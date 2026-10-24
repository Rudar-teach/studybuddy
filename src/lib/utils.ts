import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===== Deterministic avatar (feature 12) =====
const AVATAR_COLORS = [
  "from-teal-500 to-cyan-600",
  "from-cyan-400 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-amber-400 to-orange-600",
  "from-fuchsia-500 to-cyan-600",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; str; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Deterministic gradient class for a user's avatar. */
export function avatarColor(seed: string): string {
  return AVATAR_COLORS[hashString(seed) % AVATAR_COLORS.length];
}

/** Initials (max 2) for an avatar. */
export function avatarInitials(name?: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

// ===== Profile completeness (feature 8) =====
export interface ProfileCompleteness {
  percent: number;
  filled: number;
  total: number;
  missing: string[];
}

export function profileCompleteness(user: Pick<User, "bio" | "major" | "subjects" | "skills" | "availability" | "learningGoals">): ProfileCompleteness {
  const checks: { label: string; done: boolean }[] = [
    { label: "Bio", done: Boolean(user.bio?.trim()) },
    { label: "Major", done: Boolean(user.major?.trim()) },
    { label: "Subjects", done: user.subjects?.length > 0 },
    { label: "Skills", done: user.skills?.length > 0 },
    { label: "Availability", done: user.availability?.length > 0 },
    { label: "Goals", done: user.learningGoals?.length > 0 },
  ];
  const filled = checks.filter((c) => c.done).length;
  return {
    percent: Math.round((filled / checks.length) * 100),
    filled,
    total: checks.length,
    missing: checks.filter((c) => !c.done).map((c) => c.label),
  };
}

// ===== Last active helpers (feature 10) =====
export function lastActiveTimestamp(user: Pick<User, "createdAt">): number {
  const t = Date.parse(user.createdAt || "");
  return Number.isNaN(t) ? 0 : t;
}

export function relativeTime(ts: number | string): string {
  const t = typeof ts === "number" ? ts : Date.parse(ts);
  if (!ts || Number.isNaN(t) || t <= 0) return "";
  const diffMs = Date.now() - t;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(t).toLocaleDateString();
}

export function isActiveLastWeek(ts: number | string): boolean {
  const t = typeof ts === "number" ? ts : Date.parse(ts);
  if (!ts || Number.isNaN(t) || t <= 0) return false;
  return Date.now() - t < 7 * 24 * 60 * 60 * 1000;
}
