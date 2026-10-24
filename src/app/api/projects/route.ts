import { NextResponse } from "next/server";
import { getAllProjects, createProject } from "@/lib/projects";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { initStore } from "@/lib/store";
import { safeJson, cleanText, cleanStringList, cleanUrl } from "@/lib/sanitize";
import { logError } from "@/lib/logger";

export async function GET(_request: Request) {
  try {
    initStore();
    const projects = await getAllProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    logError("Projects error:", error);
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

    const title = cleanText(body.title, 120);
    const description = cleanText(body.description, 2000);
    const technologies = cleanStringList(body.technologies, 20);
    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    const project = await createProject({
      title,
      description,
      technologies,
      creatorId: user.id,
      collaborators: [user.id],
      status: "open",
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    logError("Create project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
