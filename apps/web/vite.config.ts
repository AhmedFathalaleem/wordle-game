import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@portfolio/api-client': path.resolve(rootDir, '../../packages/api-client/src/index.ts'),
      '@portfolio/shared-types': path.resolve(rootDir, '../../packages/shared-types/src/index.ts'),
      '@portfolio/ui': path.resolve(rootDir, '../../packages/ui/src/index.tsx'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
  },
});
