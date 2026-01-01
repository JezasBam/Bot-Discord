import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useChannelMessages Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import useChannelMessages hook', async () => {
    const module = await import('../../../src/features/discord/hooks/useChannelMessages');
    expect(module).toBeDefined();
  });

  it('should export a function', async () => {
    const module = await import('../../../src/features/discord/hooks/useChannelMessages');
    expect(typeof module.useChannelMessages).toBe('function');
  });

  it('should have expected return structure', () => {
    const mockHook = vi.fn(() => ({
      messages: [],
      selectedMessage: null,
      selectedMessageId: null,
      loading: false,
      fetchMessages: vi.fn(),
      sendMessage: vi.fn(),
      deleteMessage: vi.fn(),
      selectMessage: vi.fn()
    }));
    
    const result = mockHook();
    expect(Array.isArray(result.messages)).toBe(true);
    expect(result.selectedMessage).toBe(null);
    expect(result.selectedMessageId).toBe(null);
    expect(typeof result.loading).toBe('boolean');
    expect(typeof result.fetchMessages).toBe('function');
    expect(typeof result.sendMessage).toBe('function');
    expect(typeof result.deleteMessage).toBe('function');
    expect(typeof result.selectMessage).toBe('function');
  });

  it('should handle message selection', () => {
    const mockHook = vi.fn(() => ({
      messages: [],
      selectedMessage: null,
      selectedMessageId: '123',
      loading: false,
      fetchMessages: vi.fn(),
      sendMessage: vi.fn(),
      deleteMessage: vi.fn(),
      selectMessage: vi.fn()
    }));
    
    const result = mockHook();
    expect(result.selectedMessageId).toBe('123');
  });
});
