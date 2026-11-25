# Frontend Engineering Bootcamp

A practical, project-based frontend engineering bootcamp focused on real-world challenges and technical interview preparation.

This repository is not a tutorial. It is a **single evolving project** — an e-commerce search engine — that you build incrementally over a week, using realistic, deliberately messy data from six different systems. Each day adds a capability and a concept that comes up in frontend interviews: string handling, comparators, filter composition, data transformation, indexing, pagination, performance analysis and architecture.

The goal is not to memorise algorithms. The goal is to be able to **solve a problem, test it, explain your decisions and defend the trade-offs** in an interview — with or without documentation and AI tools at hand.

---

## Who this is for

- Junior frontend developers with roughly 1.5 years of IT experience.
- 6–8 months of hands-on React/TypeScript work.
- Some exposure to AI-assisted development.
- Preparing for international frontend engineering interviews.

It assumes you can already write functions, read TypeScript, use `npm`, and work with Git. It does **not** assume you have built a data pipeline, an index, or a search feature before.

---

## How the programme works

Week 1 is a guided, day-by-day build of the search engine. Every day starts from the previous day's merged work on `main`.

| Day | Challenge | Main concepts | Data sources |
| --- | --- | --- | --- |
| 01 | [Search Foundation](challenges/week-01/day-01-search-foundation/README.md) | Strings, arrays, normalisation, token filtering | products, categories, descriptions, inventory |
| 02 | [Sorting & Relevance Ranking](challenges/week-01/day-02-sorting-ranking/README.md) | Sorting, comparators, scoring | + brands, reviews |
| 03 | [Filtering & Query Composition](challenges/week-01/day-03-filtering/README.md) | Predicates, filter composition | catalogue + inventory + reviews |
| 04 | [Data Transformation](challenges/week-01/day-04-data-transformation/README.md) | `map`, `reduce`, `flatMap`, grouping, aggregation | all six sources |
| 05 | [Data Structures & Indexing](challenges/week-01/day-05-data-structures-indexing/README.md) | `Map`, `Set`, inverted index | all six sources |
| 06 | [Pagination & Performance](challenges/week-01/day-06-pagination-performance/README.md) | Pagination, Big O, benchmarking | all six sources |
| 07 | [Search Engine Integration](challenges/week-01/day-07-search-engine-integration/README.md) | Architecture, integration, new requirements | all six sources |

Days 02–07 contain **learning objectives and placeholders**, not final requirements. Detailed requirements are added before each day starts, based on how Day 01 went. This is intentional: the programme adapts to you.

The long-term target API (not Day 01) looks like this:

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

---

## What is in the repository

```text
frontend-engineering-bootcamp/
├── README.md                  ← you are here
├── CONTRIBUTING.md            ← branch, PR and review workflow
├── package.json
├── tsconfig.json
├── eslint.config.js
├── vitest.config.ts
├── data/
│   ├── raw/                   ← generated source datasets (committed)
│   ├── processed/             ← scratch space for your pipeline output
│   ├── schemas/               ← JSON Schemas for each source
│   ├── DATA_DICTIONARY.md     ← every field, relationship and known issue
│   └── README.md
├── scripts/
│   ├── generate-dataset.ts    ← deterministic dataset generator
│   └── validate-dataset.ts    ← structural + referential validation
├── challenges/
│   └── week-01/
│       ├── day-01-search-foundation/   ← README, provided loader, stub, public tests
│       └── day-02 … day-07/            ← roadmap entries / placeholders
├── docs/
│   ├── data-architecture.md
│   ├── weekly-roadmap.md
│   ├── interview-guidelines.md
│   ├── evaluation-rubric.md
│   └── branch-protection.md
└── .github/
    ├── workflows/validate.yml
    └── PULL_REQUEST_TEMPLATE.md
```

---

## Prerequisites

- Node.js **20 or newer**
- npm **10 or newer**
- Git and a GitHub account with access to this repository

No paid tools, API keys or external services are required. Everything runs locally.

---

## Install

```bash
git clone <repository-url>
cd frontend-engineering-bootcamp
npm ci
```

