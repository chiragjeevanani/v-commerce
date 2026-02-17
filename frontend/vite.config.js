import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure proper chunking and file naming
    rollupOptions: {
      output: {
        // Ensure consistent file naming
        manualChunks: undefined,
      },
    },
    // Ensure assets are properly referenced
    assetsDir: 'assets',
  },
  // Ensure base path is correct for production
  base: '/',
})
