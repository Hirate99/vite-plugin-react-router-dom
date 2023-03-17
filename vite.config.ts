import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './index.ts',
      name: 'vite-plugin-react-router-dom',
    },
    rollupOptions: {
      external: ['vite'],
    },
  },
});
