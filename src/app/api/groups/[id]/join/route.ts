import { NextResponse } from "next/server";
import { getGroupById, joinGroup } from "@/lib/groups";
import { getUserFromRequest } from "@/lib/auth-middleware";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    const { id } = await params;
    const group = joinGroup(id, user.id);
    if (!group) {
      return NextResponse.json({ error: "Group not found or full" }, { status: 400 });
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Join group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}