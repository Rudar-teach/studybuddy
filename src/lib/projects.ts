import { v4 as uuidv4 } from "uuid";
import { getAllRows, getRow, writeRow, mergeRow, deleteRow } from "./store";
import type { Project } from "@/types";

async function normalizeProject(id: string, row: any): Promise<Project> {
  return {
    id,
    title: row.title,
    description: row.description || "",
    technologies: JSON.parse(row.technologies || "[]"),
    creatorId: row.creatorId,
    collaborators: JSON.parse(row.collaborators || "[]"),
    status: row.status || "open",
    createdAt: row.createdAt,
  };
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const row = await getRow("projects", id);
  if (!row) return undefined;
  return normalizeProject(id, row);
}

export async function getAllProjects(): Promise<Project[]> {
  const rows = await getAllRows("projects");
  const out: Project[] = [];
  for (const r of rows) {
    try {
      out.push(await normalizeProject(r.id, r.data));
    } catch {
      /* skip */
    }
  }
  return out;
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const all = await getAllProjects();
  return all.filter((p) => p.creatorId === userId || p.collaborators?.includes(userId));
}

export async function createProject(data: Omit<Project, "id" | "createdAt">): Promise<Project> {
  const id = uuidv4();
  await writeRow("projects", id, {
    title: data.title,
    description: data.description,
    technologies: JSON.stringify(data.technologies),
    creatorId: data.creatorId,
    collaborators: JSON.stringify(data.collaborators),
    status: data.status || "open",
    createdAt: new Date().toISOString(),
  });
  return { ...data, id, createdAt: new Date().toISOString(), status: data.status || "open" };
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
  await mergeRow("projects", id, {
    title: updates.title,
    description: updates.description,
    technologies: updates.technologies ? JSON.stringify(updates.technologies) : undefined,
    status: updates.status,
    collaborators: updates.collaborators ? JSON.stringify(updates.collaborators) : undefined,
  });
  return getProjectById(id);
}

export async function addCollaborator(id: string, userId: string): Promise<Project | undefined> {
  const project = await getProjectById(id);
  if (!project) return undefined;
  const collaborators = [...(project.collaborators || []), userId];
  await mergeRow("projects", id, { collaborators: JSON.stringify(collaborators) });
  return getProjectById(id);
}

export async function deleteProject(id: string): Promise<boolean> {
  await deleteRow("projects", id);
  return true;
}
