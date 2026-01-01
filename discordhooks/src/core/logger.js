import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

// Pino configuration optimized for production
const pinoConfig = {
  level: process.env.LOG_LEVEL || "info",
  // Performance optimizations
  serialize: !isProduction && !isTest,
  timestamp: pino.stdTimeFunctions.isoTime,
  // Pretty output for development
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          messageFormat: "[{level}] {msg}",
        },
      },
};

const baseLogger = pino(pinoConfig);

// Create logger with same API as ticketbot
export function createLogger(options = {}) {
  const level = options.level || process.env.LOG_LEVEL || "info";

  return {
    level,
    error: (...args) => baseLogger.error(args.join(" ")),
    warn: (...args) => baseLogger.warn(args.join(" ")),
    info: (...args) => baseLogger.info(args.join(" ")),
    debug: (...args) => baseLogger.debug(args.join(" ")),
    child: (meta) => {
      const childLogger = baseLogger.child(meta);
      return {
        ...createLogger(options),
        error: (...args) => childLogger.error(args.join(" ")),
        warn: (...args) => childLogger.warn(args.join(" ")),
        info: (...args) => childLogger.info(args.join(" ")),
        debug: (...args) => childLogger.debug(args.join(" ")),
        child: (newMeta) => childLogger.child(newMeta),
      };
    },
  };
}

export const logger = createLogger();
