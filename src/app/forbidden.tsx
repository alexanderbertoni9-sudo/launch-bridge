import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main>
      <section className="card stack">
        <h1>403 - Forbidden</h1>
        <p className="muted">You do not have access to this resource.</p>
        <Link href="/" className="button">
          Return Home
        </Link>
      </section>
    </main>
  );
}
