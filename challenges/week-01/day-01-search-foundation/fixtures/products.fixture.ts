import type { Product } from '../src/types';

/**
 * Small, explicit fixture used by the Day 01 acceptance tests.
 * Names are intentionally varied: casing, punctuation, accents and compound
 * product types. Keep assertions readable — no hidden edge cases live here.
 */
export const products: Product[] = [
  {
    id: 1,
    name: 'Wireless Gaming Mouse',
    category: 'Electronics',
    description: 'Low-latency gaming mouse with adjustable DPI.',
    price: 79.99,
    inStock: true,
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    category: 'Electronics',
    description: 'Compact wireless mouse for everyday work.',
    price: 24.5,
    inStock: true,
  },
  {
    id: 3,
    name: 'Wireless Keyboard',
    category: 'Electronics',
    description: 'Slim wireless keyboard with a numeric keypad.',
    price: 49,
    inStock: false,
  },
  {
    id: 4,
    name: 'Mechanical Gaming Keyboard',
    category: 'Electronics',
    description: 'Hot-swappable mechanical keyboard with RGB lighting.',
    price: 129,
    inStock: true,
  },
  {
    id: 5,
    name: 'Wired Mouse',
    category: 'Electronics',
    description: 'Simple wired mouse with a 2 m cable.',
    price: 12.99,
    inStock: true,
  },
  {
    id: 6,
    name: 'USB-C Hub',
    category: 'Electronics',
    description: 'Seven-in-one USB-C hub with HDMI output.',
    price: 59.9,
    inStock: true,
  },
  {
    id: 7,
    name: 'Café Latte Mug',
    category: 'Home',
    description: 'Stoneware mug with a matte finish.',
    price: 14,
    inStock: false,
  },
  {
    id: 8,
    name: 'Linen Shirt',
    category: 'Clothing',
    description: 'Relaxed-fit linen shirt.',
    price: 69,
    inStock: true,
  },
  {
    id: 9,
    name: '4K Action Camera',
    category: 'Electronics',
    description: 'Waterproof action camera with stabilisation.',
    price: 299,
    inStock: true,
  },
  {
    id: 10,
    name: 'Wireless Mouse Pad (XL)',
    category: 'Electronics',
    description: 'Extra-large desk mat with a wireless charging zone.',
    price: 39,
    inStock: true,
  },
];
