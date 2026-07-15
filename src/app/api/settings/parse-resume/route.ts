import { errorJson, okJson } from "@/server/http/api-response";
import { parseResumeText } from "@/server/services/resume-parse-service";
import { extractResumeText } from "@/server/clients/pdf-text-extract/pdf-text-extract-client";

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorJson("Invalid form data", 400);
  }

  const file = formData.get("resume") as File | null;

  if (!file || file.size === 0) {
    return errorJson("Resume file is required", 400);
  }

  if (file.size > 5 * 1024 * 1024) {
    return errorJson("Resume file exceeds 5MB size limit", 400);
  }

  if (file.type && file.type !== "application/pdf") {
    return errorJson("Only PDF files are supported", 400);
  }

  const normalizedFileName = file.name.toLowerCase();
  if (!normalizedFileName.endsWith(".pdf")) {
    return errorJson("Only PDF files are supported", 400);
  }

  const pdfBytes = new Uint8Array(await file.arrayBuffer());
  const extraction = await extractResumeText(pdfBytes);

  if (!extraction.ok) {
    return errorJson(extraction.error, 422);
  }

  const result = await parseResumeText(extraction.text);

  if (!result.ok) {
    return errorJson(result.error, 422);
  }

  return okJson(result.data);
}
