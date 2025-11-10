/**
 * In-memory store for console logs from the browser
 */

export interface StoredLog {
  method: 'log' | 'info' | 'debug' | 'warn' | 'error' | 'assert'
  message: string
  timestamp: number
  count: number
  groupLevel: number
}

export class LogStore {
  private logs: StoredLog[] = []
  private maxSize: number

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
  }

  add(log: StoredLog) {
    this.logs.push(log)

    // Keep only the most recent logs
    if (this.logs.length > this.maxSize)
      this.logs.shift()
  }

  getAll(): StoredLog[] {
    return [...this.logs]
  }

  getByLevel(level: StoredLog['method']): StoredLog[] {
    return this.logs.filter(log => log.method === level)
  }

  getErrors(): StoredLog[] {
    return this.logs.filter(log => log.method === 'error' || log.method === 'assert')
  }

  getRecent(count: number): StoredLog[] {
    return this.logs.slice(-count)
  }

  getRecentErrors(count: number): StoredLog[] {
    const errors = this.getErrors()
    return errors.slice(-count)
  }

  getSince(timestamp: number): StoredLog[] {
    return this.logs.filter(log => log.timestamp >= timestamp)
  }

  clear() {
    this.logs = []
  }

  get size(): number {
    return this.logs.length
  }
}

// Global log store instance
export const logStore = new LogStore()
