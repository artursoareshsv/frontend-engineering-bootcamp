# Week 01 — Day 01: Search Foundation

| | |
| --- | --- |
| **Status** | Ready — starter challenge |
| **Estimated time** | 2–3 hours |
| **Difficulty** | Warm-up, but the review is strict |
| **Concepts** | Strings, arrays, normalisation, token filtering, immutability |
| **Data sources** | `products.csv`, `categories.json`, `product-descriptions.json`, `inventory.json` |
| **Branch** | `challenge/week-01-day-01` |

---

## Business scenario

You are the frontend engineer on a marketplace team. The product catalogue lives in several systems: a PIM exports the product list as CSV, category and brand data live in separate services, warehouse stock comes from a WMS sync, and marketing copy lives in a CMS.

The team is building the first version of the storefront search. Before ranking, filters or pagination exist, users need to type words and see the products whose **names** contain those words. The catalogue is real-sized (5,200 products) and not clean. Your job is the foundation of the search engine.

This day is intentionally narrow. Every later day builds on this function's contract.

---

## What the finished feature must do

```ts
export function searchProducts(
  products: Product[],
  query: string,
): Product[];
```

### Product model

```ts
export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  inStock: boolean;
}
```

Only `name` matters today. `category`, `description`, `price` and `inStock` are already in the model because later days need them — do not filter on them yet.

### Requirements

1. Search only within the product **name**.
2. Be case-insensitive.
3. Ignore leading and trailing whitespace in the query.
4. Split the query into tokens on **one or more** whitespace characters (spaces, tabs, newlines).
5. Ignore empty tokens.
6. Require **every** token to appear in the product name.
7. Allow tokens in any order.
8. Use **substring** matching, not whole-word matching.
9. Preserve the original product order.
10. Never mutate the original array or product objects.
11. Return an empty array for an empty or whitespace-only query.
12. Return an empty array when no products match.

### Examples

| Query | Behaviour |
| --- | --- |
| `wireless mouse` | Matches `Wireless Gaming Mouse`, `Wireless Mouse`, `Wireless Mouse Pad (XL)` |
| `MOUSE wireless` | Same products as above |
| `wire` | Matches every name containing `wire` (`Wired`, `Wireless`, …) |
| `wireless tablet` | No results unless one name contains both tokens |
| `  ` | Empty array |
| `café` | Matches `Café Latte Mug`; accents are not folded away |

---

## What is provided

```text
challenges/week-01/day-01-search-foundation/
├── README.md                          ← this file
├── fixtures/
│   └── products.fixture.ts            ← 10 products used by the acceptance tests
├── scripts/
│   └── demo.ts                        ← runs your function against the real catalogue
├── src/
│   ├── csv.ts                         ← provided RFC 4180 parser
│   ├── load-products.ts               ← PROVIDED pipeline: six sources → Product[]
│   ├── search.ts                      ← YOUR FILE — currently throws
│   └── types.ts                       ← the Product interface
└── tests/
    ├── data.spec.ts                   ← passes already; proves the loader works
    └── search.spec.ts                 ← acceptance suite (skipped until you start)
```

### The provided data pipeline

`src/load-products.ts` reads the raw files and returns `Product[]`:

| `Product` field | Source |
| --- | --- |
| `id` | `products.csv → productId` |
| `name` | `products.csv → name`, trimmed |
| `category` | `categories.json`, joined on `categoryId`; `"Uncategorized"` when missing/unknown |
| `description` | `product-descriptions.json`, short + long joined; `""` when absent |
| `price` | `products.csv → price`, kept as-is (including anomalies) |
| `inStock` | `inventory.json`, sum of `quantity` across warehouses > 0 |

Read that file. It is the reference for how the six sources fit together, and Day 04 asks you to rebuild and extend this logic yourself.

### About the real data

- 5,200 products across 22 leaf categories.
- Product names are realistic and varied, including duplicates, mixed casing, accented characters and extra whitespace.
- 90 products have broken category references; ~1,450 have no marketing description; 321 are out of stock. None of that changes today's contract: the search only looks at the name.

