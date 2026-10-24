import { NextResponse } from "next/server";
import { getRequestById, updateRequestStatus } from "@/lib/requests";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { initStore } from "@/lib/store";
import { logError } from "@/lib/logger";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    initStore();
    const { id } = await params;
    const req = await getRequestById(id);
    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (req.toUserId !== user.id) {
      return NextResponse.json({ error: "Not your request" }, { status: 403 });
    }

    const updated = await updateRequestStatus(id, "rejected");
    return NextResponse.json({ request: updated });
  } catch (error) {
    logError("Reject request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
