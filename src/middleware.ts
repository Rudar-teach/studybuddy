import { NextResponse, type NextRequest } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  // Note: 'unsafe-inline' (script) and 'unsafe-eval' are required in
  // development (Next.js inline bootstrap + React dev tooling). The
  // production build strips dev features and can tighten this further.
  // XSS protection relies on React's escaping plus input sanitization.
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com; connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com; frame-src 'none'",
};

// ---- Rate limiting (in-memory, per request) ----
type Bucket = { hits: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/api/requests": { limit: 20, windowMs: 60_000 },
  "/api/reports": { limit: 10, windowMs: 60_000 },
  "/api/api/admin": { limit: 10, windowMs: 60_000 },
  "*": { limit: 120, windowMs: 60_000 },
};

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-request-ip")?.trim() || "unknown";
}

function rateLimit(request: NextRequest): { allowed: boolean; retryAfterSec?: number } {
  const path = request.nextUrl.pathname;
  const cfg =
    Object.entries(LIMITS).find(([k]) => path === k || path.startsWith(k + "/"))?.[1] ||
    LIMITS["*"];

  const authHeader = request.headers.get("authorization") || "";
  const identifier = authHeader
    ? `tok:${authHeader.slice(7, 40)}`
    : `ip:${clientIp(request)}`;
  const key = `${identifier}:${path}`;

  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now > b.resetAt) {
    b = { hits: 0, resetAt: now + cfg.windowMs };
    buckets.set(key, b);
  }
  b.hits += 1;

  if (b.hits > cfg.limit) {
    return { allowed: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(k, v);
  }

  // Rate-limit only API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const { allowed, retryAfterSec } = rateLimit(request);
    if (!allowed) {
      const blocked = NextResponse.json(
        { error: "Too many requests. Try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSec || 60) },
        }
      );
      // Apply security headers to the blocked response too
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
        blocked.headers.set(k, v);
      }
      return blocked;
    }
  }

  return response;
}

// Prune buckets to keep memory bounded (edge runtime supports unref)
const pruneTimer = setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets.entries()) {
    if (now > b.resetAt) buckets.delete(k);
  }
}, 60_000);
// No-op if unref is unavailable (some edge runtimes)
if (typeof pruneTimer.unref === "function") pruneTimer.unref();

export const config = {
  matcher: ["/((?!_next/static|_next|favicon|icons).*)"],
};
