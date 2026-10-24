import { NextResponse } from "next/server";
import { getAllGroups, createGroup } from "@/lib/groups";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { initStore } from "@/lib/store";
import { safeJson, cleanText, cleanStringList, cleanBool, cleanUrl } from "@/lib/sanitize";
import { logError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    initStore();
    const groups = await getAllGroups();
    return NextResponse.json({ groups });
  } catch (error) {
    logError("Groups error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const name = cleanText(body.name, 80);
    const description = cleanText(body.description, 500);
    const subject = cleanText(body.subject, 60);
    const maxMembers = Math.min(50, Math.max(2, parseInt(body.maxMembers) || 10));
    const goals = cleanStringList(body.goals, 10).map((g) => g.toLowerCase());

    if (!name || !subject) {
      return NextResponse.json({ error: "Name and subject required" }, { status: 400 });
    }

    initStore();
    const group = await createGroup({
      name,
      description,
      subject,
      members: [user.id],
      creatorId: user.id,
      maxMembers,
      schedule: [],
      goals,
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    logError("Create group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
