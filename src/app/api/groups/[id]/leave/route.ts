import { NextResponse } from "next/server";
import { leaveGroup } from "@/lib/groups";
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
    const group = await leaveGroup(id, user.id);
    if (!group) {
      return NextResponse.json({ error: "Cannot leave group" }, { status: 400 });
    }
    return NextResponse.json({ group });
  } catch (error) {
    logError("Leave group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
