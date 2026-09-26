import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: {
    emptyOutDir: true,
    copyPublicDir: false,
    lib: { entry: path.resolve(import.meta.dirname, 'src/library.ts'), formats: ['es'], fileName: 'index' },
    outDir: 'packages/coreor-datatable/dist',
    rolldownOptions: {
      external: ['react','react/jsx-runtime','react-dom','react-dom/client','@tanstack/react-table','@tanstack/react-virtual','lucide-react','radix-ui','clsx','tailwind-merge','class-variance-authority'],
      output: { banner: '"use client";' },
    },
  },
})
