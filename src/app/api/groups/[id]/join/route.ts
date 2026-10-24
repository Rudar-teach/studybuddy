import { NextResponse } from "next/server";
import { joinGroup } from "@/lib/groups";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { initStore } from "@/lib/store";
import { logError } from "@/lib/logger";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    initStore();
    const { id } = await params;
    const group = await joinGroup(id, user.id);
    if (!group) {
      return NextResponse.json({ error: "Group not found or full" }, { status: 400 });
    }
    return NextResponse.json({ group });
  } catch (error) {
    logError("Join group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
