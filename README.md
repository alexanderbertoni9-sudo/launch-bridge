# LaunchBridge

LaunchBridge is a hosted multi-user web product for student ventures with role-based access control.

## Implemented MVP

### Student routes
- `/auth` - unified student/admin login (demo mode; signup disabled)
- `/student` - dashboard for own ventures
- `/student/ventures/new` - create venture
- `/student/ventures/:id/canvas` - Lean Canvas editor
- `/student/ventures/:id/feedback` - request and view feedback history

### Admin routes
- `/admin/login` - alias redirect to `/auth?role=ADMIN`
- `/admin` - list all ventures
- `/admin/ventures/:id` - venture detail (read-only)

### Temporary debug routes
- `/debug/student-dashboard-preview` - mock student dashboard preview (env-gated)
- `/debug/admin-dashboard-preview` - mock admin dashboard preview (env-gated)

## Tech stack
- Next.js App Router + TypeScript
- Auth.js credentials provider
- Prisma + PostgreSQL
- Zod validation
- Vitest + Playwright tests

## RBAC model
- Roles: `STUDENT`, `ADMIN`
- Student access is restricted to `ownerUserId === currentUser.id`
- Admin can access all ventures
- Middleware applies rate limiting for auth endpoints
- Server-side guards enforce permissions on every venture read/write operation

## Data model
- `User` (`role`, `passwordHash`)
- `Venture` (`ownerUserId`, `title`, `idea`)
- `LeanCanvas` (9 explicit fields)
- `FeedbackEntry` (`source=SYSTEM_TEMPLATE`, persisted history)
- Auth.js adapter tables (`Account`, `Session`, `VerificationToken`, `Authenticator`)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template:
   ```bash
   cp .env.example .env
   ```
3. Set `.env` values:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `DEMO_ADMIN_EMAIL=someoneelseyt69@gmail.com`
   - `DEMO_ADMIN_PASSWORD=ABC12345`
   - `DEMO_STUDENT_EMAIL=someoneelseyt69+student@gmail.com`
   - `DEMO_STUDENT_PASSWORD=Student12345`
   - `ENABLE_DEBUG_DASHBOARD_PREVIEW=true` (temporary, optional)
4. Bootstrap demo environment:
   ```bash
   npm run demo:bootstrap
   ```
5. Run app:
   ```bash
   npm run dev
   ```

## Demo account provisioning
- Demo admin and student users are seeded from:
  - `DEMO_ADMIN_EMAIL`
  - `DEMO_ADMIN_PASSWORD`
  - `DEMO_STUDENT_EMAIL`
  - `DEMO_STUDENT_PASSWORD`
- Seed script trims accidental wrapping quotes and enforces password length `>= 8`.
- Legacy admin seeding remains supported with:
  - `ADMIN_SEED_EMAILS`
  - `ADMIN_SEED_PASSWORD`

## Login expectations
- Login is role-aware in one window at `/auth`:
  - select `Student` + valid student credentials -> redirect to `/student`
  - select `Admin` + valid admin credentials -> redirect to `/admin`
- Wrong role selection returns an inline role mismatch message.
- `GET /` includes one-click demo login buttons for student/admin to immediately verify dashboard access.
- If manual login fails, use quick demo login buttons; they now auto-sync demo users from `DEMO_*` env values before signing in.

## Tests
- Unit + integration:
  ```bash
  npm test
  ```
- E2E:
  ```bash
  E2E_ADMIN_EMAIL=admin@example.com E2E_ADMIN_PASSWORD=... E2E_STUDENT_EMAIL=student@example.com E2E_STUDENT_PASSWORD=... npm run test:e2e
  ```

## Notes
- Signup is intentionally disabled for demo reliability.
- Feedback generation is deterministic template-based and persisted.
- Middleware no longer relies on custom role cookies; authorization is session + server-guard driven.
