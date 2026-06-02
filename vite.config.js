import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite + React. JSX is compiled by esbuild via @vitejs/plugin-react
// (automatic runtime — no need to `import React` just to use JSX).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
});
