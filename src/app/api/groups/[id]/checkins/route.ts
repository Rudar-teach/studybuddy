import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { getCheckinsForGroup, createCheckin } from "@/lib/groups";

// GET /api/groups/:id/checkins    -> list check-ins
// POST /api/groups/:id/checkins   -> submit a check-in (body: status, note)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const checkins = getCheckinsForGroup(id);
  return NextResponse.json({ checkins });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;
    const { id } = await params;
    const body = await request.json();
    const status = ["done", "in-progress", "blocked"].includes(body.status)
      ? body.status
      : "in-progress";
    const checkin = createCheckin({
      groupId: id,
      userId: user.id,
      status,
      note: body.note || "",
    });
    return NextResponse.json({ checkin }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
