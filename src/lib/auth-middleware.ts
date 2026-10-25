import { NextResponse } from "next/server";
import { verifyFirebaseToken, type VerifiedUser } from "@/lib/firebase-auth";

/**
 * Authenticate the caller on an API route.
 * Returns a VerifiedUser on success, or a NextResponse to return directly.
 * The token is a Firebase ID token; when no Firebase keys are set it falls
 * back to a dev-only UID so the app stays runnable locally.
 */
export async function getUserFromRequest(
  request: Request
): Promise<VerifiedUser | NextResponse> {
  const result = await verifyFirebaseToken(request);
  if (result instanceof Response) {
    const status = result.status;
    const body = await result.text();
    return NextResponse.json(JSON.parse(body), { status });
  }
  return result;
}
