export function RunJobDetailEmptyState() {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-surface-container-low/30 p-10 text-center">
      <p className="font-headline text-2xl font-bold text-white">Select a job to inspect the run output.</p>
      <p className="mt-2 text-sm text-on-surface-variant">
        Job intel, match analysis, and generated documents appear here for the selected role.
      </p>
    </div>
  );
}
