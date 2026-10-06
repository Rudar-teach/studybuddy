import { v4 as uuidv4 } from "uuid";
import { insert, selectAll } from "./database";
import type { ChatMessage } from "@/types";

export function createMessage(data: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
  const now = new Date().toISOString();
  const record = insert("messages", {
    senderId: data.senderId,
    groupId: data.groupId,
    content: data.content,
    createdAt: now,
  });
  return record as ChatMessage;
}

export function getMessagesForGroup(groupId: string, limit = 50): ChatMessage[] {
  const msgs = selectAll("messages")
    .filter((m) => m.groupId === groupId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-limit);
  return msgs as ChatMessage[];
}
