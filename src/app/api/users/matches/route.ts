import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { getUserById, getAllUsers } from "@/lib/auth";
import { getTopMatches } from "@/lib/matching";

export async function GET(request: Request) {
  try {
    const userResult = await getUserFromRequest(request);
    if (userResult instanceof Response) return userResult;
    const currentUser = getUserById(userResult.id);
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
