import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Movie-Tv/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.omdbapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
