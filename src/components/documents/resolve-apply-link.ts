import { safeExternalUrl } from "@/lib/utils/safe-external-url";

export type ApplyLinkInput = {
  applyUrl: string | null;
  jobLink: string | null;
};

export function resolveApplyLink(input: ApplyLinkInput): string | null {
  return safeExternalUrl(input.applyUrl) ?? safeExternalUrl(input.jobLink);
}
