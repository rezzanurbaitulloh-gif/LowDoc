import { NextResponse } from "next/server";

// Static health check - in production, this would be checked client-side or via a separate service
export async function GET() {
  return NextResponse.json(
    { status: "ok", version: "static-export", note: "Office health check runs client-side in production" },
    { headers: { "Cache-Control": "no-store" } }
  );
}