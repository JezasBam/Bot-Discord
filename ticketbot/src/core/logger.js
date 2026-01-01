import pino from 'pino';
import { inspect } from 'node:util';

const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

function normalizeLevel(level) {
  const raw = String(level || '')
    .trim()
    .toLowerCase();
  if (raw in LEVELS) return raw;
  return 'warn';
}

function formatArgs(args) {
  return args.map((a) => (typeof a === 'string' ? a : inspect(a, { depth: 5, colors: false }))).join(' ');
}

export function createLogger(options = {}) {
  const level = normalizeLevel(options.level);
  const format = options.format || 'text';
  const useJson = format === 'json';

  // Pino configuration for production performance
  const pinoConfig = {
    level: level === 'debug' ? 'debug' : level,
    formatters: {
      level: (label) => ({ level: label }),
      log: (object) => {
        // Preserve custom format while using Pino's performance
        if (useJson) {
          return {
            ...object,
            msg: object.msg || formatArgs(object.args || [])
          };
        }
        return object;
      }
    },
    // Performance optimizations
    serialize: !useJson,
    timestamp: pino.stdTimeFunctions.isoTime,
    // Custom pretty print for development
    transport: useJson
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            messageFormat: '[{level}] {msg}'
          }
        }
  };

  const pinoLogger = pino(pinoConfig);

  // Wrapper to maintain exact same API as before
  const log = (logLevel, args) => {
    if (!args || args.length === 0) return;

    const message = formatArgs(args);

    switch (logLevel) {
      case 'error':
        pinoLogger.error(message);
        break;
      case 'warn':
        pinoLogger.warn(message);
        break;
      case 'info':
        pinoLogger.info(message);
        break;
      case 'debug':
        pinoLogger.debug(message);
        break;
    }
  };

  return {
    level,
    format,
    error: (...args) => log('error', args),
    warn: (...args) => log('warn', args),
    info: (...args) => log('info', args),
    debug: (...args) => log('debug', args),
    child: (meta) => {
      const childLogger = pinoLogger.child(meta);
      return {
        ...createLogger(options),
        error: (...args) => log('error', args),
        warn: (...args) => log('warn', args),
        info: (...args) => log('info', args),
        debug: (...args) => log('debug', args),
        child: (newMeta) => childLogger.child(newMeta)
      };
    }
  };
}

let defaultLogger = null;

export function getLogger() {
  if (!defaultLogger) {
    defaultLogger = createLogger({
      level: process.env.LOG_LEVEL || 'warn',
      format: process.env.NODE_ENV === 'production' ? 'json' : 'text'
    });
  }
  return defaultLogger;
}

export function setDefaultLogger(logger) {
  defaultLogger = logger;
}
