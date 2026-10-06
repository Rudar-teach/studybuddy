import { NextResponse } from "next/server";
import { verifyToken, getUserById } from "@/lib/auth";
import { createRequest, getRequestsForUser, getSentRequests, checkExistingRequest } from "@/lib/requests";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const received = getRequestsForUser(payload.userId);
    const sent = getSentRequests(payload.userId);

    return NextResponse.json({ received, sent });
  } catch (error) {
    console.error("Requests fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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