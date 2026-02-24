import Link from "next/link";

import { ErrorBanner } from "@/components/error-banner";
import { adminLoginAction } from "@/lib/actions/auth-actions";

type AdminLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const errorCode = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : undefined;

  return (
    <main>
      <section className="card stack" style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1>Admin Login</h1>
        <p className="muted">Access global venture visibility and read-only detail screens.</p>

        <ErrorBanner code={errorCode} />

        <form action={adminLoginAction}>
          <label>
            Admin Email
            <input name="email" type="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" minLength={8} required />
          </label>
          <button type="submit" className="secondary">
            Login as Admin
          </button>
        </form>

        <p className="muted">
          Student account? <Link href="/auth">Go to student auth</Link>.
        </p>
      </section>
    </main>
  );
}
