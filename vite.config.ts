import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { UserConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/fullMoonFrontEnd/',  // Replace with your repository name
} as UserConfig) 