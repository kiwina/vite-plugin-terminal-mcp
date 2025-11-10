import { useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { terminal } from 'virtual:terminal'
import ErrorTester from './components/ErrorTester'
import './App.css'

function Home() {
  return (
    <div>
      <h2>Home Page</h2>
      <p>Navigate to test different error scenarios</p>
    </div>
  )
}

function About() {
  return (
    <div>
      <h2>About Page</h2>
      <p>This is a test playground for vite-plugin-terminal-mcp with MCP</p>
    </div>
  )
}

// Component that will intentionally cause React Router error
function BrokenComponent() {
  // This will throw: useLocation() may be used only in the context of a <Router> component
  const location = useLocation()
  return (
    <div>
      Location:
      {location.pathname}
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)
  const [showBroken, setShowBroken] = useState(false)

  const handleClick = () => {
    const newCount = count + 1
    setCount(newCount)
    terminal.log(`Button clicked! Count: ${newCount}`)
  }

  const handleError = () => {
    throw new Error('Intentional error from button click!')
  }

  const handleAsyncError = async () => {
    terminal.warn('Starting async operation that will fail...')
    await new Promise(resolve => setTimeout(resolve, 100))
    throw new Error('Async error: Operation failed!')
  }

  const handleUnhandledPromise = () => {
    terminal.warn('Creating unhandled promise rejection...')
    Promise.reject(new Error('Unhandled promise rejection!'))
  }

  const triggerRouterError = () => {
    terminal.warn('Triggering React Router error...')
    setShowBroken(true)
  }

  return (
    <BrowserRouter>
      <div className="App">
        <h1>Vite Plugin Terminal - React Playground</h1>

        <div className="card">
          <button onClick={handleClick}>
            Count is
            {' '}
            {count}
          </button>
          <p>Click the button and check your terminal for logs!</p>
        </div>

        <div className="card">
          <h3>Console Methods</h3>
          <button onClick={() => terminal.log('This is a log message')}>Log</button>
          <button onClick={() => terminal.info('ℹ️ Info message')}>Info</button>
          <button onClick={() => terminal.warn('⚠️ Warning message')}>Warn</button>
          <button onClick={() => terminal.error('❌ Error message')}>Error</button>
        </div>

        <div className="card error-tests">
          <h3>Error Scenarios (MCP Testing)</h3>
          <p>These errors will be captured and queryable via MCP</p>

          <ErrorTester>
            <button onClick={handleError}>
              Throw Error (ErrorBoundary)
            </button>
          </ErrorTester>

          <button onClick={handleAsyncError}>
            Async Error (Global Handler)
          </button>

          <button onClick={handleUnhandledPromise}>
            Unhandled Promise Rejection
          </button>

          <button onClick={triggerRouterError}>
            React Router Error
          </button>

          {showBroken && <BrokenComponent />}
        </div>

        <div className="card">
          <h3>Navigation</h3>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/tester">Error Tester</Link>
          </nav>
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/tester" element={<ErrorTester />} />
        </Routes>

        <div className="instructions">
          <h3>🤖 Test with AI Assistant</h3>
          <p>Try asking your AI assistant:</p>
          <ul>
            <li>"What console errors happened?"</li>
            <li>"Show me recent console logs"</li>
            <li>"Get console statistics"</li>
            <li>"Clear console logs"</li>
          </ul>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
