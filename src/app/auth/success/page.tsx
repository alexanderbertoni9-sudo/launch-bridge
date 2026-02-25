import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

type LoginSuccessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginSuccessPage({ searchParams }: LoginSuccessPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const roleParam = typeof resolvedSearchParams.role === "string" ? resolvedSearchParams.role : "";
  const isAdmin = roleParam === "ADMIN" || session.user.role === "ADMIN";
  const dashboardPath: Route = isAdmin ? "/admin" : "/student";

  return (
    <main>
      <section className="card stack" style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1>Success Log in page</h1>
        <p className="muted">Login was successful for {session.user.email}.</p>
        <p className="badge">{isAdmin ? "ADMIN" : "STUDENT"}</p>
        <p className="muted">This is a temporary proof-of-concept checkpoint route.</p>
        <div className="row">
          <Link href={dashboardPath} className="button">
            Continue to Dashboard
          </Link>
          <Link href="/auth" className="button ghost">
            Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
}
