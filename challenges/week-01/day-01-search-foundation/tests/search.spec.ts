import { describe, expect, it } from 'vitest';

import { products } from '../fixtures/products.fixture';
import { searchProducts } from '../src/search';
import type { Product } from '../src/types';

/**
 * Public acceptance tests for Day 01.
 *
 * The suite is SKIPPED in the starter repository so that `main` is green and
 * CI stays meaningful. To start the challenge, remove `.skip` from the line
 * below and run `npm run test:day01`.
 *
 * These tests are the specification. If you believe one is wrong, open a PR
 * that explains why instead of changing it silently.
 */
describe.skip('searchProducts', () => {
  const names = (result: Product[]): string[] => result.map((product) => product.name);

  describe('empty and whitespace-only queries', () => {
    it('returns an empty array for an empty query', () => {
      expect(searchProducts(products, '')).toEqual([]);
    });

    it('returns an empty array for a whitespace-only query', () => {
      expect(searchProducts(products, '   ')).toEqual([]);
      expect(searchProducts(products, '\t\n  ')).toEqual([]);
    });
  });

  describe('matching', () => {
    it('matches a single term as a substring of the product name', () => {
      expect(names(searchProducts(products, 'mouse'))).toEqual([
        'Wireless Gaming Mouse',
        'Wireless Mouse',
        'Wired Mouse',
        'Wireless Mouse Pad (XL)',
      ]);
    });

    it('matches partial words rather than whole words', () => {
      expect(names(searchProducts(products, 'wire'))).toEqual([
        'Wireless Gaming Mouse',
        'Wireless Mouse',
        'Wireless Keyboard',
        'Wired Mouse',
        'Wireless Mouse Pad (XL)',
      ]);
    });

    it('requires every token to appear in the name', () => {
      expect(names(searchProducts(products, 'wireless mouse'))).toEqual([
        'Wireless Gaming Mouse',
        'Wireless Mouse',
        'Wireless Mouse Pad (XL)',
      ]);
      expect(names(searchProducts(products, 'wireless gaming mouse'))).toEqual(['Wireless Gaming Mouse']);
    });

    it('returns no matches when one token is missing', () => {
      expect(searchProducts(products, 'wireless tablet')).toEqual([]);
    });

    it('returns an empty array when nothing matches', () => {
      expect(searchProducts(products, 'nonexistent-product')).toEqual([]);
    });

    it('matches punctuation and special characters literally', () => {
      expect(names(searchProducts(products, 'usb-c'))).toEqual(['USB-C Hub']);
      expect(names(searchProducts(products, '(xl)'))).toEqual(['Wireless Mouse Pad (XL)']);
      expect(names(searchProducts(products, '4k'))).toEqual(['4K Action Camera']);
    });

    it('handles accented characters without stripping them', () => {
      expect(names(searchProducts(products, 'café'))).toEqual(['Café Latte Mug']);
    });

    it('only searches the product name', () => {
      expect(searchProducts(products, 'electronics')).toEqual([]);
      expect(searchProducts(products, 'description')).toEqual([]);
    });
  });

  describe('case and whitespace handling', () => {
    it('is case-insensitive', () => {
      expect(names(searchProducts(products, 'MOUSE'))).toEqual(names(searchProducts(products, 'mouse')));
      expect(names(searchProducts(products, 'WiReLeSs GaMiNg'))).toEqual(['Wireless Gaming Mouse']);
    });

    it('trims the query before searching', () => {
      expect(names(searchProducts(products, '   wireless mouse   '))).toEqual([
        'Wireless Gaming Mouse',
        'Wireless Mouse',
        'Wireless Mouse Pad (XL)',
      ]);
    });

    it('splits on runs of whitespace, including tabs and newlines', () => {
      const expected = ['Wireless Gaming Mouse', 'Wireless Mouse', 'Wireless Mouse Pad (XL)'];
      expect(names(searchProducts(products, 'wireless    mouse'))).toEqual(expected);
      expect(names(searchProducts(products, 'wireless\tmouse'))).toEqual(expected);
      expect(names(searchProducts(products, 'wireless\nmouse'))).toEqual(expected);
      expect(names(searchProducts(products, '  wireless \t\n  mouse  '))).toEqual(expected);
    });

    it('ignores empty tokens produced by repeated whitespace', () => {
      expect(names(searchProducts(products, ' \t \n '))).toEqual([]);
    });
  });

  describe('token order and repetition', () => {
    it('accepts tokens in any order', () => {
      expect(names(searchProducts(products, 'mouse wireless'))).toEqual([
        'Wireless Gaming Mouse',
        'Wireless Mouse',
        'Wireless Mouse Pad (XL)',
      ]);
      expect(names(searchProducts(products, 'gaming mechanical'))).toEqual(['Mechanical Gaming Keyboard']);
    });

    it('treats a repeated token as the same token', () => {
      expect(names(searchProducts(products, 'mouse mouse'))).toEqual(names(searchProducts(products, 'mouse')));
    });
  });

  describe('ordering and immutability', () => {
    it('preserves the original product order', () => {
      const result = searchProducts(products, 'wire');
      expect(names(result)).toEqual(['Wireless Gaming Mouse', 'Wireless Mouse', 'Wireless Keyboard', 'Wired Mouse', 'Wireless Mouse Pad (XL)']);
      expect(result.map((product) => product.id)).toEqual([1, 2, 3, 5, 10]);
    });

    it('does not mutate the input array or its products', () => {
      const input = products.map((product) => ({ ...product }));
      const snapshot = structuredClone(input);

      searchProducts(input, 'mouse');

      expect(input).toEqual(snapshot);
      expect(input).toHaveLength(products.length);
    });

    it('works with a frozen input array and frozen products', () => {
      const frozen = Object.freeze(products.map((product) => Object.freeze({ ...product })));

      expect(() => searchProducts(frozen as unknown as Product[], 'mouse')).not.toThrow();
    });

    it('returns an empty array for an empty product list', () => {
      expect(searchProducts([], 'mouse')).toEqual([]);
    });
  });
});
