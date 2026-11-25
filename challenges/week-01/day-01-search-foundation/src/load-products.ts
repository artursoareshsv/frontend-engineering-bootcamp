import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCsv } from './csv';
import type { Product } from './types';

/**
 * PROVIDED CODE — you do not need to change this file for Day 01.
 *
 * Builds the `Product[]` used by the search function by joining the six raw
 * data sources. It is deliberately explicit: read it to understand where each
 * field of `Product` comes from.
 *
 * Normalisation decisions made here (Day 04 revisits them):
 * - product names, category names and brand names are trimmed (raw files keep
 *   the original untrimmed values);
 * - a missing or unknown category reference becomes "Uncategorized";
 * - `description` is the trimmed short + long description, or "" when the
 *   product has no description record;
 * - `inStock` is true when the sum of `quantity` across all warehouse records
 *   is greater than zero (reserved units are not subtracted);
 * - products are returned in `products.csv` order; no filtering or deduping.
 */

const RAW_DIR = fileURLToPath(new URL('../../../../data/raw/', import.meta.url));

const readText = (fileName: string): string => readFileSync(path.join(RAW_DIR, fileName), 'utf8');

const readJson = <T>(fileName: string): T => JSON.parse(readText(fileName)) as T;

const readCsv = (fileName: string): string[][] => parseCsv(readText(fileName));

interface CategoryRecord {
  id: string;
  name: string;
}

interface DescriptionRecord {
  productId: number;
  shortDescription: string;
  longDescription: string | null;
}

interface InventoryFile {
  records: { productId: number; quantity: number }[];
}

const columnIndex = (header: readonly string[], name: string): number => {
  const index = header.indexOf(name);
  if (index === -1) {
    throw new Error(`products.csv is missing the "${name}" column`);
  }
  return index;
};

export function loadProducts(): Product[] {
  const productRows = readCsv('products.csv');
  const header = productRows[0] ?? [];
  const idColumn = columnIndex(header, 'productId');
  const nameColumn = columnIndex(header, 'name');
  const categoryColumn = columnIndex(header, 'categoryId');
  const priceColumn = columnIndex(header, 'price');

  const categoryNames = new Map<string, string>(
    readJson<CategoryRecord[]>('categories.json').map((category) => [category.id, category.name.trim()]),
  );

  const descriptions = new Map<number, string>();
  for (const record of readJson<DescriptionRecord[]>('product-descriptions.json')) {
    const text = [record.shortDescription, record.longDescription]
      .filter((part): part is string => typeof part === 'string' && part.trim() !== '')
      .map((part) => part.trim())
      .join(' ');

    if (text !== '') {
      descriptions.set(record.productId, text);
    }
  }

  const stockByProduct = new Map<number, number>();
  for (const record of readJson<InventoryFile>('inventory.json').records) {
    stockByProduct.set(record.productId, (stockByProduct.get(record.productId) ?? 0) + record.quantity);
  }

  return productRows.slice(1).map((row) => {
    const id = Number(row[idColumn]);
    const categoryId = (row[categoryColumn] ?? '').trim();

    return {
      id,
      name: (row[nameColumn] ?? '').trim(),
      category: categoryNames.get(categoryId) ?? 'Uncategorized',
      description: descriptions.get(id) ?? '',
      price: Number(row[priceColumn]),
      inStock: (stockByProduct.get(id) ?? 0) > 0,
    };
  });
}
