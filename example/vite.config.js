import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginReactRouterDom from '../dist/vite-plugin-react-router-dom';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vitePluginReactRouterDom({
      root: __dirname,
      option: {
        basename: '/vite',
      },
    }),
    react(),
  ],
});
