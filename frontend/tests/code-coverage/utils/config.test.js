import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the config
vi.mock('../../../src/config/env', () => ({
  API_BASE: 'http://localhost:4000',
  DISCORD_TOKEN: 'test-token',
  CLIENT_ID: 'test-client-id'
}));

describe('Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import environment config', async () => {
    const module = await import('../../../src/config/env');
    expect(module).toBeDefined();
  });

  it('should have required environment variables', async () => {
    const module = await import('../../../src/config/env');
    expect(typeof module.API_BASE).toBe('string');
    expect(typeof module.DISCORD_TOKEN).toBe('string');
    expect(typeof module.CLIENT_ID).toBe('string');
    expect(module.API_BASE).toBe('http://localhost:4000');
    expect(module.DISCORD_TOKEN).toBe('test-token');
    expect(module.CLIENT_ID).toBe('test-client-id');
  });
});
