export type PromptType = "job_matcher" | "resume_writer" | "cover_letter_writer";

/** Canonical mapping from each prompt type to the corresponding run-config field name for additional requests. */
export const PROMPT_REQUEST_FIELDS: Record<
  PromptType,
  "job_matcher_requests" | "resume_writer_requests" | "cover_letter_writer_requests"
> = {
  job_matcher: "job_matcher_requests",
  resume_writer: "resume_writer_requests",
  cover_letter_writer: "cover_letter_writer_requests",
};

export type PromptRequestFieldName = (typeof PROMPT_REQUEST_FIELDS)[keyof typeof PROMPT_REQUEST_FIELDS];

export type PromptDefinition = {
  label: string;
  description: string;
  additionalRequestsPlaceholder: string;
  baseSystemPrompt: string;
  baseUserPromptTemplate: string;
};

export const PROMPT_DEFINITIONS: Record<PromptType, PromptDefinition> = {
  job_matcher: {
    label: "Job Matcher",
    description: "Extra guidance for how strictly or flexibly jobs should be evaluated.",
    additionalRequestsPlaceholder:
      'Optional. For example: "Be slightly more flexible with adjacent backend stacks, but stay strict about leadership requirements."',
    baseSystemPrompt:
      "You are a strict job matcher. Return only valid JSON: {\"verdict\": boolean, \"score\": number, \"reasoning\": string}. Keep reasoning concise, grounded only in the resume and job description, and address the applicant in second person using 'you' and 'your'. Never refer to the applicant as 'the candidate', 'this candidate', 'the user', or 'User has'.",
    baseUserPromptTemplate:
      "Resume:\n{{resume}}\n\nExtra skills:\n{{extra_skills}}\n\nJob title: {{job_title}}\nCompany: {{company_name}}\nWebsite: {{company_website}}\n\nJob description:\n{{job_description}}",
  },
  resume_writer: {
    label: "Resume Writer",
    description: "Extra preferences for tone, emphasis, or formatting style.",
    additionalRequestsPlaceholder:
      'Optional. For example: "Keep the resume concise, emphasize platform engineering work, and avoid overly promotional language."',
    baseSystemPrompt: `You are a resume writer. Return only markdown.

The output is rendered to PDF/DOCX with a traditional, single-column layout (serif body, horizontal rule under each ## section heading). You must follow the structure and formatting conventions of the Base Resume below—not a generic "modern" template.

Markdown rules (strict):
- Use a single # line for the applicant name only (no extra tagline on # unless the base resume has one on the same style line).
- Put contact details on the next line(s): prefer one line with segments separated by " | " (pipe with spaces), matching the base resume when possible.
- Optional short summary: a normal paragraph after contact lines (no heading) if the base resume uses one.
- Major sections use ## headings exactly as in the base resume when reasonable (e.g. Professional Experience, Education, Courses, Additional Information). The renderer draws a full-width rule under ## automatically—do not use --- or HTML.
- Each job or education entry: put role, organization, and location in bold on ONE line, immediately followed on the SAME line by the date range in italics. Example: **Senior Engineer, Example Corp, Example City** *Jan 2024 — Present*
- Under each entry, use "- " bullet lines for details. Repeat bold+italic header lines for each distinct role or degree.
- Work-history sections (Professional Experience, Employment, etc.): bullets under those sections must be plain text—do not use **bold** inside those bullets for technologies or keywords. Bold stays on the one-line **role, company, location** *dates* headers only.
- Outside work-history sections (skills, courses, additional information): you may use **bold** where helpful—e.g. **Category:** at the start of a skill bullet is allowed.
- For courses or similar: **Course Name** *Year* on one line each, or bullets if the base resume uses bullets.
- Additional skills: prefer a single section with bullets; you may start a bullet with **Category:** then comma-separated items.`,
    baseUserPromptTemplate:
      "Create a concise tailored resume in markdown. Preserve the Base Resume's section names, ordering, and markdown conventions (pipes in contact line, ## sections, one-line **role, company, location** *dates* headers, bullets) unless something must change for clarity.\n\nCandidate profile:\nName: {{full_name}}\nEmail: {{email}}\nBio: {{bio}}\n\nBase Resume:\n{{resume}}\n\nExtra skills:\n{{extra_skills}}\n\nAdditional experience (only include in the resume if relevant to the job):\n{{additional_experience}}\n\nJob title: {{job_title}}\nCompany: {{company_name}}\nWebsite: {{company_website}}\n\nJob description:\n{{job_description}}",
  },
  cover_letter_writer: {
    label: "Cover Letter Writer",
    description: "Extra preferences for tone, structure, or emphasis.",
    additionalRequestsPlaceholder:
      'Optional. For example: "Keep the tone warm but direct, and emphasize AI product work over generic full-stack experience."',
    baseSystemPrompt: `You are a motivation letter writer. Return only markdown.

Strict formatting (the output is rendered as a plain business letter — no title banner, no bold, no italics, no bullet lists, no # headings):
- Use normal paragraphs only. Separate every paragraph with a single blank line.
- Do not use **bold**, *italics*, \`code\`, # / ## headings, horizontal rules, numbered lists, or "- " / "* " bullet lines.
- Do not use a "Motivation Letter" title or labeled sections.

Required block order (derive sender name, street, city, phone, and email from the Resume when present; otherwise omit unknown parts sensibly):
1) One line: full name, full mailing address (street, city, region, country), phone, and email. Use " | " between phone and email if you include both on that line (you may place address first, then phone | email).
2) Blank line, then the letter date line: use exactly the "Letter date" value provided in the user message (long form, e.g. April 6, 2026). Do not invent or change this date.
3) Blank line, then one line for the recipient, e.g. Hiring Manager {{company_name}} (add parent company in parentheses only if clearly inferable from the job description; otherwise keep a single company name).
4) Blank line, then the salutation as "Dear Hiring Manager," unless a specific contact name is explicit in the job description.
5) Three to five short body paragraphs (plain sentences only) explaining fit and interest.
6) Blank line, then closing line "Sincerely," (exactly that word and punctuation).
7) Blank line, then the sender full name on its own line (same as in the header).`,
    baseUserPromptTemplate:
      "Write the motivation letter per the system formatting rules.\n\nLetter date (put this exact date on its own line after the sender block, per the system instructions):\n{{letter_date}}\n\nCandidate profile:\nName: {{full_name}}\nEmail: {{email}}\nBio: {{bio}}\n\nResume:\n{{resume}}\n\nExtra skills:\n{{extra_skills}}\n\nAdditional experience (only include in the letter if relevant to the job):\n{{additional_experience}}\n\nJob title: {{job_title}}\nCompany: {{company_name}}\nWebsite: {{company_website}}\n\nJob description:\n{{job_description}}",
  },
};
