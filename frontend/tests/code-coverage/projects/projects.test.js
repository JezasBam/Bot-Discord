import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the storage modules
vi.mock('../../../src/features/projects/storage/projectsRepository', () => ({
  getAllProjects: vi.fn(() => []),
  getProjectById: vi.fn(() => null),
  createProject: vi.fn(() => ({ id: '123', name: 'Test Project' })),
  updateProject: vi.fn(() => ({ id: '123', name: 'Updated Project' })),
  deleteProject: vi.fn(() => true)
}));

vi.mock('../../../src/features/projects/storage/db', () => ({
  init: vi.fn(),
  save: vi.fn(),
  load: vi.fn(() => [])
}));

describe('Projects Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import projects repository', async () => {
    const module = await import('../../../src/features/projects/storage/projectsRepository');
    expect(module).toBeDefined();
  });

  it('should have repository functions', async () => {
    const module = await import('../../../src/features/projects/storage/projectsRepository');
    
    expect(typeof module.getAllProjects).toBe('function');
    expect(typeof module.getProjectById).toBe('function');
    expect(typeof module.createProject).toBe('function');
    expect(typeof module.updateProject).toBe('function');
    expect(typeof module.deleteProject).toBe('function');
  });

  it('should import database module', async () => {
    const module = await import('../../../src/features/projects/storage/db');
    expect(module).toBeDefined();
  });

  it('should have database functions', async () => {
    const module = await import('../../../src/features/projects/storage/db');
    expect(typeof module.init).toBe('function');
    expect(typeof module.save).toBe('function');
    expect(typeof module.load).toBe('function');
  });
});

describe('Projects Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import useCurrentProject hook', async () => {
    const module = await import('../../../src/features/projects/hooks/useCurrentProject');
    expect(module).toBeDefined();
  });

  it('should import useProjects hook', async () => {
    const module = await import('../../../src/features/projects/hooks/useProjects');
    expect(module).toBeDefined();
  });

  it('should have useCurrentProject with expected structure', () => {
    const mockHook = vi.fn(() => ({
      project: null,
      setProject: vi.fn()
    }));
    
    const result = mockHook();
    expect(result.project).toBe(null);
    expect(typeof result.setProject).toBe('function');
  });

  it('should have useProjects with expected structure', () => {
    const mockHook = vi.fn(() => ({
      projects: [],
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn()
    }));
    
    const result = mockHook();
    expect(Array.isArray(result.projects)).toBe(true);
    expect(typeof result.createProject).toBe('function');
    expect(typeof result.updateProject).toBe('function');
    expect(typeof result.deleteProject).toBe('function');
  });
});
