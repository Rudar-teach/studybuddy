import { v4 as uuidv4 } from "uuid";
import { insert, selectAll, dbUpdate } from "./database";
import type { UserReport, User } from "@/types";

// ===== User reporting (feature 9) =====
export function reportUser(data: Omit<UserReport, "id" | "createdAt">): UserReport {
  const record = insert("user_reports", {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
  });
  return record as UserReport;
}

export function getUserReports(reportedUserId: string): UserReport[] {
  return selectAll("user_reports").filter(
    (r: any) => r.reportedUserId === reportedUserId
  ) as unknown as UserReport[];
}

// ===== Blocklist (feature 9) =====
export function toggleBlock(userId: string, currentBlocklist: string[], blockedUserId: string): string[] {
  const next = currentBlocklist.includes(blockedUserId)
    ? currentBlocklist.filter((id) => id !== blockedUserId)
    : [...currentBlocklist, blockedUserId];
  // Persist onto the user's row
  dbUpdate("users", (r: any) => r.id === userId, {
    blocklist: JSON.stringify(next),
  });
  return next;
}

export function getBlocklist(userId: string): string[] {
  const row = selectAll("users").find((r: any) => r.id === userId) as any;
  if (!row) return [];
  try {
    return JSON.parse(row.blocklist || "[]");
  } catch {
    return [];
  }
}
