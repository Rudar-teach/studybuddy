import { insert, selectAll, selectOne, dbUpdate, dbRemove } from "./database";
import type { Project } from "@/types";

function normalizeProject(row: any): Project {
  return {
    ...row,
    technologies: JSON.parse(row.technologies || "[]"),
    collaborators: JSON.parse(row.collaborators || "[]"),
  };
}

export function getProjectById(id: string): Project | undefined {
  return normalizeProject(selectOne("projects", (r) => r.id === id));
}

export function getAllProjects(): Project[] {
  return selectAll("projects").map(normalizeProject);
}

export function getProjectsByUser(userId: string): Project[] {
  return selectAll("projects")
    .filter((p) => p.creatorId === userId || p.collaborators?.includes(userId))
    .map(normalizeProject);
}

export function createProject(data: Omit<Project, "id" | "createdAt">): Project {
  const record = insert("projects", {
    title: data.title,
    description: data.description,
    technologies: JSON.stringify(data.technologies),
    creatorId: data.creatorId,
    collaborators: JSON.stringify(data.collaborators),
    status: data.status || "open",
    createdAt: new Date().toISOString(),
  });
  return normalizeProject(record);
}

export function updateProject(id: string, updates: Partial<Project>): Project | undefined {
  dbUpdate("projects", (r) => r.id === id, {
    title: updates.title,
    description: updates.description,
    technologies: JSON.stringify(updates.technologies),
    status: updates.status,
    collaborators: JSON.stringify(updates.collaborators),
  });
  return getProjectById(id);
}

export function addCollaborator(id: string, userId: string): Project | undefined {
  const project = getProjectById(id);
  if (!project) return undefined;
  const collaborators = [...(project.collaborators || []), userId];
  dbUpdate("projects", (r) => r.id === id, { collaborators: JSON.stringify(collaborators) });
  return getProjectById(id);
}

export function deleteProject(id: string): boolean {
  return dbRemove("projects", (r) => r.id === id);
}
