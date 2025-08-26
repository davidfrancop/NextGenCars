export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const levels: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
}

const DEFAULT_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug'
const levelName = (process.env.LOG_LEVEL as LogLevel) || DEFAULT_LEVEL
const currentLevel = levels[levelName] ?? levels.info

function shouldLog(level: LogLevel) {
  return levels[level] >= currentLevel
}

export const logger = {
  debug: (...args: any[]) => {
    if (shouldLog('debug')) console.debug(...args)
  },
  info: (...args: any[]) => {
    if (shouldLog('info')) console.info(...args)
  },
  warn: (...args: any[]) => {
    if (shouldLog('warn')) console.warn(...args)
  },
  error: (...args: any[]) => {
    if (shouldLog('error')) console.error(...args)
  },
}
