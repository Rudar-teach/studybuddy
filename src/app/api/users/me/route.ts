import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { getUserById, updateUser } from "@/lib/auth";
import { insert } from "@/lib/database";
import { createSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const userResult = await getUserFromRequest(request);
    if (userResult instanceof Response) return userResult;
    const supabaseUser = userResult;

    // Try to find in our DB
    let appUser = getUserById(supabaseUser.id);
    if (!appUser) {
      // First login — sync Supabase user to our DB
      appUser = insert("users", {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "",
        password: "",
        bio: "",
        subjects: [],
        skills: [],
        availability: [],
        learningGoals: [],
        year: "",
        major: "",
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        avatar: supabaseUser.user_metadata?.avatar_url || "",
      });
    }

    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = appUser;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userResult = await getUserFromRequest(request);
    if (userResult instanceof Response) return userResult;
    const supabaseUser = userResult;

    const body = await request.json();

    // Update Supabase user metadata
    const metadataUpdates: Record<string, any> = {};
    if (body.name) metadataUpdates.full_name = body.name;
    if (body.bio) metadataUpdates.bio = body.bio;
    if (body.subjects) metadataUpdates.subjects = body.subjects;
    if (body.skills) metadataUpdates.skills = body.skills;
    if (body.availability) metadataUpdates.availability = body.availability;
    if (body.learningGoals) metadataUpdates.learning_goals = body.learningGoals;
    if (body.year) metadataUpdates.year = body.year;
    if (body.major) metadataUpdates.major = body.major;

    if (Object.keys(metadataUpdates).length > 0) {
      const supabase = createSupabaseClient();
      if (supabase) {
        await supabase.auth.updateUser({ data: metadataUpdates });
      }
    }

    // Update our JSON DB
    const user = updateUser(supabaseUser.id, body);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
