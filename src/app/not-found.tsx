import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell">
      <section className="card p-8">
        <h1 className="mb-3 text-3xl font-semibold" style={{ fontFamily: "var(--font-lora), serif" }}>
          Page not found
        </h1>
        <p className="mb-5 text-sm text-[var(--muted)]">The page you requested does not exist.</p>
        <Link href="/" className="btn btn-primary">
          Go home
        </Link>
      </section>
    </main>
  );
}
