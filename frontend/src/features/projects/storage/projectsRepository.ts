import { db } from './db';
import type { EmbedProject, ProjectUpdate } from '../types';
import { createEmptyPayload } from '@/features/embedEditor/utils/payload';

function generateId(): string {
  return crypto.randomUUID();
}

export async function getAllProjects(): Promise<EmbedProject[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray();
}

export async function getProjectById(id: string): Promise<EmbedProject | undefined> {
  return db.projects.get(id);
}

export async function createProject(name: string): Promise<EmbedProject> {
  const now = Date.now();
  const project: EmbedProject = {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    payload: createEmptyPayload(),
  };

  await db.projects.add(project);
  return project;
}

export async function updateProject(id: string, updates: ProjectUpdate): Promise<void> {
  await db.projects.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}

export async function duplicateProject(id: string): Promise<EmbedProject | null> {
  const original = await getProjectById(id);
  if (!original) return null;

  const now = Date.now();
  const duplicate: EmbedProject = {
    id: generateId(),
    name: `${original.name} (copy)`,
    createdAt: now,
    updatedAt: now,
    payload: structuredClone(original.payload),
  };

  await db.projects.add(duplicate);
  return duplicate;
}
