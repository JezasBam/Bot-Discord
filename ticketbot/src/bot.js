import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { loadConfig } from './config/index.js';
import { createLogger, setDefaultLogger } from './core/logger.js';
import { runPreflight } from './util/preflight.js';
import { loadCommands } from './loaders/commands.js';
import { loadEvents } from './loaders/events.js';
import { setupGracefulShutdown } from './core/graceful-shutdown.js';
import { startCooldownCleanup, stopCooldownCleanup } from './features/tickets/index.js';
import { startHealthServer } from './core/health.js';
import { isTransientNetworkError, isInvalidTokenError } from '../../shared/utils/network-errors.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createBot() {
  const config = loadConfig();

  const logger = createLogger({
    level: config.logging.level,
    format: config.logging.format
  });
  setDefaultLogger(logger);

  const preflightResult = await runPreflight({ logger });
  if (!preflightResult.ok) {
    logger.error('Preflight checks failed');
  }

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    process.exitCode = 1;
  });

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds, 
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.ThreadMember]
  });

  client.rest.on('rateLimited', (info) => {
    logger.warn('Rate limited:', info);
  });

  client.commands = new Collection();

  const context = {
    logger,
    config,
    client
  };

  const commands = await loadCommands();
  for (const [name, cmd] of commands) {
    client.commands.set(name, cmd);
  }
  logger.info(`Loaded ${commands.size} command(s)`);

  const events = await loadEvents(client, context);
  logger.info(`Loaded ${events.length} event(s)`);

  setupGracefulShutdown({
    client,
    logger,
    onShutdown: async () => {
      stopCooldownCleanup();
      logger.info('Cleanup complete');
    }
  });

  startCooldownCleanup();

  client.logger = logger;

  return { client, config, logger, context };
}

export async function startBot() {
  const { client, config, logger } = await createBot();

  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      await client.login(config.discord.token);
      break;
    } catch (err) {
      logger.error('Failed to login:', err);

      if (isInvalidTokenError(err)) {
        process.exitCode = 1;
        break;
      }

      if (!isTransientNetworkError(err)) {
        process.exitCode = 1;
        break;
      }

      const delayMs = Math.min(30_000, 1_000 * 2 ** Math.min(attempt - 1, 5));
      logger.error(`Retrying Discord login in ${Math.round(delayMs / 1000)}s...`);
      await sleep(delayMs);
    }
  }

  // Start health check server after successful login
  startHealthServer(client);

  return client;
}
