import { NextResponse } from "next/server";
import { verifyToken, getUserById, getAllUsers } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const subject = searchParams.get("subject") || "";

    const allUsers = getAllUsers();
    const currentUserId = request.headers.get("authorization")?.startsWith("Bearer ")
      ? verifyToken(request.headers.get("authorization")!.substring(7))?.userId
      : null;

    let filtered = allUsers;

    if (currentUserId) {
      filtered = filtered.filter((u) => u.id !== currentUserId);
    }

    if (subject) {
      filtered = filtered.filter((u) => u.subjects.some((s) => s.toLowerCase().includes(subject.toLowerCase())));
    }

    if (query) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.major.toLowerCase().includes(query) ||
          u.subjects.some((s) => s.toLowerCase().includes(query)) ||
          u.skills.some((s) => s.name.toLowerCase().includes(query))
      );
    }

    const results = filtered.map(({ password, ...u }) => u);
    return NextResponse.json({ users: results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}