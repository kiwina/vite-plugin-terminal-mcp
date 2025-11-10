# vite-plugin-terminal-mcp with MCP - React Example

This example shows how to use vite-plugin-terminal-mcp with MCP support and the ErrorBoundary component to capture all errors for AI debugging.

## Setup

### 1. Install Dependencies

```bash
npm install vite-plugin-terminal-mcp
# MCP dependencies (if using MCP features)
npm install @modelcontextprotocol/sdk zod
```

### 2. Configure Vite

```typescript
import react from '@vitejs/plugin-react'
// vite.config.ts
import { defineConfig } from 'vite'
import Terminal from 'vite-plugin-terminal-mcp'

export default defineConfig({
  plugins: [
    react(),
    Terminal({
      // Redirect console to terminal
      console: 'terminal',

      // Enable MCP server
      mcp: {
        maxLogs: 1000,
        mcpPath: '/__terminal_mcp',
        printUrl: true,
        updateConfig: 'auto', // Auto-update AI config files
        serverName: 'terminal',
      }
    })
  ]
})
```

### 3. Setup Error Handlers in Your App

```typescript
// main.tsx or App.tsx
import { createRoot } from 'react-dom/client'
import { terminal } from 'virtual:terminal'
import { setupErrorHandlers } from 'vite-plugin-terminal-mcp/client/errorHandler'
import { TerminalErrorBoundary } from 'vite-plugin-terminal-mcp/client/ErrorBoundary'
import App from './App'

// Setup global error handlers
setupErrorHandlers({
  terminal,
  captureConsoleErrors: true,
  captureUnhandledRejections: true,
  captureUnhandledErrors: true,
})

createRoot(document.getElementById('root')!).render(
  <TerminalErrorBoundary terminal={terminal}>
    <App />
  </TerminalErrorBoundary>
)
```

### 4. Use in Components

```typescript
// SomeComponent.tsx
import { TerminalErrorBoundary } from 'vite-plugin-terminal-mcp/client/ErrorBoundary'
import { terminal } from 'virtual:terminal'

function ProblematicComponent() {
  // This will be caught by the error boundary
  const location = useLocation() // Error if not in Router context!

  return <div>Component content</div>
}

export function MyFeature() {
  return (
    <TerminalErrorBoundary
      terminal={terminal}
      fallback={(error, info) => (
        <div>
          <h2>Feature Error: {error.message}</h2>
          <button onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      )}
    >
      <ProblematicComponent />
    </TerminalErrorBoundary>
  )
}
```

### 5. Manual Error Logging

```typescript
import { terminal } from 'virtual:terminal'
import { createErrorLogger, logError } from 'vite-plugin-terminal-mcp/client/errorHandler'

// Direct logging
try {
  throw new Error('Something failed')
}
catch (error) {
  logError(error, { userId: '123', action: 'submit' }, terminal)
}

// Create a logger instance
const logger = createErrorLogger(terminal)

async function fetchData() {
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      logger.error('API Error', { status: response.status })
    }
  }
  catch (error) {
    logger.error(error as Error, { endpoint: '/api/data' })
  }
}
```

## MCP Usage

Once configured, the MCP server will be available. Configure your AI assistant (Cursor, etc.):

```json
// .cursor/mcp.json (auto-generated)
{
  "mcpServers": {
    "terminal": {
      "url": "http://localhost:5173/__terminal_mcp/sse"
    }
  }
}
```

### Available MCP Tools

Ask your AI assistant:

- **"What console errors happened?"** → Uses `get-console-errors`
- **"Show me the last 10 console logs"** → Uses `get-console-logs`
- **"Any errors in the last 5 minutes?"** → Uses `get-console-logs-since`
- **"Show console statistics"** → Uses `get-console-stats`
- **"Clear the console logs"** → Uses `clear-console-logs`

## Real-World Example: React Router Error

