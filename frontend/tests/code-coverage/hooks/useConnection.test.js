import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useConnection Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import useConnection hook', async () => {
    const module = await import('../../../src/features/discord/hooks/useConnection');
    expect(module).toBeDefined();
  });

  it('should export a function', async () => {
    const module = await import('../../../src/features/discord/hooks/useConnection');
    expect(typeof module.useConnection).toBe('function');
  });
});
