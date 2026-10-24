import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { reportUser, toggleBlock, getBlocklist } from "@/lib/reports";

// POST /api/reports
// body: { reportedUserId, reason, details, block?: boolean }
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    const body = await request.json();
    const { reportedUserId, reason = "other", details = "", block = false } = body;

    if (!reportedUserId || reportedUserId === user.id) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }

    const report = reportUser({
      reporterId: user.id,
      reportedUserId,
      reason,
      details,
    });

    let blocked = false;
    if (block) {
      const current = getBlocklist(user.id);
      if (!current.includes(reportedUserId)) {
        toggleBlock(user.id, current, reportedUserId);
        blocked = true;
      }
    }

    return NextResponse.json({ report, blocked }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
