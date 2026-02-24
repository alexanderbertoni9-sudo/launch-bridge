import Link from "next/link";

import { requireAdminSession } from "@/lib/rbac/guards";
import { getAllVenturesForAdmin } from "@/lib/services/venture";

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const ventures = await getAllVenturesForAdmin();

  return (
    <main className="stack">
      <section className="stack">
        <h1>Admin Dashboard</h1>
        <p className="muted">Read-only list of all ventures with owner and feedback volume.</p>
      </section>

      <section className="card stack">
        {ventures.length ? (
          <ul className="list">
            {ventures.map((venture) => (
              <li key={venture.id} className="row">
                <div className="stack">
                  <strong>{venture.title}</strong>
                  <span className="muted">Owner: {venture.owner.email}</span>
                  <span className="muted">Created: {new Date(venture.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="row">
                  <span className="badge">{venture._count.feedbackEntries} feedback</span>
                  <Link href={`/admin/ventures/${venture.id}`} className="button secondary">
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No ventures found.</p>
        )}
      </section>
    </main>
  );
}
