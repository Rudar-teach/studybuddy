import { NextResponse } from "next/server";
import {
  getSessionsForGroup,
  createSession,
  toggleSessionRsvp,
} from "@/lib/groups";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { initStore } from "@/lib/store";
import { safeJson, cleanText, cleanUrl } from "@/lib/sanitize";
import { logError } from "@/lib/logger";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    initStore();
    const { id } = await params;
    const sessions = await getSessionsForGroup(id);
    return NextResponse.json({ sessions });
  } catch (error) {
    logError("Sessions error:", error);
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

    // RSVP toggle (separate concern, same endpoint family)
    if (body.rsvp === true && body.sessionId) {
      const session = await toggleSessionRsvp(cleanText(body.sessionId, 80), user.id);
      if (!session) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ session });
    }

    const day = DAYS.includes(body.day) ? body.day : null;
    const time = /^\d{2}:\d{2}$/.test(body.time || "") ? body.time : null;
    if (!day || !time) {
      return NextResponse.json({ error: "Day and time required" }, { status: 400 });
    }

    const session = await createSession({
      groupId: id,
      day,
      time,
      topic: cleanText(body.topic, 120),
      link: cleanUrl(body.link),
      hostId: user.id,
    });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    logError("Create session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
