import { NextResponse } from "next/server";
import { getGroupById } from "@/lib/groups";
import { createMessage, getMessagesForGroup } from "@/lib/messages";
import { getUserFromRequest } from "@/lib/auth-middleware";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const group = getGroupById(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    const messages = getMessagesForGroup(id);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Messages error:", error);
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

    const { id } = await params;
    const group = getGroupById(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    const message = createMessage({
      senderId: user.id,
      groupId: id,
      content: content.trim(),
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}