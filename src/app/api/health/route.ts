import { NextResponse } from "next/server";
import { activeProvider, initStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  initStore();
  return NextResponse.json({
    ok: true,
    provider: activeProvider(),
    ts: new Date().toISOString(),
  });
}
