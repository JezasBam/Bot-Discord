import { describe, it, expect, vi } from 'vitest';
import { createBotRouter } from '../src/api/routes/bot.js';

describe('Bot Router Creation', () => {
  it('should create router without errors', () => {
    const mockClient = {
      user: {
        id: '123456789',
        username: 'TestBot',
        tag: 'TestBot#1234',
        avatarURL: vi.fn(() => 'https://example.com/avatar.png'),
        setUsername: vi.fn(),
        setAvatar: vi.fn()
      },
      isReady: vi.fn(() => true)
    };

    const mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };

    expect(() => createBotRouter(mockClient, mockLogger)).not.toThrow();
  });

  it('should handle missing client.user', () => {
    const mockClient = {
      user: null,
      isReady: vi.fn(() => true)
    };

    const mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };

    expect(() => createBotRouter(mockClient, mockLogger)).not.toThrow();
  });

  it('should handle missing client', () => {
    const mockClient = null;
    const mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };

    expect(() => createBotRouter(mockClient, mockLogger)).not.toThrow();
  });
});
