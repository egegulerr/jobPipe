function parseNumberToken(input: string): number | null {
  const normalized = input.replace(/,/g, "").trim();
  if (!normalized) {
    return null;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function parseNumbersFromText(input: string): number[] {
  return (input.match(/\d[\d,.]*/g) ?? [])
    .map((token) => parseNumberToken(token))
    .filter((value): value is number => value !== null);
}

function parseApplicantsCount(input: unknown): number | null {
  if (typeof input === "number" && Number.isFinite(input)) {
    return Math.max(0, Math.round(input));
  }

  if (typeof input !== "string") {
    return null;
  }

  const numbers = parseNumbersFromText(input);
  return numbers[0] ?? null;
}

function parseLinkedInSalary(input: unknown): {
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_unit: string | null;
  salary_text: string | null;
} {
  const values =
    Array.isArray(input) && input.length > 0
      ? input.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : [];
  const salaryText = values.length > 0 ? values.join(" - ") : null;
  const parsed = values.flatMap((value) => parseNumbersFromText(value));

  const salaryMin = parsed.length > 0 ? Math.min(...parsed) : null;
  const salaryMax = parsed.length > 0 ? Math.max(...parsed) : null;
  const hasUsdSymbol = values.some((value) => value.includes("$"));

  return {
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_currency: hasUsdSymbol ? "USD" : null,
    salary_unit: null,
    salary_text: salaryText,
  };
}

function formatIndeedLocation(input: unknown, employer: Record<string, unknown>): string | null {
  if (typeof input === "string" && input.trim()) {
    return input.trim();
  }

  if (typeof input !== "object" || !input) {
    const address = typeof employer.address === "string" ? employer.address.trim() : "";
    return address || null;
  }

  const location = input as Record<string, unknown>;
  const city = typeof location.city === "string" ? location.city.trim() : "";
  const admin1 = typeof location.admin1Code === "string" ? location.admin1Code.trim() : "";
  const country = typeof location.countryName === "string" ? location.countryName.trim() : "";
  const parts = [city, admin1, country].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  const address = typeof employer.address === "string" ? employer.address.trim() : "";
  return address || null;
}

function parseIndeedSalary(input: unknown): {
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_unit: string | null;
  salary_text: string | null;
} {
  if (typeof input !== "object" || !input) {
    return {
      salary_min: null,
      salary_max: null,
      salary_currency: null,
      salary_unit: null,
      salary_text: null,
    };
  }

  const baseSalary = input as Record<string, unknown>;
  const min = typeof baseSalary.min === "number" && Number.isFinite(baseSalary.min) ? baseSalary.min : null;
  const max = typeof baseSalary.max === "number" && Number.isFinite(baseSalary.max) ? baseSalary.max : null;
  const currencyCode = typeof baseSalary.currencyCode === "string" ? baseSalary.currencyCode : null;
  const unitOfWork = typeof baseSalary.unitOfWork === "string" ? baseSalary.unitOfWork : null;

  let salaryText: string | null = null;
  if (min !== null && max !== null) {
    salaryText = `${currencyCode ?? ""} ${min} - ${max}`.trim();
  } else if (min !== null) {
    salaryText = `${currencyCode ?? ""} ${min}`.trim();
  } else if (max !== null) {
    salaryText = `${currencyCode ?? ""} ${max}`.trim();
  }

  return {
    salary_min: min,
    salary_max: max,
    salary_currency: currencyCode,
    salary_unit: unitOfWork,
    salary_text: salaryText,
  };
}

export function normalizeLinkedInJob(item: Record<string, unknown>) {
  const companyWebsite =
    typeof item.companyWebsite === "string"
      ? item.companyWebsite
      : typeof item.companyUrl === "string"
        ? item.companyUrl
        : "";
  const salary = parseLinkedInSalary(item.salaryInfo);
  const descriptionObject =
    typeof item.description === "object" && item.description
      ? (item.description as Record<string, unknown>)
      : null;
  const descriptionText =
    typeof item.descriptionText === "string"
      ? item.descriptionText
      : typeof item.description_text === "string"
        ? item.description_text
        : typeof item.description === "string"
          ? item.description
          : descriptionObject && typeof descriptionObject.text === "string"
            ? descriptionObject.text
          : null;
  const descriptionHtml =
    typeof item.descriptionHtml === "string"
      ? item.descriptionHtml
      : typeof item.description_html === "string"
        ? item.description_html
        : descriptionObject && typeof descriptionObject.html === "string"
          ? descriptionObject.html
        : null;

  return {
    external_id: String(item.id ?? item.trackingId ?? ""),
    source: "linkedin" as const,
    title: String(item.title ?? ""),
    company_name: String(item.companyName ?? ""),
    company_website: companyWebsite || null,
    description_text: descriptionText,
    description_html: descriptionHtml,
    posted_at: String(item.postedAt ?? ""),
    link: String(item.link ?? ""),
    apply_url: String(item.applyUrl ?? ""),
    location_text: typeof item.location === "string" ? item.location : null,
    salary_min: salary.salary_min,
    salary_max: salary.salary_max,
    salary_currency: salary.salary_currency,
    salary_unit: salary.salary_unit,
    salary_text: salary.salary_text,
    applicants_count: parseApplicantsCount(item.applicantsCount),
    employment_type: typeof item.employmentType === "string" ? item.employmentType : null,
    seniority_level: typeof item.seniorityLevel === "string" ? item.seniorityLevel : null,
  };
}

export function normalizeIndeedJob(item: Record<string, unknown>) {
  const postedAt =
    typeof item.datePublished === "string"
      ? item.datePublished.split("T")[0]
      : typeof item.dateOnIndeed === "string"
        ? item.dateOnIndeed.split("T")[0]
        : "";

  const employer = typeof item.employer === "object" && item.employer ? (item.employer as Record<string, unknown>) : {};

  const companyWebsite =
    typeof item.companyWebsite === "string"
      ? item.companyWebsite
      : typeof employer.url === "string"
        ? employer.url
        : "";

  const stableKey = [
    String(item.key ?? item.id ?? ""),
    String(item.title ?? ""),
    String(employer.name ?? item.companyName ?? ""),
    String(item.url ?? item.link ?? ""),
    postedAt,
  ]
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  let hash = 5381;
  for (const char of stableKey) {
    hash = (hash << 5) + hash + char.charCodeAt(0);
    hash |= 0;
  }
  const fallbackExternalId = `indeed-${Math.abs(hash).toString(36)}`;
  const salary = parseIndeedSalary(item.baseSalary);
  const descriptionObj =
    typeof item.description === "object" && item.description ? (item.description as Record<string, unknown>) : null;
  const descriptionText =
    typeof item.descriptionText === "string"
      ? item.descriptionText
      : typeof item.description_text === "string"
        ? item.description_text
        : typeof item.description === "string"
          ? item.description
          : typeof descriptionObj?.text === "string"
            ? descriptionObj.text
            : null;
  const descriptionHtml =
    typeof item.descriptionHtml === "string"
      ? item.descriptionHtml
      : typeof item.description_html === "string"
        ? item.description_html
        : typeof descriptionObj?.html === "string"
          ? descriptionObj.html
          : null;

  return {
    external_id: String(item.key ?? item.id ?? fallbackExternalId),
    source: "indeed" as const,
    title: String(item.title ?? ""),
    company_name: String(employer.name ?? item.companyName ?? ""),
    company_website: companyWebsite || null,
    description_text: descriptionText,
    description_html: descriptionHtml,
    posted_at: postedAt,
    link: String(item.url ?? item.link ?? ""),
    apply_url: String(item.jobUrl ?? item.applyUrl ?? item.url ?? ""),
    location_text: formatIndeedLocation(item.location, employer),
    salary_min: salary.salary_min,
    salary_max: salary.salary_max,
    salary_currency: salary.salary_currency,
    salary_unit: salary.salary_unit,
    salary_text: salary.salary_text,
    applicants_count: parseApplicantsCount(item.applicantsCount),
    employment_type:
      typeof item.employmentType === "string"
        ? item.employmentType
        : typeof item.jobType === "string"
          ? item.jobType
          : null,
    seniority_level: typeof item.seniorityLevel === "string" ? item.seniorityLevel : null,
  };
}
