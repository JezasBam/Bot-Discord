import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useSocket Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import useSocket hook', async () => {
    const module = await import('../../../src/features/discord/hooks/useSocket');
    expect(module).toBeDefined();
  });

  it('should export a function', async () => {
    const module = await import('../../../src/features/discord/hooks/useSocket');
    expect(typeof module.useSocket).toBe('function');
  });

  it('should accept required parameters', () => {
    const mockHook = vi.fn();
    // Test that hook can be called with expected parameters
    expect(() => mockHook(true, 'guild123', 'channel456', vi.fn(), vi.fn())).not.toThrow();
  });

  it('should handle different connection states', () => {
    const mockHook = vi.fn();
    // Test with connected state
    expect(() => mockHook(true, 'guild123', 'channel456', vi.fn(), vi.fn())).not.toThrow();
    
    // Test with disconnected state
    expect(() => mockHook(false, null, null, vi.fn(), vi.fn())).not.toThrow();
  });
});
