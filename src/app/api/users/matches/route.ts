import { NextResponse } from "next/server";
import { verifyToken, getUserById, getAllUsers } from "@/lib/auth";
import { getTopMatches } from "@/lib/matching";

export async function GET(request: Request) {
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

    const currentUser = getUserById(payload.userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const allUsers = getAllUsers();
    const matches = getTopMatches(currentUser, allUsers);

    const results = matches.map((m) => {
      const user = allUsers.find((u) => u.id === m.userId)!;
      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        score: m.score,
        reasons: m.reasons,
      };
    });

    return NextResponse.json({ matches: results });
  } catch (error) {
    console.error("Matches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}