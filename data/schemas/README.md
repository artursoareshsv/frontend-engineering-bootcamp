# Schemas

Machine-readable descriptions of the raw datasets, plus notes on the parts that JSON Schema cannot express.

| Schema | Applies to | Notes |
| --- | --- | --- |
| [`products.row.schema.json`](./products.row.schema.json) | `raw/products.csv` | Describes the **logical** row after CSV parsing; the file itself stores every value as text |
| [`categories.schema.json`](./categories.schema.json) | `raw/categories.json` | Array of category objects |
| [`brands.schema.json`](./brands.schema.json) | `raw/brands.json` | Array of brand objects |
| [`inventory.schema.json`](./inventory.schema.json) | `raw/inventory.json` | Object with `warehouses` and `records` |
| [`product-descriptions.schema.json`](./product-descriptions.schema.json) | `raw/product-descriptions.json` | Array of description records |
| [`reviews.schema.json`](./reviews.schema.json) | `raw/reviews.json` | Array of review records |

Schemas use JSON Schema draft-07 and `additionalProperties: false`.

## What the schemas deliberately allow

The schemas describe the **contract**, including its dirty parts:

- `categoryId` and `brandId` may be empty strings or unknown ids;
- prices may be zero, negative or extremely large;
- dates are typed as `string` because several formats coexist;
- nullable fields are typed `["string", "null"]` where documented.

This is not an accident. A schema that only allowed clean values would reject the real input.

## What the schemas cannot express

Some rules are semantic and documented in [`../DATA_DICTIONARY.md`](../DATA_DICTIONARY.md):

- `products.categoryId` references `categories.id`, but broken references are expected;
- `inventory.records.reservedQuantity <= quantity`;
- a product's stock is the sum across warehouse rows, and duplicate rows exist;
- review ratings are `1..5` **or** `null`, and 120 reviews reference unknown products;
- `products.csv` order is meaningful (Day 01 must preserve it).

## Using the schemas

The bootcamp does not require a schema validator. You can use these files as documentation, or validate with a library such as AJV if Day 04 asks for a validation step. If you do, remember that `data/raw` must not be modified to satisfy a schema.

## Keeping them accurate

If you change the generator or the data contract, update the schemas and the data dictionary in the same PR. A schema that lies is worse than no schema.
