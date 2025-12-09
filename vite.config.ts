
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'gowork-2kob.onrender.com',
      'localhost',
      '127.0.0.1',
      '.onrender.com'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    allowedHosts: [
      'gowork-2kob.onrender.com',
      'localhost',
      '127.0.0.1',
      '.onrender.com'
    ]
  }
})
