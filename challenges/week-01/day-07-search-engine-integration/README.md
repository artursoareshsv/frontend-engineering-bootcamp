# Week 01 — Day 07: Search Engine Integration

> **Status: placeholder.** This is the integration and architecture day. Detailed requirements will be agreed with the mentor before the session, and will include at least one new requirement introduced live.

| | |
| --- | --- |
| **Estimated time** | 4–6 hours |
| **Concepts** | Module boundaries, API design, dependency direction, documentation, integration |
| **Data sources** | all six sources, end to end |
| **Builds on** | Days 01–06 |

## Why this day exists

Individual functions are not a feature. This day assembles the pieces into one coherent search engine with a stable public API, testable modules and a documented contract. It is also where you demonstrate the skill interviewers care about most: making a change under pressure without breaking what already works.

## Learning objectives

By the end of the day you should be able to:

- design a small public API and keep implementation details internal;
- separate data loading, normalisation, indexing, ranking, filtering and pagination into modules with one direction of dependency;
- integrate new requirements without rewriting the whole system;
- write documentation that another engineer can follow;
- explain every trade-off in the final architecture, including what you would do differently at scale;
- demonstrate the end-to-end flow on the real dataset.

## Target API shape

The long-term direction for the week is:

```ts
const results = searchEngine.search('wireless mouse', {
  filters: {
    category: 'Accessories',
    minPrice: 20,
    maxPrice: 100,
    inStock: true,
  },
  sorting: { field: 'price', direction: 'asc' },
  pagination: { page: 1, limit: 10 },
});
```

This shape is a direction, not a Day 01 requirement. By Day 07 your implementation should support an equivalent call and return results with pagination metadata.

## Expected progression

1. Assemble the modules behind a `searchEngine` facade.
2. Define the public types and document the behaviour of every option.
3. Add integration tests that exercise the real dataset end to end.
4. Handle a live requirement change (the mentor will introduce it during the session) with a focused diff.
5. Write a short architecture note: module diagram, data flow, decisions, limitations.
6. Prepare a five-minute demo and a retrospective of the week.

## Data you will touch

Everything. This day validates that the whole pipeline — six raw sources to ranked, filtered, paginated results — works together.

## Questions to prepare

1. Which module owns normalisation, and why not the search function?
2. What is the public contract of `searchEngine`, and what are you deliberately not exposing?
3. Where can this architecture fail at 100× the data or traffic?
4. If a new requirement arrives ("support multiple categories in one query"), how much of the system changes?
5. What would you test first if a bug were reported in ranking but not in filtering?

## Definition of done (provisional)

End-to-end tests pass on the real dataset; the public API is documented; module boundaries are respected; the live change is implemented with a focused, reviewed diff; the architecture note and demo are ready.

Detailed deliverables will be added before Day 07 starts.
