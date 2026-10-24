import { NextResponse } from "next/server";
import { getRequestById, updateRequestStatus } from "@/lib/requests";
import { joinGroup } from "@/lib/groups";
import { addCollaborator } from "@/lib/projects";
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

    const updated = await updateRequestStatus(id, "accepted");

    // Side effect: join group / add collaborator
    if (req.type === "study-group") {
      await joinGroup(req.targetId, user.id);
    } else {
      await addCollaborator(req.targetId, user.id);
    }

    return NextResponse.json({ request: updated });
  } catch (error) {
    logError("Accept request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
