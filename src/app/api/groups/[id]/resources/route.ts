import { NextResponse } from "next/server";
import {
  getResourcesForGroup,
  createResource,
} from "@/lib/groups";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { initStore } from "@/lib/store";
import { safeJson, cleanText, cleanUrl } from "@/lib/sanitize";
import { logError } from "@/lib/logger";

const TYPES = ["link", "file", "note"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    initStore();
    const { id } = await params;
    const resources = await getResourcesForGroup(id);
    return NextResponse.json({ resources });
  } catch (error) {
    logError("Resources error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    initStore();
    const { id } = await params;
    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const title = cleanText(body.title, 120);
    const url = cleanUrl(body.url);
    const type = TYPES.includes(body.type) ? body.type : "link";
    const note = cleanText(body.note, 500);
    if (!title && !url) {
      return NextResponse.json({ error: "Title or URL required" }, { status: 400 });
    }

    const resource = await createResource({
      groupId: id,
      title: title || url,
      url,
      type,
      note,
      addedBy: user.id,
    });
    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    logError("Create resource error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
