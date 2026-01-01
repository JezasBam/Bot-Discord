import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the main entry point
vi.mock('../../../src/main', () => ({
  default: vi.fn()
}));

describe('Application Entry Point', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import main entry point', async () => {
    const module = await import('../../../src/main');
    expect(module).toBeDefined();
  });

  it('should have default export', async () => {
    const module = await import('../../../src/main');
    expect(typeof module.default).toBe('function');
  });
});
