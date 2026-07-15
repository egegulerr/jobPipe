"use client";

export function WizardLayout() {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
      <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[60%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute top-[40%] right-0 w-[30%] h-[40%] bg-secondary/5 blur-[100px] rounded-full" />
    </div>
  );
}
