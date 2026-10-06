import { NextResponse } from "next/server";
import { verifyToken, getUserById } from "@/lib/auth";
import { getAllGroups, createGroup } from "@/lib/groups";

export async function GET(request: Request) {
  try {
    const groups = getAllGroups();
    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Groups error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { name, description, subject, maxMembers = 10, schedule = [], goals = [] } = body;

    if (!name || !subject) {
      return NextResponse.json({ error: "Name and subject required" }, { status: 400 });
    }

    const group = createGroup({
      name,
      description: description || "",
      subject,
      members: [user.id],
      creatorId: user.id,
      maxMembers,
      schedule,
      goals,
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
