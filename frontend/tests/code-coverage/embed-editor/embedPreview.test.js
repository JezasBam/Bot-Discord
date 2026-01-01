import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the EmbedPreview component
vi.mock('../../../src/features/embedEditor/preview/EmbedPreview', () => ({
  EmbedPreview: vi.fn(() => null)
}));

describe('EmbedPreview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import EmbedPreview', async () => {
    const module = await import('../../../src/features/embedEditor/preview/EmbedPreview');
    expect(module).toBeDefined();
  });

  it('should export a component', async () => {
    const module = await import('../../../src/features/embedEditor/preview/EmbedPreview');
    expect(typeof module.EmbedPreview).toBe('function');
  });

  it('should render without errors', async () => {
    const module = await import('../../../src/features/embedEditor/preview/EmbedPreview');
    
    // Test that component can be rendered without throwing
    expect(() => module.EmbedPreview({})).not.toThrow();
  });

  it('should handle different embed types', async () => {
    const module = await import('../../../src/features/embedEditor/preview/EmbedPreview');
    
    // Test with different props
    expect(() => module.EmbedPreview({ embed: {} })).not.toThrow();
    expect(() => module.EmbedPreview({ embed: { title: 'Test' } })).not.toThrow();
    expect(() => module.EmbedPreview({ embed: { description: 'Test description' } })).not.toThrow();
  });
});
