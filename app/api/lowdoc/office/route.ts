import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readdir, rm, writeFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const execFileAsync = promisify(execFile);
const OFFICE_TIMEOUT_MS = 90_000;
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

const TO_EXT: Record<string, string> = {
  pdf: "pdf",
  docx: "docx",
  doc: "doc",
  docm: "docm",
  dotx: "dotx",
  odt: "odt",
  rtf: "rtf",
  txt: "txt",
  html: "html",
  epub: "epub",
  md: "md",
  pptx: "pptx",
  ppt: "ppt",
  ppsx: "ppsx",
  odp: "odp",
  xlsx: "xlsx",
  xls: "xls",
  xlsm: "xlsm",
  xlsb: "xlsb",
  ods: "ods",
  csv: "csv",
  tsv: "tsv",
  png: "png",
  jpg: "jpg",
  svg: "svg",
};

export const runtime = "nodejs";

let loProfileDir: string | null = null;
async function getLoProfile(): Promise<string> {
  if (!loProfileDir) {
    const { mkdirSync } = await import("node:fs");
    loProfileDir = join(tmpdir(), "lowdoc-lo-profile");
    try {
      mkdirSync(loProfileDir, { recursive: true });
    } catch {
      /* noop */
    }
  }
  return loProfileDir;
}

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const file = fd.get("file");
  const toRaw = fd.get("to");

  if (!(file instanceof File) || !toRaw) {
    return NextResponse.json({ error: "missing file or target" }, { status: 400 });
  }
  const to = String(toRaw);
  const ext = TO_EXT[to];
  if (!ext) {
    return NextResponse.json({ error: `unsupported target: ${to}` }, { status: 400 });
  }
  const inputName = file.name;
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength === 0) {
    return NextResponse.json({ error: "empty file" }, { status: 400 });
  }
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "file exceeds 200 MB server-assisted limit" }, { status: 413 });
  }

  let dir: string | null = null;
  try {
    dir = await mkdtemp(join(tmpdir(), "lowdoc-office-"));
    const inPath = join(dir, inputName.replace(/[^A-Za-z0-9._-]/g, "_"));
    await writeFile(inPath, bytes);

    await execFileAsync(
      "soffice",
      [
        "--headless",
        "--norestore",
        "-env:UserInstallation=file://" + (await getLoProfile()),
        ...(inputName.toLowerCase().endsWith(".pdf")
          ? ["--infilter=writer_pdf_import"]
          : []),
        "--convert-to",
        ext,
        "--outdir",
        dir,
        inPath,
      ],
      {
        timeout: OFFICE_TIMEOUT_MS,
        maxBuffer: 32 * 1024 * 1024,
      },
    );

    // Cari file hasil konversi — hanya file (bukan direktori) yang diterima.
    let outName: string | null = null;
    const entries = await readdir(dir);
    const files = [];
    for (const name of entries) {
      const full = join(dir, name);
      try {
        const st = await stat(full);
        if (st.isFile()) files.push(name);
      } catch {
        /* entry vanished between readdir and stat — skip */
      }
    }
    if (!files.length) {
      return NextResponse.json({ error: "office: no output produced" }, { status: 500 });
    }
    const base = inputName.replace(/\.[^.]+$/, "");
    const match = files.find((n) => n.toLowerCase() === `${base}.${ext}`.toLowerCase()) ?? files[0] ?? "";
    if (!match) {
      return NextResponse.json({ error: "office: output missing" }, { status: 500 });
    }
    outName = match;

    const outBytes = await import("node:fs/promises").then((m) => m.readFile(join(dir as string, match)));
    const mime =
      ext === "pdf"
        ? "application/pdf"
        : ext === "csv"
          ? "text/csv"
          : ext === "tsv"
            ? "text/tab-separated-values"
            : ext === "html"
              ? "text/html"
              : "application/octet-stream";

    const safeOutName = outName.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 200) || `output.${ext}`;
    return new NextResponse(new Uint8Array(outBytes), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${safeOutName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const timedOut = String(message).includes("timeout");
    return NextResponse.json(
      { error: `office: ${timedOut ? "timed out after 90s" : message}` },
      { status: 500 },
    );
  } finally {
    if (dir) {
      rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  }
}