// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/face-attendance-system/', // <-- project repo name
  plugins: [react()],
})
