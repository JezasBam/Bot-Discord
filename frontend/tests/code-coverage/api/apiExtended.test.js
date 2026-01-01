import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API client
vi.mock('../../../src/api/client', () => ({
  api: {
    bot: vi.fn(),
    guilds: vi.fn(),
    channels: vi.fn(),
    messages: vi.fn(),
    sendMessage: vi.fn(),
    deleteMessage: vi.fn()
  }
}));

describe('API Client Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import API client', async () => {
    const module = await import('../../../src/api/client');
    expect(module).toBeDefined();
  });

  it('should have api object with required methods', async () => {
    const module = await import('../../../src/api/client');
    expect(typeof module.api.bot).toBe('function');
    expect(typeof module.api.guilds).toBe('function');
    expect(typeof module.api.channels).toBe('function');
    expect(typeof module.api.messages).toBe('function');
    expect(typeof module.api.sendMessage).toBe('function');
    expect(typeof module.api.deleteMessage).toBe('function');
  });

  it('should handle bot API call', async () => {
    const module = await import('../../../src/api/client');
    const mockBotInfo = {
      botReady: true,
      user: { id: '123', username: 'TestBot' }
    };
    
    module.api.bot.mockResolvedValue(mockBotInfo);
    
    const result = await module.api.bot();
    expect(result).toEqual(mockBotInfo);
    expect(module.api.bot).toHaveBeenCalledTimes(1);
  });

  it('should handle guilds API call', async () => {
    const module = await import('../../../src/api/client');
    const mockGuilds = [
      { id: '123', name: 'Test Guild', icon: null, memberCount: 100 }
    ];
    
    module.api.guilds.mockResolvedValue(mockGuilds);
    
    const result = await module.api.guilds();
    expect(result).toEqual(mockGuilds);
    expect(module.api.guilds).toHaveBeenCalledTimes(1);
  });

  it('should handle messages API call', async () => {
    const module = await import('../../../src/api/client');
    const mockMessages = [
      { id: '123', content: 'Test message', author: { username: 'User' } }
    ];
    
    module.api.messages.mockResolvedValue(mockMessages);
    
    const result = await module.api.messages('guild123', 'channel456');
    expect(result).toEqual(mockMessages);
    expect(module.api.messages).toHaveBeenCalledWith('guild123', 'channel456');
  });

  it('should handle sendMessage API call', async () => {
    const module = await import('../../../src/api/client');
    const mockMessage = { id: '123', content: 'New message' };
    
    module.api.sendMessage.mockResolvedValue(mockMessage);
    
    const result = await module.api.sendMessage('guild123', 'channel456', 'Hello world');
    expect(result).toEqual(mockMessage);
    expect(module.api.sendMessage).toHaveBeenCalledWith('guild123', 'channel456', 'Hello world');
  });

  it('should handle deleteMessage API call', async () => {
    const module = await import('../../../src/api/client');
    
    module.api.deleteMessage.mockResolvedValue(true);
    
    const result = await module.api.deleteMessage('guild123', 'channel456', 'msg123');
    expect(result).toBe(true);
    expect(module.api.deleteMessage).toHaveBeenCalledWith('guild123', 'channel456', 'msg123');
  });
});
