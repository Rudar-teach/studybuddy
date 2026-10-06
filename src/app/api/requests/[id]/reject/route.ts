import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { getRequestById, updateRequestStatus } from "@/lib/requests";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userOrError = await getUserFromRequest(request);
    if (userOrError instanceof Response) return userOrError;
    const user = userOrError;

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
