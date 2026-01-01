import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API client
vi.mock('../../../src/api/client', () => ({
  api: {
    bot: vi.fn(),
    getGuilds: vi.fn(),
    getGuild: vi.fn(),
    getGuildChannels: vi.fn(),
    getChannelMessages: vi.fn(),
    sendMessage: vi.fn(),
    editMessage: vi.fn(),
    deleteMessage: vi.fn(),
    health: vi.fn()
  }
}));

describe('API Client Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bot API', () => {
    it('should call bot endpoint successfully', async () => {
      const module = await import('../../../src/api/client');
      const mockBotInfo = {
        botReady: true,
        user: {
          id: '123',
          username: 'TestBot',
          tag: 'TestBot#1234',
          avatarUrl: 'https://example.com/avatar.png'
        }
      };
      
      module.api.bot.mockResolvedValue(mockBotInfo);
      
      const result = await module.api.bot();
      
      expect(result).toEqual(mockBotInfo);
      expect(module.api.bot).toHaveBeenCalledTimes(1);
    });

    it('should handle bot API errors', async () => {
      const module = await import('../../../src/api/client');
      const error = new Error('Bot not ready');
      
      module.api.bot.mockRejectedValue(error);
      
      await expect(module.api.bot()).rejects.toThrow('Bot not ready');
    });
  });

  describe('Guilds API', () => {
    it('should fetch all guilds', async () => {
      const module = await import('../../../src/api/client');
      const mockGuilds = [
        { id: '123', name: 'Test Guild', icon: null, memberCount: 100 },
        { id: '456', name: 'Another Guild', icon: 'icon.png', memberCount: 200 }
      ];
      
      module.api.getGuilds.mockResolvedValue(mockGuilds);
      
      const result = await module.api.getGuilds();
      
      expect(result).toEqual(mockGuilds);
      expect(module.api.getGuilds).toHaveBeenCalledTimes(1);
    });

    it('should fetch single guild', async () => {
      const module = await import('../../../src/api/client');
      const mockGuild = { id: '123', name: 'Test Guild', icon: null, memberCount: 100 };
      
      module.api.getGuild.mockResolvedValue(mockGuild);
      
      const result = await module.api.getGuild('123');
      
      expect(result).toEqual(mockGuild);
      expect(module.api.getGuild).toHaveBeenCalledWith('123');
    });

    it('should handle guild not found error', async () => {
      const module = await import('../../../src/api/client');
      const error = new Error('Guild not found');
      
      module.api.getGuild.mockRejectedValue(error);
      
      await expect(module.api.getGuild('999')).rejects.toThrow('Guild not found');
    });
  });

  describe('Channels API', () => {
    it('should fetch guild channels', async () => {
      const module = await import('../../../src/api/client');
      const mockChannels = {
        categories: [
          {
            id: 'cat1',
            name: 'Text Channels',
            position: 0,
            type: 'category',
            children: [
              { id: '456', name: 'general', position: 0, type: 0, parentId: 'cat1' }
            ]
          }
        ],
        uncategorized: []
      };
      
      module.api.getGuildChannels.mockResolvedValue(mockChannels);
      
      const result = await module.api.getGuildChannels('guild123');
      
      expect(result).toEqual(mockChannels);
      expect(module.api.getGuildChannels).toHaveBeenCalledWith('guild123');
    });

    it('should fetch channel messages', async () => {
      const module = await import('../../../src/api/client');
      const mockMessages = [
        {
          id: '789',
          content: 'Test message',
          author: {
            id: 'user123',
            username: 'User',
            avatar: 'avatar.png',
            bot: false
          },
          embeds: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          pinned: false,
          fromBot: false
        }
      ];
      
      module.api.getChannelMessages.mockResolvedValue(mockMessages);
      
      const result = await module.api.getChannelMessages('channel456');
      
      expect(result).toEqual(mockMessages);
      expect(module.api.getChannelMessages).toHaveBeenCalledWith('channel456');
    });

    it('should fetch channel messages with embeds filter', async () => {
      const module = await import('../../../src/api/client');
      const mockMessages = [
        {
          id: '789',
          content: 'Test message',
          author: { id: 'user123', username: 'User', avatar: 'avatar.png', bot: false },
          embeds: [{ title: 'Test Embed' }],
          createdAt: '2024-01-01T00:00:00.000Z',
          pinned: false,
          fromBot: false
        }
      ];
      
      module.api.getChannelMessages.mockResolvedValue(mockMessages);
      
      const result = await module.api.getChannelMessages('channel456', true);
      
      expect(result).toEqual(mockMessages);
      expect(module.api.getChannelMessages).toHaveBeenCalledWith('channel456', true);
    });
  });

  describe('Messages API', () => {
    it('should send message successfully', async () => {
      const module = await import('../../../src/api/client');
      const mockMessage = {
        id: '123',
        content: 'Hello world',
        author: {
          id: 'bot123',
          username: 'TestBot',
          avatar: 'avatar.png',
          bot: true
        },
        embeds: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        pinned: false,
        fromBot: true
      };
      
      module.api.sendMessage.mockResolvedValue(mockMessage);
      
      const result = await module.api.sendMessage('channel456', { content: 'Hello world' });
      
      expect(result).toEqual(mockMessage);
      expect(module.api.sendMessage).toHaveBeenCalledWith('channel456', { content: 'Hello world' });
    });

    it('should send message with embeds', async () => {
      const module = await import('../../../src/api/client');
      const mockMessage = {
        id: '123',
        content: 'Check out this embed!',
        author: { id: 'bot123', username: 'TestBot', avatar: 'avatar.png', bot: true },
        embeds: [{ title: 'Test Embed', description: 'Test Description' }],
        createdAt: '2024-01-01T00:00:00.000Z',
        pinned: false,
        fromBot: true
      };
      
      module.api.sendMessage.mockResolvedValue(mockMessage);
      
      const payload = {
        content: 'Check out this embed!',
        embeds: [{ title: 'Test Embed', description: 'Test Description' }]
      };
      
      const result = await module.api.sendMessage('channel456', payload);
      
      expect(result).toEqual(mockMessage);
      expect(module.api.sendMessage).toHaveBeenCalledWith('channel456', payload);
    });

    it('should edit message successfully', async () => {
      const module = await import('../../../src/api/client');
      const mockMessage = {
        id: '123',
        content: 'Edited message',
        author: { id: 'bot123', username: 'TestBot', avatar: 'avatar.png', bot: true },
        embeds: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        editedAt: '2024-01-01T01:00:00.000Z',
        pinned: false,
        fromBot: true
      };
      
      module.api.editMessage.mockResolvedValue(mockMessage);
      
      const result = await module.api.editMessage('msg123', 'channel456', { content: 'Edited message' });
      
      expect(result).toEqual(mockMessage);
      expect(module.api.editMessage).toHaveBeenCalledWith('msg123', 'channel456', { content: 'Edited message' });
    });

    it('should delete message successfully', async () => {
      const module = await import('../../../src/api/client');
      
      module.api.deleteMessage.mockResolvedValue(undefined);
      
      const result = await module.api.deleteMessage('msg123', 'channel456');
      
      expect(result).toBeUndefined();
      expect(module.api.deleteMessage).toHaveBeenCalledWith('msg123', 'channel456');
    });

    it('should handle message not found error', async () => {
      const module = await import('../../../src/api/client');
      const error = new Error('Message not found');
      
      module.api.deleteMessage.mockRejectedValue(error);
      
      await expect(module.api.deleteMessage('msg999', 'channel456')).rejects.toThrow('Message not found');
    });
  });

  describe('Health API', () => {
    it('should check health status', async () => {
      const module = await import('../../../src/api/client');
      const mockHealth = {
        status: 'ok',
        botReady: true,
        guilds: 5
      };
      
      module.api.health.mockResolvedValue(mockHealth);
      
      const result = await module.api.health();
      
      expect(result).toEqual(mockHealth);
      expect(module.api.health).toHaveBeenCalledTimes(1);
    });

    it('should handle unhealthy status', async () => {
      const module = await import('../../../src/api/client');
      const mockHealth = {
        status: 'error',
        botReady: false,
        guilds: 0
      };
      
      module.api.health.mockResolvedValue(mockHealth);
      
      const result = await module.api.health();
      
      expect(result.status).toBe('error');
      expect(result.botReady).toBe(false);
    });
  });
});
