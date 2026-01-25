import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const basePath = process.env.VITE_BASE_PATH?.trim() || '/'
const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow overriding the base path for GitHub Pages/custom domains via VITE_BASE_PATH
  base: normalizedBase,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/analytics'],
          motion: ['framer-motion'],
          query: ['@tanstack/react-query'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  // @ts-expect-error - Vitest config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
