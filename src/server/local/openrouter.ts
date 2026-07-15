import { getLocalConfig } from "./config";

export async function openRouterText(input: {
  system: string;
  user: string;
  kind: "matching" | "writing";
  json?: boolean;
}) {
  const config = getLocalConfig();
  if (!config.openRouterApiKey) throw new Error("OpenRouter is not configured. Open /setup first.");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.openRouterApiKey}`,
      "content-type": "application/json",
      "http-referer": "http://localhost:3000",
      "x-title": "Job Pipe Local",
    },
    body: JSON.stringify({
      model: input.kind === "matching" ? config.matchingModel : config.writingModel,
      messages: [{ role: "system", content: input.system }, { role: "user", content: input.user }],
      ...(input.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!response.ok) throw new Error(`OpenRouter request failed (${response.status}): ${await response.text()}`);
  const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const text = body.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenRouter returned no text.");
  return text.replace(/^```(?:json|markdown)?\s*/i, "").replace(/\s*```$/, "").trim();
}
