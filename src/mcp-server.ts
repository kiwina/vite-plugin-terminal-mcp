/**
 * MCP Server for retrieving browser console logs
 *
 * Integrated into the Vite plugin using StreamableHTTP transport
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ViteDevServer } from 'vite'
import type { LogStore } from './logStore'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'

export interface MCPServerOptions {
  logStore: LogStore
  name?: string
  version?: string
}

export function createMCPServer(options: MCPServerOptions): McpServer {
  const { logStore, name = 'vite-plugin-terminal-mcp', version = '1.0.0' } = options

  const server = new McpServer({
    name,
    version,
  })

  // Tool: Get Console Errors
  server.tool(
    'get-console-errors',
    'Retrieve recent console errors from the browser. Returns the most recent error messages logged to the browser console.',
    {
      count: z.number()
        .optional()
        .default(10)
        .describe('Number of recent errors to retrieve (default: 10)'),
    },
    async ({ count = 10 }) => {
      const errors = logStore.getRecentErrors(count)
      return {
        content: [{
          type: 'text',
          text: formatLogs(errors, 'Recent Console Errors'),
        }],
      }
    },
  )

  // Tool: Get Console Logs
  server.tool(
    'get-console-logs',
    'Retrieve recent console logs from the browser. Can filter by log level (log, info, debug, warn, error).',
    {
      count: z.number()
        .optional()
        .default(50)
        .describe('Number of recent logs to retrieve (default: 50)'),
      level: z.enum(['log', 'info', 'debug', 'warn', 'error', 'assert', 'all'])
        .optional()
        .default('all')
        .describe('Filter logs by level (default: all)'),
    },
    async ({ count = 50, level = 'all' }) => {
      const logs = level === 'all'
        ? logStore.getRecent(count)
        : logStore.getByLevel(level as any).slice(-count)

      return {
        content: [{
          type: 'text',
          text: formatLogs(logs, `Recent Console Logs${level !== 'all' ? ` (${level})` : ''}`),
        }],
      }
    },
  )

  // Tool: Get Console Logs Since
  server.tool(
    'get-console-logs-since',
    'Retrieve console logs since a specific timestamp.',
    {
      timestamp: z.number()
        .describe('Unix timestamp in milliseconds'),
      level: z.enum(['log', 'info', 'debug', 'warn', 'error', 'assert', 'all'])
        .optional()
        .default('all')
        .describe('Filter logs by level (default: all)'),
    },
    async ({ timestamp, level = 'all' }) => {
      let logs = logStore.getSince(timestamp)
      if (level !== 'all')
        logs = logs.filter(log => log.method === level)

      return {
        content: [{
          type: 'text',
          text: formatLogs(logs, `Console Logs Since ${new Date(timestamp).toISOString()}`),
        }],
      }
    },
  )

  // Tool: Clear Console Logs
  server.tool(
    'clear-console-logs',
    'Clear all stored console logs from memory.',
    {},
    async () => {
      const previousSize = logStore.size
      logStore.clear()
      return {
        content: [{
          type: 'text',
          text: `Cleared ${previousSize} console logs from memory.`,
        }],
      }
    },
  )

  // Tool: Get Console Stats
  server.tool(
    'get-console-stats',
    'Get statistics about stored console logs (total count, error count, etc.).',
    {},
    async () => {
      const all = logStore.getAll()
      const errors = logStore.getErrors()
      const warnings = logStore.getByLevel('warn')
      const info = logStore.getByLevel('info')
      const debug = logStore.getByLevel('debug')
      const regular = logStore.getByLevel('log')

      const stats = {
        total: all.length,
        errors: errors.length,
        warnings: warnings.length,
        info: info.length,
        debug: debug.length,
        log: regular.length,
        oldestTimestamp: all.length > 0 ? all[0].timestamp : null,
        newestTimestamp: all.length > 0 ? all[all.length - 1].timestamp : null,
      }

      return {
        content: [{
          type: 'text',
          text: `Console Log Statistics:\n${JSON.stringify(stats, null, 2)}`,
        }],
      }
    },
  )

  return server
}

function formatLogs(logs: any[], title: string): string {
  if (logs.length === 0)
    return `${title}: No logs found.`

  const formatted = logs.map((log) => {
    const date = new Date(log.timestamp).toISOString()
    const indent = '  '.repeat(log.groupLevel)
    return `[${date}] [${log.method.toUpperCase()}] ${indent}${log.message}`
  }).join('\n')

  return `${title} (${logs.length} entries):\n\n${formatted}`
}

/**
 * Setup MCP routes using StreamableHTTP transport
 */
export async function setupMCPRoutes(
  base: string,
  server: McpServer,
  vite: ViteDevServer,
): Promise<void> {
  // Single endpoint for MCP requests
  vite.middlewares.use(`${base}`, async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end('Method Not Allowed')
      return
    }

    // Create a new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })

    res.on('close', () => {
      transport.close()
    })

    // Read request body
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', async () => {
      try {
        const requestBody = JSON.parse(body)
        await server.connect(transport)
        await transport.handleRequest(req, res, requestBody)
      }
      catch {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Invalid request' }))
      }
    })
  })
}
