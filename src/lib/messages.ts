import { v4 as uuidv4 } from "uuid";
import { getAllRows, writeRow } from "./store";
import type { ChatMessage } from "@/types";

export async function createMessage(
  data: Omit<ChatMessage, "id" | "createdAt">
): Promise<ChatMessage> {
  const id = uuidv4();
  const now = new Date().toISOString();
  await writeRow("messages", id, {
    ...data,
    createdAt: now,
  });
  return { ...data, id, createdAt: now };
}

export async function getMessagesForGroup(
  groupId: string,
  limit = 50
): Promise<ChatMessage[]> {
  const rows = await getAllRows("messages");
  return rows
    .filter((r) => r.data.groupId === groupId)
    .map((r) => ({ id: r.id, ...r.data } as unknown as ChatMessage))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-limit);
}
