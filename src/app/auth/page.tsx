import Link from "next/link";

import { ErrorBanner } from "@/components/error-banner";
import { loginAction } from "@/lib/actions/auth-actions";

type AuthPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const errorCode = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : undefined;

  return (
    <main>
      <section className="grid two">
        <article className="card stack">
          <div className="stack">
            <h1>Student Access</h1>
            <p className="muted">Demo mode is active. Login is available; signup is temporarily disabled.</p>
          </div>

          <ErrorBanner code={errorCode} />

          <p className="badge">Login</p>

          <form action={loginAction}>
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
            Admin? Use <Link href="/admin/login">admin login</Link>.
          </p>
        </article>

        <article className="card stack">
          <h2>What you can do</h2>
          <ul className="list muted">
            <li>Use demo student and admin credentials to access the product.</li>
            <li>Create and manage multiple ventures.</li>
            <li>Fill out the full 9-block Lean Canvas.</li>
            <li>Request and review persisted feedback history.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
