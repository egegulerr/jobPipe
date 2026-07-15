"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SetupState = {
  apifyConfigured?: boolean;
  openRouterConfigured?: boolean;
  linkedinActor?: string;
  indeedActor?: string;
  matchingModel?: string;
  writingModel?: string;
};

const steps = [
  {
    name: "Apify",
    eyebrow: "01 · Job sources",
    title: "Connect your job search",
    description:
      "Job Pipe uses Apify to collect matching roles from the sources you choose. Your token stays on this device.",
  },
  {
    name: "OpenRouter",
    eyebrow: "02 · AI models",
    title: "Connect the intelligence",
    description:
      "OpenRouter powers job matching and tailored documents. You control the account, model access, and spend.",
  },
] as const;

export function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [state, setState] = useState<SetupState>({});
  const [secret, setSecret] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const current = steps[step];
  const configured = step === 0 ? state.apifyConfigured : state.openRouterConfigured;

  useEffect(() => {
    fetch("/api/setup")
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<SetupState>;
      })
      .then(setState)
      .catch(() => toast.error("Setup details could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  function changeStep(next: number) {
    setStep(next);
    setSecret("");
    setShowSecret(false);
    setAdvanced(false);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!secret && !configured) return;

    setSaving(true);
    const payload =
      step === 0
        ? {
            ...(secret && { apifyApiToken: secret }),
            linkedinActor: state.linkedinActor,
            indeedActor: state.indeedActor,
          }
        : {
            ...(secret && { openRouterApiKey: secret }),
            matchingModel: state.matchingModel,
            writingModel: state.writingModel,
          };

    try {
      const response = await fetch("/api/setup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();
      setState((value) => ({
        ...value,
        ...(step === 0 ? { apifyConfigured: true } : { openRouterConfigured: true }),
      }));
      setSecret("");
      toast.success(`${current.name} saved.`);
      if (step === 0) changeStep(1);
      else router.push("/dashboard/settings");
    } catch {
      toast.error(`Could not save ${current.name}. Check the key and try again.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface-dim px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,#46455433_1px,transparent_1px),linear-gradient(to_bottom,#46455433_1px,transparent_1px)] [background-size:52px_52px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 -top-48 size-[34rem] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-outline-variant pb-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-primary text-on-primary">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-headline text-lg font-bold tracking-tight">JOB PIPE</p>
              <p className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Local setup</p>
            </div>
          </div>
          <p className="hidden font-label text-xs uppercase tracking-[0.18em] text-on-surface-variant sm:block">Two connections. One private workspace.</p>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <section aria-label="Setup progress" className="animate-fade-up">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-secondary">Welcome aboard</p>
            <h1 className="mt-4 max-w-md font-headline text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-on-surface sm:text-5xl">
              Your search.<br />Your keys.<br /><span className="text-primary">Your machine.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-6 text-on-surface-variant">
              Connect the two services Job Pipe needs. Credentials are stored locally and are never shown again after saving.
            </p>

            <ol className="mt-10 space-y-3">
              {steps.map((item, index) => {
                const done = index === 0 ? state.apifyConfigured : state.openRouterConfigured;
                return (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => changeStep(index)}
                      aria-current={step === index ? "step" : undefined}
                      className={cn(
                        "flex w-full max-w-md items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        step === index ? "border-primary/60 bg-primary/10" : "border-transparent hover:bg-surface-container-low",
                      )}
                    >
                      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border font-label text-xs", done ? "border-secondary bg-secondary text-on-secondary" : "border-outline text-on-surface-variant")}>
                        {done ? <Check className="size-4" aria-label="Configured" /> : `0${index + 1}`}
                      </span>
                      <span>
                        <span className="block font-headline text-sm font-semibold">{item.name}</span>
                        <span className="block text-xs text-on-surface-variant">{done ? "Configured" : "Connection required"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="animate-scale-in overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low shadow-2xl shadow-black/25">
            <div className="h-1 bg-gradient-to-r from-primary via-primary-container to-secondary" />
            <form onSubmit={save} className="p-6 sm:p-9">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-label text-xs uppercase tracking-[0.18em] text-primary">{current.eyebrow}</p>
                  <h2 className="mt-3 font-headline text-2xl font-bold tracking-tight sm:text-3xl">{current.title}</h2>
                </div>
                {configured && <span className="flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1.5 text-xs font-semibold text-secondary"><Check className="size-3.5" /> Connected</span>}
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-on-surface-variant">{current.description}</p>

              <div className="mt-8 rounded-xl border border-outline-variant bg-surface-container-lowest/70 p-4 sm:p-5">
                <div className="flex gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-md bg-surface-container-high text-primary"><KeyRound className="size-4" /></div>
                  <div className="text-sm leading-6 text-on-surface-variant">
                    {step === 0 ? (
                      <div className="space-y-3"><p>Create an Apify account, open <a className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary" href="https://console.apify.com/account/integrations" target="_blank" rel="noreferrer">Settings → Integrations <ExternalLink className="inline size-3" /></a>, then copy your personal API token.</p><p className="text-xs leading-5">Job Pipe does not enforce provider budgets. You control the selected actors and result counts and are responsible for Apify usage and costs. You must also comply with each source website&apos;s terms, robots policy, and applicable law.</p></div>
                    ) : (
                      <div className="space-y-3"><p>Create an OpenRouter account, open <a className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary" href="https://openrouter.ai/settings/keys" target="_blank" rel="noreferrer">API Keys <ExternalLink className="inline size-3" /></a>, then create and copy a key.</p><p className="text-xs leading-5">Job Pipe does not enforce provider budgets. You control the selected models and are responsible for OpenRouter usage and costs.</p></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-2">
                <Label htmlFor="setup-secret">{step === 0 ? "Apify API token" : "OpenRouter API key"}</Label>
                <div className="relative">
                  <Input
                    id="setup-secret"
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    onChange={(event) => setSecret(event.target.value)}
                    placeholder={configured ? "Saved — enter a new key to replace it" : step === 0 ? "apify_api_••••••••" : "sk-or-v1-••••••••"}
                    autoComplete="off"
                    spellCheck={false}
                    className="h-12 pr-12 font-mono"
                  />
                  <button type="button" onClick={() => setShowSecret((value) => !value)} aria-label={showSecret ? "Hide key" : "Show key"} className="absolute right-1.5 top-1.5 grid size-9 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant">Saved keys are write-only and will not be returned to this screen.</p>
              </div>

              <button type="button" onClick={() => setAdvanced((value) => !value)} aria-expanded={advanced} className="mt-6 text-xs font-semibold text-on-surface-variant underline decoration-outline underline-offset-4 hover:text-on-surface">
                {advanced ? "Hide advanced settings" : "Advanced settings"}
              </button>

              {advanced && (
                <div className="mt-4 grid gap-4 rounded-lg border border-outline-variant p-4 sm:grid-cols-2">
                  {step === 0 ? (
                    <>
                      <SetupField label="LinkedIn actor" value={state.linkedinActor ?? ""} placeholder="Use tested default" onChange={(linkedinActor) => setState((value) => ({ ...value, linkedinActor }))} />
                      <SetupField label="Indeed actor" value={state.indeedActor ?? ""} placeholder="Use tested default" onChange={(indeedActor) => setState((value) => ({ ...value, indeedActor }))} />
                    </>
                  ) : (
                    <>
                      <SetupField label="Matching model" value={state.matchingModel ?? ""} placeholder="Use tested default" onChange={(matchingModel) => setState((value) => ({ ...value, matchingModel }))} />
                      <SetupField label="Writing model" value={state.writingModel ?? ""} placeholder="Use tested default" onChange={(writingModel) => setState((value) => ({ ...value, writingModel }))} />
                    </>
                  )}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-outline-variant pt-6">
                <Button type="button" variant="ghost" onClick={() => changeStep(0)} disabled={step === 0 || saving}><ArrowLeft /> Back</Button>
                <Button type="submit" size="lg" disabled={loading || saving || (!secret && !configured)}>
                  {saving ? <><LoaderCircle className="animate-spin" /> Saving</> : step === 0 ? <>Save & continue <ArrowRight /></> : <><Check /> Save setup</>}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function SetupField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
