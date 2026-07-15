export default function DashboardLoading() {
  return (
    <main className="shell flex min-h-[60vh] items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-white/25 border-t-white"
        aria-label="Loading"
        role="status"
      />
    </main>
  );
}
