import { useState } from 'react'
import { terminal } from 'virtual:terminal'
import { TerminalErrorBoundary } from '../../examples/ErrorBoundary'

function BuggyComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError)
    throw new Error('Intentional error from BuggyComponent!')

  return <div>✅ Component is working fine</div>
}

export default function ErrorTester({ children }: { children?: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  const triggerError = () => {
    terminal.warn('About to trigger component error...')
    setHasError(true)
  }

  const reset = () => {
    terminal.info('Resetting error boundary...')
    setHasError(false)
  }

  return (
    <div style={{ border: '2px solid #646cff', padding: '1rem', margin: '1rem 0', borderRadius: '8px' }}>
      <h4>Error Boundary Test</h4>

      {children || (
        <button onClick={triggerError}>
          Trigger Component Error
        </button>
      )}

      <TerminalErrorBoundary
        terminal={terminal}
        fallback={error => (
          <div style={{ padding: '1rem', background: '#f44336', color: 'white', borderRadius: '4px', margin: '1rem 0' }}>
            <h4>⚠️ Error Caught by Boundary</h4>
            <p>{error.message}</p>
          </div>
        )}
      >
        <BuggyComponent shouldError={hasError} />
      </TerminalErrorBoundary>

      {hasError && (
        <button onClick={reset} style={{ marginTop: '1rem' }}>
          Reset Test
        </button>
      )}
    </div>
  )
}
