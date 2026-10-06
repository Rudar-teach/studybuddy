import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { getRequestById, updateRequestStatus } from "@/lib/requests";
import { addCollaborator } from "@/lib/projects";
import { joinGroup as joinGroupLib } from "@/lib/groups";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    const { id } = await params;
    const req = getRequestById(id);
    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (req.toUserId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const updated = updateRequestStatus(id, "accepted");
    if (!updated) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    if (req.type === "study-group") {
      joinGroupLib(req.targetId, req.fromUserId);
    } else if (req.type === "project-partner") {
      addCollaborator(req.targetId, req.fromUserId);
    }

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("Accept request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}