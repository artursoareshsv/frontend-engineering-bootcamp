import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['challenges/**/tests/**/*.spec.ts'],
    environment: 'node',
    reporters: ['default'],
    passWithNoTests: false,
  },
});
