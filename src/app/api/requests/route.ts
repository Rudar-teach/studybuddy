import { NextResponse } from "next/server";
import { createRequest, getRequestsForUser, getSentRequests, checkExistingRequest } from "@/lib/requests";
import { getUserFromRequest } from "@/lib/auth-middleware";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    const received = getRequestsForUser(user.id);
    const sent = getSentRequests(user.id);

    return NextResponse.json({ received, sent });
  } catch (error) {
    console.error("Requests fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    const body = await request.json();
    const { toUserId, type, targetId, message = "" } = body;

    if (!toUserId || !type || !targetId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (toUserId === user.id) {
      return NextResponse.json({ error: "Cannot send request to yourself" }, { status: 400 });
    }

    const existing = checkExistingRequest(user.id, toUserId, targetId);
    if (existing) {
      return NextResponse.json({ error: "Request already sent" }, { status: 409 });
    }

    const req = createRequest({
      fromUserId: user.id,
      toUserId,
      type,
      targetId,
      message,
      status: "pending",
    });

    return NextResponse.json({ request: req }, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}