# Week 01 — Day 02: Sorting & Relevance Ranking

> **Status: placeholder.** This day's detailed requirements are intentionally not specified yet. They will be agreed with the mentor before the session, based on how Day 01 went. What follows is the approved learning direction, not a final brief.

| | |
| --- | --- |
| **Estimated time** | 3–4 hours |
| **Concepts** | Comparators, stable sorting, multi-key ordering, scoring, tie-breaking |
| **Data sources** | `products.csv`, `brands.json`, `reviews.json` (+ Day 01 loader) |
| **Builds on** | Day 01 search foundation (merged on `main`) |

## Why this day exists

Real search never returns "whatever the filter produced". Users expect the best match first, then a predictable order. This day turns a boolean match into a ranking, and forces you to make explicit decisions about stability and tie-breaking — a common source of production bugs and interview questions.

## Learning objectives

By the end of the day you should be able to:

- write comparators that are total, consistent and side-effect free;
- explain why `Array.prototype.sort` stability matters for multi-key ranking;
- break ties deterministically so identical queries always return identical pages;
- separate "does this product match?" from "how relevant is it?";
- justify a scoring formula rather than inventing one by intuition;
- explain the cost of sorting on every request and when to avoid it.

## Expected progression

Starting from your Day 01 function:

1. Keep matching behaviour unchanged and covered by the Day 01 tests.
2. Introduce an explicit ranking result that carries the product plus score metadata.
3. Define a documented scoring strategy (for example token coverage, position of the match, review signal) and defend it.
4. Apply deterministic tie-breaking.
5. Add tests for ordering, stability and ties — including cases where several products have identical scores.
6. Measure the cost of ranking on the real 5,200-product catalogue.

Brands and reviews become relevant here: ranking may use review aggregates or brand metadata, and you will have to handle products with no reviews.

## Data you will touch

- `products.csv` — names, prices, status.
- `brands.json` — brand identity for display and potential signals.
- `reviews.json` — ratings with `null` values and orphan product ids. Any aggregate must define how nulls and orphans are handled.

## Questions to prepare

1. When is a sort stable, and why does it matter when you sort by score and then by price?
2. How do you guarantee the same result order for equal scores?
3. What changes if ranking must run on 500,000 products on every keystroke?
4. Is "more tokens matched" always a better relevance signal? Give a counter-example.

## Definition of done (provisional)

Day 01 acceptance tests still pass; new ranking tests cover ordering, ties and stability; scoring rules are documented in the PR; complexity is stated with variables defined.

Detailed deliverables will be added to this file before Day 02 starts.
