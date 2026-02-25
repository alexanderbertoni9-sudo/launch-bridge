import Link from "next/link";

import { ErrorBanner } from "@/components/error-banner";
import { loginAction, quickDemoLoginAction } from "@/lib/actions/auth-actions";

type AuthPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const errorCode = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : undefined;
  const roleParam = typeof resolvedSearchParams.role === "string" ? resolvedSearchParams.role.toUpperCase() : "";
  const selectedRole = roleParam === "ADMIN" ? "ADMIN" : "STUDENT";
  const debugPreviewEnabled = process.env.ENABLE_DEBUG_DASHBOARD_PREVIEW === "true";

  return (
    <main>
      <section className="stack" style={{ maxWidth: 560, margin: "0 auto" }}>
        <article className="card stack">
          <div className="stack">
            <h1>LaunchBridge Login</h1>
            <p className="muted">Demo mode is active. Login is available; signup is temporarily disabled.</p>
          </div>

          <ErrorBanner code={errorCode} />

          <p className="badge">{selectedRole === "ADMIN" ? "Admin Login" : "Student Login"}</p>

          <form action={loginAction}>
            <label>
              Role
              <select name="expectedRole" defaultValue={selectedRole} required>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Password
              <input name="password" type="password" minLength={8} required />
            </label>
            <button type="submit">Login</button>
          </form>

          <p className="muted">
            Use your seeded demo account. Admin alias still available at <Link href="/admin/login">/admin/login</Link>.
          </p>

          <section className="stack">
            <h2>Quick Demo Access</h2>
            <p className="muted">
              If manual login fails, use one-click demo sign-in to verify dashboard flow instantly.
            </p>
            <div className="row">
              <form action={quickDemoLoginAction}>
                <input name="expectedRole" type="hidden" value="STUDENT" />
                <button type="submit" className="button ghost">
                  Enter Student Dashboard
                </button>
              </form>
              <form action={quickDemoLoginAction}>
                <input name="expectedRole" type="hidden" value="ADMIN" />
                <button type="submit" className="button secondary">
                  Enter Admin Dashboard
                </button>
              </form>
            </div>
          </section>
        </article>

        {debugPreviewEnabled ? (
          <article className="card stack">
            <h2>Temporary Debug Preview</h2>
            <p className="muted">
              Use these links to preview dashboard layouts while login is being stabilized.
            </p>
            <div className="row">
              <Link href="/debug/student-dashboard-preview" className="button ghost">
                Preview Student Dashboard
              </Link>
              <Link href="/debug/admin-dashboard-preview" className="button secondary">
                Preview Admin Dashboard
              </Link>
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}
