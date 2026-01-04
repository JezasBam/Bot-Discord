import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

// Debug environment variables
console.log("🔍 Environment Variables Loaded:");
console.log("CLIENT_ID:", process.env.CLIENT_ID);
console.log("DISCORD_CLIENT_SECRET:", process.env.DISCORD_CLIENT_SECRET ? "SET" : "NOT_SET");
console.log("DISCORD_TOKEN:", process.env.DISCORD_TOKEN ? "SET" : "NOT_SET");

import { Client, GatewayIntentBits, Partials } from "discord.js";
import { startApiServer } from "./api/server.js";
import { logger } from "./core/logger.js";
import {
  isTransientNetworkError,
  isInvalidTokenError,
} from "../../shared/utils/network-errors.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

let io = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loginWithRetry(token) {
  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      await client.login(token);
      return;
    } catch (err) {
      logger.error("Failed to login:", err);

      if (isInvalidTokenError(err)) {
        process.exitCode = 1;
        return;
      }

      if (!isTransientNetworkError(err)) {
        process.exitCode = 1;
        return;
      }

      const delayMs = Math.min(30_000, 1_000 * 2 ** Math.min(attempt - 1, 5));
      logger.error(
        `Retrying Discord login in ${Math.round(delayMs / 1000)}s...`,
      );
      await sleep(delayMs);
    }
  }
}

client.once("ready", async () => {
  logger.info(`Discord Hooks Bot ready as ${client.user.tag}`);
  logger.info(`Connected to ${client.guilds.cache.size} guild(s)`);
});

// Real-time events - notify frontend when something changes
client.on("channelCreate", (channel) => {
  if (io && channel.guild) {
    logger.info(`Channel created: ${channel.name}`);
    io.emit("channelUpdate", { type: "create", guildId: channel.guild.id });
  }
});

client.on("channelDelete", (channel) => {
  if (io && channel.guild) {
    logger.info(`Channel deleted: ${channel.name}`);
    io.emit("channelUpdate", { type: "delete", guildId: channel.guild.id });
  }
});

client.on("channelUpdate", (oldChannel, newChannel) => {
  if (io && newChannel.guild) {
    logger.info(`Channel updated: ${newChannel.name}`);
    io.emit("channelUpdate", { type: "update", guildId: newChannel.guild.id });
  }
});

client.on("messageCreate", (message) => {
  if (!io) return;
  // Include bot messages too so projects created by the bot sync to the website.
  io.emit("messageUpdate", { type: "create", channelId: message.channelId });
});

client.on("messageDelete", (message) => {
  if (!io) return;
  // For uncached deletions, ensure we still have channelId (partials help, but be defensive).
  const channelId = message.channelId || message.channel?.id;
  if (!channelId) return;
  io.emit("messageUpdate", { type: "delete", channelId });
});

client.on("messageUpdate", (oldMessage, newMessage) => {
  if (io) {
    io.emit("messageUpdate", {
      type: "update",
      channelId: newMessage.channelId,
    });
  }
});

client.on("error", (err) => {
  logger.error("Discord client error:", err);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  logger.error("DISCORD_TOKEN not found in environment variables");
  process.exit(1);
}

const port = Number(process.env.PORT) || 4000;

startApiServer(client, logger, port)
  .then((result) => {
    io = result.io;
    logger.info("API server started successfully");
    // Start Discord login only after API server is ready
    void loginWithRetry(token);
  })
  .catch((err) => {
    logger.error("Failed to start API server:", err);
    process.exit(1);
  });
