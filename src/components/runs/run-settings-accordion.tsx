import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getDaysFilterLabel } from "@/components/runs/start-run-recommendation";
import {
  hasPromptOverrides,
} from "@/components/runs/start-run-dialog.helpers";
import {
  parseRunAiPreferencesFromConfig,
} from "@/components/runs/start-run-wizard/steps/ai-preferences-shared";
import { getDocumentToneLabel } from "@/components/settings/document-tone";
import { getResumeTemplateOption } from "@/components/runs/start-run-wizard/steps/resume-template-options";
import { resolveResumeTemplate } from "@/lib/shared/document-template";
import type { RunConfigDto } from "@/types/output/runs.dto";

type RunSettingsAccordionProps = {
  runConfig: RunConfigDto;
};

function RunAiPreferencesSummary({ runConfig }: { runConfig: RunConfigDto }) {
  const { promptOverrides, engineSettings, coverLetterTone } =
    parseRunAiPreferencesFromConfig(runConfig);
  const hasPerRunOverrides = hasPromptOverrides(promptOverrides);
  const resumeToneLabel = engineSettings.toneInstructions.trim()
    ? "Custom"
    : getDocumentToneLabel(engineSettings.defaultTone);
  const coverLetterToneLabel = coverLetterTone.toneInstructions.trim()
    ? "Custom"
    : getDocumentToneLabel(coverLetterTone.defaultTone);

  return (
    <dl className="grid min-w-0 grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
      <dt className="text-muted-foreground">Source</dt>
      <dd>
        <Badge variant="outline">
          {hasPerRunOverrides ? "Configured for this run" : "Default engine settings"}
        </Badge>
      </dd>

      <dt className="text-muted-foreground">Minimum match threshold</dt>
      <dd>{engineSettings.matchThreshold}%</dd>

      {engineSettings.jobMatcherInstructions.trim() ? (
        <>
          <dt className="text-muted-foreground">Matcher instructions</dt>
          <dd className="break-words whitespace-pre-wrap">{engineSettings.jobMatcherInstructions.trim()}</dd>
        </>
      ) : null}

      <dt className="text-muted-foreground">Resume tone</dt>
      <dd>{resumeToneLabel}</dd>

      {engineSettings.toneInstructions.trim() ? (
        <>
          <dt className="text-muted-foreground">Resume tone instructions</dt>
          <dd className="break-words whitespace-pre-wrap">{engineSettings.toneInstructions.trim()}</dd>
        </>
      ) : null}

      <dt className="text-muted-foreground">Cover letter tone</dt>
      <dd>{coverLetterToneLabel}</dd>

      {coverLetterTone.toneInstructions.trim() ? (
        <>
          <dt className="text-muted-foreground">Cover letter tone instructions</dt>
          <dd className="break-words whitespace-pre-wrap">{coverLetterTone.toneInstructions.trim()}</dd>
        </>
      ) : null}
    </dl>
  );
}

export function RunSettingsAccordion({ runConfig }: RunSettingsAccordionProps) {
  return (
    <Accordion type="multiple" defaultValue={["search-config", "prompt-overrides"]} className="w-full">
      <AccordionItem value="search-config">
        <AccordionTrigger>Search Configuration</AccordionTrigger>
        <AccordionContent>
          <dl className="grid min-w-0 grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Keywords</dt>
            <dd>{runConfig.title_keywords}</dd>

            <dt className="text-muted-foreground">Location</dt>
            <dd>{runConfig.locations}</dd>

            <dt className="text-muted-foreground">Days filter</dt>
            <dd>{getDaysFilterLabel(runConfig.days_filter)}</dd>

            <dt className="text-muted-foreground">Platforms</dt>
            <dd>{runConfig.platforms.join(", ")}</dd>

            {runConfig.linkedin_results_limit != null ? (
              <>
                <dt className="text-muted-foreground">LinkedIn limit</dt>
                <dd>{runConfig.linkedin_results_limit}</dd>
              </>
            ) : null}

            {runConfig.indeed_results_limit != null ? (
              <>
                <dt className="text-muted-foreground">Indeed limit</dt>
                <dd>{runConfig.indeed_results_limit}</dd>
              </>
            ) : null}

            <dt className="text-muted-foreground">Resume layout</dt>
            <dd>{getResumeTemplateOption(resolveResumeTemplate(runConfig.resume_template).id).label}</dd>
          </dl>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="prompt-overrides">
        <AccordionTrigger>Matching &amp; Drafts</AccordionTrigger>
        <AccordionContent>
          <RunAiPreferencesSummary runConfig={runConfig} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
