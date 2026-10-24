import { v4 as uuidv4 } from "uuid";
import { insert, selectAll, selectOne, dbUpdate } from "./database";
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

function normalizeUser(row: any): User {
  const subjects = parseArray<string>(row.subjects, []);
  const skills = parseArray<Skill>(row.skills, []);
  const availability = parseArray<any>(row.availability, []);
  const learningGoals = parseArray<string>(row.learningGoals, []);
  const blocklist = parseArray<string>(row.blocklist, []);

  return {
    id: row.id,
    email: row.email || "",
    name: row.name || "",
    password: row.password || "",
    avatar: row.avatar || "",
    bio: row.bio || "",
    subjects,
    skills,
    availability,
    learningGoals,
    year: row.year || "",
    major: row.major || "",
    createdAt: row.createdAt || new Date().toISOString(),
    lastActiveAt: row.lastActiveAt,
    blocklist,
  };
}

export function getUserById(id: string): User | undefined {
  return normalizeUser(selectOne("users", (r) => r.id === id));
}

export function getUserByEmail(email: string): User | undefined {
  return normalizeUser(selectOne("users", (r) => r.email === email));
}

export function createUser(user: Omit<User, "createdAt">): User {
  const now = new Date().toISOString();
  const record = insert("users", {
    id: user.id || uuidv4(),
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
  return { ...user, id: record.id, createdAt: now, lastActiveAt: now };
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const existing = getUserById(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...updates };
  dbUpdate(
    "users",
    (r: any) => r.id === id,
    {
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
    }
  );
  return getUserById(id);
}

/** Stamp lastActiveAt without touching other fields. */
export function touchUser(id: string): void {
  dbUpdate("users", (r: any) => r.id === id, { lastActiveAt: new Date().toISOString() });
}

export function getAllUsers(): User[] {
  return selectAll("users").map(normalizeUser);
}

export function getUsersByIds(ids: string[]): User[] {
  if (ids.length === 0) return [];
  return selectAll("users")
    .filter((u) => ids.includes(u.id))
    .map(normalizeUser);
}
