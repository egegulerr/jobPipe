"use client";

export default function DashboardError({
  error,
}: Readonly<{
  error: Error;
}>) {
  return (
    <main className="shell">
      <section className="card p-6">
        <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-[var(--muted)]">{error.message}</p>
      </section>
    </main>
  );
}
