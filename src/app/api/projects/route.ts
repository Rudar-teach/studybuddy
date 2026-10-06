import { NextResponse } from "next/server";
import { verifyToken, getUserById } from "@/lib/auth";
import { getAllProjects, createProject } from "@/lib/projects";

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