import { defineConfig } from 'vite';

// Plain Vite build. JSX is handled by esbuild (automatic runtime), so no React plugin is needed.
export default defineConfig({
  base: './',
  esbuild: { jsx: 'automatic' },
});
