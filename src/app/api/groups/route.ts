import { NextResponse } from "next/server";
import { getAllGroups, createGroup } from "@/lib/groups";
import { getUserFromRequest } from "@/lib/auth-middleware";

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
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

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
