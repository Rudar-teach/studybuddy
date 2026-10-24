import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-middleware";
import {
  getSessionsForGroup,
  createSession,
  removeSession,
  toggleSessionRsvp,
} from "@/lib/groups";

// GET  /api/groups/:id/sessions       -> list sessions
// POST /api/groups/:id/sessions       -> create a session
// POST /api/groups/:id/sessions/rsvp  -> toggle RSVP (body: sessionId)
// DELETE /api/groups/:id/sessions     -> remove a session (body: sessionId)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessions = getSessionsForGroup(id);
  return NextResponse.json({ sessions });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;
    const { id } = await params;
    const body = await request.json();
    const { day, time, topic = "", link = "", rsvp = false, sessionId } = body;

    // RSVP toggle (separate concern, same endpoint family)
    if (rsvp && sessionId) {
      const session = toggleSessionRsvp(sessionId, user.id);
      if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ session });
    }

    if (!day || !time) {
      return NextResponse.json({ error: "Day and time required" }, { status: 400 });
    }
    const session = createSession({
      groupId: id,
      day,
      time,
      topic,
      link,
      hostId: user.id,
    });
    return NextResponse.json({ session }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;
    const { id } = await params;
    const body = await request.json();
    const removed = removeSession(body.sessionId || id);
    if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
