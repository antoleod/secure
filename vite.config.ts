import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function normalizeBase(base: string): string {
  if (base === '/') return '/'
  const trimmed = base.trim()
  const withoutSlashes = trimmed.replace(/^\/+|\/+$/g, '')
  return `/${withoutSlashes}/`
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: normalizeBase(process.env.VITE_BASE_PATH || '/'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // @ts-expect-error - Vitest config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
