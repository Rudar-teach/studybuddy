import { v4 as uuidv4 } from "uuid";
import { insert, selectAll, selectOne, dbUpdate } from "./database";
import type { CollaborationRequest } from "@/types";

export function createRequest(data: Omit<CollaborationRequest, "id" | "createdAt">): CollaborationRequest {
  const id = uuidv4();
  const now = new Date().toISOString();
  const record = insert("collaboration_requests", {
    ...data,
    id,
    createdAt: now,
  });
  return record as CollaborationRequest;
}

export function getRequestsForUser(userId: string): CollaborationRequest[] {
  return selectAll("collaboration_requests")
    .filter((r) => r.toUserId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSentRequests(userId: string): CollaborationRequest[] {
  return selectAll("collaboration_requests")
    .filter((r) => r.fromUserId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getRequestById(id: string): CollaborationRequest | undefined {
  return selectOne("collaboration_requests", (r) => r.id === id) as CollaborationRequest | undefined;
}

export function updateRequestStatus(id: string, status: CollaborationRequest["status"]): CollaborationRequest | undefined {
  dbUpdate("collaboration_requests", (r) => r.id === id, { status });
  return getRequestById(id);
}

export function deleteRequest(id: string): boolean {
  const all = selectAll("collaboration_requests");
  const target = all.find((r) => r.id === id);
  if (!target) return false;
  return dbUpdate("collaboration_requests", (r) => r.id === id, { deleted: true }) !== undefined;
}

export function checkExistingRequest(fromUserId: string, toUserId: string, targetId: string): CollaborationRequest | undefined {
  return selectAll("collaboration_requests").find(
    (r) => r.fromUserId === fromUserId && r.toUserId === toUserId && r.targetId === targetId && r.status === "pending"
  ) as CollaborationRequest | undefined;
}
