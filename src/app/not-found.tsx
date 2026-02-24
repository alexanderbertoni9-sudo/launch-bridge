import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main>
      <section className="card stack">
        <h1>404 - Not Found</h1>
        <p className="muted">This resource does not exist or is no longer available.</p>
        <Link href="/" className="button">
          Return Home
        </Link>
      </section>
    </main>
  );
}
