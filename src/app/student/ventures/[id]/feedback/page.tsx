import Link from "next/link";
import { forbidden, notFound } from "next/navigation";

import { requestFeedbackAction } from "@/lib/actions/venture-actions";
import { PermissionDeniedError, ResourceNotFoundError } from "@/lib/rbac/errors";
import { requireRole } from "@/lib/rbac/guards";
import { getFeedbackHistoryForStudent, getVentureForStudent } from "@/lib/services/venture";

type FeedbackPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FeedbackPage({ params, searchParams }: FeedbackPageProps) {
  const user = await requireRole("STUDENT");
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  const requested = resolvedSearchParams.requested === "1";

  try {
    const [venture, history] = await Promise.all([
      getVentureForStudent(id, user.id),
      getFeedbackHistoryForStudent(id, user.id),
    ]);

    return (
      <main className="stack">
        <section className="row">
          <div className="stack">
            <h1>{venture.title} - Feedback</h1>
            <p className="muted">Request deterministic feedback snapshots and keep full history.</p>
          </div>
          <div className="row">
            <Link href="/student" className="button ghost">
              Dashboard
            </Link>
            <Link href={`/student/ventures/${id}/canvas`} className="button secondary">
              Canvas
            </Link>
          </div>
        </section>

        {requested ? <p className="badge">New feedback entry saved</p> : null}

        <section className="card stack">
          <form action={requestFeedbackAction}>
            <input type="hidden" name="ventureId" value={id} />
            <button type="submit">Request Feedback</button>
          </form>
        </section>

        <section className="card stack">
          <h2>Feedback History</h2>
          {history.length ? (
            <ul className="list">
              {history.map((entry) => (
                <li key={entry.id} className="card stack" style={{ boxShadow: "none" }}>
                  <div className="row">
                    <span className="badge">{entry.source}</span>
                    <span className="muted">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{entry.content}</pre>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No feedback yet. Request your first entry.</p>
          )}
        </section>
      </main>
    );
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      notFound();
    }

    if (error instanceof PermissionDeniedError) {
      forbidden();
    }

    throw error;
  }
}
