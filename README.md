# Bedier Group · Task Tracking & Performance System

Internal task management platform for Creative, Operations, and Tech teams.
Three roles (Super Admin, Team Manager, Employee), three task types (General / Team / Private),
strict role-scoped visibility, proof uploads, points & faults gamification, and three-tier
leaderboards.

Design system: **Executive Command** — deep navy `#0b1326` + neon `#adc6ff/#ddb7ff/#ffb95f`,
glassmorphism, Mission Control aesthetic.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, TanStack Query, framer-motion, recharts, Material Symbols |
| Backend | Node.js, Express, Prisma 5, PostgreSQL 16 |
| Auth | JWT (12h) + bcrypt |
| Storage | multer to local `backend/uploads/` (10 MB cap; jpg/png/webp/gif/pdf) |
| Security | helmet, cors pinned to frontend origin, express-rate-limit on `/auth` |

---

## Quick start

```bash
# 0. From this folder
cd "C:\Users\Ahmed\OneDrive\Desktop\bedier group system\app"

# 1. Start Postgres
docker compose up -d postgres

# 2. Install deps (workspaces)
npm install

# 3. Generate Prisma client + run migration + seed
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run seed
cd ..

# 4. Run both servers (port 4000 backend, 5173 frontend)
npm run dev
```

Open http://localhost:5173

### Seeded accounts

**Super Admins**

| Name | Email | Password |
|---|---|---|
| Bedier | `bedier@system.com` | `admin7181` |
| Hanan | `hanan@system.com` | `admin123` |

**Tech Team Employees**

| Name | Email | Password |
|---|---|---|
| Baraa Mohamed | `baraa.mohamed@system.com` | `12345678` |
| Alaa Ahmed | `alaa.ahmed@system.com` | `87654321` |
| Safa Naser | `safa.naser@system.com` | `0123456789` |

> Creative and Operations teams have no members yet — add them via **Admin → Users** as a Super Admin. Then use **Admin → Teams → Assign** to promote one employee per team to Team Leader. The system enforces exactly one Team Leader per team.

---

## Project layout

```
app/
├── docker-compose.yml      Postgres 16
├── package.json            workspaces root, runs FE+BE concurrently
├── shared/constants.js     Role/Status/TaskType enums
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   8 tables, 8 enums
│   │   └── seed.js         3 teams, 5 admin accounts (managers + employees added via UI)
│   ├── uploads/            multer destination
│   └── src/
│       ├── server.js       express bootstrap, helmet, cors, rate limiter
│       ├── config/         env + prisma client
│       ├── middleware/     auth (JWT), rbac, upload, error, rateLimit
│       ├── routes/         auth, users, teams, tasks, assignments, penalties,
│       │                   leaderboards, dashboard, notifications, activity, settings
│       ├── services/       pointsService, faultService, notificationService,
│       │                   activityService, settingsService
│       ├── validators/     zod schemas
│       └── utils/          jwt, hash, httpError
└── frontend/
    ├── tailwind.config.js  Executive Command tokens
    ├── index.html          Inter + Material Symbols
    └── src/
        ├── App.jsx         router + role guards
        ├── api/            axios + React Query hooks
        ├── auth/           AuthContext + ProtectedRoute + RoleGate
        ├── components/
        │   ├── layout/     Shell, Sidebar, Topbar
        │   ├── ui/         GlassCard, Button, Input, Badge, Avatar, Modal,
        │   │               StatCard, Empty
        │   └── domain/     TaskCard, LeaderboardRow, ActivityItem,
        │                   NotificationBell, SubmitProofModal
        ├── pages/
        │   ├── auth/       Login
        │   ├── admin/      Dashboard, Tasks, TaskForm, Users, Teams,
        │   │               Leaderboards, ActivityLog, Settings
        │   ├── employee/   MyDashboard, Profile
        │   ├── manager/    TeamDashboard, ReviewQueue
        │   └── shared/     TaskDetail, Notifications, Forbidden, NotFound
        └── lib/            cn, format
```

---

## Role visibility matrix

| Resource | Super Admin | Team Manager | Employee |
|---|---|---|---|
| All teams | ✅ | own only | own only |
| All users | ✅ | own team only | self only |
| GENERAL tasks | ✅ | ✅ | ✅ |
| TEAM tasks | ✅ | own team only | own team only |
| PRIVATE tasks | ✅ | own team's | only when assignee |
| Create task | ✅ all types | TEAM (own) + PRIVATE (own team) | ❌ |
| Review submissions | ✅ | own team only | ❌ |
| Issue penalty | ✅ | own team only | ❌ |
| Settings | ✅ | ❌ | ❌ |
| Activity log | ✅ | ❌ | ❌ |

A Creative-team employee CANNOT see Tech or Operations team tasks — verified via
`GET /api/tasks` (filters out cross-team) and `GET /api/tasks/:id` (returns 403).

---

## Task lifecycle & points

