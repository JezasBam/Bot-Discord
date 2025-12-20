import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { loadConfig } from './config/index.js';
import { createLogger, setDefaultLogger } from './core/logger.js';
import { runPreflight } from './util/preflight.js';
import { loadCommands } from './loaders/commands.js';
import { loadEvents } from './loaders/events.js';
import { setupGracefulShutdown } from './core/graceful-shutdown.js';
import { startCooldownCleanup, stopCooldownCleanup } from './features/tickets/index.js';

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
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
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

  return { client, config, logger, context };
}

export async function startBot() {
  const { client, config, logger } = await createBot();

  try {
    await client.login(config.discord.token);
  } catch (err) {
    logger.error('Failed to login:', err);
    process.exitCode = 1;
  }

  return client;
}
