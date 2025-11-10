import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import terminal from '../../src'

export default defineConfig({
  plugins: [
    vue(),
    terminal(),
  ],
  server: {
    open: true,
  },
})
