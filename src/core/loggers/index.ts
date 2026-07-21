export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

const LOG_LEVELS: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

const currentLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= (LOG_LEVELS[currentLevel as LogLevel] ?? 1);
}

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta !== undefined ? ` ${typeof meta === 'string' ? meta : JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function log(level: LogLevel, message: string, meta?: unknown): void {
  if (!shouldLog(level)) return;
  const formatted = formatMessage(level, message, meta);
  switch (level) {
    case LogLevel.ERROR:
      console.error(formatted);
      break;
    case LogLevel.WARN:
      console.warn(formatted);
      break;
    case LogLevel.INFO:
      console.info(formatted);
      break;
    case LogLevel.DEBUG:
      console.debug(formatted);
      break;
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => log(LogLevel.DEBUG, message, meta),
  info: (message: string, meta?: unknown) => log(LogLevel.INFO, message, meta),
  warn: (message: string, meta?: unknown) => log(LogLevel.WARN, message, meta),
  error: (message: string, meta?: unknown) => log(LogLevel.ERROR, message, meta),
};