```
Created → Assigned → In progress → Submitted → Under review → Approved
                                                            ↘ Rejected → resubmit
                                          past deadline & unsubmitted → Missed
```

- `+1` on TEAM or PRIVATE task approval
- General task points configurable in **Admin → Settings** (default `1`)
- `+2` daily completion bonus when an employee approves all of today's tasks
- `-1` LATE penalty on past-due submissions
- `-1` MISSED penalty when fault scan marks an unsubmitted overdue task
- Fault count escalates `warningLevel` per `warning_thresholds` (default `[3, 6, 9]`)

Trigger fault scan manually from **Admin → Settings → Run scan now**, or hit
`POST /api/settings/run-fault-scan`.

---

## End-to-end verification

After setup:

1. **Auth & RBAC.**
   Sign in as `it1@bedier.local`. Sidebar hides admin items; `/admin/users` → 403 page.
   Sign in as `creative.lead@bedier.local`. `/team` shows Creative members only.
   Sign in as `admin@bedier.local`. Full sidebar.
2. **Admin task creation.**
   `/admin/tasks/new` → choose TEAM, pick Tech, due tomorrow, proof required, assign 2
   Tech employees. Both their notification bells increment.
3. **Employee lifecycle.**
   Sign in as the assignee → `/me` shows the task in **Due today**. Open it →
   *Start task* → *Submit for review* → upload an image. File lands in `backend/uploads/`,
   status flips to **Submitted**.
4. **Manager review.**
   Sign in as the Tech lead → `/manager/review` → preview proof → *Approve*. Employee's
   `points` increments (verify on their `/me/profile`), a `TASK_APPROVED` notification
   fires, ActivityLog records `TASK_REVIEWED`.
5. **Faults & leaderboards.**
   Run `POST /api/settings/run-fault-scan` (admin Settings page button). Past-due
   unsubmitted assignments flip to MISSED, employees receive `-1` penalty + notification,
   `faultCount` and `warningLevel` update on profile. `/admin/leaderboards` → all three
   tabs render with data.
6. **Visibility hard-test.**
   As `creative1@bedier.local`, devtools → `GET /api/tasks` → response has zero
   `type=TEAM, teamId=<Tech-team-id>` tasks. `GET /api/tasks/<known-Tech-task-id>` → 403.
7. **Settings effect.**
   As admin, change `general_task_points` to `5` in `/admin/settings`. Approve a GENERAL
   submission and verify the new value awards.

All seven passing → MVP shippable.

---

## Common scripts

| From | Command | Purpose |
|---|---|---|
| `app/` | `npm run dev` | Run backend + frontend in parallel |
| `app/` | `npm run seed` | Reset DB + reseed |
| `app/backend` | `npx prisma studio` | Inspect DB visually |
| `app/backend` | `npx prisma migrate dev --name <x>` | Add migration after schema change |
| `app/backend` | `npm run db:reset` | Wipe + remigrate + reseed |

---

## Environment

`backend/.env` is checked in for local dev. Replace `JWT_SECRET` with a long random value
before exposing to anyone.

| Var | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://bedier:bedier@localhost:5432/bedier_tasks` | Postgres connection |
| `JWT_SECRET` | dev placeholder | **Change for any non-local use.** |
| `JWT_EXPIRES_IN` | `12h` | |
| `PORT` | `4000` | |
| `UPLOAD_DIR` | `./uploads` | |
| `MAX_UPLOAD_MB` | `10` | |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | CORS allow-list |

---

## Out of scope for this MVP

(Per SRS sections 14–26, deferred to follow-up iterations.)

- Reports / monthly exports (CSV/Excel)
- Recurring tasks (cron-generated)
- Approval workflow extensions (multi-step reviews)
- Badges, streaks, employee of the month
- Mobile app, push notifications, email
- Slack/Discord/calendar integrations
- Multi-branch / multi-company / API keys for external tools

---

## Existing UI source

The 8 design assets in
[bedier group system/stitch_gamified_team_task_manager](../stitch_gamified_team_task_manager/stitch_gamified_team_task_manager)
were the reference for these screens:

| Mockup | Implemented as |
|---|---|
| `admin_dashboard_leaderboard_1` | `pages/admin/Dashboard.jsx` |
| `admin_dashboard_leaderboard_2` | `pages/admin/Leaderboards.jsx` |
| `admin_task_management` | `pages/admin/Tasks.jsx` + `TaskForm.jsx` |
| `member_personal_dashboard` | `pages/employee/MyDashboard.jsx` |
| `team_member_dashboard` | `pages/manager/TeamDashboard.jsx` |
| `task_submission_upload` | `components/domain/SubmitProofModal.jsx` |
| `executive_command/DESIGN.md` | `frontend/tailwind.config.js` |

New screens with no mockup: Login, Users, Teams, ActivityLog, Settings, TaskDetail,
Notifications, Profile, ReviewQueue, Forbidden, NotFound.
