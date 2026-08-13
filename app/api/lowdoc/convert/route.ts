import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "server-side conversion disabled — conversions run fully in-browser (WASM)" },
    { status: 501 },
  );
}