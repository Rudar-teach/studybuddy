# StudyBuddy

A study group and project-partner matcher. It pairs people by weighted
subject overlap, complementary skills, shared availability, and aligned
learning goals. Groups get shared chat, scheduled sessions, resource
sharing, and weekly progress check-ins.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS 4
- Supabase for email/password auth (sessions + user metadata)
- Data layer: Firestore (Firebase) when configured, with a local JSON
  file fallback so the app runs before Firebase is set up

## Local development

```bash
npm install
npm run dev          # http://localhost:3456
```

Create a `.env` from `.env.example` and fill in your keys:

```
# Supabase (Auth)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Firebase (Firestore)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Admin (server-side only, never exposed to the browser)
ADMIN_KEYS=change-me-to-a-strong-secret
```

- Without Supabase keys, the landing page renders but login returns
  "Supabase not configured".
- Without Firebase keys, data falls back to `data/studybuddy.json`.
- `ADMIN_KEYS` is only read on the server; the client never sees it.

## Security notes

- All API routes authenticate via Supabase JWT (Bearer token) and
  enforce ownership: a user can only act on their own requests,
  groups, and projects.
- `/api/admin` requires an `X-Admin-Key` header that matches one of
  the `ADMIN_KEYS` env values.
- Input is sanitized on every mutating endpoint: text is trimmed,
  control characters stripped, and length-capped; URLs must be
  http/https with no userinfo; lists are capped.
- Rate limiting (per token or IP, sliding window) applies to all
  `/api/` routes, with tighter caps on request/report/admin endpoints.
- Security headers (CSP, HSTS, X-Frame-Options, etc.) are set on
  every response via `src/middleware.ts`.
- Debug logging is gated behind `NODE_ENV === "development"`.
- `.env`, `.env.*.local`, `data/`, and `dev-server.log` are
  gitignored. Run a periodic secret scan on git history; nothing in
  the committed history currently contains a real key.

## Feature map

- Matching: `src/lib/matching.ts` (weighted score + reasons +
  mutual-match detection)
- Profile completeness, avatars, relative time: `src/lib/utils.ts`
- Data access: `src/lib/store.ts` (Firebase or JSON fallback)
- Group sessions / resources / check-ins: `src/lib/groups.ts`
- Reporting and blocklist: `src/lib/reports.ts`
- Legal pages: `src/app/pages/privacy`, `src/app/pages/terms`
- Admin: `src/app/admin` + `/api/admin`
