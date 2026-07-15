export default function AboutPage() {
  return (
    <main className="shell">
      <section className="card p-8 md:p-12">
        <h1 className="mb-4 text-4xl font-semibold md:text-5xl" style={{ fontFamily: "var(--font-lora), serif" }}>
          About Job Pipe
        </h1>
        <p className="max-w-2xl text-base text-[var(--muted)] md:text-lg">
          Job Pipe helps individuals run a private local job-search pipeline with
          generated application documents.
        </p>
      </section>
    </main>
  );
}
