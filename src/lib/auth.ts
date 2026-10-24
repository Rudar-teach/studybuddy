import { v4 as uuidv4 } from "uuid";
import { getAllRows, getRow, writeRow, mergeRow } from "./store";
import type { User, Skill } from "@/types";

function parseArray<T>(v: unknown, fallback: T[]): T[] {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === "string" && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      /* not JSON */
    }
  }
  return Array.isArray(fallback) ? fallback : [];
}

function normalizeUser(id: string, row: any): User {
  return {
    id,
    email: row.email || "",
    name: row.name || "",
    password: row.password || "",
    avatar: row.avatar || "",
    bio: row.bio || "",
    subjects: parseArray<string>(row.subjects, []),
    skills: parseArray<Skill>(row.skills, []),
    availability: parseArray<any>(row.availability, []),
    learningGoals: parseArray<string>(row.learningGoals, []),
    year: row.year || "",
    major: row.major || "",
    createdAt: row.createdAt || new Date().toISOString(),
    lastActiveAt: row.lastActiveAt,
    blocklist: parseArray<string>(row.blocklist, []),
  };
}

export async function getUserById(id: string): Promise<User | undefined> {
  const row = await getRow("users", id);
  if (!row) return undefined;
  return normalizeUser(id, row);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const rows = await getAllRows("users");
  const found = rows.find((r) => (r.data.email || "").toLowerCase() === email.toLowerCase());
  if (!found) return undefined;
  return normalizeUser(found.id, found.data);
}

export async function createUser(user: Omit<User, "createdAt">): Promise<User> {
  const id = user.id || uuidv4();
  const now = new Date().toISOString();
  await writeRow("users", id, {
    email: user.email,
    name: user.name,
    password: user.password,
    avatar: user.avatar || "",
    bio: user.bio,
    subjects: JSON.stringify(user.subjects),
    skills: JSON.stringify(user.skills),
    availability: JSON.stringify(user.availability),
    learningGoals: JSON.stringify(user.learningGoals),
    year: user.year,
    major: user.major,
    blocklist: JSON.stringify(user.blocklist || []),
    lastActiveAt: now,
    createdAt: now,
  });
  return { ...user, id, createdAt: now, lastActiveAt: now };
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const existing = await getUserById(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...updates };
  await mergeRow("users", id, {
    name: merged.name,
    bio: merged.bio,
    subjects: JSON.stringify(merged.subjects),
    skills: JSON.stringify(merged.skills),
    availability: JSON.stringify(merged.availability),
    learningGoals: JSON.stringify(merged.learningGoals),
    year: merged.year,
    major: merged.major,
    avatar: merged.avatar || "",
    blocklist: JSON.stringify(merged.blocklist || []),
  });
  return getUserById(id);
}

/** Stamp lastActiveAt without touching other fields. */
export async function touchUser(id: string): Promise<void> {
  await mergeRow("users", id, { lastActiveAt: new Date().toISOString() });
}

export async function getAllUsers(): Promise<User[]> {
  const rows = await getAllRows("users");
  return rows.map((r) => normalizeUser(r.id, r.data));
}

export async function getUsersByIds(ids: string[]): Promise<User[]> {
  if (ids.length === 0) return [];
  const rows = await getAllRows("users");
  return rows
    .filter((r) => ids.includes(r.id))
    .map((r) => normalizeUser(r.id, r.data));
}
