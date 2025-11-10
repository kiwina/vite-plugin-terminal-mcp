import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { terminal } from 'virtual:terminal'
import { TerminalErrorBoundary } from '../examples/ErrorBoundary'
import { setupErrorHandlers } from '../examples/errorHandler'
import App from './App'
import './index.css'

// Setup global error handlers
setupErrorHandlers({ terminal })

// Log startup
terminal.info('🚀 React playground starting...')
terminal.log('Terminal plugin initialized with MCP support')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TerminalErrorBoundary terminal={terminal}>
      <App />
    </TerminalErrorBoundary>
  </StrictMode>,
)
