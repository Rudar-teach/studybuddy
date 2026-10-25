import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { firebaseUpdateName } from "@/lib/firebase-auth";
import { getUserById, updateUser, createUser } from "@/lib/auth";

import { initStore, activeProvider } from "@/lib/store";
import { safeJson, cleanText, cleanStringList, cleanUrl } from "@/lib/sanitize";
import { logError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const userResult = await getUserFromRequest(request);
    if (userResult instanceof Response) return userResult;
    const fbUser = userResult;

    initStore();
    let appUser = await getUserById(fbUser.id);
    if (!appUser) {
      appUser = await createUser({
        id: fbUser.id,
        email: fbUser.email || "",
        name:
          fbUser.displayName ||
          fbUser.email?.split("@")[0] ||
          "",
        password: "",
        bio: "",
        subjects: [],
        skills: [],
        availability: [],
        learningGoals: [],
        year: "",
        major: "",
      });
    }

    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password: _pw, ...userWithoutPassword } = appUser;
    return NextResponse.json({ user: userWithoutPassword, provider: activeProvider() });
  } catch (error) {
    logError("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userResult = await getUserFromRequest(request);
    if (userResult instanceof Response) return userResult;
    const fbUser = userResult;

    initStore();
    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const clean = {
      name: cleanText(body.name, 80),
      bio: cleanText(body.bio, 500),
      subjects: cleanStringList(body.subjects, 30),
      skills: Array.isArray(body.skills)
        ? body.skills
            .filter(
              (s: any) =>
                s &&
                typeof s.name === "string" &&
                ["beginner", "intermediate", "advanced", "expert"].includes(s.level)
            )
            .slice(0, 30)
            .map((s: any) => ({ name: cleanText(s.name, 60), level: s.level }))
        : undefined,
      availability: Array.isArray(body.availability)
        ? body.availability
            .filter(
              (a: any) =>
                a &&
                DAYS.includes(a.day) &&
                typeof a.startTime === "string" &&
                /^\d{2}:\d{2}$/.test(a.startTime) &&
                typeof a.endTime === "string" &&
                /^\d{2}:\d{2}$/.test(a.endTime)
            )
            .slice(0, 70)
        : undefined,
      learningGoals: cleanStringList(body.learningGoals, 20),
      year: cleanText(body.year, 40),
      major: cleanText(body.major, 80),
      avatar: cleanUrl(body.avatar, 200),
    };

    const metadataUpdates: Record<string, any> = {};
    if (clean.name) metadataUpdates.full_name = clean.name;
    if (clean.bio) metadataUpdates.bio = clean.bio;
    if (clean.subjects) metadataUpdates.subjects = clean.subjects;
    if (clean.skills) metadataUpdates.skills = clean.skills;
    if (clean.availability) metadataUpdates.availability = clean.availability;
    if (clean.learningGoals) metadataUpdates.learning_goals = clean.learningGoals;
    if (clean.year) metadataUpdates.year = clean.year;
    if (clean.major) metadataUpdates.major = clean.major;

    if (clean.name) {
      try {
        await firebaseUpdateName(clean.name);
      } catch {
        /* best-effort; Firebase displayName sync */
      }
    }

    const user = await updateUser(fbUser.id, clean);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password: _pw, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    logError("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
