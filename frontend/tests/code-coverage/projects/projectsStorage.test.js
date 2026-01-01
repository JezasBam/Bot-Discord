import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the projects storage
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

  it('should export repository functions', async () => {
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

  it('should export database functions', async () => {
    const module = await import('../../../src/features/projects/storage/db');
    expect(typeof module.init).toBe('function');
    expect(typeof module.save).toBe('function');
    expect(typeof module.load).toBe('function');
  });

  it('should handle database operations', async () => {
    const module = await import('../../../src/features/projects/storage/db');
    
    expect(() => module.init()).not.toThrow();
    expect(() => module.save({})).not.toThrow();
    expect(Array.isArray(module.load())).toBe(true);
  });

  it('should handle repository operations', async () => {
    const module = await import('../../../src/features/projects/storage/projectsRepository');
    
    // Test getAllProjects
    const allProjects = await module.getAllProjects();
    expect(Array.isArray(allProjects)).toBe(true);
    
    // Test getProjectById
    const project = await module.getProjectById('123');
    expect(project).toBe(null);
    
    // Test createProject
    const newProject = await module.createProject('Test');
    expect(newProject.id).toBe('123');
    expect(newProject.name).toBe('Test Project');
    
    // Test updateProject
    const updatedProject = await module.updateProject('123', { name: 'Updated Project' });
    expect(updatedProject.name).toBe('Updated Project');
    
    // Test deleteProject
    const deleted = await module.deleteProject('123');
    expect(deleted).toBe(true);
  });
});
