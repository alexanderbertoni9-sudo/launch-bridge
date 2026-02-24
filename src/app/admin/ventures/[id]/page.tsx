import Link from "next/link";
import { notFound } from "next/navigation";

import { ResourceNotFoundError } from "@/lib/rbac/errors";
import { requireAdminSession } from "@/lib/rbac/guards";
import { getVentureDetailForAdmin } from "@/lib/services/venture";

type AdminVentureDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminVentureDetailPage({ params }: AdminVentureDetailPageProps) {
  await requireAdminSession();
  const { id } = await params;

  try {
    const venture = await getVentureDetailForAdmin(id);

    return (
      <main className="stack">
        <section className="row">
          <div className="stack">
            <h1>{venture.title}</h1>
            <p className="muted">Owner: {venture.owner.email}</p>
          </div>
          <Link href="/admin" className="button ghost">
            Back to Admin Dashboard
          </Link>
        </section>

        <section className="card stack">
          <h2>Idea</h2>
          <p>{venture.idea}</p>
        </section>

        <section className="card stack">
          <h2>Lean Canvas (Read-only)</h2>
          {venture.leanCanvas ? (
            <div className="grid two">
              <CanvasBlock title="Problem" value={venture.leanCanvas.problem} />
              <CanvasBlock title="Customer Segments" value={venture.leanCanvas.customerSegments} />
              <CanvasBlock
                title="Unique Value Proposition"
                value={venture.leanCanvas.uniqueValueProposition}
              />
              <CanvasBlock title="Solution" value={venture.leanCanvas.solution} />
              <CanvasBlock title="Channels" value={venture.leanCanvas.channels} />
              <CanvasBlock title="Revenue Streams" value={venture.leanCanvas.revenueStreams} />
              <CanvasBlock title="Cost Structure" value={venture.leanCanvas.costStructure} />
              <CanvasBlock title="Key Metrics" value={venture.leanCanvas.keyMetrics} />
              <CanvasBlock title="Unfair Advantage" value={venture.leanCanvas.unfairAdvantage} />
            </div>
          ) : (
            <p className="muted">No Lean Canvas saved for this venture yet.</p>
          )}
        </section>

        <section className="card stack">
          <h2>Feedback History</h2>
          {venture.feedbackEntries.length ? (
            <ul className="list">
              {venture.feedbackEntries.map((entry) => (
                <li key={entry.id} className="card stack" style={{ boxShadow: "none" }}>
                  <div className="row">
                    <span className="badge">{entry.source}</span>
                    <span className="muted">
                      {new Date(entry.createdAt).toLocaleString()} by {entry.requestedBy.email}
                    </span>
                  </div>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{entry.content}</pre>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No feedback entries yet.</p>
          )}
        </section>
      </main>
    );
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      notFound();
    }

    throw error;
  }
}

function CanvasBlock({ title, value }: { title: string; value: string }) {
  return (
    <article className="card stack" style={{ boxShadow: "none" }}>
      <h3>{title}</h3>
      <p className="muted">{value || "Not provided"}</p>
    </article>
  );
}
