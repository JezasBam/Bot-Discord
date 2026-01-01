import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../../.env') });

class ConfigValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new ConfigValidationError(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optionalEnv(name, defaultValue = null) {
  const value = process.env[name];
  if (!value || value.trim() === '') return defaultValue;
  return value.trim();
}

function validateLogLevel(level) {
  const valid = ['error', 'warn', 'info', 'debug'];
  if (!valid.includes(level)) {
    return 'warn';
  }
  return level;
}

function validatePositiveInt(value, defaultValue) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return defaultValue;
  return Math.floor(num);
}

let cachedConfig = null;

export function loadConfig() {
  if (cachedConfig) return cachedConfig;

  const config = {
    discord: {
      token: requireEnv('DISCORD_TOKEN'),
      clientId: requireEnv('CLIENT_ID'),
      guildId: optionalEnv('GUILD_ID')
    },
    tickets: {
      cooldownMs: validatePositiveInt(optionalEnv('TICKET_COOLDOWN_MS'), 10_000),
      maxTranscriptMessages: validatePositiveInt(optionalEnv('MAX_TRANSCRIPT_MESSAGES'), 300),
      maxAttachmentBytes: validatePositiveInt(optionalEnv('MAX_ATTACHMENT_BYTES'), 7_500_000),
      maxAttachmentFiles: validatePositiveInt(optionalEnv('MAX_ATTACHMENT_FILES'), 15)
    },
    moderation: {
      adminRoles: optionalEnv('ADMIN_ROLES', 'Support').split(',').map(r => r.trim()),
      muteDuration: validatePositiveInt(optionalEnv('MUTE_DURATION_MINUTES'), 5),
      logChannel: optionalEnv('MOD_LOG_CHANNEL')
    },
    logging: {
      level: validateLogLevel(optionalEnv('LOG_LEVEL', 'warn')),
      format: optionalEnv('LOG_FORMAT', process.env.NODE_ENV === 'production' ? 'json' : 'text')
    },
    env: optionalEnv('NODE_ENV', 'development')
  };

  cachedConfig = Object.freeze(config);
  return cachedConfig;
}

export function resetConfigCache() {
  cachedConfig = null;
}

export function getConfig() {
  if (!cachedConfig) {
    return loadConfig();
  }
  return cachedConfig;
}

export { ConfigValidationError };
