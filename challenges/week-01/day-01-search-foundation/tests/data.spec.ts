import { describe, expect, it } from 'vitest';

import { loadProducts } from '../src/load-products';

/**
 * These tests exercise the provided data pipeline (products + categories +
 * descriptions + inventory + brands). They pass in the starter repository and
 * are here to prove that the six raw sources actually produce the catalogue
 * your search function consumes.
 *
 * If one of these fails, the dataset or the loader is broken — not your
 * Day 01 implementation.
 */
describe('loadProducts (provided data pipeline)', () => {
  const products = loadProducts();

  it('loads the full product catalogue', () => {
    expect(products.length).toBeGreaterThanOrEqual(5000);
  });

  it('returns products with the expected field types', () => {
    for (const product of products) {
      expect(Number.isInteger(product.id)).toBe(true);
      expect(product.id).toBeGreaterThan(0);
      expect(typeof product.name).toBe('string');
      expect(product.name.length).toBeGreaterThan(0);
      expect(typeof product.category).toBe('string');
      expect(product.category.length).toBeGreaterThan(0);
      expect(typeof product.description).toBe('string');
      expect(Number.isFinite(product.price)).toBe(true);
      expect(typeof product.inStock).toBe('boolean');
    }
  });

  it('trims product names coming from the raw CSV', () => {
    expect(products.every((product) => product.name === product.name.trim())).toBe(true);
  });

  it('joins category names and falls back to "Uncategorized" for broken references', () => {
    expect(products.some((product) => product.category === 'Computers')).toBe(true);
    expect(products.some((product) => product.category === 'Uncategorized')).toBe(true);
  });

  it('joins descriptions and leaves unknown descriptions empty', () => {
    expect(products.some((product) => product.description.length > 0)).toBe(true);
    expect(products.some((product) => product.description === '')).toBe(true);
  });

  it('aggregates inventory across warehouses into a boolean', () => {
    const inStock = products.filter((product) => product.inStock).length;
    const outOfStock = products.filter((product) => !product.inStock).length;

    expect(inStock).toBeGreaterThan(100);
    expect(outOfStock).toBeGreaterThan(100);
  });

  it('keeps the raw price values, including the documented anomalies', () => {
    expect(products.some((product) => product.price <= 0)).toBe(true);
    expect(products.some((product) => product.price > 10000)).toBe(true);
  });
});
