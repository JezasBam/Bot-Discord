import { Router } from 'express';
import { ChannelType } from 'discord.js';

export function createGuildsRouter(client, logger) {
  const router = Router();

  router.get('/', (req, res) => {
    const guilds = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ size: 64 }),
      memberCount: guild.memberCount
    }));

    res.json(guilds);
  });

  router.get('/:guildId', async (req, res) => {
    const { guildId } = req.params;

    try {
      const guild = await client.guilds.fetch(guildId);
      if (!guild) {
        return res.status(404).json({ error: 'Guild not found' });
      }

      res.json({
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL({ size: 128 }),
        memberCount: guild.memberCount
      });
    } catch (err) {
      logger.error('Failed to fetch guild:', err);
      res.status(500).json({ error: 'Failed to fetch guild' });
    }
  });

  router.get('/:guildId/channels', async (req, res) => {
    const { guildId } = req.params;

    try {
      const guild = await client.guilds.fetch(guildId);
      if (!guild) {
        return res.status(404).json({ error: 'Guild not found' });
      }

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
            type: 'category',
            children: []
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
          ChannelType.PrivateThread
        ].includes(channel.type);

        if (!isTextBased) return;

        const channelData = {
          id: channel.id,
          name: channel.name,
          position: channel.position,
          type: channel.type,
          parentId: channel.parentId
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
        uncategorized
      });
    } catch (err) {
      logger.error('Failed to fetch channels:', err);
      res.status(500).json({ error: 'Failed to fetch channels' });
    }
  });

  return router;
}
