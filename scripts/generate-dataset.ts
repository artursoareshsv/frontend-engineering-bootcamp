import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { brands as brandSeeds, categories as categorySeeds, colors, firstNames, lastInitials, warehouses } from './lib/catalog';
import { serializeCsv } from './lib/csv';
import { createRng, type Rng } from './lib/random';
import type { Segment } from './lib/catalog';

/**
 * Deterministic synthetic dataset generator.
 *
 * Everything is driven by a fixed seed and hand-written vocabulary, so running
 * this script twice produces byte-identical files. No network access is used.
 */

const SEED = 20260101;
const TARGET_PRODUCTS = 5200;
const TARGET_REVIEWS = 9600;
const DESCRIPTION_COVERAGE = 0.72;
const SCHEMA_VERSION = 1;

const DATA_DIR = fileURLToPath(new URL('../data/raw', import.meta.url));

const rng = createRng(SEED);

const MS_PER_DAY = 86_400_000;
const CATALOG_START = Date.UTC(2021, 0, 1);
const CATALOG_END = Date.UTC(2026, 9, 31);
const REVIEW_START = Date.UTC(2022, 0, 1);
const REVIEW_END = Date.UTC(2026, 10, 1);
const RESTOCK_START = Date.UTC(2024, 0, 1);
const RESTOCK_END = Date.UTC(2026, 10, 1);

const pad = (value: number, width: number): string => String(value).padStart(width, '0');

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const isoDate = (rngInstance: Rng, start: number, end: number): string => {
  const days = Math.floor((end - start) / MS_PER_DAY);
  return new Date(start + rngInstance.int(0, days) * MS_PER_DAY).toISOString().slice(0, 10);
};

const isoDateTime = (rngInstance: Rng, start: number, end: number): string =>
  new Date(start + Math.floor(rngInstance.next() * (end - start))).toISOString();

