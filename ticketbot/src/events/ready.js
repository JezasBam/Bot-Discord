import { Events } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client, context) {
  const { logger } = context;
  logger.info(`Ready! Logged in as ${client.user.tag}`);
  logger.info(`Serving ${client.guilds.cache.size} guild(s)`);
}
