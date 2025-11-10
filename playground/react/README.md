# React Playground for vite-plugin-terminal-mcp

Test playground demonstrating all features of vite-plugin-terminal-mcp with MCP support.

## Features Tested

### ✅ Console Logging
- All console methods (log, info, warn, error, debug)
- Messages appear in Vite terminal
- Messages stored in MCP for AI querying

### ✅ Error Boundaries
- React ErrorBoundary catches render errors
- Beautiful error UI in development
- Errors sent to terminal and MCP

### ✅ Global Error Handling
- Unhandled errors caught by global handler
- Unhandled promise rejections captured
- Async errors properly logged

### ✅ React Router Error
- Demonstrates the specific error you showed:
  - `useLocation() may be used only in the context of a <Router> component`
- Click "React Router Error" button to trigger

### ✅ MCP Integration
- All errors and logs queryable via AI assistant
- Auto-generates `.cursor/mcp.json` configuration
- Try queries like:
  - "What console errors happened?"
  - "Show me recent logs"
  - "Get console statistics"

## Running

```bash
# From playground/react directory
npm install
npm run dev
```

## Testing

1. **Basic Logging**: Click console method buttons, check terminal
2. **Error Boundary**: Click "Trigger Component Error", see error UI
3. **Async Errors**: Click "Async Error", check terminal
4. **Promise Rejection**: Click "Unhandled Promise Rejection"
5. **Router Error**: Click "React Router Error" (your specific use case!)
6. **MCP Query**: Ask AI "What errors happened?" after triggering errors

## Expected Behavior

- ✅ All logs appear in Vite dev server terminal
- ✅ Errors show beautiful UI in development
- ✅ MCP URL printed on startup: `http://localhost:5173/__terminal_mcp/sse`
- ✅ `.cursor/mcp.json` auto-created with MCP configuration
- ✅ AI assistant can query all logs and errors