const toUsDate = (iso: string): string => {
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${month}/${day}/${year}`;
};

const toEuropeanDate = (iso: string): string => {
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
};

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
}

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  country: string;
  foundedYear: number;
  website: string | null;
}

interface ProductRow {
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

interface ProductMeta {
  productId: number;
  cleanName: string;
  noun: string;
  modifier: string;
  brandName: string;
  categoryName: string;
  features: string[];
  material: string | null;
  color: string;
  useCase: string;
  isBook: boolean;
}

interface DescriptionRow {
  productId: number;
  shortDescription: string;
  longDescription: string | null;
  features: string[];
  material: string | null;
  warrantyMonths: number | null;
  updatedAt: string;
}

interface ReviewRow {
  reviewId: string;
  productId: number;
  rating: number | null;
  title: string | null;
  body: string | null;
  authorName: string;
  createdAt: string;
  verifiedPurchase: boolean;
  helpfulVotes: number;
}

interface InventoryRecord {
  inventoryId: string;
  productId: number;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  lastRestockedAt: string;
}

const CATEGORY_SEGMENTS: Record<string, Segment[]> = {
  computers: ['electronics'],
  smartphones: ['electronics'],
  audio: ['electronics'],
  cameras: ['electronics'],
  wearables: ['electronics'],
  'keyboards-mice': ['accessories', 'electronics'],
  'cables-adapters': ['accessories'],
  'cases-sleeves': ['accessories'],
  'desk-accessories': ['accessories', 'electronics'],
  'kitchen-appliances': ['home'],
  'cleaning-appliances': ['home'],
  'climate-control': ['home'],
  'office-furniture': ['furniture'],
  'living-room': ['furniture', 'home'],
  bedroom: ['furniture', 'home'],
  'mens-clothing': ['clothing'],
  'womens-clothing': ['clothing'],
  footwear: ['clothing', 'sports'],
  'fitness-equipment': ['sports'],
  'outdoor-gear': ['sports'],
  books: ['books'],
  stationery: ['books'],
};

// ---------------------------------------------------------------------------
// Categories and brands
// ---------------------------------------------------------------------------

const categoryIdByKey = new Map<string, string>();
categorySeeds.forEach((seed, index) => {
  categoryIdByKey.set(seed.key, `CAT-${pad(index + 1, 2)}`);
});

const categories: CategoryRow[] = categorySeeds.map((seed, index) => ({
  id: `CAT-${pad(index + 1, 2)}`,
  name: seed.name,
  slug: slugify(seed.name),
  parentId: seed.parentKey === null ? null : (categoryIdByKey.get(seed.parentKey) ?? null),
  description: seed.description,
}));

// Documented data-quality quirks: inconsistent capitalisation and trailing
// whitespace coming from the category management system.
categories[7]!.name = `${categories[7]!.name} `;
categories[20]!.name = categories[20]!.name.toLowerCase();

const brands: BrandRow[] = brandSeeds.map((seed, index) => ({
  id: `BR-${pad(index + 1, 3)}`,
  name: seed.name,
  slug: slugify(seed.name),
  country: seed.country,
  foundedYear: seed.foundedYear,
  website: seed.website,
}));

brands[11]!.name = `${brands[11]!.name.toLowerCase()} `;
brands[39]!.name = brands[39]!.name.toUpperCase();

const catalogBrands = brandSeeds.map((seed, index) => ({
  id: `BR-${pad(index + 1, 3)}`,
  name: seed.name,
  segments: seed.segments,
}));

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const leafCategories = categorySeeds.filter((seed) => seed.weight > 0);
const totalWeight = leafCategories.reduce((sum, seed) => sum + seed.weight, 0);

const categoryTargets = new Map<string, number>();
let allocated = 0;
leafCategories.forEach((seed, index) => {
  const target =
    index === leafCategories.length - 1
      ? TARGET_PRODUCTS - allocated
      : Math.round((TARGET_PRODUCTS * seed.weight) / totalWeight);
  categoryTargets.set(seed.key, target);
  allocated += target;
});

const brandCandidates = (categoryKey: string): readonly { id: string; name: string }[] => {
  const segments = CATEGORY_SEGMENTS[categoryKey];
  if (segments === undefined) {
    throw new Error(`No segment mapping for category: ${categoryKey}`);
  }
  const candidates = catalogBrands.filter((brand) => brand.segments.some((segment) => segments.includes(segment)));
  if (candidates.length === 0) {
    throw new Error(`No brands available for category: ${categoryKey}`);
  }
  return candidates;
};

interface BuiltName {
  name: string;
  noun: string;
  modifier: string;
  priceRange: [number, number];
}

const buildCleanName = (seed: (typeof leafCategories)[number], brandName: string): BuiltName => {
  if (seed.titleStyle === 'book') {
    const adjective = rng.pick(seed.bookAdjectives ?? []);
    const title = rng.pick(seed.bookTitles ?? []);
    const format = rng.pick(seed.bookFormats ?? []);
    return {
      name: `The ${adjective} ${title} (${format})`,
      noun: 'book',
      modifier: adjective,
      priceRange: seed.priceRange,
    };
  }

  const variant = rng.pick(seed.variants);
  const series = rng.pick(seed.series);
  const modifier = rng.pick(variant.modifiers);
  const noun = variant.noun;
  const model = rng.chance(0.55) ? ` ${series.slice(0, 2).toUpperCase()}${rng.int(100, 999)}` : '';
  return {
    name: `${brandName} ${series} ${modifier} ${noun}${model}`,
    noun,
    modifier,
    priceRange: variant.priceRange ?? seed.priceRange,
  };
};

const products: ProductRow[] = [];
const productMeta: ProductMeta[] = [];
const skuCounters = new Map<string, number>();

for (const seed of leafCategories) {
  const target = categoryTargets.get(seed.key) ?? 0;
  const candidates = brandCandidates(seed.key);

  for (let index = 0; index < target; index += 1) {
    const productId = products.length + 1;
    const category = categories[categorySeeds.indexOf(seed)]!;
    const brand = rng.pick(candidates);

    const built = buildCleanName(seed, brand.name);

    const basePrice = built.priceRange[0] + rng.next() * (built.priceRange[1] - built.priceRange[0]);
    const premium = seed.titleStyle === 'book' ? 1 : rng.chance(0.15) ? 1.1 + rng.next() * 0.25 : 1;
    const price = roundMoney(Math.min(basePrice * premium, built.priceRange[1] * 1.35));

    const skuCounterKey = category.id;
    const nextSku = (skuCounters.get(skuCounterKey) ?? 0) + 1;
    skuCounters.set(skuCounterKey, nextSku);

    products.push({
      productId,
      sku: `SKU-${category.id.replace('CAT-', 'C')}-${pad(nextSku, 4)}`,
      name: built.name,
      categoryId: category.id,
      brandId: brand.id,
      price,
      currency: 'USD',
      createdAt: isoDate(rng, CATALOG_START, CATALOG_END),
      status: rng.weighted([
        ['active', 90],
        ['discontinued', 7],
        ['draft', 3],
      ]),
    });

    productMeta.push({
      productId,
      cleanName: built.name,
      noun: built.noun,
      modifier: built.modifier,
      brandName: brand.name,
      categoryName: category.name.trim(),
      features: rng.sample(seed.features, rng.int(2, Math.min(4, seed.features.length))),
      material: rng.chance(0.65) ? rng.pick(seed.materials) : null,
      color: rng.pick(colors),
      useCase: seed.useCase,
      isBook: seed.titleStyle === 'book',
    });
  }
}

if (products.length !== TARGET_PRODUCTS) {
  throw new Error(`Expected ${TARGET_PRODUCTS} products, generated ${products.length}`);
}

// ---------------------------------------------------------------------------
// Controlled data-quality anomalies (documented in data/DATA_DICTIONARY.md)
// ---------------------------------------------------------------------------

const allIndexes = products.map((_, index) => index);
const takeIndexes = (count: number): number[] => rng.shuffled(allIndexes).slice(0, count);

const anomalies = {
  nameUppercase: 0,
  nameLowercase: 0,
  nameWhitespace: 0,
  skuWhitespace: 0,
  missingCategory: 0,
  unknownCategory: 0,
  missingBrand: 0,
  unknownBrand: 0,
  priceAnomalies: 0,
  createdAtFormat: 0,
};

for (const index of takeIndexes(95)) {
  const row = products[index]!;
  row.name = row.name.toUpperCase();
  anomalies.nameUppercase += 1;
}

for (const index of takeIndexes(45)) {
  const row = products[index]!;
  row.name = row.name.toLowerCase();
  anomalies.nameLowercase += 1;
}

for (const index of takeIndexes(130)) {
  const row = products[index]!;
  const prefix = rng.pick(['  ', ' ', '\t']);
  const suffix = rng.pick(['  ', ' ', '\t', '   ']);
  row.name = `${prefix}${row.name}${suffix}`;
  anomalies.nameWhitespace += 1;
}

for (const index of takeIndexes(25)) {
  const row = products[index]!;
  row.sku = `${row.sku} `;
  anomalies.skuWhitespace += 1;
}

for (const index of takeIndexes(55)) {
  const row = products[index]!;
  row.categoryId = '';
  anomalies.missingCategory += 1;
}

for (const index of takeIndexes(35)) {
  const row = products[index]!;
  row.categoryId = 'CAT-99';
  anomalies.unknownCategory += 1;
}

for (const index of takeIndexes(45)) {
  const row = products[index]!;
  row.brandId = '';
  anomalies.missingBrand += 1;
}

for (const index of takeIndexes(30)) {
  const row = products[index]!;
  row.brandId = 'BR-99';
  anomalies.unknownBrand += 1;
}

for (const index of takeIndexes(45)) {
  const row = products[index]!;
  row.price = rng.pick([0, 0.01, 249999.99, -19.99, 99999, 0.5]);
  anomalies.priceAnomalies += 1;
}

for (const index of takeIndexes(35)) {
  const row = products[index]!;
  if (row.createdAt.includes('-')) {
    row.createdAt = toUsDate(row.createdAt);
    anomalies.createdAtFormat += 1;
  }
}

// ---------------------------------------------------------------------------
// Product descriptions (75% coverage, optional fields missing on purpose)
// ---------------------------------------------------------------------------

const descriptionCount = Math.round(TARGET_PRODUCTS * DESCRIPTION_COVERAGE);
const descriptionProductIndexes = rng.shuffled(allIndexes).slice(0, descriptionCount);

const descriptions: DescriptionRow[] = descriptionProductIndexes
  .map((index) => {
    const meta = productMeta[index]!;
    const warrantyMonths = rng.pick([12, 24, 36, null]);
    const featureOne = meta.features[0] ?? 'thoughtful details';
    const featureTwo = meta.features[1] ?? 'everyday reliability';
    const materialSentence =
      meta.material === null
        ? 'Designed to stay comfortable during daily use. '
        : `Finished in ${meta.material.toLowerCase()}, it balances durability with a clean look. `;
    const warrantySentence =
      warrantyMonths === null ? '' : `Covered by a ${warrantyMonths}-month limited warranty.`;

    return {
      productId: meta.productId,
      shortDescription: meta.isBook
        ? `${meta.cleanName} from ${meta.brandName}.`
        : `${meta.modifier} ${meta.noun} by ${meta.brandName}, available in ${meta.color.toLowerCase()} and made for ${meta.useCase}.`,
      longDescription: rng.chance(0.08)
        ? null
        : meta.isBook
          ? `${meta.brandName} presents ${meta.cleanName}, with ${featureOne.toLowerCase()} and ${featureTwo.toLowerCase()}. ${warrantySentence}`.trim()
          : `${meta.brandName} built this piece around ${featureOne.toLowerCase()} and ${featureTwo.toLowerCase()}. ${materialSentence}${warrantySentence}`.trim(),
      features: meta.features,
      material: meta.material,
      warrantyMonths,
      updatedAt: rng.chance(0.02) ? toUsDate(isoDate(rng, CATALOG_START, CATALOG_END)) : isoDate(rng, CATALOG_START, CATALOG_END),
    };
  })
  .sort((a, b) => a.productId - b.productId);

// ---------------------------------------------------------------------------
// Inventory (multiple warehouses, duplicates, zero-stock products)
// ---------------------------------------------------------------------------

const inventoryRecords: InventoryRecord[] = [];
const chosenWarehouses = warehouses.map((warehouse) => warehouse.warehouseId);

for (const product of products) {
  const warehouseCount = rng.weighted([
    [1, 45],
    [2, 35],
    [3, 16],
    [4, 4],
  ]);
  const assignedWarehouses = rng.sample(chosenWarehouses, warehouseCount);

  for (const warehouseId of assignedWarehouses) {
    const quantity = rng.weighted([
      [0, 10],
      [rng.int(1, 10), 30],
      [rng.int(11, 50), 35],
      [rng.int(51, 300), 18],
      [rng.int(301, 2000), 7],
    ]);
    const reservedQuantity = quantity === 0 ? 0 : rng.int(0, Math.floor(quantity * 0.4));

    inventoryRecords.push({
      inventoryId: '',
      productId: product.productId,
      warehouseId,
      quantity,
      reservedQuantity,
      lastRestockedAt: rng.chance(0.005)
        ? toUsDate(isoDate(rng, RESTOCK_START, RESTOCK_END))
        : isoDateTime(rng, RESTOCK_START, RESTOCK_END),
    });
  }
}

// Products that are completely out of stock even though records exist.
const zeroStockProducts = new Set(rng.shuffled(products.map((product) => product.productId)).slice(0, 65));
for (const record of inventoryRecords) {
  if (zeroStockProducts.has(record.productId)) {
    record.quantity = 0;
    record.reservedQuantity = 0;
  }
}

// Duplicate / conflicting warehouse sync records: same product + warehouse,
// different quantities and timestamps, unique inventoryId.
const duplicateSources = rng.sample(inventoryRecords, 45);
for (const source of duplicateSources) {
  inventoryRecords.push({
    inventoryId: '',
    productId: source.productId,
    warehouseId: source.warehouseId,
    quantity: Math.max(0, source.quantity + rng.int(5, 80)),
    reservedQuantity: 0,
    lastRestockedAt: isoDateTime(rng, RESTOCK_START, RESTOCK_END),
  });
}

const shuffledInventory = rng.shuffled(inventoryRecords);
shuffledInventory.forEach((record, index) => {
  record.inventoryId = `INV-${pad(index + 1, 6)}`;
});

// ---------------------------------------------------------------------------
// Reviews (verified purchases, missing ratings/text, orphan product ids)
// ---------------------------------------------------------------------------

const reviewTitles: readonly string[] = [
  'Exactly what I needed',
  'Solid value for the price',
  'Works well, minor issues',
  'Not bad, but not great',
  'Would buy again',
  'Sturdy and well made',
  'Good, with a few caveats',
  'Disappointing quality',
  'Better than expected',
  'Does the job',
];

const positiveBodies: readonly string[] = [
  'Arrived quickly and matches the description. The build quality feels premium.',
  'I have used it daily for a few weeks now and it still looks and works like new.',
  'Great attention to detail. Setup took less than five minutes.',
  'Comfortable, well designed and easy to live with.',
  'The finish is nicer than the photos suggested and packaging was excellent.',
];

const neutralBodies: readonly string[] = [
  'Does what it promises, although the instructions could be clearer.',
  'Good overall, but I expected slightly better materials at this price.',
  'Works fine for basic use. Heavier than I anticipated.',
  'Decent product. Delivery took longer than the estimate.',
];

const negativeBodies: readonly string[] = [
  'The unit I received had a scratch and support took days to reply.',
  'Stopped working after two weeks. Requested a replacement.',
  'Feels flimsy compared to the product photos.',
  'Not comfortable for long sessions, unfortunately.',
];

const reviews: ReviewRow[] = [];
for (let index = 0; index < TARGET_REVIEWS; index += 1) {
  const isOrphan = index < 120;
  const productId = isOrphan ? 9_000_001 + index : rng.int(1, TARGET_PRODUCTS);
  const rating = rng.chance(0.03)
    ? null
    : rng.weighted([
        [5, 45],
        [4, 28],
        [3, 13],
        [2, 8],
        [1, 6],
      ]);

  const bodyPool =
    rating === null ? neutralBodies : rating >= 4 ? positiveBodies : rating === 3 ? neutralBodies : negativeBodies;

  const dateStyle = rng.weighted([
    ['iso', 55],
    ['isoDateTime', 25],
    ['mdy', 12],
    ['dmy', 8],
  ] as const);
  const reviewDate = isoDate(rng, REVIEW_START, REVIEW_END);

  reviews.push({
    reviewId: `REV-${pad(index + 1, 6)}`,
    productId,
    rating,
    title: rng.chance(0.06) ? null : rng.pick(reviewTitles),
    body: rng.chance(0.04) ? null : rng.sample(bodyPool, 2).join(' '),
    authorName: rng.chance(0.08) ? 'Anonymous' : `${rng.pick(firstNames)} ${rng.pick(lastInitials)}.`,
    createdAt:
      dateStyle === 'iso'
        ? reviewDate
        : dateStyle === 'isoDateTime'
          ? isoDateTime(rng, REVIEW_START, REVIEW_END)
          : dateStyle === 'mdy'
            ? toUsDate(reviewDate)
            : toEuropeanDate(reviewDate),
    verifiedPurchase: rng.chance(0.78),
    helpfulVotes: rng.weighted([
      [0, 40],
      [1, 20],
      [2, 12],
      [3, 8],
      [5, 7],
      [8, 5],
      [12, 4],
      [25, 2],
      [40, 1],
      [90, 1],
    ]),
  });
}

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------

mkdirSync(DATA_DIR, { recursive: true });

const productCsv = serializeCsv(
  ['productId', 'sku', 'name', 'categoryId', 'brandId', 'price', 'currency', 'createdAt', 'status'],
  products.map((product) => [
    product.productId,
    product.sku,
    product.name,
    product.categoryId,
    product.brandId,
    product.price.toFixed(2),
    product.currency,
    product.createdAt,
    product.status,
  ]),
);

const files: readonly { name: string; content: string }[] = [
  { name: 'products.csv', content: productCsv },
  { name: 'categories.json', content: `${JSON.stringify(categories, null, 2)}\n` },
  { name: 'brands.json', content: `${JSON.stringify(brands, null, 2)}\n` },
  {
    name: 'inventory.json',
    content: `${JSON.stringify({ schemaVersion: SCHEMA_VERSION, warehouses, records: shuffledInventory }, null, 2)}\n`,
  },
  { name: 'product-descriptions.json', content: `${JSON.stringify(descriptions, null, 2)}\n` },
  { name: 'reviews.json', content: `${JSON.stringify(reviews, null, 2)}\n` },
];

const hashes: { name: string; sha256: string; bytes: number }[] = [];
for (const file of files) {
  writeFileSync(path.join(DATA_DIR, file.name), file.content, 'utf8');
  hashes.push({
    name: file.name,
    sha256: createHash('sha256').update(file.content).digest('hex'),
    bytes: Buffer.byteLength(file.content, 'utf8'),
  });
}

const totalQuantity = shuffledInventory.reduce((sum, record) => sum + record.quantity, 0);
const productsWithStock = new Set(
  shuffledInventory.filter((record) => record.quantity > 0).map((record) => record.productId),
).size;

console.log(`Generated dataset with seed ${SEED} in ${DATA_DIR}`);
console.log('');
console.log('Record counts');
console.log(`  products              ${products.length}`);
console.log(`  categories            ${categories.length} (${leafCategories.length} leaves with products)`);
console.log(`  brands                ${brands.length}`);
console.log(`  warehouses            ${warehouses.length}`);
console.log(`  inventory records     ${shuffledInventory.length}`);
console.log(`  product descriptions  ${descriptions.length}`);
console.log(`  reviews               ${reviews.length}`);
console.log('');
console.log('Derived signals');
console.log(`  products with stock   ${productsWithStock}`);
console.log(`  products out of stock ${products.length - productsWithStock}`);
console.log(`  total units on hand   ${totalQuantity}`);
console.log('');
console.log('Injected anomalies (documented in data/DATA_DICTIONARY.md)');
for (const [key, value] of Object.entries(anomalies)) {
  console.log(`  ${key.padEnd(20)}  ${value}`);
}
console.log('');
console.log('File checksums (SHA-256)');
for (const hash of hashes) {
  console.log(`  ${hash.sha256}  ${hash.name.padEnd(30)} ${hash.bytes} bytes`);
}
