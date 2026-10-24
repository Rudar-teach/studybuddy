import { v4 as uuidv4 } from "uuid";
import { getAllRows, getRow, writeRow, mergeRow } from "./store";
import type { UserReport } from "@/types";

// ===== User reporting =====
export async function reportUser(
  data: Omit<UserReport, "id" | "createdAt">
): Promise<UserReport> {
  const id = uuidv4();
  const now = new Date().toISOString();
  await writeRow("user_reports", id, {
    ...data,
    createdAt: now,
  });
  return { ...data, id, createdAt: now };
}

export async function getUserReports(
  reportedUserId: string
): Promise<UserReport[]> {
  const rows = await getAllRows("user_reports");
  return rows
    .filter((r) => r.data.reportedUserId === reportedUserId)
    .map((r) => ({ id: r.id, ...r.data } as unknown as UserReport));
}

// ===== Blocklist =====
export async function toggleBlock(
  userId: string,
  currentBlocklist: string[],
  blockedUserId: string
): Promise<string[]> {
  const next = currentBlocklist.includes(blockedUserId)
    ? currentBlocklist.filter((id) => id !== blockedUserId)
    : [...currentBlocklist, blockedUserId];
  await mergeRow("users", userId, { blocklist: JSON.stringify(next) });
  return next;
}

export async function getBlocklist(userId: string): Promise<string[]> {
  const row = await getRow("users", userId);
  if (!row) return [];
  try {
    const bl = row.blocklist;
    if (Array.isArray(bl)) return bl;
    return JSON.parse(bl || "[]");
  } catch {
    return [];
  }
}
