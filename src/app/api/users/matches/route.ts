import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-middleware";
import { getUserById, getAllUsers, touchUser } from "@/lib/auth";
import { getTopMatches, getMutualMatchIds } from "@/lib/matching";
import { relativeTime, isActiveLastWeek } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const userResult = await getUserFromRequest(request);
    if (userResult instanceof Response) return userResult;
    const currentUser = getUserById(userResult.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Touch for last-active indicator (feature 10)
    touchUser(currentUser.id);

    const allUsers = getAllUsers();

    // Exclude blocklisted users from matches (feature 9)
    const blocklist = currentUser.blocklist || [];
    const visibleUsers = blocklist.length
      ? allUsers.filter((u) => !blocklist.includes(u.id))
      : allUsers;

    const rawMatches = getTopMatches(currentUser, visibleUsers, 20, {
      excludeIds: blocklist,
    });
    const mutualIds = getMutualMatchIds(currentUser, visibleUsers);

    const results = rawMatches.map((m) => {
      const user = visibleUsers.find((u) => u.id === m.userId)!;
      const { password, ...userWithoutPassword } = user;
      const lastActive = user.lastActiveAt || user.createdAt;
      return {
        user: {
          ...userWithoutPassword,
          lastActiveAt: user.lastActiveAt,
          activeThisWeek: isActiveLastWeek(lastActive),
          lastActiveLabel: relativeTime(lastActive),
        },
        score: m.score,
        reasons: m.reasons,
        mutual: mutualIds.has(m.userId),
      };
    });

    return NextResponse.json({
      matches: results,
      totalMutual: results.filter((r) => r.mutual).length,
    });
  } catch (error) {
    console.error("Matches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
