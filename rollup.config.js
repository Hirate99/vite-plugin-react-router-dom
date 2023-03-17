import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

/** @type import("rollup").RollupOptions */
export default {
  input: './index.ts',
  output: [
    {
      file: './dist/vite-plugin-react-router-dom.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: './dist/vite-plugin-react-router-dom.cjs',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  external: ['vite'],
  plugins: [typescript(), nodeResolve(), terser()],
};
