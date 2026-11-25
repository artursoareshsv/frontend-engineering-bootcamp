import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCsv } from './lib/csv';

/**
 * Structural and referential validation for the raw dataset.
 *
 * Intentional data-quality issues (missing category ids, orphan reviews, ...)
 * are expected and reported as warnings. Everything that would make the data
 * unusable — broken JSON, duplicate primary keys, impossible values, missing
 * files, datasets that are too small — fails the run with exit code 1.
 */

const RAW_DIR = fileURLToPath(new URL('../data/raw', import.meta.url));

const MINIMUMS = {
  products: 5000,
  categories: 20,
  brands: 50,
  warehouses: 4,
  inventoryRecords: 5000,
  reviews: 5000,
  descriptions: 3000,
} as const;

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string;
  foundedYear: number;
  website: string | null;
}

interface Warehouse {
  warehouseId: string;
}

interface InventoryRecord {
  inventoryId: string;
  productId: number;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  lastRestockedAt: string;
}

interface DescriptionRecord {
  productId: number;
  shortDescription: string;
  longDescription: string | null;
  features: string[];
}

interface ReviewRecord {
  reviewId: string;
  productId: number;
  rating: number | null;
  title: string | null;
  body: string | null;
  createdAt: string;
}

interface ProductRecord {
  productId: number;
  sku: string;
  name: string;
  categoryId: string;
  brandId: string;
  price: number;
  currency: string;
  createdAt: string;
  status: string;
}

const errors: string[] = [];

const fail = (message: string): void => {
  errors.push(message);
};

const readJson = <T>(fileName: string): T => {
  const filePath = path.join(RAW_DIR, fileName);
  let content: string;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    fail(`Missing file: data/raw/${fileName}`);
    return [] as unknown as T;
  }
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    fail(`Invalid JSON in data/raw/${fileName}: ${(error as Error).message}`);
    return [] as unknown as T;
  }
};

// ---------------------------------------------------------------------------
// products.csv
// ---------------------------------------------------------------------------

const PRODUCT_HEADER = [
  'productId',
  'sku',
  'name',
  'categoryId',
  'brandId',
  'price',
  'currency',
  'createdAt',
  'status',
];

let productRows: string[][] = [];
try {
  productRows = parseCsv(readFileSync(path.join(RAW_DIR, 'products.csv'), 'utf8'));
} catch {
  fail('Missing file: data/raw/products.csv');
}

const header = productRows[0] ?? [];
if (header.join(',') !== PRODUCT_HEADER.join(',')) {
  fail(`products.csv header mismatch. Expected: ${PRODUCT_HEADER.join(',')}. Got: ${header.join(',')}`);
}

const products: ProductRecord[] = [];
for (const [rowIndex, row] of productRows.slice(1).entries()) {
  if (row.length !== PRODUCT_HEADER.length) {
    fail(`products.csv row ${rowIndex + 2} has ${row.length} columns, expected ${PRODUCT_HEADER.length}`);
    continue;
  }
  const [productId, sku, name, categoryId, brandId, price, currency, createdAt, status] = row;
  const numericId = Number(productId);
  const numericPrice = Number(price);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    fail(`products.csv row ${rowIndex + 2} has an invalid productId: ${String(productId)}`);
    continue;
  }
  if (!Number.isFinite(numericPrice)) {
    fail(`products.csv row ${rowIndex + 2} has an invalid price: ${String(price)}`);
    continue;
  }
  if ((name ?? '').trim().length === 0) {
    fail(`products.csv row ${rowIndex + 2} has an empty product name`);
  }

  products.push({
    productId: numericId,
    sku: sku ?? '',
    name: name ?? '',
    categoryId: categoryId ?? '',
    brandId: brandId ?? '',
    price: numericPrice,
    currency: currency ?? '',
    createdAt: createdAt ?? '',
    status: status ?? '',
  });
}

const uniqueProductIds = new Set(products.map((product) => product.productId));
if (uniqueProductIds.size !== products.length) {
  fail('products.csv contains duplicate productId values');
}

// ---------------------------------------------------------------------------
// categories / brands / inventory / descriptions / reviews
// ---------------------------------------------------------------------------

const categories = readJson<Category[]>('categories.json');
const brands = readJson<Brand[]>('brands.json');
const inventory = readJson<{ schemaVersion: number; warehouses: Warehouse[]; records: InventoryRecord[] }>('inventory.json');
const descriptions = readJson<DescriptionRecord[]>('product-descriptions.json');
const reviews = readJson<ReviewRecord[]>('reviews.json');

const warehouses = Array.isArray(inventory.warehouses) ? inventory.warehouses : [];
const inventoryRecords = Array.isArray(inventory.records) ? inventory.records : [];

if (!Array.isArray(inventory.warehouses) || !Array.isArray(inventory.records)) {
  fail('inventory.json must contain `warehouses` and `records` arrays');
}

const categoryIds = new Set(categories.map((category) => category.id));
const brandIds = new Set(brands.map((brand) => brand.id));
const warehouseIds = new Set(warehouses.map((warehouse) => warehouse.warehouseId));
const productIds = uniqueProductIds;

if (categoryIds.size !== categories.length) {
  fail('categories.json contains duplicate ids');
}
if (brandIds.size !== brands.length) {
  fail('brands.json contains duplicate ids');
}
if (warehouseIds.size !== warehouses.length) {
  fail('inventory.json contains duplicate warehouseIds');
}
for (const category of categories) {
  if (category.parentId !== null && !categoryIds.has(category.parentId)) {
    fail(`Category ${category.id} references unknown parentId ${category.parentId}`);
  }
}

const inventoryIds = new Set<string>();
const inventoryPairs = new Set<string>();
const stockByProduct = new Map<number, number>();
let duplicateInventoryPairs = 0;

