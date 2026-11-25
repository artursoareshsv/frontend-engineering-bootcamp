# Weekly Roadmap — Week 1

One project, seven days, one branch and one PR per day. Each day is merged to `main` before the next one starts.

## At a glance

| Day | Challenge | Concepts | Primary sources | Est. time | Status |
| --- | --- | --- | --- | ---: | --- |
| 01 | [Search Foundation](../challenges/week-01/day-01-search-foundation/README.md) | Strings, tokenisation, filtering, immutability | products, categories, descriptions, inventory | 2–3 h | Ready |
| 02 | [Sorting & Ranking](../challenges/week-01/day-02-sorting-ranking/README.md) | Comparators, stability, scoring | + brands, reviews | 3–4 h | Placeholder |
| 03 | [Filtering](../challenges/week-01/day-03-filtering/README.md) | Predicates, composition, facets | full catalogue | 3–4 h | Placeholder |
| 04 | [Data Transformation](../challenges/week-01/day-04-data-transformation/README.md) | map/reduce/flatMap, joins, aggregation | all six sources | 4–5 h | Placeholder |
| 05 | [Indexing](../challenges/week-01/day-05-data-structures-indexing/README.md) | Map, Set, inverted index | normalised model | 4–5 h | Placeholder |
| 06 | [Pagination & Performance](../challenges/week-01/day-06-pagination-performance/README.md) | Pagination, Big O, benchmarking | normalised model + index | 3–4 h | Placeholder |
| 07 | [Integration](../challenges/week-01/day-07-search-engine-integration/README.md) | Architecture, API design, live change | everything | 4–6 h | Placeholder |

Total: roughly 24–31 focused hours, or one intensive week.

## Milestones

| Milestone | Criteria |
| --- | --- |
| **M1 — Search works** | Day 01 merged; `searchProducts` passes the public suite on the real catalogue |
| **M2 — Search is usable** | Days 02–03 merged; results are ranked and filterable with documented semantics |
| **M3 — Data is owned** | Day 04 merged; the pipeline is yours, tested and documented |
| **M4 — Search scales** | Days 05–06 merged; indexed search has parity and measured performance |
| **M5 — Feature complete** | Day 07 merged; `searchEngine` façade, integration tests, architecture note, demo |

## How requirements are finalised

Days 02–07 are placeholders on purpose. Before each day:

1. The learner reads the day's objectives and data sources.
2. A 15-minute planning conversation with the mentor agrees the scope and the acceptance criteria for that day.
3. The mentor updates the day's README in a docs PR (or adds a `REQUIREMENTS.md`) before the challenge branch starts.
4. The learner implements against the agreed criteria.

This keeps the difficulty calibrated to actual progress instead of a pre-written script.

## Daily rhythm

| Phase | Time | Activity |
| --- | --- | --- |
| Read & plan | 15–20 min | Challenge README, data dictionary, write down assumptions |
| Implement | 90–150 min | Small steps, focused tests running |
| Self-review | 15 min | Read your own diff; check edge cases; run `npm run validate` |
| PR & CI | 10 min | Fill the template, open the PR, wait for green CI |
| Review | 20–30 min | Address comments; resolve conversations |
| Interview drill (optional) | 30 min | Explain the day's work aloud; answer complexity questions |

## Weekly interview sessions

- **Mid-week (after Day 03 or 04):** 45-minute session on the work so far, focused on explanation and one live change.
- **End of week (after Day 07):** 75-minute session following `docs/interview-guidelines.md`, scored with `docs/evaluation-rubric.md`.

## Success criteria for the week

The learner can, without notes:

- explain the end-to-end data flow from six raw files to paginated results;
- justify every normalisation and aggregation decision;
- state time and space complexity for search, indexing, ranking and pagination;
- implement a small, unplanned change in the existing code without breaking tests;
- describe what would change at 100× the data and 100× the traffic.

## If the week slips

Do not skip days or merge unfinished work to keep the schedule. Instead:

- reduce the scope of the placeholder day (e.g. ranking by one signal instead of three);
- keep Day 04 and Day 07 intact — they carry the most interview value;
- move performance measurement earlier rather than dropping it entirely.

## After Week 1

Candidate directions for Week 2 (not yet scheduled):

- a React UI over the search engine: state management, debouncing, URL-synced filters, accessible results;
- server-side search simulation with a small API layer and caching;
- testing depth: component tests, contract tests, mocking boundaries;
- a second data domain to practise generalisation (orders, returns, inventory movements).
