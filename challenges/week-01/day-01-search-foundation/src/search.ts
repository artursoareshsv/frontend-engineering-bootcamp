import type { Product } from './types';

/**
 * Week 01 — Day 01: Search Foundation
 *
 * Implement this function according to the requirements in README.md.
 *
 * Contract summary:
 * - search only the product name
 * - case-insensitive
 * - trim the query and split it on one or more whitespace characters
 * - every query token must appear in the name (in any order, substring match)
 * - preserve the original product order
 * - never mutate the input array or its products
 * - return [] for an empty/whitespace-only query, and when nothing matches
 */
export function searchProducts(
  products: Product[],
  query: string,
): Product[] {
  // Intentionally unimplemented starter: the challenge is to write the search.
  void products;
  void query;

  throw new Error(
    'searchProducts is not implemented yet. Read challenges/week-01/day-01-search-foundation/README.md, remove .skip from the acceptance tests, and implement the function.',
  );
}
