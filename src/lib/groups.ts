import { v4 as uuidv4 } from "uuid";
import { getAllRows, getRow, writeRow, mergeRow } from "./store";
import type {
  StudyGroup,
  GroupSession,
  GroupResource,
  GroupCheckin,
} from "@/types";

async function normalizeGroup(id: string, row: any): Promise<StudyGroup> {
  return {
    id,
    name: row.name,
    description: row.description || "",
    subject: row.subject,
    members: JSON.parse(row.members || "[]"),
    creatorId: row.creatorId,
    maxMembers: row.maxMembers ?? 10,
    schedule: JSON.parse(row.schedule || "[]"),
    goals: JSON.parse(row.goals || "[]"),
    createdAt: row.createdAt,
  };
}

export async function getGroupById(id: string): Promise<StudyGroup | undefined> {
  const row = await getRow("study_groups", id);
  if (!row) return undefined;
  try {
    return await normalizeGroup(id, row);
  } catch {
    return undefined;
  }
}

export async function getAllGroups(): Promise<StudyGroup[]> {
  const rows = await getAllRows("study_groups");
  const out: StudyGroup[] = [];
  for (const r of rows) {
    try {
      out.push(await normalizeGroup(r.id, r.data));
    } catch {
      /* skip malformed */
    }
  }
  return out;
}

export async function getGroupsByUser(userId: string): Promise<StudyGroup[]> {
  const all = await getAllGroups();
  return all.filter((g) => g.members?.includes(userId));
}

export async function createGroup(
  data: Omit<StudyGroup, "id" | "createdAt">
): Promise<StudyGroup> {
  const id = uuidv4();
  await writeRow("study_groups", id, {
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
  const created = await getGroupById(id);
  if (!created) throw new Error("failed to persist group");
  return created;
}

export async function joinGroup(
  id: string,
  userId: string
): Promise<StudyGroup | undefined> {
  const group = await getGroupById(id);
  if (!group) return undefined;
  if (group.members.includes(userId)) return group;
  const members = [...group.members, userId];
  await mergeRow("study_groups", id, { members: JSON.stringify(members) });
  return getGroupById(id);
}

export async function leaveGroup(
  id: string,
  userId: string
): Promise<StudyGroup | undefined> {
  const group = await getGroupById(id);
  if (!group) return undefined;
  const members = group.members.filter((m) => m !== userId);
  await mergeRow("study_groups", id, { members: JSON.stringify(members) });
  return getGroupById(id);
}

// ===== Group sessions =====

function normalizeSession(id: string, row: any): GroupSession {
  return {
    id,
    groupId: row.groupId,
    day: row.day,
    time: row.time,
    topic: row.topic || "",
    link: row.link || "",
    hostId: row.hostId,
    rsvps: JSON.parse(row.rsvps || "[]"),
    createdAt: row.createdAt,
  };
}

export async function getSessionsForGroup(groupId: string): Promise<GroupSession[]> {
  const rows = await getAllRows("group_sessions");
  return rows
    .filter((r) => r.data.groupId === groupId)
    .map((r) => normalizeSession(r.id, r.data));
}

export async function createSession(
  data: Omit<GroupSession, "id" | "createdAt" | "rsvps">
): Promise<GroupSession> {
  const id = uuidv4();
  await writeRow("group_sessions", id, {
    ...data,
    rsvps: JSON.stringify([data.hostId]),
    createdAt: new Date().toISOString(),
  });
  const rows = await getAllRows("group_sessions");
  const created = rows.find((r) => r.id === id);
  return normalizeSession(id, created?.data || {});
}

export async function removeSession(sessionId: string): Promise<boolean> {
  await mergeRow("group_sessions", sessionId, { deleted: true });
  return true;
}

export async function toggleSessionRsvp(
  sessionId: string,
  userId: string
): Promise<GroupSession | undefined> {
  const rows = await getAllRows("group_sessions");
  const target = rows.find((r) => r.id === sessionId);
  if (!target) return undefined;
  let rsvps: string[] = [];
  try {
    rsvps = JSON.parse(target.data.rsvps || "[]");
  } catch {
    rsvps = [];
  }
  const next = rsvps.includes(userId)
    ? rsvps.filter((i) => i !== userId)
    : [...rsvps, userId];
  await mergeRow("group_sessions", sessionId, { rsvps: JSON.stringify(next) });
  return normalizeSession(sessionId, { ...target.data, rsvps: JSON.stringify(next) });
}

// ===== Group resources =====

export async function getResourcesForGroup(groupId: string): Promise<GroupResource[]> {
  const rows = await getAllRows("group_resources");
  return rows
    .filter((r) => r.data.groupId === groupId)
    .map((r) => ({
      id: r.id,
      groupId: r.data.groupId,
      title: r.data.title,
      url: r.data.url,
      type: r.data.type,
      note: r.data.note,
      addedBy: r.data.addedBy,
      createdAt: r.data.createdAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function createResource(
  data: Omit<GroupResource, "id" | "createdAt">
): Promise<GroupResource> {
  const id = uuidv4();
  await writeRow("group_resources", id, {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return { ...data, id, createdAt: new Date().toISOString() };
}

export async function removeResource(resourceId: string): Promise<boolean> {
  await mergeRow("group_resources", resourceId, { deleted: true });
  return true;
}

// ===== Group check-ins =====

export async function getCheckinsForGroup(groupId: string): Promise<GroupCheckin[]> {
  const rows = await getAllRows("group_checkins");
  return rows
    .filter((r) => r.data.groupId === groupId)
    .map((r) => ({
      id: r.id,
      groupId: r.data.groupId,
      userId: r.data.userId,
      status: r.data.status,
      note: r.data.note || "",
      createdAt: r.data.createdAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function createCheckin(
  data: Omit<GroupCheckin, "id" | "createdAt">
): Promise<GroupCheckin> {
  const id = uuidv4();
  await writeRow("group_checkins", id, {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return { ...data, id, createdAt: new Date().toISOString() };
}

// ===== Engagement / leaderboard =====
export async function groupEngagement(
  groupId: string
): Promise<{ userId: string; messages: number; rsvps: number; checkins: number }[]> {
  const msgs = (await getAllRows("messages")).filter((r) => r.data.groupId === groupId);
  const sess = (await getAllRows("group_sessions")).filter((r) => r.data.groupId === groupId);
  const checks = (await getAllRows("group_checkins")).filter((r) => r.data.groupId === groupId);

  const counts = new Map<string, { userId: string; messages: number; rsvps: number; checkins: number }>();
  const bump = (id: string, key: "messages" | "rsvps" | "checkins") => {
    if (!counts.has(id)) counts.set(id, { userId: id, messages: 0, rsvps: 0, checkins: 0 });
    const e = counts.get(id)!;
    e[key] += 1;
  };
  msgs.forEach((m) => bump(m.data.senderId, "messages"));
  sess.forEach((s) => {
    let rsvps: string[] = [];
    try {
      rsvps = JSON.parse(s.data.rsvps || "[]");
    } catch {
      rsvps = [];
    }
    rsvps.forEach((id) => bump(id, "rsvps"));
  });
  checks.forEach((c) => bump(c.data.userId, "checkins"));

  return [...counts.values()].sort(
    (a, b) =>
      b.messages + b.rsvps + b.checkins - (a.messages + a.rsvps + a.checkins)
  );
}
