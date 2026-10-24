import { NextResponse } from "next/server";
import { getAllRows, initStore } from "@/lib/store";
import { safeJson, cleanText } from "@/lib/sanitize";

/**
 * Admin endpoints are gated by the ADMIN_KEYS env var: a comma-separated
 * list of secret tokens. The client must send one of them in the
 * X-Admin-Key header. This is process-side only — the key is never shipped
 * to the browser, so it cannot be leaked via the client bundle.
 */
function isAdmin(request: Request): boolean {
  const provided = request.headers.get("x-admin-key") || "";
  const configured = process.env.ADMIN_KEYS || "";
  const keys = configured
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (keys.length === 0) return false;
  return keys.includes(provided);
}

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  initStore();
  const tables = ["users", "study_groups", "projects", "messages"];
  const out: Record<string, number> = {};
  for (const t of tables) {
    const rows = await getAllRows(t);
    out[t] = rows.length;
  }
  return NextResponse.json({ counts: out, provider: "store" });
}

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const body = await safeJson(request);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  // Admin "mark as seen" / flag — currently supports marking a user's
  // reports as reviewed.
  const { action } = body;
  switch (action) {
    case "ping":
      return NextResponse.json({ ok: true, at: new Date().toISOString() });
    default:
      return NextResponse.json(
        { error: `Unknown action "${cleanText(action, 40)}"` },
        { status: 400 }
      );
  }
}
