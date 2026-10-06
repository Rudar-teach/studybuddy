# StudyBuddy — Study Group & Project-Partner Matcher

Find study partners, form study groups, and post collaborative projects — all matched by shared subjects, skills, and availability.

🔗 **Live:** [github.com/Rudar-teach/studybuddy](https://github.com/Rudar-teach/studybuddy)

---

## Features

### Core Functionality
- **Smart Matching** — Find the best study partners ranked by shared subjects, complementary skills, and overlapping availability slots
- **Study Groups** — Create or join groups with a subject focus, set schedule, max members, and goals
- **Project Collaboration** — Post projects, invite collaborators, track status (open → in-progress → completed)
- **Collaboration Requests** — Send/accept/reject requests with a personal message — no duplicate pending requests
- **Real-time Group Chat** — Message other group members directly within any group you've joined
- **User Profiles** — Showcase subjects, skills, availability, year, major, bio, and avatar
- **Dark/Light Theme** — Toggle between dark and light mode, preference persisted in localStorage

### UI / UX
- Fully responsive dark-themed interface with purple/indigo accent colors
- Toast notifications for all actions (join, leave, request, etc.)
- Animated landing page with feature cards
- Skeleton loading states and hover animations
- Mobile-first responsive navigation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Database | JSON-file storage (no setup required) |
| State | React Context API |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Rudar-teach/studybuddy.git
cd studybuddy
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and set a strong `JWT_SECRET`:

```bash
cp .env.example .env
```

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-very-strong-random-secret-here
```

### Run

```bash
npm run dev
# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run start
```

---

## Project Structure

```
src/
├── app/
│   ├── api/                  # REST API routes
│   │   ├── auth/             #   register, login, me
│   │   ├── groups/           #   CRUD + join/leave
│   │   ├── projects/         #   CRUD + collaborator invites
│   │   ├── requests/         #   create/accept/reject
│   │   └── users/            #   search, matches, profile
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # SPA router (client-side)
├── components/
│   ├── auth.tsx              #   Login/Register forms
│   ├── browse.tsx            #   Browse all users with filters
│   ├── dashboard.tsx         #   User dashboard
│   ├── group-detail.tsx      #   Group view + chat
│   ├── groups.tsx            #   Browse/join/create groups
│   ├── landing.tsx           #   Landing page
│   ├── matches.tsx           #   Match results
│   ├── navigation.tsx        #   Navbar
│   ├── profile.tsx           #   Edit profile
│   ├── projects.tsx          #   Browse/post projects
│   ├── providers.tsx         #   React Context (auth, theme, nav)
│   ├── requests.tsx          #   Incoming/sent requests
│   └── toast.tsx             #   Toast notifications
├── lib/
│   ├── auth.ts               #   Auth logic (register, login, JWT)
│   ├── database.ts           #   JSON-file DB (CRUD)
│   ├── groups.ts             #   Group operations
│   ├── matching.ts           #   Matching algorithm
│   ├── messages.ts           #   Group chat messages
│   ├── projects.ts           #   Project operations
│   └── requests.ts           #   Request operations
└── types/
    └── index.ts              #   TypeScript interfaces
```

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/groups` | List all groups |
| POST | `/api/groups` | Create group |
| POST | `/api/groups/[id]/join` | Join group |
| POST | `/api/groups/[id]/leave` | Leave group |
| GET | `/api/groups/[id]/messages` | Get group chat |
| POST | `/api/groups/[id]/messages` | Send message |
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/requests` | Get requests for user |
| POST | `/api/requests` | Send request |
| POST | `/api/requests/[id]/accept` | Accept request |
| POST | `/api/requests/[id]/reject` | Reject request |
| GET | `/api/users/search` | Search users |
| GET | `/api/users/matches` | Get matched users |
| GET | `/api/users/me` | Get/update profile |

---

## Matching Algorithm

The matcher (`src/lib/matching.ts`) scores potential partners on three dimensions:

1. **Shared Subjects** (40 pts max) — how many subjects overlap
2. **Complementary Skills** (30 pts max) — beginner + expert pairs score higher
3. **Availability Overlap** (30 pts max) — matching time slots

Results are returned as a ranked list with per-reason breakdowns.

---

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Set `JWT_SECRET` in Vercel dashboard → Settings → Environment Variables.

### Self-hosted

```bash
npm run build
npm run start
```

Ensure `data/` is writable (the JSON database lives there). Add `data/` to `.gitignore` (already done).

---

## Security Notes

- `.env` is git-ignored — never commit secrets
- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt (12 rounds)
- No API keys, OAuth, or third-party services required
- The JSON-file DB stores data locally — no external DB needed

---

## Roadmap

- [ ] WebSocket real-time chat (instead of polling)
- [ ] File/image sharing in groups
- [ ] Calendar integration for scheduling
- [ ] Email notifications for requests
- [ ] Group video call link sharing
- [ ] User ratings/reviews
- [ ] Export profile to PDF
- [ ] Multi-language support

---

## License

MIT

🤖 Generated with [Claude Code](https://claude.com/claude-code)
