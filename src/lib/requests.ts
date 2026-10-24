import { v4 as uuidv4 } from "uuid";
import { getAllRows, getRow, writeRow, mergeRow } from "./store";
import type { CollaborationRequest } from "@/types";

export async function createRequest(
  data: Omit<CollaborationRequest, "id" | "createdAt">
): Promise<CollaborationRequest> {
  const id = uuidv4();
  const now = new Date().toISOString();
  await writeRow("collaboration_requests", id, {
    ...data,
    createdAt: now,
  });
  return { ...data, id, createdAt: now };
}

export async function getRequestsForUser(userId: string): Promise<CollaborationRequest[]> {
  const rows = await getAllRows("collaboration_requests");
  return rows
    .filter((r) => r.data.toUserId === userId)
    .map((r) => ({ id: r.id, ...r.data } as unknown as CollaborationRequest))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getSentRequests(userId: string): Promise<CollaborationRequest[]> {
  const rows = await getAllRows("collaboration_requests");
  return rows
    .filter((r) => r.data.fromUserId === userId)
    .map((r) => ({ id: r.id, ...r.data } as unknown as CollaborationRequest))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getRequestById(id: string): Promise<CollaborationRequest | undefined> {
  const row = await getRow("collaboration_requests", id);
  if (!row) return undefined;
  return { id, ...row } as unknown as CollaborationRequest;
}

export async function updateRequestStatus(
  id: string,
  status: CollaborationRequest["status"]
): Promise<CollaborationRequest | undefined> {
  await mergeRow("collaboration_requests", id, { status });
  return getRequestById(id);
}

export async function deleteRequest(id: string): Promise<boolean> {
  await mergeRow("collaboration_requests", id, { deleted: true });
  return true;
}

export async function checkExistingRequest(
  fromUserId: string,
  toUserId: string,
  targetId: string
): Promise<boolean> {
  const rows = await getAllRows("collaboration_requests");
  return rows.some(
    (r) =>
      r.data.fromUserId === fromUserId &&
      r.data.toUserId === toUserId &&
      r.data.targetId === targetId &&
      r.data.status === "pending"
  );
}
