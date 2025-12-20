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

function shouldLog(minLevel, level) {
  return LEVELS[level] <= LEVELS[minLevel];
}

function formatArgs(args) {
  return args.map((a) => (typeof a === 'string' ? a : inspect(a, { depth: 5, colors: false }))).join(' ');
}

function formatJson(level, args, meta = {}) {
  return JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg: formatArgs(args),
    ...meta
  });
}

function formatText(level, args) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  return `${prefix} ${formatArgs(args)}`;
}

export function createLogger(options = {}) {
  const level = normalizeLevel(options.level);
  const format = options.format || 'text';
  const useJson = format === 'json';

  const log = (logLevel, args) => {
    if (!shouldLog(level, logLevel)) return;
    const output = useJson ? formatJson(logLevel, args) : formatText(logLevel, args);

    if (logLevel === 'error') {
      console.error(output);
    } else if (logLevel === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  };

  return {
    level,
    format,
    error: (...args) => log('error', args),
    warn: (...args) => log('warn', args),
    info: (...args) => log('info', args),
    debug: (...args) => log('debug', args),
    child: (meta) => createLogger({ ...options, meta: { ...options.meta, ...meta } })
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
