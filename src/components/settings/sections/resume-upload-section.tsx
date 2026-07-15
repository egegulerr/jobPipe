"use client";

import { useRef, useCallback, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useParseResume } from "@/hooks/use-parse-resume";
import type { ParseResumeResponseDto } from "@/types/output/settings.dto";

interface ResumeUploadSectionProps {
  /** Called after a resume file is uploaded and successfully parsed. */
  onParsedResume: (parsed: ParseResumeResponseDto) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Renders a resume upload area with parsing support.
 */
export function ResumeUploadSection({ onParsedResume }: ResumeUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedFileName, setParsedFileName] = useState<string | null>(null);
  const parseResume = useParseResume();

  const handleResumeClick = useCallback(() => {
    if (parseResume.isPending) return;
    fileInputRef.current?.click();
  }, [parseResume.isPending]);

  const handleResumeUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        toast.error("File exceeds 5MB limit");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      let result: ParseResumeResponseDto;
      try {
        result = await parseResume.mutateAsync(file);
        toast.success("Resume parsed successfully");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to parse resume";
        toast.error(message);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      try {
        onParsedResume(result);
        setParsedFileName(file.name);
      } catch (error) {
        console.error("Error applying parsed resume:", error);
        toast.error("Resume parsed, but failed to apply results");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [parseResume, onParsedResume],
  );

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-white/5">
      <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block mb-4">
        Master Resume
      </label>
      <div
        className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group/upload"
        onClick={handleResumeClick}
      >
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover/upload:scale-110 transition-transform">
          {parseResume.isPending ? (
            <Loader2 className="size-5 text-primary animate-spin" />
          ) : (
            <Upload className="size-5 text-primary" />
          )}
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-on-surface">
            {parseResume.isPending ? "Parsing resume..." : "Click to upload your resume"}
          </p>
          <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">
            PDF up to 5MB. We parse it and derive your profile sections from it.
          </p>
        </div>
      </div>
      {parsedFileName ? (
        <div className="mt-4 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
          <p className="text-xs font-bold text-on-surface">{parsedFileName}</p>
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
            Resume parsed. Review the profile sections below and save your changes.
          </p>
        </div>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        aria-label="Upload Resume PDF"
        className="hidden"
        onChange={handleResumeUpload}
        disabled={parseResume.isPending}
      />
    </div>
  );
}
