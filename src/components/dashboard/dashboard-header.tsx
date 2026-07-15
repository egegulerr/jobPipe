import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 w-full flex justify-between items-center px-8 py-3 bg-surface-dim/70 backdrop-blur-md border-b border-outline-variant/30">
      <div className="flex items-center gap-4">
        <h2 className="font-headline font-extrabold text-xl tracking-tight text-on-surface">Dashboard</h2>
        <div className="hidden md:flex gap-6 ml-8 font-label text-[10px] uppercase tracking-[0.2em]">
          <Link className="text-primary border-b-2 border-primary pb-1" href="/dashboard">
            Overview
          </Link>
        </div>
      </div>

    </header>
  );
}
