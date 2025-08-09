import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    exclude: ['@mysten/sui'],
    include: ['poseidon-lite'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /poseidon-lite/],
      transformMixedEsModules: true,
    },
  },
  define: {
    global: 'globalThis',
  },
  ssr: {
    noExternal: ['poseidon-lite'],
  },
})
