import { describe, expect, it } from "vitest";
import { normalizeIndeedJob, normalizeLinkedInJob } from "../jobs";

describe("job normalizers metadata", () => {
  it("parses linkedin salary range and applicants count", () => {
    const job = normalizeLinkedInJob({
      id: "li-1",
      title: "Data Analyst",
      companyName: "Meta",
      salaryInfo: ["$17.00", "$19.00"],
      applicantsCount: "200 applicants",
      location: "Los Angeles Metropolitan Area",
      employmentType: "Contract",
      seniorityLevel: "Associate",
    });

    expect(job.salary_min).toBe(17);
    expect(job.salary_max).toBe(19);
    expect(job.salary_currency).toBe("USD");
    expect(job.salary_text).toBe("$17.00 - $19.00");
    expect(job.applicants_count).toBe(200);
  });

  it("keeps linkedin applicants count null when it is not parsable", () => {
    const job = normalizeLinkedInJob({
      id: "li-2",
      title: "Data Analyst",
      companyName: "Meta",
      applicantsCount: "Many applicants",
    });

    expect(job.applicants_count).toBeNull();
  });

  it("reads linkedin description text/html from object form payload", () => {
    const job = normalizeLinkedInJob({
      id: "li-3",
      title: "Data Analyst",
      companyName: "Meta",
      description: {
        text: "Plain description",
        html: "<p>HTML description</p>",
      },
    });

    expect(job.description_text).toBe("Plain description");
    expect(job.description_html).toBe("<p>HTML description</p>");
  });

  it("parses indeed base salary fields", () => {
    const job = normalizeIndeedJob({
      key: "ind-1",
      title: "Quantitative Analyst",
      employer: { name: "Citi" },
      baseSalary: {
        min: 175000,
        max: 250000,
        unitOfWork: "YEAR",
        currencyCode: "USD",
      },
    });

    expect(job.salary_min).toBe(175000);
    expect(job.salary_max).toBe(250000);
    expect(job.salary_currency).toBe("USD");
    expect(job.salary_unit).toBe("YEAR");
    expect(job.salary_text).toBe("USD 175000 - 250000");
  });

  it("formats indeed location from structured location payload", () => {
    const job = normalizeIndeedJob({
      key: "ind-2",
      title: "Quantitative Analyst",
      employer: { name: "Citi" },
      location: {
        city: "New York",
        admin1Code: "NY",
        countryName: "United States",
      },
    });

    expect(job.location_text).toBe("New York, NY, United States");
  });
});
