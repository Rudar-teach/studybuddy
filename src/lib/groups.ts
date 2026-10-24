import { v4 as uuidv4 } from "uuid";
import { insert, selectAll, selectOne, dbUpdate, dbRemove } from "./database";
import type { StudyGroup, Schedule, GroupSession, GroupResource, GroupCheckin } from "@/types";

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
    id: uuidv4(),
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

// ===== Group sessions (feature 5) =====

function normalizeIds(row: any) {
  return { ...row, rsvps: JSON.parse(row.rsvps || "[]") };
}

export function getSessionsForGroup(groupId: string): GroupSession[] {
  return selectAll("group_sessions")
    .filter((s: any) => s.groupId === groupId)
    .map(normalizeIds);
}

export function createSession(data: Omit<GroupSession, "id" | "createdAt" | "rsvps">): GroupSession {
  const record = insert("group_sessions", {
    id: uuidv4(),
    ...data,
    rsvps: JSON.stringify([data.hostId]),
    createdAt: new Date().toISOString(),
  });
  return normalizeIds(record);
}

export function removeSession(sessionId: string): boolean {
  return dbRemove("group_sessions", (r: any) => r.id === sessionId);
}

export function toggleSessionRsvp(sessionId: string, userId: string): GroupSession | undefined {
  const row = selectOne("group_sessions", (r: any) => r.id === sessionId);
  if (!row) return undefined;
  let rsvps: string[] = [];
  try {
    rsvps = JSON.parse(row.rsvps || "[]");
  } catch {
    rsvps = [];
  }
  const has = rsvps.includes(userId);
  const next = has ? rsvps.filter((id) => id !== userId) : [...rsvps, userId];
  dbUpdate("group_sessions", (r: any) => r.id === sessionId, { rsvps: JSON.stringify(next) });
  return normalizeIds({ ...row, rsvps: JSON.stringify(next) });
}

// ===== Group resources (feature 6) =====

export function getResourcesForGroup(groupId: string): GroupResource[] {
  return selectAll("group_resources")
    .filter((r: any) => r.groupId === groupId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createResource(
  data: Omit<GroupResource, "id" | "createdAt">
): GroupResource {
  const record = insert("group_resources", {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
  });
  return record as GroupResource;
}

export function removeResource(resourceId: string): boolean {
  return dbRemove("group_resources", (r: any) => r.id === resourceId);
}

// ===== Group check-ins (feature 7) =====

export function getCheckinsForGroup(groupId: string): GroupCheckin[] {
  return selectAll("group_checkins")
    .filter((c: any) => c.groupId === groupId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createCheckin(data: Omit<GroupCheckin, "id" | "createdAt">): GroupCheckin {
  const record = insert("group_checkins", {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
  });
  return record as GroupCheckin;
}

// ===== Engagement / leaderboard (feature 3) =====

export function groupEngagement(groupId: string): { userId: string; messages: number; rsvps: number; checkins: number }[] {
  const msgs = selectAll("messages").filter((m: any) => m.groupId === groupId);
  const sess = selectAll("group_sessions").filter((s: any) => s.groupId === groupId);
  const checks = selectAll("group_checkins").filter((c: any) => c.groupId === groupId);

  const counts = new Map<string, { userId: string; messages: number; rsvps: number; checkins: number }>();

  const bump = (id: string, key: "messages" | "rsvps" | "checkins") => {
    if (!counts.has(id)) counts.set(id, { userId: id, messages: 0, rsvps: 0, checkins: 0 });
    const entry = counts.get(id)!;
    entry[key] += 1;
  };

  msgs.forEach((m: any) => bump(m.senderId, "messages"));
  sess.forEach((s: any) => {
    let rsvps: string[] = [];
    try {
      rsvps = JSON.parse(s.rsvps || "[]");
    } catch {
      rsvps = [];
    }
    rsvps.forEach((id: string) => bump(id, "rsvps"));
  });
  checks.forEach((c: any) => bump(c.userId, "checkins"));

  return [...counts.values()].sort(
    (a, b) => b.messages + b.rsvps + b.checkins - (a.messages + a.rsvps + a.checkins)
  );
}
