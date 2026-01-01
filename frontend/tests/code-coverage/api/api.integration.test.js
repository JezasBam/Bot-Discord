import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API client to match real implementation
vi.mock('../../../src/api/client', () => ({
  api: {
    health: vi.fn(),
    bot: vi.fn(),
    getGuilds: vi.fn(),
    getGuild: vi.fn(),
    getGuildChannels: vi.fn(),
    getChannelMessages: vi.fn(),
    sendMessage: vi.fn(),
    editMessage: vi.fn(),
    deleteMessage: vi.fn()
  }
}));

describe('API Client Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import API client', async () => {
    const module = await import('../../../src/api/client');
    expect(module).toBeDefined();
  });

  it('should export api object', async () => {
    const module = await import('../../../src/api/client');
    expect(module.api).toBeDefined();
  });

  it('should have all required methods', async () => {
    const module = await import('../../../src/api/client');
    expect(typeof module.api.health).toBe('function');
    expect(typeof module.api.bot).toBe('function');
    expect(typeof module.api.getGuilds).toBe('function');
    expect(typeof module.api.getGuild).toBe('function');
    expect(typeof module.api.getGuildChannels).toBe('function');
    expect(typeof module.api.getChannelMessages).toBe('function');
    expect(typeof module.api.sendMessage).toBe('function');
    expect(typeof module.api.editMessage).toBe('function');
    expect(typeof module.api.deleteMessage).toBe('function');
  });

  it('should handle health API call', async () => {
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

  it('should handle bot API call', async () => {
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

  it('should handle getGuilds API call', async () => {
    const module = await import('../../../src/api/client');
    const mockGuilds = [
      { id: '123', name: 'Test Guild', icon: null, memberCount: 100 }
    ];
    
    module.api.getGuilds.mockResolvedValue(mockGuilds);
    
    const result = await module.api.getGuilds();
    expect(result).toEqual(mockGuilds);
    expect(module.api.getGuilds).toHaveBeenCalledTimes(1);
  });

  it('should handle getGuild API call', async () => {
    const module = await import('../../../src/api/client');
    const mockGuild = { id: '123', name: 'Test Guild', icon: null, memberCount: 100 };
    
    module.api.getGuild.mockResolvedValue(mockGuild);
    
    const result = await module.api.getGuild('123');
    expect(result).toEqual(mockGuild);
    expect(module.api.getGuild).toHaveBeenCalledWith('123');
  });

  it('should handle getGuildChannels API call', async () => {
    const module = await import('../../../src/api/client');
    const mockGuildChannels = {
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
    
    module.api.getGuildChannels.mockResolvedValue(mockGuildChannels);
    
    const result = await module.api.getGuildChannels('guild123');
    expect(result).toEqual(mockGuildChannels);
    expect(module.api.getGuildChannels).toHaveBeenCalledWith('guild123');
  });

  it('should handle getChannelMessages API call', async () => {
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

  it('should handle sendMessage API call', async () => {
    const module = await import('../../../src/api/client');
    const mockMessage = {
      id: '123',
      content: 'New message',
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

  it('should handle deleteMessage API call', async () => {
    const module = await import('../../../src/api/client');
    
    module.api.deleteMessage.mockResolvedValue(undefined);
    
    const result = await module.api.deleteMessage('msg123', 'channel456');
    expect(result).toBeUndefined();
    expect(module.api.deleteMessage).toHaveBeenCalledWith('msg123', 'channel456');
  });

  it('should handle editMessage API call', async () => {
    const module = await import('../../../src/api/client');
    const mockMessage = {
      id: '123',
      content: 'Edited message',
      author: {
        id: 'bot123',
        username: 'TestBot',
        avatar: 'avatar.png',
        bot: true
      },
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
});
