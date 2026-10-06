import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const subject = searchParams.get("subject") || "";

    const allUsers = getAllUsers();

    let filtered = allUsers;

    if (query) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.major.toLowerCase().includes(query) ||
          u.subjects.some((s) => s.toLowerCase().includes(query)) ||
          u.skills.some((s) => s.name.toLowerCase().includes(query))
      );
    }

    if (subject) {
      filtered = filtered.filter((u) => u.subjects.some((s) => s.toLowerCase().includes(subject.toLowerCase())));
    }

    const results = filtered.map(({ password, ...u }) => u);
    return NextResponse.json({ users: results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
