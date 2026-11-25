# Data Dictionary

This document describes every raw data source, its schema, how the sources relate, and every known data-quality issue. It is an input contract: the raw files are **not** cleaned, and the issues below are part of the challenges.

- Seed: `20260101`
- Generator: `scripts/generate-dataset.ts`
- Validator: `scripts/validate-dataset.ts`
- Regenerate: `npm run data:generate`
- Validate: `npm run data:validate`

All data is synthetic. Brands, products, reviews and authors are fictional.

---

## 1. Files at a glance

| File | Format | Root shape | Records | System it simulates |
| --- | --- | --- | ---: | --- |
| `raw/products.csv` | CSV (RFC 4180) | header + rows | 5,200 | Product Information Management (PIM) |
| `raw/categories.json` | JSON | array of objects | 29 | Category management |
| `raw/brands.json` | JSON | array of objects | 60 | Supplier / brand catalogue |
| `raw/inventory.json` | JSON | object | 6 warehouses, 9,435 stock records | Warehouse Management System (WMS) sync |
| `raw/product-descriptions.json` | JSON | array of objects | 3,744 | Content management system (CMS) |
| `raw/reviews.json` | JSON | array of objects | 9,600 | Reviews platform |

The six sources are deliberately inconsistent: different formats, different levels of completeness, different conventions for dates and identifiers.

### Identifier relationships

```text
products.productId  ←──── inventory.records.productId
products.productId  ←──── product-descriptions.productId
products.productId  ←──── reviews.productId
products.categoryId ────→ categories.id
products.brandId    ────→ brands.id
inventory.records.warehouseId ────→ inventory.warehouses.warehouseId
categories.parentId ────→ categories.id   (self-referencing hierarchy)
```

`productId` is the only key shared by four sources. `categories.id` and `brands.id` are referenced from `products.csv`. `warehouseId` is internal to `inventory.json`.

