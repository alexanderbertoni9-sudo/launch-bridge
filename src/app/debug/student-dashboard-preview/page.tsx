import Link from "next/link";
import { redirect } from "next/navigation";

const previewVentures = [
  {
    id: "preview-1",
    title: "Campus Pantry App",
    idea: "A student-run platform to coordinate surplus food pick-ups on campus.",
    feedbackCount: 3,
  },
  {
    id: "preview-2",
    title: "Peer Tutor Match",
    idea: "A matching service for students looking for subject-specific peer tutoring.",
    feedbackCount: 1,
  },
];

export default function StudentDashboardPreviewPage() {
  if (process.env.ENABLE_DEBUG_DASHBOARD_PREVIEW !== "true") {
    redirect("/auth");
  }

  return (
    <main className="stack">
      <section className="stack">
        <h1>Student Dashboard (Debug Preview)</h1>
        <p className="muted">
          Temporary preview route for layout validation only. Real data still requires successful login.
        </p>
      </section>

      <section className="row">
        <span className="badge">PREVIEW ONLY</span>
        <Link href="/auth" className="button ghost">
          Back to Login
        </Link>
      </section>

      <section className="grid two">
        {previewVentures.map((venture) => (
          <article key={venture.id} className="card stack">
            <div className="row">
              <h2>{venture.title}</h2>
              <span className="badge">{venture.feedbackCount} feedback</span>
            </div>
            <p className="muted">{venture.idea}</p>
            <div className="row">
              <button type="button" className="button ghost" disabled>
                Edit Canvas
              </button>
              <button type="button" className="button secondary" disabled>
                Feedback
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
