export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

class Logger {
  private minLevel: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.minLevel = this.isDevelopment ? 'debug' : 'info'
  }

  setLevel(level: LogLevel): void {
    this.minLevel = level
  }

  getLevel(): LogLevel {
    return this.minLevel
  }

  private format(
    level: LogLevel,
    module: string,
    fn: string,
    message: string,
  ): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level.toUpperCase()}] [${module}.${fn}] ${message}`
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel]
  }

  debug(module: string, fn: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('debug', module, fn, message), ...args)
    }
  }

  info(module: string, fn: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.format('info', module, fn, message), ...args)
    }
  }

  warn(module: string, fn: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', module, fn, message), ...args)
    }
  }

  error(module: string, fn: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', module, fn, message), ...args)
    }
  }
}

export const logger = new Logger()
