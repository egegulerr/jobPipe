import { NextResponse } from "next/server";
import { z } from "zod";
import { publicLocalConfig, updateLocalConfig } from "@/server/local/config";

export const runtime = "nodejs";

const setupSchema = z.object({
  apifyApiToken: z.string().trim().min(1).optional(),
  openRouterApiKey: z.string().trim().min(1).optional(),
  linkedinActor: z.string().trim().min(1).optional(),
  indeedActor: z.string().trim().min(1).optional(),
  matchingModel: z.string().trim().min(1).optional(),
  writingModel: z.string().trim().min(1).optional(),
});

export async function GET() {
  return NextResponse.json(publicLocalConfig());
}

export async function PUT(request: Request) {
  const parsed = setupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid setup values" }, { status: 400 });
  }
  updateLocalConfig(parsed.data);
  return NextResponse.json(publicLocalConfig());
}
