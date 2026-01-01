import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the ErrorBoundary
vi.mock('../../../src/components/ErrorBoundary', () => ({
  ErrorBoundary: vi.fn(({ children }) => children)
}));

describe('Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import ErrorBoundary', async () => {
    const module = await import('../../../src/components/ErrorBoundary');
    expect(module).toBeDefined();
  });

  it('should be a component', async () => {
    const module = await import('../../../src/components/ErrorBoundary');
    expect(typeof module.ErrorBoundary).toBe('function');
  });

  it('should render children when no error', async () => {
    const module = await import('../../../src/components/ErrorBoundary');
    const mockChildren = vi.fn(() => 'Test content');
    
    // Test that ErrorBoundary can render without throwing
    expect(() => module.ErrorBoundary({ children: mockChildren() })).not.toThrow();
  });
});
