# Week 01 — Day 06: Pagination & Performance

> **Status: placeholder.** Detailed requirements will be agreed with the mentor before the session.

| | |
| --- | --- |
| **Estimated time** | 3–4 hours |
| **Concepts** | Pagination contracts, Big O, benchmarking, profiling, caching |
| **Data sources** | normalised catalogue + index from Day 05 |
| **Builds on** | Day 05 indexing |

## Why this day exists

Interviewers expect you to quantify performance, not guess. This day makes you measure, write down the numbers, and design a pagination contract that stays correct when the underlying order is deterministic. It also exposes the cost of doing work in the wrong layer.

## Learning objectives

By the end of the day you should be able to:

- design a pagination contract with explicit edge-case behaviour (page bounds, limit limits, total counts);
- explain offset pagination versus cursor pagination, with trade-offs;
- state and defend time and space complexity for the full search pipeline;
- benchmark with `performance.now()` or an equivalent, over a warm and cold run;
- identify the dominant cost in a query and avoid repeated work;
- present numbers honestly: dataset size, iterations, variance, hardware caveats.

## Expected progression

1. Add pagination to the composed search API without changing result order.
2. Define behaviour for out-of-range pages, zero limits, negative values and oversized limits.
3. Build a repeatable benchmark script against the real dataset.
4. Produce a small results table (query, dataset size, mean/median time, memory) and commit the script, not the machine-specific noise.
5. Optimise one identified bottleneck and show before/after numbers.
6. Explain which optimisations you rejected and why.

## Data you will touch

The full normalised dataset and your Day 05 index. Use the real 5,200 products, not a toy subset, for the headline benchmark.

## Questions to prepare

1. What is the complexity of building the index versus answering one query?
2. Why can offset pagination return duplicates when the underlying data changes?
3. Where would you cache, and what would invalidate the cache?
4. Does pagination belong before or after ranking and sorting? Why?
5. How do you avoid reporting benchmark numbers that only look good because of a warm cache?

## Definition of done (provisional)

Pagination edge cases are tested; benchmark script is reproducible; complexity analysis is included in the PR; one measured optimisation is documented with before/after data; Day 01–05 suites remain green.

Detailed deliverables will be added before Day 06 starts.
