import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { apiDevServer } from './vite-plugins/api-dev-server'

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevServer()],
})
