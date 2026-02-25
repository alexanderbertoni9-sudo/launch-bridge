import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { quickDemoLoginAction } from "@/lib/actions/auth-actions";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main>
        <section className="card stack" style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1>LaunchBridge</h1>
          <p className="muted">
            Use one-click demo access to preview dashboards immediately, or open manual login.
          </p>
          <div className="row">
            <form action={quickDemoLoginAction}>
              <input name="expectedRole" type="hidden" value="STUDENT" />
              <button type="submit">Open Student Dashboard</button>
            </form>
            <form action={quickDemoLoginAction}>
              <input name="expectedRole" type="hidden" value="ADMIN" />
              <button type="submit" className="secondary">
                Open Admin Dashboard
              </button>
            </form>
          </div>
          <Link href="/auth" className="button ghost">
            Manual Login
          </Link>
        </section>
      </main>
    );
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  redirect("/student");
}
