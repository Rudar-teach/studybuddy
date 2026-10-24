import { NextResponse } from "next/server";
import { getCheckinsForGroup, createCheckin } from "@/lib/groups";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { initStore } from "@/lib/store";
import { safeJson, cleanText } from "@/lib/sanitize";
import { logError } from "@/lib/logger";

const STATUSES = ["done", "in-progress", "blocked"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    initStore();
    const { id } = await params;
    const checkins = await getCheckinsForGroup(id);
    return NextResponse.json({ checkins });
  } catch (error) {
    logError("Checkins error:", error);
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
    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const status = STATUSES.includes(body.status) ? body.status : "in-progress";
    const checkin = await createCheckin({
      groupId: id,
      userId: user.id,
      status,
      note: cleanText(body.note, 500),
    });
    return NextResponse.json({ checkin }, { status: 201 });
  } catch (error) {
    logError("Create checkin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
