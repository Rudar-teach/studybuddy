import { insert, selectAll, selectOne, dbUpdate, dbRemove } from "./database";
import type { StudyGroup, Schedule } from "@/types";

function normalizeGroup(row: any): StudyGroup {
  return {
    ...row,
    schedule: JSON.parse(row.schedule || "[]"),
    goals: JSON.parse(row.goals || "[]"),
  };
}

export function getGroupById(id: string): StudyGroup | undefined {
  return normalizeGroup(selectOne("study_groups", (r) => r.id === id));
}

export function getAllGroups(): StudyGroup[] {
  return selectAll("study_groups").map(normalizeGroup);
}

export function getGroupsByUser(userId: string): StudyGroup[] {
  return selectAll("study_groups").filter((g) => g.members?.includes(userId)).map(normalizeGroup);
}

export function createGroup(data: Omit<StudyGroup, "id" | "createdAt">): StudyGroup {
  const record = insert("study_groups", {
    name: data.name,
    description: data.description,
    subject: data.subject,
    members: JSON.stringify(data.members),
    creatorId: data.creatorId,
    maxMembers: data.maxMembers,
    schedule: JSON.stringify(data.schedule),
    goals: JSON.stringify(data.goals),
    createdAt: new Date().toISOString(),
  });
  return normalizeGroup(record);
}

export function joinGroup(id: string, userId: string): StudyGroup | undefined {
  const group = getGroupById(id);
  if (!group) return undefined;
  const members = [...(group.members || []), userId];
  dbUpdate("study_groups", (r) => r.id === id, { members: JSON.stringify(members) });
  return getGroupById(id);
}

export function leaveGroup(id: string, userId: string): StudyGroup | undefined {
  const group = getGroupById(id);
  if (!group) return undefined;
  const members = (group.members || []).filter((m: string) => m !== userId);
  dbUpdate("study_groups", (r) => r.id === id, { members: JSON.stringify(members) });
  return getGroupById(id);
}

export function deleteGroup(id: string): boolean {
  return dbRemove("study_groups", (r) => r.id === id);
}
