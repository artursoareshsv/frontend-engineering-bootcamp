# Week 01 — Day 04: Data Transformation

> **Status: placeholder.** This is the day where you stop relying on the provided loader and own the pipeline. Detailed requirements will be agreed with the mentor before the session.

| | |
| --- | --- |
| **Estimated time** | 4–5 hours |
| **Concepts** | `map`, `filter`, `reduce`, `flatMap`, grouping, aggregation, joins |
| **Data sources** | all six raw sources |
| **Builds on** | Day 03 filtering |

## Why this day exists

The provided `loadProducts()` is deliberately minimal. In a real frontend or BFF, you are responsible for turning inconsistent source data into a stable internal model. This day is the core of the "data manipulation" competency: joins, aggregations, normalisation and explicit decisions about missing data.

## Learning objectives

By the end of the day you should be able to:

- build a normalised `Product` model from six sources with documented join rules;
- aggregate stock across warehouses, including duplicate sync rows;
- compute average rating and review count while ignoring null ratings and orphan reviews;
- group data with `Map`/`reduce` and explain the chosen data structures;
- handle optional descriptions and metadata without inventing data;
- decide where normalisation belongs (load, transform, or search) and defend it;
- keep the pipeline deterministic and testable.

## Expected progression

1. Re-implement the pipeline yourself in the challenge folder; the provided loader becomes a reference, not a dependency.
2. Extend the internal model with the fields later days need (brand, stock total, rating average, review count, category path).
3. Make every join explicit: inner vs left join, missing values, invalid references.
4. Resolve the inventory duplicate policy and document it.
5. Parse mixed date formats where needed, without throwing on unexpected input.
6. Add tests with small fixtures for each transformation and one integration test against the real dataset.
7. Consider (and measure) whether processing should happen once and be cached, or per request.

## Data you will touch

All six sources. This is the day that uses the entire dataset.

## Questions to prepare

1. Why is `reduce` a better fit than `map` for aggregating warehouse stock?
2. Which join should be used for descriptions, and which for categories? What are the consequences?
3. How many products have no reviews? What should their `averageRating` be — `0`, `null`, or absent?
4. Duplicate warehouse rows: sum, take the latest `lastRestockedAt`, or discard? Justify.
5. What is the difference between normalising in the pipeline and normalising inside the search function?

## Definition of done (provisional)

The pipeline is your own code, covered by unit and integration tests; every join and aggregation rule is documented; Day 01–03 behaviour is preserved; the output is deterministic across runs.

Detailed deliverables will be added before Day 04 starts.
