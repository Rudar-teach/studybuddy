import { NextResponse } from "next/server";
import { getGroupById } from "@/lib/groups";
import { createMessage, getMessagesForGroup } from "@/lib/messages";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { initStore } from "@/lib/store";
import { safeJson, cleanText } from "@/lib/sanitize";
import { logError } from "@/lib/logger";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    initStore();
    const { id } = await params;
    const group = await getGroupById(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    const messages = await getMessagesForGroup(id);
    return NextResponse.json({ messages });
  } catch (error) {
    logError("Messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    initStore();
    const { id } = await params;
    const group = await getGroupById(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const content = cleanText(body.content, 2000);
    if (!content) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    const message = await createMessage({
      senderId: user.id,
      groupId: id,
      content,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    logError("Send message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
