# vite-plugin-terminal-mcp

[![NPM version](https://img.shields.io/npm/v/vite-plugin-terminal-mcp?color=a1b858&label=)](https://www.npmjs.com/package/vite-plugin-terminal-mcp)

Log in the node terminal from the browser with **MCP (Model Context Protocol) server integration** for AI assistants.

> This is a fork of [vite-plugin-terminal](https://github.com/patak-dev/vite-plugin-terminal) with added MCP server support, allowing AI assistants like Claude, Cursor, and Windsurf to query browser console logs in real-time.

![](https://github.com/kiwina/vite-plugin-terminal-mcp/blob/main/vite-plugin-terminal-mcp.png)

## Features

- 🖥️ Log to terminal from browser
- 🤖 **MCP Server** for AI assistant integration
- 🔍 Query console logs via MCP tools
- ⚛️ Works with React, Vue, Svelte, and all frameworks
- 🎯 Zero config - works out of the box
- 🌲 Tree-shakeable in production

## Install

```bash
npm i -D vite-plugin-terminal-mcp
```

### Optional: Install MCP Dependencies

For MCP server support (AI assistant integration):

```bash
npm i @modelcontextprotocol/sdk zod pathe
```

## Quick Start

Add plugin to your `vite.config.ts`:

```ts
// vite.config.ts
import Terminal from 'vite-plugin-terminal-mcp'

export default {
  plugins: [
    Terminal()
  ]
}
```

### With MCP Server (for AI Assistants)

```ts
// vite.config.ts
import Terminal from 'vite-plugin-terminal-mcp'

export default {
  plugins: [
    Terminal({
      console: 'terminal',
      mcp: {
        maxLogs: 1000,
        printUrl: true,
        updateConfig: ['cursor'], // Auto-update Cursor MCP config
        serverName: 'my-app-terminal',
      }
    })
  ]
}
```

## Usage

In your source code import `terminal`, and use it like you do with `console.log`.

```ts
import { terminal } from 'virtual:terminal'

terminal.log('Hey terminal! A message from the browser')
```

The terminal log calls will be removed when building the app.

## Types

There are two ways of telling typescript about the types of the virtual import:

- In your `global.d.ts` file add the following line:
  ```ts
  /// <reference types="vite-plugin-terminal-mcp/client" />
  ```

- In your `tsconfig.json` add the following to your `compilerOptions.types` array:
  ```json
  {
    "compilerOptions": {
      "types": [
        "vite-plugin-terminal-mcp/client"
      ]
    }
  }
  ```
  ```

- In your `tsconfig.json` add the following to your `compilerOptions.types` array:

  ```json
  {
    // ...
    "compilerOptions": {
      // ...
      "types": [
        "vite-plugin-terminal-mcp/client"
      ]
    }
  }
  ```

## API

Supported methods:
- `terminal.log(obj1 [, obj2, ..., objN])`
- `terminal.info(obj1 [, obj2, ..., objN])`
- `terminal.warn(obj1 [, obj2, ..., objN])`
- `terminal.error(obj1 [, obj2, ..., objN])`
- `terminal.assert(assertion, obj1 [, obj2, ..., objN])`
- `terminal.group()`
- `terminal.groupCollapsed()`
- `terminal.groupEnd()`
- `terminal.table(obj)`
- `terminal.time(id)`
- `terminal.timeLog(id, obj1 [, obj2, ..., objN])`
- `terminal.timeEnd(id)`
- `terminal.clear()`
- `terminal.count(label)`
- `terminal.countReset(label)`
- `terminal.dir(obj)`
- `terminal.dirxml(obj)`

These methods will work but use the console

- `terminal.trace(...args: any[])`
- `terminal.profile(...args: any[])`
- `terminal.profileEnd(...args: any[])`

## Redirect `console` logs to the terminal

If you want the standard `console` logs to appear in the terminal, you can use the `console: 'terminal'` option in your `vite.config.ts`:

```ts
// vite.config.ts
import Terminal from 'vite-plugin-terminal-mcp'

export default {
  plugins: [
    Terminal({
      console: 'terminal'
    })
  ]
}
```

In this case, you don't need to import the virtual terminal to use the plugin.

```ts
console.log('Hey terminal! A message from the browser')
```

You can also overwrite it in your `index.html` head manually in case you would like more control.

```html
  <script type="module">
    // Redirect console logs to the terminal
    import terminal from 'virtual:terminal'
    globalThis.console = terminal
  </script>
```

Check the [Console playground](./playground/console) for a full example.

## Log in both the terminal and the console

You can use the `output` option to define where the `terminal` logs should be logged. Accepts `terminal`, `console`, or an array with both.

```ts
// vite.config.ts
import Terminal from 'vite-plugin-terminal-mcp'

export default {
  plugins: [
    Terminal({
      output: ['terminal', 'console']
    })
  ]
}
```

## Framework Examples

### React

```tsx
// vite.config.ts
import react from '@vitejs/plugin-react'
import Terminal from 'vite-plugin-terminal-mcp'

export default {
  plugins: [
    react(),
    Terminal({
      console: 'terminal',
      mcp: {
        maxLogs: 1000,
        printUrl: true,
        updateConfig: ['cursor'],
        serverName: 'my-react-app',
      }
    })
  ]
}

// App.tsx
import { terminal } from 'virtual:terminal'

function App() {
  const handleClick = () => {
    terminal.log('Button clicked!')
    terminal.error('Simulated error for debugging')
  }

  return <button onClick={handleClick}>Test Terminal</button>
}
```

### Vue

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import Terminal from 'vite-plugin-terminal-mcp'

export default {
  plugins: [
    vue(),
    Terminal({ console: 'terminal' })
  ]
}
```

### Vanilla JS

```ts
import { terminal } from 'virtual:terminal'

terminal.log('Hello from vanilla JS!')
```

## Playgrounds

- **[Basic](./playground/basic)** - Vanilla JS using every available method
- **[Console](./playground/console)** - Redirect standard console logs to terminal
- **[Auto Import](./playground/autoimport)** - Using [unplugin-auto-import](https://github.com/antfu/unplugin-auto-import)
- **[Vue](./playground/vue)** - Vue 3 example
- **[React](./playground/react)** - React 18 example with MCP

## Options

### `console`

Type: `'terminal' | undefined`<br>
Default: `undefined`<br>

Set to `'terminal'` to make `globalThis.console` equal to the `terminal` object in your app.

### `output`

Type: `'terminal' | 'console' | ['terminal', 'console']`<br>
Default: `terminal`<br>

Define where the output for the logs.

### `strip`

Type: `boolean`<br>
Default: `true`<br>

Strip `terminal.*()` when bundling for production.

### `include`

Type: `String | RegExp | Array[...String|RegExp]`<br>
Default: `/.+\.(js|ts|mjs|cjs|mts|cts)/`<br>
Example: `include: '**/*.(mjs|js)',`<br>

A pattern, or array of patterns, which specify the files in the build the plugin should operate on when removing calls for production.

### `exclude`

Type: `String | RegExp | Array[...String|RegExp]`<br>
Default: `[]`<br>
Example: `exlude: 'tests/**/*',`<br>

A pattern, or array of patterns, which specify the files in the build the plugin should _ignore_ when removing calls for production.

### `mcp`

Type: `boolean | MCPOptions`<br>
Default: `false`<br>

Enable MCP (Model Context Protocol) server for AI assistant integration. Set to `true` for defaults or configure with an object:

```ts
{
  mcp: {
    maxLogs: 1000,              // Max logs to store in memory
    mcpPath: '/__terminal_mcp', // MCP endpoint path
    printUrl: true,             // Print MCP URL on startup
    updateConfig: ['cursor'],   // Auto-update AI config files
    serverName: 'terminal',     // Server name in config
    levels: ['error', 'warn', 'info', 'log', 'debug', 'assert'], // Log levels to capture (default: all)
    silent: false,              // Only store in MCP without printing to terminal
  }
}
```

#### MCP Options

**`levels`** - Filter which log types are captured by MCP
- Type: `Array<'error' | 'warn' | 'info' | 'log' | 'debug' | 'assert'>`
- Default: `['error', 'warn', 'info', 'log', 'debug', 'assert']` (all)
- Example: `levels: ['error']` - Only capture errors

**`updateConfig`** - Auto-update AI assistant config files
- Type: `'auto' | false | Array<'cursor' | 'vscode' | 'windsurf'>`
- Default: `'auto'`
- `'auto'` - Automatically updates config files if `.cursor`, `.vscode`, or `~/.codeium/windsurf` exist
- `false` - Don't update any config files
- `['cursor', 'vscode']` - Update specific config files only
- Creates/updates:
  - **Cursor**: `.cursor/mcp.json`
  - **VSCode**: `.vscode/mcp.json`
  - **Windsurf**: `~/.codeium/windsurf/mcp_config.json`

**`silent`** - Suppress terminal output for MCP-captured logs
- Type: `boolean`
- Default: `false`
- When `true`, logs matching `levels` are only stored in MCP, not printed to terminal
- Non-matching logs still print normally

#### MCP Usage Examples

**Capture only errors, hide them from terminal:**
```ts
Terminal({
  console: 'terminal',
  mcp: {
    levels: ['error'],
    silent: true,  // Errors only in MCP, not printed
  }
})
// Result: Errors → MCP only, other logs → terminal
```

**Capture errors and warnings, print everything:**
```ts
Terminal({
  console: 'terminal',
  mcp: {
    levels: ['error', 'warn'],
    silent: false,  // Print to terminal too
  }
})
// Result: Errors & warnings → MCP + terminal, other logs → terminal
```

**Capture everything, hide everything:**
```ts
Terminal({
  console: 'terminal',
  mcp: {
    silent: true,  // All logs only in MCP
  }
})
// Result: All logs → MCP only, nothing prints to terminal
```

**Capture everything, show everything:**
```ts
Terminal({
  console: 'terminal',
  mcp: true  // or { silent: false }
})
// Result: All logs → MCP + terminal (default behavior)
```

#### MCP Tools Available
- `get-console-errors` - Get recent console errors
- `get-console-logs` - Get console logs with filtering
- `get-console-logs-since` - Get logs since timestamp
- `get-console-stats` - Get console log statistics
- `clear-console-logs` - Clear stored logs

#### Supported AI Assistants
- Cursor
- Claude Desktop (via MCP)
- Windsurf
- Any MCP-compatible client

#### Auto-Config Update
When `updateConfig` is enabled, the plugin will automatically update your AI assistant's configuration file (e.g., `.cursor/mcp.json` for Cursor) with the MCP server endpoint.

## Common Scenarios

### Scenario 1: Debug Production-Like Environment
**Goal:** Keep development clean, only let AI see errors

```ts
Terminal({
  console: 'terminal',
  mcp: {
    levels: ['error'],
    silent: true,  // Errors only in MCP, not cluttering terminal
    serverName: 'my-app-errors',
  }
})
```
**Result:**
- ✅ Errors captured by MCP (AI can query them)
- ✅ Terminal stays clean (no error spam)
- ✅ Other logs (warn, info, log) print normally

### Scenario 2: AI-Assisted Debugging Session
**Goal:** Let AI see everything while you debug

```ts
Terminal({
  console: 'terminal',
  output: ['terminal', 'console'],  // See logs everywhere
  mcp: true,  // AI can see everything too
})
```
**Result:**
- ✅ All logs in terminal
- ✅ All logs in browser console
- ✅ All logs available to AI via MCP

### Scenario 3: Silent Monitoring
**Goal:** Capture logs for AI without any terminal output

```ts
Terminal({
  console: 'terminal',
  mcp: {
    silent: true,  // Nothing prints
    maxLogs: 5000,
    serverName: 'background-monitor',
  }
})
```
**Result:**
- ✅ All logs captured by MCP
- ✅ Zero terminal output
- ✅ AI can query historical logs

### Scenario 4: Error + Warning Tracking
**Goal:** Track errors and warnings, hide them from terminal

```ts
Terminal({
  console: 'terminal',
  mcp: {
    levels: ['error', 'warn'],
    silent: true,
    serverName: 'issue-tracker',
  }
})
```
**Result:**
- ✅ Errors and warnings → MCP only
- ✅ Info and debug logs → Terminal
- ✅ Clean terminal, comprehensive error tracking

### Scenario 5: Development with Live AI Assistant
**Goal:** Normal development with AI watching for issues

```ts
Terminal({
  console: 'terminal',
  mcp: {
    levels: ['error', 'warn'],
    silent: false,  // Print errors/warnings too
    updateConfig: ['cursor'],
    printUrl: true,
  }
})
```
**Result:**
- ✅ Errors/warnings in terminal AND MCP
- ✅ AI can proactively notice issues
- ✅ You see everything in real-time

## MCP Integration

The MCP server allows AI assistants to query your browser console logs in real-time. When enabled:

1. Logs are captured from the browser and stored in memory
2. MCP server exposes tools for querying these logs
3. AI assistants can ask questions like:
   - "What console errors happened?"
   - "Show me the last 10 warnings"
   - "Any errors in the last 5 minutes?"

### How `output` and `mcp.silent` Work Together

The `output` option controls **where** logs are displayed, while `mcp.silent` controls **whether** MCP-captured logs are printed:

| Configuration | Errors | Warnings | Info/Log | Notes |
|--------------|--------|----------|----------|-------|
| `output: 'terminal'`<br>`mcp: { levels: ['error'], silent: true }` | MCP only | Terminal | Terminal | Errors hidden from terminal |
| `output: 'console'`<br>`mcp: { levels: ['error'], silent: true }` | MCP only | Browser console | Browser console | Errors not in browser console either |
| `output: ['terminal', 'console']`<br>`mcp: { levels: ['error'], silent: false }` | MCP + Both | Both | Both | Everything everywhere |
| `output: 'terminal'`<br>`mcp: { silent: false }` | MCP + Terminal | MCP + Terminal | MCP + Terminal | Default: capture and display |

**Key Points:**
- `mcp.silent: true` suppresses printing for logs matching `mcp.levels`, regardless of `output` setting
- Logs NOT in `mcp.levels` follow the `output` setting normally
- `output` only affects printing, not MCP storage

### Example MCP Usage with Cursor

```jsonc
// .cursor/mcp.json (auto-generated)
{
  "mcpServers": {
    "my-app-terminal": {
      "url": "http://localhost:5173/__terminal_mcp"
    }
  }
}
```

Then in Cursor's AI chat:
- "Check the console for errors"
- "What's in the console logs?"
- "Clear the console logs"

## Why This Fork?

This fork adds MCP server integration to the original [vite-plugin-terminal](https://github.com/patak-dev/vite-plugin-terminal), enabling:

- **AI-assisted debugging** - Let AI assistants query console logs
- **Real-time log access** - Query logs without switching to devtools
- **Framework agnostic** - Works with React, Vue, Svelte, etc.
- **Zero browser extensions** - No browser plugins needed
- **Optional** - MCP is opt-in, doesn't affect existing functionality

## Credits

- Original plugin by [Matias Capeletto](https://github.com/patak-dev) - [vite-plugin-terminal](https://github.com/patak-dev/vite-plugin-terminal)
- MCP integration by [kiwina](https://github.com/kiwina)
- Original idea from [Domenic Elm](https://twitter.com/elmd_)
- Project setup from [@antfu's vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect)
- Bundling by [unbuild](https://github.com/unjs/unbuild)
- Strip functions during build uses [rollup-plugin-strip](https://github.com/rollup/plugins/tree/master/packages/strip)

## License

[MIT](./LICENSE) License © 2022-2024 [Matias Capeletto](https://github.com/patak-dev), 2025-present [kiwina](https://github.com/kiwina)
