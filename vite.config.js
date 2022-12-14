import { defineConfig } from 'vite';
import totalBundlesize from '@blockquote/rollup-plugin-total-bundlesize';

export default defineConfig({
  server: {
    open: '/demo/index.html',
    port: 8000,
  },
  build: {
    emptyOutDir: false,
    target: 'esnext',
    lib: {
      entry: 'src/index.ts',
      fileName: 'bundle',
      formats: ['es'],
    },
    rollupOptions: {
      external: /^lit|^@lit-labs|^igniteui/,
      plugins: [totalBundlesize()],
    },
  },
});
