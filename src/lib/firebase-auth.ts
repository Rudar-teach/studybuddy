/**
 * Firebase Auth helpers.
 *
 * Client: sign in / up with email + password; session persisted locally.
 * Secrets stay in .env (gitignored); only the public web API key is
 * bundled into the client, which Firebase scopes to public access.
 *
 * Server: verifies the ID token the client sends as
 * `Authorization: Bearer <idToken>` via the identitytoolkit lookup
 * endpoint (no admin-SDK dependency needed).
 */
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
  type Unsubscribe,
} from "firebase/auth";
import { getApps, initializeApp } from "firebase/app";

export function isFirebaseAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

function getFirebaseApp() {
  return (
    getApps()[0] ||
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
  );
}

let authInstance: Auth | null = null;
export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export interface AuthSession {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
}

export function subscribeAuth(cb: (session: AuthSession) => void): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), (u) => {
    cb({
      user: u
        ? {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            photoURL: u.photoURL,
          }
        : null,
    });
  });
}

export function firebaseSignIn(email: string, password: string) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function firebaseSignUp(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password
  );
  await updateProfile(user, { displayName: name });
  return user;
}

export function firebaseSignOut() {
  return signOut(getFirebaseAuth());
}

export async function firebaseUpdateName(name: string) {
  const u = getFirebaseAuth().currentUser;
  if (!u) return;
  await updateProfile(u, { displayName: name });
}

// ---- Server-side verification ----

export interface VerifiedUser {
  id: string;
  email: string | null;
  displayName: string | null;
}

function jsonError(msg: string, status: number): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Verify the bearer token (a Firebase ID token) from the request.
 * Returns a VerifiedUser, or a Response to send back to the client.
 */
export async function verifyFirebaseToken(
  request: Request
): Promise<VerifiedUser | Response> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return jsonError("Unauthorized", 401);

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    // Dev convenience: no Firebase keys configured. Still require a
    // token-shaped header, but treat its trailing segment as the user ID.
    // This keeps the app runnable locally before Firebase is wired up.
    const uid = token.split(".").pop() || token;
    return { id: uid, email: null, displayName: null };
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!res.ok) return jsonError("Invalid token", 401);
    const data = await res.json();
    const acc = data.users?.[0];
    if (!acc) return jsonError("Invalid token", 401);
    return {
      id: acc.localId,
      email: acc.email || null,
      displayName: acc.displayName || null,
    };
  } catch {
    return jsonError("Token verification failed", 500);
  }
}
