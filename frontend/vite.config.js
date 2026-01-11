import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:5000',
      '/ai': 'http://localhost:5000',
      '/user': 'http://localhost:5000',
      '/payment': 'http://localhost:5000',
    }
  }
})
