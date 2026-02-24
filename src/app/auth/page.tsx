import Link from "next/link";

import { ErrorBanner } from "@/components/error-banner";
import { loginAction, signupStudentAction } from "@/lib/actions/auth-actions";

type AuthPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const mode = typeof resolvedSearchParams.mode === "string" ? resolvedSearchParams.mode : "login";
  const errorCode = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : undefined;

  return (
    <main>
      <section className="grid two">
        <article className="card stack">
          <div className="stack">
            <h1>Student Access</h1>
            <p className="muted">Create an account or log in to build ventures and request feedback.</p>
          </div>

          <ErrorBanner code={errorCode} />

          <div className="row muted">
            <span className={mode === "login" ? "badge" : undefined}>Login</span>
            <Link href="/auth?mode=signup" className="button ghost">
              Switch to Signup
            </Link>
          </div>

          {mode === "signup" ? (
            <form action={signupStudentAction}>
              <label>
                Email
                <input name="email" type="email" required />
              </label>
              <label>
                Password
                <input name="password" type="password" minLength={8} required />
              </label>
              <label>
                Confirm Password
                <input name="confirmPassword" type="password" minLength={8} required />
              </label>
              <button type="submit">Create Student Account</button>
            </form>
          ) : (
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
          )}

          <p className="muted">
            Admin? Use <Link href="/admin/login">admin login</Link>.
          </p>
        </article>

        <article className="card stack">
          <h2>What you can do</h2>
          <ul className="list muted">
            <li>Create and manage multiple ventures.</li>
            <li>Fill out the full 9-block Lean Canvas.</li>
            <li>Request and review persisted feedback history.</li>
            <li>Keep all data scoped to your account ownership.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
