import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { reportUser, toggleBlock, getBlocklist } from "@/lib/reports";
import { initStore } from "@/lib/store";
import { safeJson, cleanText } from "@/lib/sanitize";
import { logError } from "@/lib/logger";

const REASONS = ["spam", "harassment", "fake", "other"];

// POST /api/reports
// body: { reportedUserId, reason, details, block?: boolean }
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    initStore();
    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const reportedUserId = cleanText(body.reportedUserId, 80);
    const reason = REASONS.includes(body.reason) ? body.reason : "other";
    const details = cleanText(body.details, 500);
    const block = body.block === true;

    if (!reportedUserId || reportedUserId === user.id) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }

    const report = await reportUser({
      reporterId: user.id,
      reportedUserId,
      reason,
      details,
    });

    let blocked = false;
    if (block) {
      const current = await getBlocklist(user.id);
      if (!current.includes(reportedUserId)) {
        await toggleBlock(user.id, current, reportedUserId);
        blocked = true;
      }
    }

    return NextResponse.json({ report, blocked }, { status: 201 });
  } catch (error) {
    logError("Report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
