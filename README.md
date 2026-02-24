# LaunchBridge

LaunchBridge is a hosted multi-user web product for student ventures with role-based access control.

## Implemented MVP

### Student routes
- `/auth` - student login (demo mode; signup disabled)
- `/student` - dashboard for own ventures
- `/student/ventures/new` - create venture
- `/student/ventures/:id/canvas` - Lean Canvas editor
- `/student/ventures/:id/feedback` - request and view feedback history

### Admin routes
- `/admin/login` - admin login
- `/admin` - list all ventures
- `/admin/ventures/:id` - venture detail (read-only)

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
   - demo seed vars (`DEMO_ADMIN_*`, `DEMO_STUDENT_*`)
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
- Legacy admin seeding remains supported with:
  - `ADMIN_SEED_EMAILS`
  - `ADMIN_SEED_PASSWORD`

## Tests
- Unit + integration:
  ```bash
  npm test
  ```
- E2E:
  ```bash
  E2E_ADMIN_EMAIL=admin@example.com E2E_ADMIN_PASSWORD=... npm run test:e2e
  ```

## Notes
- Signup is intentionally disabled for demo reliability.
- Feedback generation is deterministic template-based and persisted.
- Middleware no longer relies on custom role cookies; authorization is session + server-guard driven.
