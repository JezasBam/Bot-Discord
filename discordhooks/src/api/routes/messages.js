import { Router } from 'express';

export function createMessagesRouter(client, logger) {
  const router = Router();

  router.post('/', async (req, res) => {
    const { channelId, content, embeds, username, avatarURL } = req.body;

    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) {
        return res.status(404).json({ error: 'Text channel not found' });
      }

      const message = await channel.send({
        content: content || undefined,
        embeds: embeds || []
      });

      res.json({
        id: message.id,
        channelId: message.channelId,
        content: message.content,
        embeds: message.embeds.map((e) => e.toJSON()),
        createdAt: message.createdAt.toISOString()
      });
    } catch (err) {
      logger.error('Failed to send message:', err);
      const errorMessage = err.rawError?.message || err.message || 'Failed to send message';
      const errorDetails = err.rawError?.errors ? JSON.stringify(err.rawError.errors) : undefined;
      res.status(err.status || 500).json({ 
        error: errorMessage,
        details: errorDetails,
        code: err.code
      });
    }
  });

  router.patch('/:messageId', async (req, res) => {
    const { messageId } = req.params;
    const { channelId, content, embeds } = req.body;

    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) {
        return res.status(404).json({ error: 'Text channel not found' });
      }

      const message = await channel.messages.fetch(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.author.id !== client.user.id) {
        return res.status(403).json({ error: 'Can only edit bot messages' });
      }

      const edited = await message.edit({
        content: content ?? message.content,
        embeds: embeds ?? message.embeds.map((e) => e.toJSON())
      });

      res.json({
        id: edited.id,
        channelId: edited.channelId,
        content: edited.content,
        embeds: edited.embeds.map((e) => e.toJSON()),
        editedAt: edited.editedAt?.toISOString()
      });
    } catch (err) {
      logger.error('Failed to edit message:', err);
      res.status(500).json({ error: 'Failed to edit message' });
    }
  });

  router.delete('/:messageId', async (req, res) => {
    const { messageId } = req.params;
    const { channelId } = req.query;

    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) {
        return res.status(404).json({ error: 'Text channel not found' });
      }

      const message = await channel.messages.fetch(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      await message.delete();

      res.json({ success: true });
    } catch (err) {
      logger.error('Failed to delete message:', err);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  });

  return router;
}
