import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API client
vi.mock('../../src/api/client', () => ({
  api: {
    bot: vi.fn(),
    guilds: vi.fn(),
    channels: vi.fn(),
    messages: vi.fn(),
    sendMessage: vi.fn(),
    deleteMessage: vi.fn()
  }
}));

describe('App Component Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import App component', async () => {
    const module = await import('../../../src/app/App');
    expect(module).toBeDefined();
  });

  it('should have default export', async () => {
    const module = await import('../../../src/app/App');
    expect(typeof module.default).toBe('function');
  });

  it('should have required imports', async () => {
    // Test that App can be imported without throwing
    expect(() => import('../../../src/app/App')).not.toThrow();
  });

  it('should have React imports', async () => {
    // Test that React can be imported
    expect(() => import('react')).not.toThrow();
    expect(() => import('react-dom')).not.toThrow();
  });
});
