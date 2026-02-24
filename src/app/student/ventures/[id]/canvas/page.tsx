import Link from "next/link";
import { forbidden, notFound } from "next/navigation";

import { ErrorBanner } from "@/components/error-banner";
import { updateCanvasAction } from "@/lib/actions/venture-actions";
import { PermissionDeniedError, ResourceNotFoundError } from "@/lib/rbac/errors";
import { requireStudentSession } from "@/lib/rbac/guards";
import { getVentureForStudent } from "@/lib/services/venture";

type CanvasPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CanvasEditorPage({ params, searchParams }: CanvasPageProps) {
  const user = await requireStudentSession();
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  const saved = resolvedSearchParams.saved === "1";
  const errorCode = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : undefined;

  try {
    const venture = await getVentureForStudent(id, user.id);

    if (!venture.leanCanvas) {
      notFound();
    }

    return (
      <main className="stack">
        <section className="row">
          <div className="stack">
            <h1>{venture.title} - Lean Canvas</h1>
            <p className="muted">Edit your nine Lean Canvas blocks and save changes.</p>
          </div>
          <div className="row">
            <Link href="/student" className="button ghost">
              Dashboard
            </Link>
            <Link href={`/student/ventures/${id}/feedback`} className="button secondary">
              Feedback
            </Link>
          </div>
        </section>

        {saved ? <p className="badge">Canvas saved</p> : null}
        <ErrorBanner code={errorCode} />

        <section className="card">
          <form action={updateCanvasAction}>
            <input type="hidden" name="ventureId" value={id} />

            <label>
              Problem
              <textarea name="problem" defaultValue={venture.leanCanvas.problem} />
            </label>
            <label>
              Customer Segments
              <textarea name="customerSegments" defaultValue={venture.leanCanvas.customerSegments} />
            </label>
            <label>
              Unique Value Proposition
              <textarea
                name="uniqueValueProposition"
                defaultValue={venture.leanCanvas.uniqueValueProposition}
              />
            </label>
            <label>
              Solution
              <textarea name="solution" defaultValue={venture.leanCanvas.solution} />
            </label>
            <label>
              Channels
              <textarea name="channels" defaultValue={venture.leanCanvas.channels} />
            </label>
            <label>
              Revenue Streams
              <textarea name="revenueStreams" defaultValue={venture.leanCanvas.revenueStreams} />
            </label>
            <label>
              Cost Structure
              <textarea name="costStructure" defaultValue={venture.leanCanvas.costStructure} />
            </label>
            <label>
              Key Metrics
              <textarea name="keyMetrics" defaultValue={venture.leanCanvas.keyMetrics} />
            </label>
            <label>
              Unfair Advantage
              <textarea name="unfairAdvantage" defaultValue={venture.leanCanvas.unfairAdvantage} />
            </label>

            <button type="submit">Save Canvas</button>
          </form>
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
