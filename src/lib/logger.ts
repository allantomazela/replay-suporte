/**
 * Logger centralizado que remove logs em produção
 * Use este logger em vez de console.log/error/warn diretamente
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug'

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // Em produção, apenas errors são logados
    if (!isDevelopment) {
      return level === 'error'
    }
    return true
  }

  log(...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log('[LOG]', ...args)
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  }

  error(...args: any[]): void {
    // Errors sempre são logados
    console.error('[ERROR]', ...args)
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args)
    }
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args)
    }
  }

  /**
   * Log de performance (apenas em dev)
   */
  performance(label: string, duration: number): void {
    if (this.shouldLog('debug')) {
      console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`)
    }
  }
}

export const logger = new Logger()

