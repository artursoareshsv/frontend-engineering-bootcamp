# Data

This folder contains the raw datasets you will work with for the whole bootcamp, plus documentation and JSON Schemas.

Start here, then read [`DATA_DICTIONARY.md`](./DATA_DICTIONARY.md) before writing any code.

```
data/
├── raw/                    ← generated and committed; do not edit by hand
├── processed/              ← git-ignored scratch space for your pipeline
├── schemas/                ← JSON Schemas and schema notes
├── DATA_DICTIONARY.md      ← fields, relationships, known issues
└── README.md               ← you are here
```

## The six sources

| File | Format | Records | Simulates |
| --- | --- | ---: | --- |
| `raw/products.csv` | CSV | 5,200 | Product catalogue |
| `raw/categories.json` | JSON array | 29 | Category hierarchy |
| `raw/brands.json` | JSON array | 60 | Brand catalogue |
| `raw/inventory.json` | JSON object | 6 warehouses, 9,435 rows | Warehouse stock |
| `raw/product-descriptions.json` | JSON array | 3,744 | Marketing copy |
| `raw/reviews.json` | JSON array | 9,600 | Customer reviews |

The data is synthetic, deterministic and intentionally imperfect. It is **not** a single pre-joined array: your job is to read the sources, understand their schemas, join them and deal with the inconsistencies.

## Explore before coding

Look at the first rows of each file:

```bash
head -n 6 data/raw/products.csv
node -e "console.log(require('./data/raw/categories.json').slice(0, 3))"
jq '.warehouses' data/raw/inventory.json
jq '.[0:2]' data/raw/reviews.json
```

Answer these questions before Day 01:

1. Which field identifies a product across files?
2. Which two files are *required* to build a product, and which are optional?
3. What happens to a product whose `categoryId` is empty or unknown?
4. How many warehouse rows can one product have?
5. Why can you not compute an average rating by summing ratings and dividing by review count?

## Rules

- `data/raw` is an input contract. Do not trim, sort or "fix" the files.
- `data/processed` is for artefacts you generate; it is ignored by Git except for its README.
- Regenerate raw data only with `npm run data:generate`, and never edit it by hand.
- If you believe the data is wrong, prove it with `npm run data:validate` and open an issue.

## Contracts and schemas

- Human-readable contract: [`DATA_DICTIONARY.md`](./DATA_DICTIONARY.md)
- Machine-readable shape: [`schemas/`](./schemas/README.md)
- Pipeline design and join rules: [`../docs/data-architecture.md`](../docs/data-architecture.md)
