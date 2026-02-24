import Link from "next/link";

import { requireStudentSession } from "@/lib/rbac/guards";
import { getStudentVentures } from "@/lib/services/venture";

export default async function StudentDashboardPage() {
  const user = await requireStudentSession();
  const ventures = await getStudentVentures(user.id);

  return (
    <main className="stack">
      <section className="row">
        <div className="stack">
          <h1>Student Dashboard</h1>
          <p className="muted">Manage your ventures, canvas drafts, and feedback history.</p>
        </div>
        <Link href="/student/ventures/new" className="button">
          New Venture
        </Link>
      </section>

      <section className="grid two">
        {ventures.length ? (
          ventures.map((venture) => (
            <article key={venture.id} className="card stack">
              <div className="row">
                <h2>{venture.title}</h2>
                <span className="badge">{venture._count.feedbackEntries} feedback</span>
              </div>
              <p className="muted">{venture.idea}</p>
              <div className="row">
                <Link href={`/student/ventures/${venture.id}/canvas`} className="button ghost">
                  Edit Canvas
                </Link>
                <Link href={`/student/ventures/${venture.id}/feedback`} className="button secondary">
                  Feedback
                </Link>
              </div>
            </article>
          ))
        ) : (
          <article className="card stack">
            <h2>No ventures yet</h2>
            <p className="muted">Create your first venture to begin filling your Lean Canvas.</p>
          </article>
        )}
      </section>
    </main>
  );
}