Not every reference is valid. See [section 6](#6-known-data-quality-issues).

---

## 2. `products.csv`

Comma-separated values with a header row. Fields containing commas, quotes or leading/trailing whitespace are quoted per RFC 4180. Do not parse this file with `line.split(',')`.

```csv
productId,sku,name,categoryId,brandId,price,currency,createdAt,status
1,SKU-C08-0001,SonicWave Vertex Compact Tablet,CAT-08,BR-006,788.52,USD,2023-01-14,active
```

| Column | Type in file | Meaning | Notes |
| --- | --- | --- | --- |
| `productId` | integer as text | Primary key | Unique, 1–5200, contiguous |
| `sku` | string | Stock keeping unit | Format `SKU-C<categoryNumber>-<sequence>`; 25 values have a trailing space |
| `name` | string | Display name | Trimmable whitespace, inconsistent casing, duplicate names |
| `categoryId` | string | FK → `categories.id` | May be empty or unknown (`CAT-99`) |
| `brandId` | string | FK → `brands.id` | May be empty or unknown (`BR-99`) |
| `price` | decimal string | Shelf price | USD; includes deliberate anomalies |
| `currency` | string | ISO currency code | Always `USD` |
| `createdAt` | string | Catalogue creation date | ISO `YYYY-MM-DD` for most rows; 35 rows use `MM/DD/YYYY` |
| `status` | enum | Lifecycle state | `active` 4,696 · `discontinued` 360 · `draft` 144 |

The file is ordered by `productId`. That order is meaningful: Day 01 requires search results to preserve it.

---

## 3. `categories.json`

JSON array. Seven roots have `parentId: null`; the other 22 are leaves and are the only categories products are assigned to.

```json
{
  "id": "CAT-13",
  "name": "Keyboards & Mice",
  "slug": "keyboards-and-mice",
  "parentId": "CAT-02",
  "description": "Mechanical keyboards, wireless mice and desk input devices."
}
```

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | Primary key, `CAT-01` … `CAT-29` |
| `name` | string | Display name (two values are deliberately dirty) |
| `slug` | string | URL-safe identifier, unique |
| `parentId` | string \| null | Parent category id; `null` for roots |
| `description` | string | Short merchandising description |

### Category tree

| id | name | parent | products |
| --- | --- | --- | ---: |
| CAT-01 | Electronics | — | 0 |
| CAT-02 | Accessories | — | 0 |
| CAT-03 | Home Appliances | — | 0 |
| CAT-04 | Furniture | — | 0 |
| CAT-05 | Clothing | — | 0 |
| CAT-06 | Sports & Outdoors | — | 0 |
| CAT-07 | Books & Stationery | — | 0 |
| CAT-08 | Computers | CAT-01 | 432 |
| CAT-09 | Smartphones | CAT-01 | 205 |
| CAT-10 | Audio | CAT-01 | 377 |
| CAT-11 | Cameras | CAT-01 | 152 |
| CAT-12 | Wearables | CAT-01 | 203 |
| CAT-13 | Keyboards & Mice | CAT-02 | 427 |
| CAT-14 | Cables & Adapters | CAT-02 | 307 |
| CAT-15 | Cases & Sleeves | CAT-02 | 223 |
| CAT-16 | Desk Accessories | CAT-02 | 201 |
| CAT-17 | Kitchen Appliances | CAT-03 | 302 |
| CAT-18 | Cleaning Appliances | CAT-03 | 142 |
| CAT-19 | Climate Control | CAT-03 | 110 |
| CAT-20 | Office Furniture | CAT-04 | 244 |
| CAT-21 | Living Room | CAT-04 | 179 |
| CAT-22 | Bedroom | CAT-04 | 163 |
| CAT-23 | Men's Clothing | CAT-05 | 228 |
| CAT-24 | Women's Clothing | CAT-05 | 254 |
| CAT-25 | Footwear | CAT-05 | 202 |
| CAT-26 | Fitness Equipment | CAT-06 | 161 |
| CAT-27 | Outdoor Gear | CAT-06 | 169 |
| CAT-28 | Books | CAT-07 | 279 |
| CAT-29 | Stationery | CAT-07 | 150 |

90 products are not counted in this table: 55 have no `categoryId` and 35 point at the non-existent `CAT-99`.

---

## 4. `brands.json`

JSON array of 60 brands.

```json
{
  "id": "BR-001",
  "name": "Voltix",
  "slug": "voltix",
  "country": "Germany",
  "foundedYear": 2009,
  "website": "https://voltix.example"
}
```

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | Primary key, `BR-001` … `BR-060` |
| `name` | string | Brand name; some contain accents, `&`, or inconsistent casing |
| `slug` | string | URL-safe identifier, unique |
| `country` | string | Country of origin |
| `foundedYear` | integer | Year founded |
| `website` | string \| null | Brand site; `null` for two brands |

Brands are not evenly spread: electronics and accessories have many brands, books and stationery share seven publisher brands. A product's brand should also be plausible for its category, which matters if you build brand facets later.

---

## 5. `inventory.json`

JSON object with two top-level arrays: physical warehouses and stock records.

```json
{
  "schemaVersion": 1,
  "warehouses": [
    {
      "warehouseId": "WH-AMS-01",
      "name": "Amsterdam Fulfilment Centre",
      "city": "Amsterdam",
      "country": "Netherlands",
      "region": "EMEA",
      "capacityUnits": 120000
    }
  ],
  "records": [
    {
      "inventoryId": "INV-000001",
      "productId": 4312,
      "warehouseId": "WH-BER-01",
      "quantity": 34,
      "reservedQuantity": 6,
      "lastRestockedAt": "2025-11-03T08:14:22.000Z"
    }
  ]
}
```

### `warehouses[]`

| Field | Type | Meaning |
| --- | --- | --- |
| `warehouseId` | string | Primary key, `WH-AMS-01`, `WH-BER-01`, `WH-MAD-01`, `WH-WAW-01`, `WH-MAN-01`, `WH-NJ-01` |
| `name` | string | Human-readable name |
| `city` / `country` | string | Location |
| `region` | enum | `EMEA` or `NA` |
| `capacityUnits` | integer | Nominal capacity |

### `records[]`

| Field | Type | Meaning |
| --- | --- | --- |
| `inventoryId` | string | Primary key of the stock row, `INV-000001` … ; unique even when the row is a duplicate |
| `productId` | integer | FK → `products.productId` |
| `warehouseId` | string | FK → `warehouses[].warehouseId` |
| `quantity` | integer ≥ 0 | Units physically on hand |
| `reservedQuantity` | integer ≥ 0 | Units already reserved for open orders; always ≤ `quantity` |
| `lastRestockedAt` | string | ISO 8601 timestamp for most rows; 43 rows use `MM/DD/YYYY` |

Records are not sorted. A product may have 1–4 warehouse rows, or duplicates (see below).

### Derived meaning of "in stock"

A product is **in stock** when the sum of `quantity` across all its records is greater than zero. `reservedQuantity` is informational; subtracting it is a product decision, not part of the raw contract. 4,879 products are in stock and 321 are not.

---

## 6. `product-descriptions.json`

JSON array, one record per described product. Coverage is 72% (`3,744 / 5,200`).

```json
{
  "productId": 5,
  "shortDescription": "14-inch Chromebook by Zephyra, available in burgundy and made for everyday productivity and creative work.",
  "longDescription": "Zephyra built this piece around up to 18h battery and fingerprint reader. Finished in carbon fibre, it balances durability with a clean look.",
  "features": ["Up to 18h battery", "Fingerprint reader"],
  "material": "Carbon fibre",
  "warrantyMonths": 24,
  "updatedAt": "2025-07-31"
}
```

| Field | Type | Meaning | Missing values |
| --- | --- | --- | --- |
| `productId` | integer | FK → `products.productId`; unique in this file | never |
| `shortDescription` | string | One-sentence marketing copy | never empty in this dataset |
| `longDescription` | string \| null | Longer copy | 315 records are `null` |
| `features` | string[] | 2–4 feature bullets | always present, can be short |
| `material` | string \| null | Material description | 1,311 records are `null` |
| `warrantyMonths` | 12 \| 24 \| 36 \| null | Warranty length | 935 records are `null` |
| `updatedAt` | string | Last content update | 72 records use `MM/DD/YYYY`, the rest ISO |

Products absent from this file have no marketing content at all (1,456 products).

---

## 7. `reviews.json`

JSON array of 9,600 reviews.

```json
{
  "reviewId": "REV-000123",
  "productId": 2871,
  "rating": 4,
  "title": "Solid value for the price",
  "body": "Does what it promises, although the instructions could be clearer. Good overall, but I expected slightly better materials at this price.",
  "authorName": "Marta K.",
  "createdAt": "2025-02-11",
  "verifiedPurchase": true,
  "helpfulVotes": 3
}
```

| Field | Type | Meaning | Missing values |
| --- | --- | --- | --- |
| `reviewId` | string | Primary key, `REV-000001` … | never |
| `productId` | integer | FK → `products.productId` | 120 reviews reference unknown ids (`9000001`–`9000120`) |
| `rating` | 1–5 \| null | Star rating | 282 reviews are `null` |
| `title` | string \| null | Review headline | 545 reviews are `null` |
| `body` | string \| null | Review text | 361 reviews are `null` |
| `authorName` | string | Display name | `"Anonymous"` on ~8% of reviews |
| `createdAt` | string | Date or timestamp | Mixed formats, see below |
| `verifiedPurchase` | boolean | Purchase verified | never |
| `helpfulVotes` | integer ≥ 0 | Community upvotes | never |

Date formats present in `createdAt`:

| Format | Example | Count |
| --- | --- | ---: |
| ISO date | `2025-02-11` | 5,319 |
| ISO date-time | `2025-02-11T14:03:22.000Z` | 2,379 |
| `MM/DD/YYYY` or `DD/MM/YYYY` (ambiguous by design) | `02/11/2025` | 1,902 |

Only 865 products have at least one review; 4,335 have none. Review counts per product are uneven, which is realistic and matters for ranking.

---

## 8. Known data-quality issues

The generator injects controlled problems. Most records are clean; the numbers below are exact for the committed dataset and are stable because the seed is fixed. A single record can carry more than one issue.

### 8.1 Product catalogue

| Issue | Count | Example / detail |
| --- | ---: | --- |
| Name with leading/trailing whitespace (spaces or tabs) | 130 | `"  Hearthstone Sweep … \t"` |
| Name in ALL CAPS | 95 | `CLASP KANSO WIRELESS MOUSE` |
| Name in all lowercase | 45 | `portside conduit braided hdmi cable co567` |
| Duplicate names after trimming and lowercasing | 188 | Same model generated twice; ids differ |
| SKU with trailing space | 25 | `"SKU-C14-0171 "` |
| Missing `categoryId` | 55 | Empty string in the CSV |
| Unknown `categoryId` | 35 | `CAT-99` does not exist |
| Missing `brandId` | 44 | Empty string (one of the 45 injected values was overwritten by `BR-99`) |
| Unknown `brandId` | 30 | `BR-99` does not exist |
| Price anomaly | 45 | `0`, `0.01`, `0.50`, `-19.99`, `99999`, `249999.99` |
| `createdAt` in `MM/DD/YYYY` | 35 | Mixed with ISO dates in the same column |
| Discontinued or draft products | 504 | `status` is `discontinued` (360) or `draft` (144) |

### 8.2 Category and brand systems

| Issue | Count | Detail |
| --- | ---: | --- |
| Category name with trailing space | 1 | `CAT-08` is `"Computers "` |
| Category name in lowercase | 1 | `CAT-21` is `"living room"` |
| Brand name with trailing space and lowercase | 1 | `BR-012` is `"zephyra "` |
| Brand name in uppercase with accents | 1 | `BR-040` is `"BERGSTRÖM"` |
| Brand without website | 2 | `website: null` |

### 8.3 Inventory

| Issue | Count | Detail |
| --- | ---: | --- |
| Products with zero total stock | 321 | Includes 65 products forced to zero despite having rows |
| Duplicate `(productId, warehouseId)` rows with conflicting quantities | 45 | Different `inventoryId`, different `quantity` and `lastRestockedAt` |
| `lastRestockedAt` in `MM/DD/YYYY` | 43 | Remaining rows are ISO timestamps |
| Rows with `quantity: 0` | many | Legitimate: warehouse has no units |

There are **no** orphan inventory rows: every `productId` exists in the catalogue. Inventory is the one source with guaranteed referential integrity.

### 8.4 Descriptions and reviews

| Issue | Count | Detail |
| --- | ---: | --- |
| Products without any description record | 1,456 | Join is optional |
| Descriptions with `longDescription: null` | 315 | Short copy still exists |
| Descriptions with `material: null` | 1,311 | |
| Descriptions with `warrantyMonths: null` | 935 | |
| Descriptions with `updatedAt` in `MM/DD/YYYY` | 72 | |
| Reviews with `rating: null` | 282 | Cannot be averaged naively |
| Reviews with `title: null` | 545 | |
| Reviews with `body: null` | 361 | |
| Reviews referencing unknown products | 120 | `productId` 9,000,001+ |
| Products without any review | 865 | Average rating must be optional |

### 8.5 What the loader does about it

The Day 01 loader (`challenges/week-01/day-01-search-foundation/src/load-products.ts`) is a **provided reference** for a minimal, honest pipeline. It:

- trims product, category and brand names;
- replaces missing/unknown categories with `"Uncategorized"`;
- joins descriptions and uses `""` when absent;
- sums inventory quantities across warehouses and exposes `inStock: boolean`;
- keeps prices exactly as received, including anomalies;
- preserves catalogue order and does not dedupe.

It does **not** fix prices, infer missing brands, resolve duplicate warehouse rows or normalize dates. Those decisions belong to later challenges and to you.

---

## 9. Which challenge uses which source

| Source | Day 01 | Day 02 | Day 03 | Day 04 | Day 05 | Day 06 | Day 07 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| products.csv | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| categories.json | ✅ |  | ✅ | ✅ | ✅ |  | ✅ |
| brands.json |  | ✅ | ✅ | ✅ | ✅ |  | ✅ |
| inventory.json | ✅ |  | ✅ | ✅ | ✅ | ✅ | ✅ |
| descriptions | ✅ |  |  | ✅ | ✅ |  | ✅ |
| reviews.json |  | ✅ | ✅ | ✅ | ✅ |  | ✅ |

Day 01 uses categories, descriptions and inventory to build the `Product` shape. Brands, reviews and deeper aggregation become relevant from Day 02 onward.

---

## 10. Regeneration and determinism

The generator is seeded (`20260101`) and uses a single sequential random stream. Running it twice produces byte-identical files:

```bash
npm run data:generate
shasum -a 256 data/raw/*
npm run data:generate
shasum -a 256 data/raw/*
```

Expected checksums for this revision:

```text
563afa4e13ac63305f44c5632ec89f2cc224b2471bf80063a36a3105b1f9b0f8  products.csv
7f043b5a47f26944d7a3b585fc7e6defd70a5b64f9f1669bdc08bebeb39f666d  categories.json
aa88af2fb8e595985465ff0c1d248661cf49bd6513bf3b1f56b75f53ef30aadb  brands.json
6be52e18eb0fdb990994c2897d66d3a0de07e75579df6acf41451b11ca5cf512  inventory.json
61262283028f75294b3a1c35086ed8fcca63874beb7e8e2a578d0fae97613907  product-descriptions.json
f1e0eeb8b08b4215182e6616d486efd377c2327bc8be6d6496936131a13854a7  reviews.json
```

CI regenerates the data and fails if `git diff data/raw` is not empty. If you intentionally change the generator, update this document, commit the new raw files and update the checksums.

### Files are written in a fixed order

`products.csv`, `categories.json`, `brands.json`, `inventory.json`, `product-descriptions.json`, `reviews.json`. JSON is written with two-space indentation and a trailing newline. Do not reformat raw files; it changes checksums and creates noise.
