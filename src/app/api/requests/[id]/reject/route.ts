import { NextResponse } from "next/server";
import { verifyToken, getUserById } from "@/lib/auth";
import { getRequestById, updateRequestStatus } from "@/lib/requests";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const req = getRequestById(id);
    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (req.toUserId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const updated = updateRequestStatus(id, "rejected");
    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("Reject request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}