```typescript
// App.tsx - WRONG (causes the error you saw)
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TerminalErrorBoundary } from 'vite-plugin-terminal-mcp/client/ErrorBoundary'
import { terminal } from 'virtual:terminal'

function SwebotRoot() {
  const location = useLocation() // ❌ Error during HMR!
  return <div>Root</div>
}

export default function App() {
  return (
    <TerminalErrorBoundary terminal={terminal}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SwebotRoot />} />
        </Routes>
      </BrowserRouter>
    </TerminalErrorBoundary>
  )
}
```

```typescript
// App.tsx - FIXED
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { TerminalErrorBoundary } from 'vite-plugin-terminal-mcp/client/ErrorBoundary'
import { terminal } from 'virtual:terminal'

// Component using useLocation is inside Router
function SwebotRoot() {
  const location = useLocation() // ✅ Works!
  return <div>Root at {location.pathname}</div>
}

export default function App() {
  return (
    <TerminalErrorBoundary terminal={terminal}>
      <BrowserRouter>
        <TerminalErrorBoundary terminal={terminal}>
          <Routes>
            <Route path="/" element={<SwebotRoot />} />
          </Routes>
        </TerminalErrorBoundary>
      </BrowserRouter>
    </TerminalErrorBoundary>
  )
}
```

## Error Boundary Features

### Custom Fallback UI

```typescript
<TerminalErrorBoundary
  terminal={terminal}
  fallback={(error, info) => (
    <div className="error-container">
      <h1>Oops! Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Reload App
      </button>
    </div>
  )}
>
  <YourApp />
</TerminalErrorBoundary>
```

### Custom Error Handler

```typescript
<TerminalErrorBoundary
  terminal={terminal}
  onError={(error, errorInfo) => {
    // Send to error tracking service
    trackError({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    // Log additional context
    terminal.error('User was on page:', window.location.href)
  }}
>
  <YourApp />
</TerminalErrorBoundary>
```

### HOC Pattern

```typescript
import { withErrorBoundary } from 'vite-plugin-terminal-mcp/client/ErrorBoundary'
import { terminal } from 'virtual:terminal'

function MyComponent() {
  // Component that might error
  return <div>Content</div>
}

export default withErrorBoundary(MyComponent, {
  terminal,
  fallback: <div>Failed to load component</div>
})
```

## Benefits

### For Development
- **See all errors in one place** (terminal)
- **Query errors via AI** without copying/pasting
- **Beautiful error UI** in development
- **Full stack traces** captured
- **HMR-safe** error handling

### For AI Assistants
- **Instant error access** via MCP tools
- **Historical error logs** (last 1000 by default)
- **Contextual debugging** with timestamps
- **Structured error data** for better analysis

## TypeScript Support

```typescript
// Add to your tsconfig.json or global.d.ts
/// <reference types="vite-plugin-terminal-mcp/client" />
```

## Tips

1. **Wrap high-level components**: Place ErrorBoundary at app root and feature boundaries
2. **Use multiple boundaries**: Prevent one error from breaking the entire app
3. **Log context**: Include relevant data when logging errors
4. **Development only**: The detailed error UI only shows in dev mode
5. **Test error boundaries**: Intentionally throw errors to verify they're caught

## Common Issues

### Error boundary not catching errors

Error boundaries DON'T catch:
- Event handlers (use try/catch)
- Async code (use try/catch or `.catch()`)
- Server-side rendering
- Errors in the error boundary itself

```typescript
// Won't be caught by error boundary
<button onClick={() => {
  throw new Error('Oops') // ❌ Not caught
}}>
  Click me
</button>

// Will be logged to terminal
<button onClick={() => {
  try {
    throw new Error('Oops')
  } catch (error) {
    terminal.error(error) // ✅ Logged
  }
}}>
  Click me
</button>
```

## Production Considerations

```typescript
// Only enable detailed error boundaries in development
const ErrorBoundary = import.meta.env.DEV
  ? TerminalErrorBoundary
  : ProductionErrorBoundary

<ErrorBoundary terminal={terminal}>
  <App />
</ErrorBoundary>
```
