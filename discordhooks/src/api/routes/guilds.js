import { Router } from "express";
import { ChannelType } from "discord.js";

export function createGuildsRouter(client, logger) {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      // Fetch all guilds the bot is in
      const guilds = await Promise.all(
        client.guilds.cache.map(async (guild) => {
          const fetchedGuild = await guild.fetch();
          return {
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL({ size: 64 }),
            memberCount: guild.memberCount,
            ownerId: fetchedGuild.ownerId,
            isOwner: fetchedGuild.ownerId === client.user.id,
          };
        })
      );

      // Show all guilds the bot is in (not just owned ones)
      console.log(`🔍 Fetching ${guilds.length} guilds the bot is in`);

      res.json(guilds);
    } catch (err) {
      logger.error("Failed to fetch guilds:", err);
      res.status(500).json({ error: "Failed to fetch guilds" });
    }
  });

  router.get("/:guildId", async (req, res) => {
    const { guildId } = req.params;

    try {
      const guild = await client.guilds.fetch(guildId);
      if (!guild) {
        return res.status(404).json({ error: "Guild not found" });
      }

      // Remove owner check - allow access to all guilds the bot is in
      console.log(`🔍 Fetching guild details: ${guild.name} (${guildId})`);

      res.json({
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL({ size: 128 }),
        memberCount: guild.memberCount,
        ownerId: guild.ownerId,
        isOwner: guild.ownerId === client.user.id,
      });
    } catch (err) {
      logger.error("Failed to fetch guild:", err);
      res.status(500).json({ error: "Failed to fetch guild" });
    }
  });

  router.get("/:guildId/channels", async (req, res) => {
    const { guildId } = req.params;

    try {
      // First check if bot is in the guild by trying to fetch it
      let guild;
      try {
        guild = await client.guilds.fetch(guildId);
      } catch (fetchErr) {
        // If we get Unknown Guild error, bot is not in the server
        if (fetchErr.code === 10004 || fetchErr.message.includes('Unknown Guild')) {
          console.log(`❌ Bot is not in guild: ${guildId}`);
          return res.status(403).json({ 
            error: "Bot not in server",
            code: "BOT_NOT_IN_GUILD"
          });
        }
        throw fetchErr; // Re-throw other errors
      }

      if (!guild) {
        return res.status(404).json({ error: "Guild not found" });
      }

      console.log(`🔍 Fetching channels for guild: ${guild.name} (${guildId})`);

      const channels = await guild.channels.fetch();

      const categories = [];
      const uncategorized = [];

      channels.forEach((channel) => {
        if (!channel) return;

        if (channel.type === ChannelType.GuildCategory) {
          categories.push({
            id: channel.id,
            name: channel.name,
            position: channel.position,
            type: "category",
            children: [],
          });
        }
      });

      categories.sort((a, b) => a.position - b.position);

      channels.forEach((channel) => {
        if (!channel) return;
        if (channel.type === ChannelType.GuildCategory) return;

        const isTextBased = [
          ChannelType.GuildText,
          ChannelType.GuildAnnouncement,
          ChannelType.GuildForum,
          ChannelType.PublicThread,
          ChannelType.PrivateThread,
        ].includes(channel.type);

        if (!isTextBased) return;

        const channelData = {
          id: channel.id,
          name: channel.name,
          position: channel.position,
          type: channel.type,
          parentId: channel.parentId,
        };

        if (channel.parentId) {
          const category = categories.find((c) => c.id === channel.parentId);
          if (category) {
            category.children.push(channelData);
          } else {
            uncategorized.push(channelData);
          }
        } else {
          uncategorized.push(channelData);
        }
      });

      categories.forEach((cat) => {
        cat.children.sort((a, b) => a.position - b.position);
      });
      uncategorized.sort((a, b) => a.position - b.position);

      res.json({
        categories,
        uncategorized,
      });
    } catch (err) {
      logger.error("Failed to fetch channels:", err);
      res.status(500).json({ error: "Failed to fetch channels" });
    }
  });

  router.get("/:guildId/invite", async (req, res) => {
    const { guildId } = req.params;

    try {
      // Generate OAuth2 invite URL for the bot
      const clientId = process.env.CLIENT_ID;
      if (!clientId) {
        return res.status(500).json({ error: "Client ID not configured" });
      }
      
      // Create invite URL that pre-selects the guild
      const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot&guild_id=${guildId}&disable_guild_select=true`;
      
      console.log(`🔗 Generated invite URL for guild: ${guildId}`);
      
      res.json({ inviteUrl });
    } catch (err) {
      logger.error("Failed to generate invite URL:", err);
      res.status(500).json({ error: "Failed to generate invite URL" });
    }
  });

  return router;
}
