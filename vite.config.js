import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const env = process.env.VITE_ENV || 'production'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: env === 'staging' ? 18795 : 18794,
    allowedHosts: ['.trycloudflare.com', '.localhost'],
  },
  define: {
    'import.meta.env.VITE_ENV': JSON.stringify(env),
  },
})
