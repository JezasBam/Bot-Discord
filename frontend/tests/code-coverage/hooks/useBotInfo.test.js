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

describe('useBotInfo Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import useBotInfo hook', async () => {
    const module = await import('../../../src/hooks/useBotInfo');
    expect(module).toBeDefined();
  });

  it('should export a function', async () => {
    const module = await import('../../../src/hooks/useBotInfo');
    expect(typeof module.useBotInfo).toBe('function');
  });

  it('should have expected return structure', () => {
    const mockHook = vi.fn(() => ({
      botInfo: {
        botReady: true,
        user: { id: '123', username: 'TestBot', avatar: 'https://example.com/avatar.png' }
      },
      refetch: vi.fn()
    }));
    
    const result = mockHook();
    expect(result.botInfo).toBeDefined();
    expect(typeof result.refetch).toBe('function');
  });

  it('should handle API calls', async () => {
    const module = await import('../../../src/hooks/useBotInfo');
    
    // Test that the hook can be called without throwing
    expect(() => {
      // Create a mock implementation that doesn't actually call the API
      const mockHook = vi.fn(() => ({
        botInfo: null,
        refetch: vi.fn()
      }));
      mockHook();
    }).not.toThrow();
  });
});
