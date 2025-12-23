import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { startApiServer } from './api/server.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

let io = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientNetworkError(err) {
  const code = err?.code;
  return code === 'ENOTFOUND' || code === 'EAI_AGAIN' || code === 'ECONNRESET' || code === 'ETIMEDOUT';
}

function isInvalidTokenError(err) {
  if (err?.code === 'TokenInvalid') return true;
  const msg = typeof err?.message === 'string' ? err.message : '';
  return /invalid token/i.test(msg);
}

async function loginWithRetry(token) {
  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      await client.login(token);
      return;
    } catch (err) {
      console.error('Failed to login:', err);

      if (isInvalidTokenError(err)) {
        process.exitCode = 1;
        return;
      }

      if (!isTransientNetworkError(err)) {
        process.exitCode = 1;
        return;
      }

      const delayMs = Math.min(30_000, 1_000 * 2 ** Math.min(attempt - 1, 5));
      console.error(`Retrying Discord login in ${Math.round(delayMs / 1000)}s...`);
      await sleep(delayMs);
    }
  }
}

client.once('ready', async () => {
  console.log(`Discord Hooks Bot ready as ${client.user.tag}`);
  console.log(`Connected to ${client.guilds.cache.size} guild(s)`);
});

// Real-time events - notify frontend when something changes
client.on('channelCreate', (channel) => {
  if (io && channel.guild) {
    console.log(`Channel created: ${channel.name}`);
    io.emit('channelUpdate', { type: 'create', guildId: channel.guild.id });
  }
});

client.on('channelDelete', (channel) => {
  if (io && channel.guild) {
    console.log(`Channel deleted: ${channel.name}`);
    io.emit('channelUpdate', { type: 'delete', guildId: channel.guild.id });
  }
});

client.on('channelUpdate', (oldChannel, newChannel) => {
  if (io && newChannel.guild) {
    console.log(`Channel updated: ${newChannel.name}`);
    io.emit('channelUpdate', { type: 'update', guildId: newChannel.guild.id });
  }
});

client.on('messageCreate', (message) => {
  if (!io) return;
  // Include bot messages too so projects created by the bot sync to the website.
  io.emit('messageUpdate', { type: 'create', channelId: message.channelId });
});

client.on('messageDelete', (message) => {
  if (!io) return;
  // For uncached deletions, ensure we still have channelId (partials help, but be defensive).
  const channelId = message.channelId || message.channel?.id;
  if (!channelId) return;
  io.emit('messageUpdate', { type: 'delete', channelId });
});

client.on('messageUpdate', (oldMessage, newMessage) => {
  if (io) {
    io.emit('messageUpdate', { type: 'update', channelId: newMessage.channelId });
  }
});

client.on('error', (err) => {
  console.error('Discord client error:', err);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN not found in environment variables');
  process.exit(1);
}

startApiServer(client, console, 4000)
  .then((result) => {
    io = result.io;
  })
  .catch((err) => {
    console.error('Failed to start API server:', err);
    process.exit(1);
  });

void loginWithRetry(token);
