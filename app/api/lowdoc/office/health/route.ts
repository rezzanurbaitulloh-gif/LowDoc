import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const execFileAsync = promisify(execFile);
    const { stdout } = await execFileAsync("soffice", ["--version"], { timeout: 8_000 });
    const version = String(stdout).trim().split("\n")[0] ?? "unknown";
    return NextResponse.json({ status: "ok", version }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { headers: { "Cache-Control": "no-store" } });
  }
}