import { loadProducts } from '../src/load-products';
import { searchProducts } from '../src/search';

/**
 * Manual demo: run `npm run demo:day01` (optionally add a query, e.g.
 * `npm run demo:day01 -- "wireless mouse"`).
 */
const query = process.argv.slice(2).join(' ').trim() || 'wireless mouse';

const products = loadProducts();
console.log(`Loaded ${products.length} products from data/raw.`);
console.log(`Searching for "${query}"...`);

try {
  const results = searchProducts(products, query);
  console.log(`\n${results.length} result(s):\n`);

  for (const product of results.slice(0, 10)) {
    const stock = product.inStock ? 'in stock' : 'out of stock';
    console.log(`- ${product.name} | ${product.category} | $${product.price.toFixed(2)} | ${stock}`);
  }

  if (results.length > 10) {
    console.log(`...and ${results.length - 10} more`);
  }
} catch (error) {
  console.error(`\n${(error as Error).message}`);
  process.exitCode = 1;
}
