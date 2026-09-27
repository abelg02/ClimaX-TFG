import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En GitHub Pages la app vive en /ClimaX-TFG/ (lo fija el workflow con VITE_BASE)
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: {
    proxy: {
      // En desarrollo, /api va al backend Spring Boot
      '/api': 'http://localhost:8080',
    },
  },
})