Run `npm run data:validate` if you want to see the exact counts.

---

## What is out of scope

Do **not** implement:

- relevance ranking or scoring;
- sorting;
- category, description, price or stock filtering;
- pagination;
- an inverted index;
- search across descriptions or reviews;
- fuzzy matching, stemming, synonyms or diacritic folding.

If you add these, the review will ask you to remove them. Scope control is part of the exercise.

---

## Getting started

1. Install dependencies from the repository root:

   ```bash
   npm ci
   ```

2. Read the data documentation:

   ```bash
   less data/DATA_DICTIONARY.md
   ```

3. Create your branch:

   ```bash
   git switch main
   git pull
   git switch -c challenge/week-01-day-01
   ```

4. **Activate the acceptance suite**: open `tests/search.spec.ts` and remove `.skip` from `describe.skip(...)`. This is the only edit you should make to that file.

5. Run the focused suite:

   ```bash
   npm run test:day01
   ```

   You should see 20 failing tests. That is the starting point.

6. Implement `searchProducts` in `src/search.ts`.

7. Iterate:

   ```bash
   npm run test:watch
   ```

8. Try the real catalogue:

   ```bash
   npm run demo:day01
   npm run demo:day01 -- "wireless mouse"
   ```

9. Run the full validation before opening the PR:

   ```bash
   npm run validate
   ```

---

## Acceptance criteria

The public suite covers:

- exact and partial (substring) matches;
- uppercase and mixed-case queries;
- leading/trailing whitespace and runs of spaces, tabs and newlines;
- token order independence and repeated tokens;
- all-token matching (`wireless tablet` → no results);
- empty and whitespace-only queries;
- no matches;
- original ordering of results;
- no mutation of the input array or products;
- empty product list;
- punctuation, special characters and accented characters;
- the fact that only names are searched.

Passing tests is necessary, not sufficient. The interview evaluates whether you understand *why* the implementation behaves this way.

---

## Investigate before you code

Spend ten minutes answering these. They mirror what an interviewer will ask.

1. How many products does `loadProducts()` return, and why is that number different from the number of valid category references?
2. Which product fields are unused by today's contract, and why are they there?
3. `products.csv` stores some names as `ALL CAPS` and some with leading spaces. Where should that be normalised — in the loader, in the search function, or both? What are the trade-offs?
4. If you call the search twice, does your implementation depend on any shared mutable state?
5. What is the time complexity in terms of `n` products and `q` characters in the query? What about `k` tokens?

Write your answers in the PR description, not in code comments.

---

## Hints (only if stuck)

- Normalise the **query** once; then compare against each name normalised in the same way.
- `"a b".split(/\s+/)` is not enough on its own — think about what happens with leading/trailing whitespace and with an all-whitespace query.
- "Every token appears" is a separate idea from "any token appears".
- `Array.prototype.filter` returns a new array, but the product objects inside it are shared. That is fine; mutating them is not.
- Do not use `sort` — requirement 9 forbids reordering.

There is no reference solution in this repository. That is deliberate.

---

## Definition of done

- [ ] `searchProducts` implemented in `src/search.ts`.
- [ ] `describe.skip` removed; all 20 acceptance tests pass, none skipped or modified otherwise.
- [ ] `npm run validate` passes locally.
- [ ] `npm run demo:day01 -- "wireless mouse"` returns plausible results from the real catalogue.
- [ ] PR opened against `main` using the template, with complexity, alternatives and trade-offs explained.
- [ ] CI green and review conversations resolved.

---

## Interview connection

In the interview you will be asked to:

- explain your normalisation strategy and its trade-offs;
- state time and space complexity, with variables defined;
- handle a small live change (for example: "make the last token optional" or "match whole words only");
- explain what you would change to support 500,000 products.

Read [`docs/interview-guidelines.md`](../../../docs/interview-guidelines.md) before the session.
