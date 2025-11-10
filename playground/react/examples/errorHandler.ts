/**
 * Global error handlers for vite-plugin-terminal-mcp
 *
 * Copy this file into your project and customize as needed.
 *
 * Usage:
 * ```ts
 * import { terminal } from 'virtual:terminal'
 * import { setupErrorHandlers } from './errorHandler'
 *
 * setupErrorHandlers({ terminal })
 * ```
 */

interface Terminal {
  error: (...args: any[]) => void
  log: (...args: any[]) => void
  warn: (...args: any[]) => void
}

interface ErrorHandlerOptions {
  terminal: Terminal
  captureConsoleError?: boolean
  captureUnhandledErrors?: boolean
  captureUnhandledRejections?: boolean
}

/**
 * Setup global error handlers to capture and log errors to terminal
 */
export function setupErrorHandlers(options: ErrorHandlerOptions) {
  const {
    terminal,
    captureConsoleError = false, // Default to false to prevent loops
    captureUnhandledErrors = true,
    captureUnhandledRejections = true,
  } = options

  // Capture unhandled errors
  if (captureUnhandledErrors) {
    window.addEventListener('error', (event) => {
      // Prevent default to avoid duplicate console errors
      event.preventDefault()
      terminal.error(`Unhandled Error: ${event.message}`)
      if (event.error?.stack)
        terminal.error(`Stack:\n${event.error.stack}`)

      terminal.error(`Source: ${event.filename}:${event.lineno}:${event.colno}`)
    })
  }

  // Capture unhandled promise rejections
  if (captureUnhandledRejections) {
    window.addEventListener('unhandledrejection', (event) => {
      // Prevent default to avoid duplicate console errors
      event.preventDefault()
      terminal.error(`Unhandled Promise Rejection: ${event.reason}`)
      if (event.reason?.stack)
        terminal.error(`Stack:\n${event.reason.stack}`)
    })
  }

  // Optionally patch console.error to also log to terminal
  // WARNING: This can cause loops if error handlers also use console.error
  if (captureConsoleError) {
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      originalConsoleError(...args)
      terminal.error(...args)
    }
  }
}

/**
 * Create an error logger function
 */
export function createErrorLogger(terminal: Terminal) {
  return (error: Error, context?: string) => {
    if (context)
      terminal.error(`[${context}] ${error.message}`)
    else
      terminal.error(error.message)

    if (error.stack)
      terminal.error(`Stack:\n${error.stack}`)
  }
}

/**
 * Log an error with additional context
 */
export function logError(terminal: Terminal, error: Error, context?: Record<string, any>) {
  terminal.error(`Error: ${error.message}`)

  if (error.stack)
    terminal.error(`Stack:\n${error.stack}`)

  if (context)
    terminal.error(`Context: ${JSON.stringify(context, null, 2)}`)
}

/**
 * Wrap an async function with error logging
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  terminal: Terminal,
  context?: string,
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    }
    catch (error) {
      const logger = createErrorLogger(terminal)
      logger(error as Error, context)
      throw error
    }
  }) as T
}
