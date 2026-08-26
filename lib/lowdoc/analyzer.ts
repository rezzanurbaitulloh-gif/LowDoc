/* Document Analyzer (PRD §10-11) + Fidelity comparison (PRD §23).
   Cheap, local inspection: PDF via pdf.js, images via createImageBitmap. */

import { matchPaper, formatMm, type PaperMatch } from "./paper";

export interface FileAnalysis {
  kind: "pdf" | "image" | "other";
  pages?: number;
  widthMm?: number;
  heightMm?: number;
  paper?: string; // "A4 (portrait)" | "Custom 210 × 315 mm" | pixel dims for images
  widthPx?: number;
  heightPx?: number;
}

const PX_TO_MM = 25.4 / 72; // pdf.js viewports are in CSS px at 72dpi units

export async function analyzeFile(file: File): Promise<FileAnalysis | null> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const bytes = new Uint8Array(await file.arrayBuffer());
  return analyzeBytes(bytes, ext);
}

export async function analyzeBlob(blob: Blob, name: string): Promise<FileAnalysis | null> {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return analyzeBytes(bytes, ext);
}

export async function analyzeBytes(bytes: Uint8Array, ext: string): Promise<FileAnalysis | null> {
  try {
    if (ext === "pdf") return await analyzePdfBytes(bytes);
    if (["png", "jpg", "jpeg", "webp", "gif", "bmp"].includes(ext)) return await analyzeBytesImage(bytes, ext);
  } catch {
    return null;
  }
  return null;
}

async function analyzePdfBytes(bytes: Uint8Array): Promise<FileAnalysis> {
  const { ensurePdfJs } = await import("./engines");
  await ensurePdfJs();
  const pdfjs = await import("pdfjs-dist");
  const doc = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const pageCount = doc.numPages;
  const page = await doc.getPage(1);
  const vp = page.getViewport({ scale: 1 });
  const wMm = vp.width * PX_TO_MM;
  const hMm = vp.height * PX_TO_MM;
  const match: PaperMatch | "custom" = matchPaper(wMm, hMm);
  const paper =
    match === "custom"
      ? `Custom ${formatMm(wMm, hMm)}`
      : `${match.paper.name} (${match.orientation})`;
  doc.destroy();
  return { kind: "pdf", pages: pageCount, widthMm: wMm, heightMm: hMm, paper };
}

async function analyzeBytesImage(bytes: Uint8Array, ext: string): Promise<FileAnalysis> {
  const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
  const bmp = await createImageBitmap(new Blob([bytes as unknown as BlobPart], { type: mime }));
  const out: FileAnalysis = { kind: "image", widthPx: bmp.width, heightPx: bmp.height };
  bmp.close();
  return out;
}

export function describeAnalysis(a: FileAnalysis | null): string {
  if (!a) return "";
  if (a.kind === "pdf") return `${a.pages} page(s) · ${a.paper}`;
  if (a.kind === "image") return `${a.widthPx} × ${a.heightPx} px`;
  return "";
}

export interface FidelityReport {
  verdict: "match" | "changed" | "unknown";
  line: string;
}

/** Compare source vs output analysis after a conversion (PRD §23). */
export function compareAnalyses(src: FileAnalysis | null, out: FileAnalysis | null): FidelityReport {
  if (!src || !out) return { verdict: "unknown", line: "" };

  if (src.kind === "image" && out.kind === "image") {
    const same = src.widthPx === out.widthPx && src.heightPx === out.heightPx;
    return {
      verdict: same ? "match" : "changed",
      line: same
        ? `${src.widthPx}×${src.heightPx} → ${out.widthPx}×${out.heightPx} px · dimensions preserved`
        : `${src.widthPx}×${src.heightPx} → ${out.widthPx}×${out.heightPx} px · dimensions changed`,
    };
  }

  if (src.kind === "pdf" && out.kind === "pdf") {
    const samePages = src.pages === out.pages;
    const samePaper = src.paper === out.paper;
    const bits: string[] = [];
    bits.push(`${src.pages ?? "?"} → ${out.pages ?? "?"} page(s)`);
    bits.push(samePaper ? `${src.paper} preserved` : `${src.paper} → ${out.paper}`);
    return {
      verdict: samePages && samePaper ? "match" : "changed",
      line: bits.join(" · "),
    };
  }

  if (out.kind === "pdf") {
    return { verdict: "unknown", line: `output: ${out.pages ?? "?"} page(s) · ${out.paper}` };
  }
  if (out.kind === "image") {
    return { verdict: "unknown", line: `output: ${out.widthPx}×${out.heightPx} px` };
  }
  return { verdict: "unknown", line: "" };
}
