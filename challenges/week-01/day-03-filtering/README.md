# Week 01 — Day 03: Filtering & Query Composition

> **Status: placeholder.** Requirements for this day will be finalised with the mentor before the session. This file records the agreed learning objectives and dependencies only.

| | |
| --- | --- |
| **Estimated time** | 3–4 hours |
| **Concepts** | Predicates, composition, facets, filter semantics, hierarchy |
| **Data sources** | catalogue + `inventory.json` + `reviews.json` + `categories.json` |
| **Builds on** | Day 02 ranking |

## Why this day exists

Search is not a single function call; it is a query composed of independent constraints. Interviewers use filtering to test whether you can design small, composable pieces instead of a 200-line `if` tree. It is also where data-quality decisions become user-visible: what does "in stock" mean when warehouse rows conflict? What happens to products with a broken category?

## Learning objectives

By the end of the day you should be able to:

- express filters as small, testable predicates;
- compose filters with AND/OR semantics and explain short-circuit behaviour;
- design a filter API that later days can extend without breaking callers;
- treat category hierarchies correctly (filtering a parent should include its leaves);
- define and defend semantics for missing or invalid references;
- avoid accidental mutation and repeated work when composing filters.

## Expected progression

1. Model the filter input as a typed options object.
2. Implement independent predicates: category (including hierarchy), brand, price range, stock, rating threshold.
3. Compose predicates and keep the Day 01/02 behaviour intact when no filters are supplied.
4. Define behaviour for contradictory filters and unknown values.
5. Add tests for boundaries (min == max, zero results, invalid ids, products without reviews).
6. Document the semantics in the PR: what "inStock" ignores, how nulls affect rating filters, how duplicates affect stock.

## Data you will touch

- `categories.json` — parent/child hierarchy; two dirty names.
- `inventory.json` — duplicate `(productId, warehouseId)` rows and zero-quantity rows.
- `reviews.json` — nullable ratings; products without reviews.
- `products.csv` — broken `categoryId`/`brandId` references.

## Questions to prepare

1. Should `category: "Electronics"` return computers and phones? Justify the choice.
2. What is the difference between filtering `inStock` by `quantity > 0` and by `quantity - reservedQuantity > 0`?
3. How do you compose filters without letting one bug silently disable another?
4. Where do you normalise category names — at load time or at filter time?

## Definition of done (provisional)

Day 01 and Day 02 suites still pass; filters are independently unit-tested and covered in combination; semantics for dirty data are written down; no caller has to know how predicates are implemented.

Detailed deliverables will be added before Day 03 starts.
