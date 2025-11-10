import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import Terminal from 'vite-plugin-terminal-mcp'

export default defineConfig({
  server: {
    port: 3333,
    strictPort: true,
  },
  plugins: [
    react(),
    Terminal({
      console: 'terminal',
      output: 'terminal',
      mcp: {
        maxLogs: 1000,
        printUrl: true,
        updateConfig: ['cursor'],
        serverName: 'vite-terminal-playground-mcp',
      },
    }),
  ],
})
