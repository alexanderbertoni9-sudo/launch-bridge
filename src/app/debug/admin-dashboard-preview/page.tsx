import Link from "next/link";
import { redirect } from "next/navigation";

const previewRows = [
  {
    id: "preview-1",
    title: "Campus Pantry App",
    ownerEmail: "someoneelseyt69+student@gmail.com",
    createdAt: "02/25/2026",
    feedbackCount: 3,
  },
  {
    id: "preview-2",
    title: "Peer Tutor Match",
    ownerEmail: "someoneelseyt69+student@gmail.com",
    createdAt: "02/25/2026",
    feedbackCount: 1,
  },
];

export default function AdminDashboardPreviewPage() {
  if (process.env.ENABLE_DEBUG_DASHBOARD_PREVIEW !== "true") {
    redirect("/auth");
  }

  return (
    <main className="stack">
      <section className="stack">
        <h1>Admin Dashboard (Debug Preview)</h1>
        <p className="muted">
          Temporary preview route for layout validation only. Real admin data requires successful login.
        </p>
      </section>

      <section className="row">
        <span className="badge">PREVIEW ONLY</span>
        <Link href="/auth?role=ADMIN" className="button ghost">
          Back to Login
        </Link>
      </section>

      <section className="card stack">
        <ul className="list">
          {previewRows.map((venture) => (
            <li key={venture.id} className="row">
              <div className="stack">
                <strong>{venture.title}</strong>
                <span className="muted">Owner: {venture.ownerEmail}</span>
                <span className="muted">Created: {venture.createdAt}</span>
              </div>
              <div className="row">
                <span className="badge">{venture.feedbackCount} feedback</span>
                <button type="button" className="button secondary" disabled>
                  Open
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
