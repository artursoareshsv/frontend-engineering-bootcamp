# Week 01 — Day 05: Data Structures & Indexing

> **Status: placeholder.** Detailed requirements will be agreed with the mentor before the session. This file records the approved direction.

| | |
| --- | --- |
| **Estimated time** | 4–5 hours |
| **Concepts** | `Map`, `Set`, inverted index, lookup complexity, index freshness |
| **Data sources** | normalised catalogue from Day 04 |
| **Builds on** | Day 04 transformation pipeline |

## Why this day exists

Linear scanning is fine for 5,200 products and unacceptable as the catalogue grows. This day introduces the data structure that powers real search — the inverted index — and the engineering questions that come with it: build cost, memory, freshness and correctness under updates.

## Learning objectives

By the end of the day you should be able to:

- explain the difference between a linear scan and an indexed lookup in complexity terms;
- build a token → product ids inverted index with correct tokenisation;
- use `Map` and `Set` deliberately (and know when a plain object is a poor choice);
- reason about index memory footprint and build time;
- keep search results identical to the linear implementation (parity testing);
- handle edge cases: duplicate tokens, punctuation, empty names, accented characters;
- explain when an index becomes stale and how you would invalidate or rebuild it.

## Expected progression

1. Extract the tokenisation rules from Day 01 into a single, tested function.
2. Build an inverted index that maps tokens to product ids.
3. Implement a search path that uses the index and intersects posting lists.
4. Prove parity with the Day 01/02 behaviour using the existing acceptance suite plus a dataset comparison.
5. Measure build time, memory and query time on the real catalogue.
6. Document the trade-offs: eager vs lazy building, memory vs latency, per-query vs per-session cache.

## Data you will touch

The normalised dataset you produced on Day 04. If your Day 04 model is incomplete, fix it here rather than special-casing in the index.

## Questions to prepare

1. Why is `Map<string, Set<number>>` usually a better index than `Record<string, number[]>`?
2. What is the complexity of intersecting three posting lists, and what dominates it?
3. How would you support prefix search without scanning every token?
4. When should the index be rebuilt in a browser app with live catalogue updates?
5. What breaks if tokenisation in the index and in the query differ by even one rule?

## Definition of done (provisional)

Indexed search returns byte-for-byte the same results as the linear path on the full dataset; tokenisation lives in one place with tests; build/query costs are measured and reported; limitations are documented.

Detailed deliverables will be added before Day 05 starts.
