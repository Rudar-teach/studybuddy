import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { insert, selectAll, selectOne, dbUpdate } from "./database";
import type { User, Skill, AvailabilitySlot } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "studybuddy-jwt-secret-change-in-production-2024";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function comparePassword(password: string, hashed: string): boolean {
  return bcrypt.compareSync(password, hashed);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

function normalizeUser(row: any): User {
  return {
    ...row,
    subjects: JSON.parse(row.subjects || "[]"),
    skills: JSON.parse(row.skills || "[]"),
    availability: JSON.parse(row.availability || "[]"),
    learningGoals: JSON.parse(row.learningGoals || "[]"),
  };
}

export function getUserById(id: string): User | undefined {
  return normalizeUser(selectOne("users", (r) => r.id === id));
}

export function getUserByEmail(email: string): User | undefined {
  return normalizeUser(selectOne("users", (r) => r.email === email));
}

export function createUser(user: Omit<User, "id" | "createdAt">): User {
  const id = uuidv4();
  const now = new Date().toISOString();
  const record = insert("users", {
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
    createdAt: now,
  });
  return { ...user, id, createdAt: now };
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const existing = getUserById(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...updates };
  dbUpdate("users", (r: any) => r.id === id, {
    name: merged.name,
    bio: merged.bio,
    subjects: JSON.stringify(merged.subjects),
    skills: JSON.stringify(merged.skills),
    availability: JSON.stringify(merged.availability),
    learningGoals: JSON.stringify(merged.learningGoals),
    year: merged.year,
    major: merged.major,
    avatar: merged.avatar || "",
  });
  return getUserById(id);
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
