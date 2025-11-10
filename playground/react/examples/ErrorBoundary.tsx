/**
 * React Error Boundary for vite-plugin-terminal-mcp
 *
 * Copy this file into your project and customize as needed.
 *
 * Usage:
 * ```tsx
 * import { terminal } from 'virtual:terminal'
 * import { TerminalErrorBoundary } from './ErrorBoundary'
 *
 * <TerminalErrorBoundary terminal={terminal}>
 *   <App />
 * </TerminalErrorBoundary>
 * ```
 */

import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface Terminal {
  error: (...args: any[]) => void
  log: (...args: any[]) => void
}

interface ErrorBoundaryProps {
  terminal: Terminal
  children: ReactNode
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode)
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class TerminalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    this.logToTerminal(error, errorInfo)
  }

  logToTerminal(error: Error, errorInfo: ErrorInfo) {
    const { terminal } = this.props
    terminal.error(`React Error Boundary caught error: ${error.message}`)
    terminal.error(`Component Stack:${errorInfo.componentStack}`)
    if (error.stack)
      terminal.error(`Error Stack:\n${error.stack}`)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback } = this.props

    if (hasError && error) {
      // Custom fallback
      if (typeof fallback === 'function')
        return fallback(error, errorInfo!)

      if (fallback)
        return fallback

      // Default fallback - beautiful in dev, minimal in prod
      const isDev = import.meta.env.DEV

      if (isDev) {
        return (
          <div style={{
            padding: '2rem',
            margin: '1rem',
            background: '#1a1a1a',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'monospace',
          }}
          >
            <h2 style={{ color: '#ef4444', marginTop: 0 }}>⚠️ Error</h2>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{error.message}</p>

            {error.stack && (
              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', color: '#60a5fa' }}>
                  Stack Trace
                </summary>
                <pre style={{
                  background: '#0a0a0a',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '0.85rem',
                }}
                >
                  {error.stack}
                </pre>
              </details>
            )}

            {errorInfo && (
              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', color: '#60a5fa' }}>
                  Component Stack
                </summary>
                <pre style={{
                  background: '#0a0a0a',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '0.85rem',
                }}
                >
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Try Again
            </button>
          </div>
        )
      }

      // Production: minimal UI
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <button onClick={this.handleReset}>Reload</button>
        </div>
      )
    }

    return children
  }
}

/**
 * HOC to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  terminal: Terminal,
  fallback?: ErrorBoundaryProps['fallback'],
) {
  return function WithErrorBoundary(props: P) {
    return (
      <TerminalErrorBoundary terminal={terminal} fallback={fallback}>
        <Component {...props} />
      </TerminalErrorBoundary>
    )
  }
}
