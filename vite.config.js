import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 使用相對路徑，確保在 GitHub Pages 與各環境皆能順暢載入
})
