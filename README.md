# LaunchBridge

LaunchBridge is a hosted multi-user web product for student ventures with role-based access control.

## Implemented MVP

### Student routes
- `/auth` - student signup/login
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
- Middleware applies route gating and basic auth endpoint rate limiting
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
   - `ADMIN_SEED_EMAILS`
   - `ADMIN_SEED_PASSWORD`
4. Apply migrations:
   ```bash
   npm run prisma:migrate
   ```
5. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
6. Seed admin accounts:
   ```bash
   npm run prisma:seed
   ```
7. Run app:
   ```bash
   npm run dev
   ```

## Admin provisioning
- Admin users are seeded from:
  - `ADMIN_SEED_EMAILS` (comma-separated)
  - `ADMIN_SEED_PASSWORD`
- Public signup always creates `STUDENT` users.

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
- Feedback generation is deterministic template-based and persisted; this is AI-ready for future replacement.
- Middleware role hints use a secure role cookie for fast gating; authoritative authorization is still server-side via session + DB ownership checks.
