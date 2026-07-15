import { openRouterText } from "@/server/local/openrouter";
import {
  ParsedResumeSchema,
  type ParsedResume,
} from "@/server/domains/resume-parse/resume-parse.schema";

/** Cap extracted resume text before LLM inference (matches document render limits in spirit). */
const MAX_RESUME_TEXT_CHARS = 120_000;

const RESUME_PARSE_SYSTEM_PROMPT = `You are a resume parser. Extract structured data from resume text and return ONLY valid JSON matching the schema below. Do not include markdown fences, explanations, or any text outside the JSON.

IMPORTANT: Do NOT alter, rewrite, paraphrase, or summarize any text from the resume. Keep all descriptions, titles, and organization names exactly as written in the original resume.

{
  "profile": {
    "firstName": string | null,
    "lastName": string | null,
    "bio": string | null
  },
  "experiences": [
    {
      "type": "experience" | "education",
      "title": string,
      "organization": string | null,
      "dateRange": string | null,
      "description": string | null
    }
  ],
  "technologies": [
    {
      "name": string
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuer": string | null,
      "issueDate": string | null,
      "description": string | null
    }
  ],
  "skills": [
    {
      "name": string,
      "context": string | null,
      "description": string | null
    }
  ],
  "languages": [
    {
      "name": string,
      "proficiency": "Native" | "Fluent" | "Intermediate" | "Basic"
    }
  ]
}

Rules:
- Include both work experience AND education in "experiences"
- Set experience "type" to "experience" for jobs and "education" for schools, degrees, and training
- For education entries, use the degree name as "title" and the institution as "organization"
- Normalize date ranges to "Mon D, YYYY - Mon D, YYYY" or "Mon D, YYYY - Present". Use regular hyphen with spaces around it. Always include the day (1 if not specified). Examples: "Jan 15, 2023 - Mar 20, 2025" or "Jun 1, 2021 - Present"
- For "technologies", capture single-word technical skills, tools, and frameworks (e.g. Azure, Kubernetes, React, Python, Docker). Keep each as a single word or short phrase.
- For "certifications", capture professional certifications with their issuing organization, issue date, and any description. Do NOT put certifications in "technologies" or "skills".
- For "skills", capture ONLY additional work experiences the user had (not technical skills, not certifications). These represent roles or projects that could supplement the main experience list.
- For "languages", extract spoken languages with proficiency level; infer from context if not explicitly stated
- For experience "description", return ONLY plain text. Remove bullet points (●, •, -, *, etc.), numbering, markdown formatting, and special characters. Convert lists into flowing plain text paragraphs with natural sentence structure.
- For "bio", if the resume does not contain an explicit bio/summary section, generate a concise 2-3 sentence professional bio based on the person's job titles, key technologies, and overall experience level extracted from the resume
- Set fields to null when information is not present in the resume (except bio, which should be generated)
- Return ONLY valid JSON, no other text`;

export async function parseResumeText(
  text: string,
): Promise<{ ok: true; data: ParsedResume } | { ok: false; error: string }> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: "Resume PDF must contain selectable text." };
  }

  const cappedText =
    trimmed.length > MAX_RESUME_TEXT_CHARS ? trimmed.slice(0, MAX_RESUME_TEXT_CHARS) : trimmed;

  try {
    const raw = await openRouterText({ kind: "writing", json: true, system: RESUME_PARSE_SYSTEM_PROMPT, user: `Resume text:\n${cappedText}` });
    const data = ParsedResumeSchema.parse(JSON.parse(raw));

    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI parsing error";
    return { ok: false, error: `AI parsing failed: ${message}` };
  }
}
