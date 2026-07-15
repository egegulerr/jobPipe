import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { assetsDir } from "@/server/local/database";

export const runtime = "nodejs";

function imageContentType(buffer: Buffer) {
  if (buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return "image/png";
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg";
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
  if (name !== path.basename(name) || name.includes("\\")) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const filePath = path.join(assetsDir, name);
  if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const contentType = imageContentType(buffer);
  if (!contentType) return NextResponse.json({ error: "Unsupported file" }, { status: 415 });

  return new Response(buffer, { headers: { "content-type": contentType, "cache-control": "private, no-store" } });
}
