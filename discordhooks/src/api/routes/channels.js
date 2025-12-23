import { Router } from 'express';

export function createChannelsRouter(client, logger) {
  const router = Router();

  router.get('/:channelId', async (req, res) => {
    const { channelId } = req.params;

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
      }

      res.json({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        guildId: channel.guildId
      });
    } catch (err) {
      logger.error('Failed to fetch channel:', err);
      res.status(500).json({ error: 'Failed to fetch channel' });
    }
  });

  router.get('/:channelId/messages', async (req, res) => {
    const { channelId } = req.params;
    const { limit = 50, hasEmbeds } = req.query;

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) {
        return res.status(404).json({ error: 'Text channel not found' });
      }

      const messages = await channel.messages.fetch({ limit: Math.min(Number(limit), 100) });

      let filtered = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        author: {
          id: msg.author.id,
          username: msg.author.username,
          avatar: msg.author.displayAvatarURL({ size: 64 }),
          bot: msg.author.bot
        },
        embeds: msg.embeds.map((embed) => embed.toJSON()),
        createdAt: msg.createdAt.toISOString(),
        editedAt: msg.editedAt?.toISOString(),
        pinned: msg.pinned,
        fromBot: msg.author.id === client.user.id
      }));

      if (hasEmbeds === 'true') {
        filtered = filtered.filter((m) => m.embeds.length > 0);
      }

      res.json(filtered);
    } catch (err) {
      logger.error('Failed to fetch messages:', err);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  return router;
}
