import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-middleware";
import {
  getResourcesForGroup,
  createResource,
  removeResource,
} from "@/lib/groups";

// GET /api/groups/:id/resources     -> list resources
// POST /api/groups/:id/resources    -> add a resource
// DELETE /api/groups/:id/resources  -> remove (body: resourceId)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const resources = getResourcesForGroup(id);
  return NextResponse.json({ resources });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;
    const { id } = await params;
    const body = await request.json();
    const { title = "", url = "", type = "link", note = "" } = body;
    if (!title && !url) {
      return NextResponse.json({ error: "Title or URL required" }, { status: 400 });
    }
    const resource = createResource({
      groupId: id,
      title: title || url,
      url,
      type,
      note,
      addedBy: user.id,
    });
    return NextResponse.json({ resource }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;
    const { id } = await params;
    const body = await request.json();
    const removed = removeResource(body.resourceId || id);
    if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
