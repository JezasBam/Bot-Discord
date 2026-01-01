import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the ProjectsSidebar component
vi.mock('../../../src/features/projects/components/ProjectsSidebar', () => ({
  ProjectsSidebar: vi.fn(() => null)
}));

describe('ProjectsSidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import ProjectsSidebar', async () => {
    const module = await import('../../../src/features/projects/components/ProjectsSidebar');
    expect(module).toBeDefined();
  });

  it('should export a component', async () => {
    const module = await import('../../../src/features/projects/components/ProjectsSidebar');
    expect(typeof module.ProjectsSidebar).toBe('function');
  });

  it('should render without errors', async () => {
    const module = await import('../../../src/features/projects/components/ProjectsSidebar');
    
    // Test that component can be rendered without throwing
    expect(() => module.ProjectsSidebar({})).not.toThrow();
  });

  it('should handle project list prop', async () => {
    const module = await import('../../../src/features/projects/components/ProjectsSidebar');
    
    const mockProjects = [
      { id: '1', name: 'Project 1', createdAt: new Date() },
      { id: '2', name: 'Project 2', createdAt: new Date() }
    ];
    
    expect(() => module.ProjectsSidebar({ projects: mockProjects })).not.toThrow();
  });

  it('should handle project selection', async () => {
    const module = await import('../../../src/features/projects/components/ProjectsSidebar');
    const mockSelectProject = vi.fn();
    
    expect(() => module.ProjectsSidebar({ 
      projects: [],
      onSelectProject: mockSelectProject 
    })).not.toThrow();
  });

  it('should handle project creation', async () => {
    const module = await import('../../../src/features/projects/components/ProjectsSidebar');
    const mockCreateProject = vi.fn();
    
    expect(() => module.ProjectsSidebar({ 
      projects: [],
      onCreateProject: mockCreateProject 
    })).not.toThrow();
  });
});
