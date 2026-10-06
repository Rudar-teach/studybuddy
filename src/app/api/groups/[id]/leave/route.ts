import { NextResponse } from "next/server";
import { verifyToken, getUserById } from "@/lib/auth";
import { getGroupById, leaveGroup } from "@/lib/groups";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const group = leaveGroup(id, user.id);
    if (!group) {
      return NextResponse.json({ error: "Cannot leave group" }, { status: 400 });
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Leave group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}