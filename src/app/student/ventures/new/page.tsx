import Link from "next/link";

import { ErrorBanner } from "@/components/error-banner";
import { createVentureAction } from "@/lib/actions/venture-actions";
import { requireRole } from "@/lib/rbac/guards";

type NewVenturePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewVenturePage({ searchParams }: NewVenturePageProps) {
  await requireRole("STUDENT");
  const resolvedSearchParams = (await searchParams) ?? {};
  const errorCode = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : undefined;

  return (
    <main>
      <section className="card stack" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="row">
          <h1>Create Venture</h1>
          <Link href="/student" className="button ghost">
            Back
          </Link>
        </div>

        <ErrorBanner code={errorCode} />

        <form action={createVentureAction}>
          <label>
            Venture Title
            <input name="title" type="text" minLength={3} maxLength={120} required />
          </label>
          <label>
            Idea
            <textarea name="idea" minLength={10} maxLength={5000} required />
          </label>
          <button type="submit">Create and Open Canvas</button>
        </form>
      </section>
    </main>
  );
}
