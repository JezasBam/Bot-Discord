import { useState, useEffect, useCallback } from 'react';
import type { EmbedProject, ProjectUpdate } from '../types';
import * as repo from '../storage/projectsRepository';

export function useProjects() {
  const [projects, setProjects] = useState<EmbedProject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      const data = await repo.getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = useCallback(async (name: string): Promise<EmbedProject | null> => {
    try {
      const project = await repo.createProject(name);
      setProjects((prev) => [project, ...prev]);
      return project;
    } catch (err) {
      console.error('Failed to create project:', err);
      return null;
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: ProjectUpdate): Promise<void> => {
    try {
      await repo.updateProject(id, updates);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        )
      );
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  }, []);

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    try {
      await repo.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  }, []);

  const duplicateProject = useCallback(async (id: string): Promise<EmbedProject | null> => {
    try {
      const duplicate = await repo.duplicateProject(id);
      if (duplicate) {
        setProjects((prev) => [duplicate, ...prev]);
      }
      return duplicate;
    } catch (err) {
      console.error('Failed to duplicate project:', err);
      return null;
    }
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    refresh: loadProjects,
  };
}
