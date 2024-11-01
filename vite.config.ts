import { defineConfig } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react(), eslintPlugin(), nodePolyfills()],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
});
