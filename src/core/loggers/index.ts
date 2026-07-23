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

const SENSITIVE_KEYS = /password|secret|token|authorization|key|private|credential|jwt|api[_-]?key/i;

function redactSensitive(meta: unknown): unknown {
  if (typeof meta === 'object' && meta !== null) {
    const obj: any = Array.isArray(meta) ? [...meta] : { ...meta };
    for (const key of Object.keys(obj)) {
      if (SENSITIVE_KEYS.test(key)) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = redactSensitive(obj[key]);
      }
    }
    return obj;
  }
  return meta;
}

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const sanitized = meta !== undefined ? redactSensitive(meta) : undefined;
  const metaStr = sanitized !== undefined ? ` ${typeof sanitized === 'string' ? sanitized : JSON.stringify(sanitized)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function log(level: LogLevel, message: string, meta?: unknown): void {
  if (!shouldLog(level)) return;
  const safeMeta = meta !== undefined ? redactSensitive(meta) : undefined;
  const formatted = formatMessage(level, message, safeMeta);
  writeLog(level, formatted);
}

const SENSITIVE_PATTERNS = /\b(password|secret|token|authorization|api[_-]?key|private_key|jwt|credential|refresh_token|access_token)\b[:\s]*['"]?[^\s'"]+/gi;

function redactMessage(msg: string): string {
  return msg.replace(SENSITIVE_PATTERNS, '$1=[REDACTED]');
}

function writeLog(level: LogLevel, message: string): void {
  const safe = redactMessage(message);
  switch (level) {
    case LogLevel.ERROR:
      console.error(safe);
      break;
    case LogLevel.WARN:
      console.warn(safe);
      break;
    case LogLevel.INFO:
      console.info(safe);
      break;
    case LogLevel.DEBUG:
      console.debug(safe);
      break;
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => log(LogLevel.DEBUG, message, meta),
  info: (message: string, meta?: unknown) => log(LogLevel.INFO, message, meta),
  warn: (message: string, meta?: unknown) => log(LogLevel.WARN, message, meta),
  error: (message: string, meta?: unknown) => log(LogLevel.ERROR, message, meta),
};
