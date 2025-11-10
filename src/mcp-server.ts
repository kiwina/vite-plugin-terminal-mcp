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
  const { logStore, name = 'vite-plugin-terminal-mcp', version = '1.4.1' } = options

  const server = new McpServer({
    name,
    version,
  })

  // Tool: Get Console Errors
  server.registerTool(
    'get-console-errors',
    {
      title: 'Get Console Errors',
      description: 'Retrieve recent console errors from the browser. Returns the most recent error messages logged to the browser console.',
      inputSchema: { count: z.number() } as any,
      outputSchema: { errors: z.array(z.any()) } as any,
    },
    async ({ count }: any) => {
      const errors = logStore.getRecentErrors(count ?? 10)
      const output = { errors, count: errors.length }
      return {
        content: [{
          type: 'text' as const,
          text: formatLogs(errors, 'Recent Console Errors'),
        }],
        structuredContent: output,
      }
    },
  )

  // Tool: Get Console Logs
  server.registerTool(
    'get-console-logs',
    {
      title: 'Get Console Logs',
      description: 'Retrieve recent console logs from the browser. Can filter by log level (log, info, debug, warn, error).',
      inputSchema: {
        count: z.number(),
        level: z.enum(['log', 'info', 'debug', 'warn', 'error', 'assert', 'all']),
      } as any,
      outputSchema: { logs: z.array(z.any()), count: z.number() } as any,
    },
    async ({ count, level }: any) => {
      const finalCount = count ?? 50
      const finalLevel = level ?? 'all'
      const logs = finalLevel === 'all'
        ? logStore.getRecent(finalCount)
        : logStore.getByLevel(finalLevel as any).slice(-finalCount)

      const output = { logs, count: logs.length, level: finalLevel }
      return {
        content: [{
          type: 'text' as const,
          text: formatLogs(logs, `Recent Console Logs${finalLevel !== 'all' ? ` (${finalLevel})` : ''}`),
        }],
        structuredContent: output,
      }
    },
  )

  // Tool: Get Console Logs Since
  server.registerTool(
    'get-console-logs-since',
    {
      title: 'Get Console Logs Since',
      description: 'Retrieve console logs since a specific timestamp.',
      inputSchema: {
        timestamp: z.number(),
        level: z.enum(['log', 'info', 'debug', 'warn', 'error', 'assert', 'all']),
      } as any,
      outputSchema: { logs: z.array(z.any()), count: z.number(), since: z.string() } as any,
    },
    async ({ timestamp, level }: any) => {
      const finalLevel = level ?? 'all'
      let logs = logStore.getSince(timestamp)
      if (finalLevel !== 'all')
        logs = logs.filter(log => log.method === finalLevel)

      const output = { logs, count: logs.length, since: new Date(timestamp).toISOString(), level: finalLevel }
      return {
        content: [{
          type: 'text' as const,
          text: formatLogs(logs, `Console Logs Since ${new Date(timestamp).toISOString()}`),
        }],
        structuredContent: output,
      }
    },
  )

  // Tool: Clear Console Logs
  server.registerTool(
    'clear-console-logs',
    {
      title: 'Clear Console Logs',
      description: 'Clear all stored console logs from memory.',
      inputSchema: {} as any,
      outputSchema: { cleared: z.number(), success: z.boolean() } as any,
    },
    async () => {
      const previousSize = logStore.size
      logStore.clear()
      const output = { cleared: previousSize, success: true }
      return {
        content: [{
          type: 'text' as const,
          text: `Cleared ${previousSize} console logs from memory.`,
        }],
        structuredContent: output,
      }
    },
  )

  // Tool: Get Console Stats
  server.registerTool(
    'get-console-stats',
    {
      title: 'Get Console Stats',
      description: 'Get statistics about stored console logs (total count, error count, etc.).',
      inputSchema: {} as any,
      outputSchema: {
        total: z.number(),
        errors: z.number(),
        warnings: z.number(),
        info: z.number(),
        debug: z.number(),
        log: z.number(),
        oldestTimestamp: z.number().nullable(),
        newestTimestamp: z.number().nullable(),
      } as any,
    },
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
          type: 'text' as const,
          text: `Console Log Statistics:\n${JSON.stringify(stats, null, 2)}`,
        }],
        structuredContent: stats,
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
