import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/auth";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { initStore } from "@/lib/store";
import { logError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    initStore();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase().slice(0, 80) || "";
    const subject = searchParams.get("subject")?.slice(0, 80) || "";
    const hideBlocked = searchParams.get("hideBlocked") === "true";

    let blocklist: string[] = [];
    if (hideBlocked) {
      const caller = await getUserFromRequest(request);
      if (!(caller instanceof Response)) {
        const all = await getAllUsers();
        const me = all.find((u) => u.id === (caller as any).id);
        blocklist = me?.blocklist || [];
      }
    }

    let filtered = await getAllUsers();
    if (blocklist.length > 0) {
      filtered = filtered.filter((u) => !blocklist.includes(u.id));
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

    if (subject) {
      filtered = filtered.filter((u) =>
        u.subjects.some((s) => s.toLowerCase().includes(subject.toLowerCase()))
      );
    }

    const results = filtered.map(({ password, ...u }) => u);
    return NextResponse.json({ users: results });
  } catch (error) {
    logError("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
