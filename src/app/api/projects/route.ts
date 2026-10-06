import { NextResponse } from "next/server";
import { getAllProjects, createProject } from "@/lib/projects";
import { getUserFromRequest } from "@/lib/auth-middleware";

export async function GET(request: Request) {
  try {
    const projects = getAllProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Projects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof Response) return user;

    const body = await request.json();
    const { title, description, technologies = [] } = body;

    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    const project = createProject({
      title,
      description: description || "",
      technologies,
      creatorId: user.id,
      collaborators: [user.id],
      status: "open",
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}