import { NextResponse } from "next/server";
import {
  createRequest,
  getRequestsForUser,
  getSentRequests,
  checkExistingRequest,
} from "@/lib/requests";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { initStore } from "@/lib/store";
import { safeJson, cleanText } from "@/lib/sanitize";
import { logError } from "@/lib/logger";

const TYPES = ["study-group", "project-partner"];

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    initStore();
    const received = await getRequestsForUser(user.id);
    const sent = await getSentRequests(user.id);
    return NextResponse.json({ received, sent });
  } catch (error) {
    logError("Requests fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    initStore();
    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const toUserId = cleanText(body.toUserId, 80);
    const type = TYPES.includes(body.type) ? body.type : null;
    const targetId = cleanText(body.targetId, 80);
    const message = cleanText(body.message, 500);

    if (!toUserId || !type || !targetId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (toUserId === user.id) {
      return NextResponse.json({ error: "Cannot send request to yourself" }, { status: 400 });
    }

    const existing = await checkExistingRequest(user.id, toUserId, targetId);
    if (existing) {
      return NextResponse.json({ error: "Request already sent" }, { status: 409 });
    }

    const req = await createRequest({
      fromUserId: user.id,
      toUserId,
      type,
      targetId,
      message,
      status: "pending",
    });

    return NextResponse.json({ request: req }, { status: 201 });
  } catch (error) {
    logError("Create request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
