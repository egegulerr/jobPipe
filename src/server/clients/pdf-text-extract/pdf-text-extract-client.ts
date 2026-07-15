import { extractText } from "unpdf";

export type ExtractResumeTextResult = { ok: true; text: string } | { ok: false; error: string };

export async function extractResumeText(pdfBytes: Uint8Array): Promise<ExtractResumeTextResult> {
  try {
    const result = await extractText(pdfBytes, { mergePages: true });
    const text = (result.text ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
    return text ? { ok: true, text } : { ok: false, error: "Resume PDF must contain selectable text." };
  } catch (error) {
    return { ok: false, error: `PDF extraction failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}
