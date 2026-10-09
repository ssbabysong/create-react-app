import { defineConfig } from 'vite';

// Built into ../docs so GitHub Pages can serve it straight from the branch.
export default defineConfig({
  base: './',
  build: { outDir: '../docs', emptyOutDir: true, target: 'es2020' },
});
