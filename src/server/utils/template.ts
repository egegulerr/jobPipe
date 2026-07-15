export function renderTemplate(
  template: string,
  values: Record<string, string | null | undefined>,
): string {
  let output = template;
  for (const [key, rawValue] of Object.entries(values)) {
    output = output.split(`{{${key}}}`).join(rawValue ?? "");
  }
  return output;
}
