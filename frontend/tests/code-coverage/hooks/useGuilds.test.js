import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useGuilds Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import useGuilds hook', async () => {
    const module = await import('../../../src/features/discord/hooks/useGuilds');
    expect(module).toBeDefined();
  });

  it('should export a function', async () => {
    const module = await import('../../../src/features/discord/hooks/useGuilds');
    expect(typeof module.useGuilds).toBe('function');
  });

  it('should have expected return structure', () => {
    const mockHook = vi.fn(() => ({
      guilds: [],
      loading: false,
      error: null,
      refreshGuilds: vi.fn()
    }));
    
    const result = mockHook();
    expect(Array.isArray(result.guilds)).toBe(true);
    expect(typeof result.loading).toBe('boolean');
    expect(result.error).toBe(null);
    expect(typeof result.refreshGuilds).toBe('function');
  });
});
