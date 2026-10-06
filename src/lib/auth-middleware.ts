import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const { data: { user }, error } = await supabase.auth.getUser(authHeader.substring(7));
  if (error || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  return user;
}
