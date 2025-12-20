import { REST, Routes } from 'discord.js';
import { loadConfig } from './config/index.js';
import { getCommandJson } from './loaders/commands.js';

const config = loadConfig();
const rest = new REST({ version: '10' }).setToken(config.discord.token);

const commands = await getCommandJson();

try {
  const route = config.discord.guildId
    ? Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId)
    : Routes.applicationCommands(config.discord.clientId);

  await rest.put(route, { body: commands });
  console.log(
    config.discord.guildId
      ? `Deployed ${commands.length} commands to guild ${config.discord.guildId}.`
      : `Deployed ${commands.length} commands globally.`
  );
} catch (err) {
  console.error('Failed to deploy commands:', err);
  process.exitCode = 1;
}