If you are starting from an empty clone and `package-lock.json` is present, always prefer `npm ci`. Use `npm install` only when you intentionally change dependencies.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript strict-mode type check (`tsc --noEmit`) |
| `npm run lint` | ESLint over scripts, challenges and config |
| `npm test` | Run the Vitest suites |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:day01` | Run only the Day 01 suite |
| `npm run data:generate` | Regenerate `data/raw` deterministically |
| `npm run data:validate` | Validate dataset structure and references |
| `npm run demo:day01` | Search the real catalogue once Day 01 is implemented |
| `npm run validate` | Typecheck + lint + data validation + tests (what CI runs) |

---

## The dataset

The catalogue is synthetic but realistic and **deterministic**. It is generated from a fixed seed (`20260101`) with hand-written product vocabulary — no external APIs, no placeholder names like "Product 1".

| Source | Format | Records | What it represents |
| --- | --- | ---: | --- |
| `data/raw/products.csv` | CSV | 5,200 | Product catalogue (PIM) |
| `data/raw/categories.json` | JSON array | 29 | Category hierarchy (7 roots, 22 leaves) |
| `data/raw/brands.json` | JSON array | 60 | Brand catalogue (supplier system) |
| `data/raw/inventory.json` | JSON object | 6 warehouses / 9,435 records | Warehouse stock (WMS sync) |
| `data/raw/product-descriptions.json` | JSON array | 3,744 | Marketing copy and metadata (CMS) |
| `data/raw/reviews.json` | JSON array | 9,600 | Customer reviews and ratings |

The data is **not clean**. It contains missing and invalid references, inconsistent capitalisation, untrimmed values, duplicate warehouse rows, out-of-stock products, price anomalies, missing review ratings and mixed date formats. All of them are documented in [`data/DATA_DICTIONARY.md`](data/DATA_DICTIONARY.md) and are part of the exercise. Do not "fix" the raw files.

Start with [`data/README.md`](data/README.md) to understand the six sources, then read the dictionary before Day 01.

### Regenerating the dataset

```bash
npm run data:generate    # rewrites data/raw from the fixed seed
npm run data:validate    # checks counts, keys and references
```

Regeneration must produce byte-identical files. CI enforces this by regenerating the data and failing if `git diff` is not empty.

---

## Starting Day 01

1. Read [`data/README.md`](data/README.md) and skim [`data/DATA_DICTIONARY.md`](data/DATA_DICTIONARY.md).
2. Sync `main`:

   ```bash
   git switch main
   git pull
   ```

3. Create your branch:

   ```bash
   git switch -c challenge/week-01-day-01
   ```

4. Read the challenge: [`challenges/week-01/day-01-search-foundation/README.md`](challenges/week-01/day-01-search-foundation/README.md).
5. Open `challenges/week-01/day-01-search-foundation/src/search.ts` and implement `searchProducts`.
6. Activate the acceptance suite by removing `.skip` from `describe.skip` in `challenges/week-01/day-01-search-foundation/tests/search.spec.ts`.
7. Run the checks:

   ```bash
   npm run test:day01
   npm run typecheck
   npm run lint
   npm run demo:day01 -- "wireless mouse"
   ```

8. Commit, push and open a Pull Request. Fill in the PR template **before** asking for review.
9. Wait for CI, address review feedback, then merge after approval.

The acceptance suite is skipped in `main` on purpose so that the starter repository stays green. **Do not modify the tests to make them pass** — if you think a test is wrong, explain why in the PR.

---

## How to submit challenges

Full details are in [`CONTRIBUTING.md`](CONTRIBUTING.md). The short version:

1. One challenge per branch, named `challenge/week-01-day-01`.
2. One Pull Request per challenge, targeting `main`.
3. CI must be green.
4. The PR description must explain the approach, alternatives, complexity and what you would change in production.
5. An approval is required before merging, and direct pushes to `main` are not allowed.

### Branch protection status

Server-side branch protection is **not currently enforceable**: this repository is private and owned by a GitHub Free personal account, and GitHub restricts branch protection and rulesets on private repositories to Pro/Team/Enterprise plans. The intended rules (pull request required, `validate` status check required, force pushes and deletions blocked, conversation resolution required) are documented in [`docs/branch-protection.md`](docs/branch-protection.md), together with the exact ruleset to apply after an upgrade and the caveat that a second reviewer account is needed before requiring approvals.

Until then, the workflow is enforced by convention, by CI running on every PR, and by the PR template. Do not push to `main` directly.

---

## Interview preparation

The challenge is the material for a structured interview. Two documents support it:

- [`docs/interview-guidelines.md`](docs/interview-guidelines.md) — how the mentor runs the session, question bank, live-change exercise, AI policy.
- [`docs/evaluation-rubric.md`](docs/evaluation-rubric.md) — nine criteria, a 1–5 scale, and concrete examples of weak, acceptable and strong performance.

You are allowed to consult documentation and use AI tools. You must be able to explain, test and defend whatever you produce.

---

## Rules of the bootcamp

- The raw datasets are inputs, not suggestions. Handle their quirks deliberately and document your decisions.
- Do not commit generated artefacts to `data/processed` (it is ignored except for its README).
- Do not weaken tests, skip them silently, or add `.only`.
- Do not paste a solution you cannot explain. In the interview you will be asked to change it live.
- Keep the architecture proportional. A readable 120-line pipeline is better than a framework.

---

## Troubleshooting

**`npm run demo:day01` throws "searchProducts is not implemented yet"** — expected until you implement the function.

**Tests are all skipped** — remove `.skip` from `describe.skip` in the Day 01 acceptance suite.

**`data:generate` changes files on every run** — that is a bug in the generator, not in your work. Open an issue; do not commit the diff.

**TypeScript complains about unused parameters in `search.ts`** — keep the required signature, and use the parameters once you implement the function.

---

## License and usage

This repository is private training material. The dataset is entirely synthetic; brands, products and reviews are fictional.