for (const record of inventoryRecords) {
  if (inventoryIds.has(record.inventoryId)) {
    fail(`inventory.json contains duplicate inventoryId ${record.inventoryId}`);
  }
  inventoryIds.add(record.inventoryId);

  if (!warehouseIds.has(record.warehouseId)) {
    fail(`Inventory record ${record.inventoryId} references unknown warehouse ${record.warehouseId}`);
  }
  if (!Number.isInteger(record.quantity) || record.quantity < 0) {
    fail(`Inventory record ${record.inventoryId} has an invalid quantity`);
  }
  if (!Number.isInteger(record.reservedQuantity) || record.reservedQuantity < 0) {
    fail(`Inventory record ${record.inventoryId} has an invalid reservedQuantity`);
  }
  if (record.reservedQuantity > record.quantity) {
    fail(`Inventory record ${record.inventoryId} reserves more units than it has`);
  }
  if (typeof record.lastRestockedAt !== 'string' || record.lastRestockedAt.trim() === '') {
    fail(`Inventory record ${record.inventoryId} has no lastRestockedAt value`);
  }

  stockByProduct.set(record.productId, (stockByProduct.get(record.productId) ?? 0) + record.quantity);

  const pair = `${record.productId}:${record.warehouseId}`;
  if (inventoryPairs.has(pair)) {
    duplicateInventoryPairs += 1;
  }
  inventoryPairs.add(pair);
}

const reviewIds = new Set<string>();
const reviewCountByProduct = new Map<number, number>();
let invalidRatings = 0;
let orphanReviews = 0;

for (const review of reviews) {
  if (reviewIds.has(review.reviewId)) {
    fail(`reviews.json contains duplicate reviewId ${review.reviewId}`);
  }
  reviewIds.add(review.reviewId);

  if (review.rating !== null && (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5)) {
    invalidRatings += 1;
  }
  if (!productIds.has(review.productId)) {
    orphanReviews += 1;
  } else {
    reviewCountByProduct.set(review.productId, (reviewCountByProduct.get(review.productId) ?? 0) + 1);
  }
}
if (invalidRatings > 0) {
  fail(`reviews.json contains ${invalidRatings} ratings outside the 1-5 range`);
}

const descriptionProductIds = new Set<number>();
for (const description of descriptions) {
  if (descriptionProductIds.has(description.productId)) {
    fail(`product-descriptions.json contains duplicate productId ${description.productId}`);
  }
  descriptionProductIds.add(description.productId);
  if (!Array.isArray(description.features)) {
    fail(`Description ${description.productId} has a non-array features field`);
  }
}

// ---------------------------------------------------------------------------
// Reported (expected) data-quality signals
// ---------------------------------------------------------------------------

const missingCategory = products.filter((product) => product.categoryId.trim() === '');
const unknownCategory = products.filter(
  (product) => product.categoryId.trim() !== '' && !categoryIds.has(product.categoryId.trim()),
);
const missingBrand = products.filter((product) => product.brandId.trim() === '');
const unknownBrand = products.filter(
  (product) => product.brandId.trim() !== '' && !brandIds.has(product.brandId.trim()),
);
const untrimmedNames = products.filter((product) => product.name !== product.name.trim());
const duplicateNames = products.length - new Set(products.map((product) => product.name.trim().toLowerCase())).size;
const outOfStock = products.filter((product) => (stockByProduct.get(product.productId) ?? 0) === 0);
const productsWithoutDescription = products.filter((product) => !descriptionProductIds.has(product.productId));
const productsWithoutReviews = products.filter((product) => !reviewCountByProduct.has(product.productId));

// ---------------------------------------------------------------------------
// Counts
// ---------------------------------------------------------------------------

const counts = {
  products: products.length,
  categories: categories.length,
  brands: brands.length,
  warehouses: warehouses.length,
  inventoryRecords: inventoryRecords.length,
  descriptions: descriptions.length,
  reviews: reviews.length,
};

const countChecks: readonly [keyof typeof MINIMUMS, number][] = [
  ['products', counts.products],
  ['categories', counts.categories],
  ['brands', counts.brands],
  ['warehouses', counts.warehouses],
  ['inventoryRecords', counts.inventoryRecords],
  ['reviews', counts.reviews],
  ['descriptions', counts.descriptions],
];

for (const [key, actual] of countChecks) {
  if (actual < MINIMUMS[key]) {
    fail(`Dataset too small: ${key} has ${actual} records, expected at least ${MINIMUMS[key]}`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log('Dataset validation report');
console.log('=========================');
console.log('');
console.log('Record counts');
for (const [key, value] of Object.entries(counts)) {
  console.log(`  ${key.padEnd(18)} ${value}`);
}
console.log('');
console.log('Expected data-quality signals (documented in data/DATA_DICTIONARY.md)');
console.log(`  products with missing categoryId      ${missingCategory.length}`);
console.log(`  products with unknown categoryId      ${unknownCategory.length}`);
console.log(`  products with missing brandId         ${missingBrand.length}`);
console.log(`  products with unknown brandId         ${unknownBrand.length}`);
console.log(`  product names with outer whitespace   ${untrimmedNames.length}`);
console.log(`  duplicate (product, warehouse) pairs  ${duplicateInventoryPairs}`);
console.log(`  products out of stock                 ${outOfStock.length}`);
console.log(`  products without description          ${productsWithoutDescription.length}`);
console.log(`  products without reviews              ${productsWithoutReviews.length}`);
console.log(`  reviews referencing unknown products  ${orphanReviews}`);
console.log(`  duplicate product names (normalised)  ${duplicateNames}`);
console.log('');

if (errors.length > 0) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log('Validation passed: structure, primary keys and referential integrity are valid.');
}
