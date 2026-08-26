"use client";

import { PDFDocument } from "pdf-lib";
import { pickEngine, findPath, type LowDocTarget } from "./matrix";

export type EngineId =
  | "pandoc"
  | "magick"
  | "pdflib"
  | "pdfjs"
  | "pdftext"
  | "dxf"
  | "sheets"
  | "mammoth"
  | "office"
  | "bridge";

export type EngineEventType = "info" | "success" | "warn" | "error" | "progress";

export interface EngineEvent {
  type: EngineEventType;
  message: string;
  progress?: number;
}

export type EngineEventHandler = (event: EngineEvent) => void;

export interface OfficeApi {
  status: "ok" | "unavailable";
  version?: string;
  error?: string;
}

/* ── helpers ─────────────────────────────────────────────────────────── */

const MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
  epub: "application/epub+zip",
  html: "text/html",
  md: "text/markdown",
  txt: "text/plain",
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  json: "application/json",
  xml: "application/xml",
  svg: "image/svg+xml",
  rtf: "application/rtf",
  tex: "application/x-tex",
  org: "text/x-org",
  rst: "text/x-rst",
  adoc: "text/asciidoc",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  ico: "image/x-icon",
  tiff: "image/tiff",
  heic: "image/heic",
  bmp: "image/bmp",
  doc: "application/msword",
  docm: "application/vnd.ms-word.document.macroEnabled.12",
  dotx: "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
  xls: "application/vnd.ms-excel",
  xlsm: "application/vnd.ms-excel.sheet.macroEnabled.12",
  xlsb: "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
  ppt: "application/vnd.ms-powerpoint",
  ppsx: "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  wpd: "application/vnd.wordperfect",
  sdw: "application/vnd.stardivision.writer",
  sxw: "application/vnd.sun.xml.writer",
  pages: "application/x-iwork-pages-sffpages",
  numbers: "application/x-iwork-numbers-sffnumbers",
  key: "application/x-iwork-keynote-sffkey",
};

export function mimeFor(ext: string): string {
  return MIME_TYPES[ext.toLowerCase().replace(/^\./, "")] ?? "application/octet-stream";
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n >= 100 || i === 0 ? Math.round(n) : n.toFixed(1)} ${units[i]}`;
}

export function downloadBytes(data: Uint8Array | string, filename: string, mime: string) {
  const blob =
    typeof data === "string"
      ? new Blob([data as unknown as BlobPart], { type: mime })
      : new Blob([data as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function emit(e: EngineEventHandler | undefined, event: EngineEvent) {
  if (e) e(event);
}

function inputExtension(name: string): string {
  const m = name.match(/\.([A-Za-z0-9]+)$/);
  return m ? m[1].toLowerCase() : "";
}

function outputNameFor(inputName: string, target: LowDocTarget): string {
  const base = inputName.replace(/\.[^.]+$/, "");
  return `${base}.${target}`;
}

async function toArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

/* ── Office availability ────────────────────────────────────────────── */

let _officeCache: OfficeApi | null = null;

export async function checkOffice(onEvent?: EngineEventHandler): Promise<OfficeApi> {
  if (_officeCache) return _officeCache;
  emit(onEvent, { type: "info", message: "Probing LibreOffice availability…" });
  try {
    const res = await fetch("/api/lowdoc/office/health", { cache: "no-store" });
    if (!res.ok) throw new Error(`health ${res.status}`);
    const api: OfficeApi = await res.json();
    if (api.status === "ok") {
      _officeCache = api;
      emit(onEvent, { type: "success", message: `LibreOffice online (${api.version ?? "?"})` });
    } else {
      _officeCache = api;
      emit(onEvent, { type: "warn", message: "LibreOffice unavailable — office fallback disabled" });
    }
    return _officeCache;
  } catch (err) {
    const api: OfficeApi = { status: "unavailable", error: String(err) };
    _officeCache = api;
    emit(onEvent, { type: "warn", message: "LibreOffice unavailable — office fallback disabled" });
    return api;
  }
}

export async function convertViaOffice(
  inputName: string,
  inputBytes: Uint8Array,
  to: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<Uint8Array> {
  emit(onEvent, { type: "info", message: `office: handing ${inputName} → ${to} to LibreOffice` });
  const fd = new FormData();
  fd.append("file", new Blob([inputBytes as unknown as BlobPart]), inputName);
  fd.append("to", to);
  const res = await fetch("/api/lowdoc/office", { method: "POST", body: fd });
  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j.error ?? "";
    } catch {
      /* noop */
    }
    throw new Error(`office route ${res.status} ${detail}`.trim());
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength === 0) {
    throw new Error(`office: LibreOffice produced an empty .${to} — source may be unreadable or target unsupported for this input`);
  }
  emit(onEvent, { type: "success", message: `office: converted to .${to} (${formatBytes(buf.byteLength)})` });
  return buf;
}

/* ── Pandoc (WASM) ──────────────────────────────────────────────────── */

let pandocReady = false;

async function ensurePandoc(): Promise<void> {
  if (pandocReady) return;
  await import("pandoc-wasm");
  pandocReady = true;
}

async function runPandoc(
  inputName: string,
  inputBytes: Uint8Array,
  to: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<Uint8Array> {
  await ensurePandoc();
  const { convert: pandocConvert } = await import("pandoc-wasm");
  const from = inputExtension(inputName);
  const reader: Record<string, string> = {
    md: "markdown",
    html: "html",
    txt: "markdown",
    tex: "latex",
    org: "org",
    rst: "rst",
    adoc: "asciidoc",
    json: "json",
    xml: "jats",
    csv: "csv",
    tsv: "tsv",
  };
  const writer: Partial<Record<LowDocTarget, string>> = {
    pdf: "pdf",
    docx: "docx",
    odt: "odt",
    html: "html",
    epub: "epub",
    md: "markdown",
    rtf: "rtf",
    tex: "latex",
    txt: "plain",
    org: "org",
    rst: "rst",
    adoc: "asciidoc",
    json: "json",
    xml: "jats",
    svg: "svg",
    xlsx: "xlsx",
    pptx: "pptx",
  };
  const textWriters = new Set<LowDocTarget>(["html", "md", "rtf", "tex", "txt", "org", "rst", "adoc", "json", "xml"]);
  const stdin = new TextDecoder().decode(inputBytes);
  const outName = `lowdoc-output.${to}`;
  const options: Record<string, unknown> = {
    from: reader[from] ?? "markdown",
    to: writer[to] ?? "markdown",
    "output-file": outName,
  };
  if (textWriters.has(to)) options.standalone = true;
  let result = await pandocConvert(options, stdin, {});
  let outBlob = result.files[outName];
  if (!outBlob && from === "json") {
    emit(onEvent, { type: "info", message: "pandoc: not a pandoc AST JSON — retrying as plain text" });
    options.from = "markdown";
    result = await pandocConvert(options, stdin, {});
    outBlob = result.files[outName];
  }
  if (!outBlob) {
    throw new Error(`pandoc: no output for .${to} (${result.stderr?.trim() || "conversion failed"})`);
  }
  const outSize = typeof outBlob === "string" ? outBlob.length : outBlob.size;
  if (outSize === 0) {
    throw new Error(`pandoc: empty output for .${to} (${result.stderr?.trim() || "no stderr"})`);
  }
  const data = await new Response(outBlob).arrayBuffer();
  emit(onEvent, { type: "success", message: `pandoc: ${inputName} → .${to} (${formatBytes(data.byteLength)})` });
  return new Uint8Array(data);
}

/* ── ImageMagick (WASM) ─────────────────────────────────────────────── */

let magickReady = false;

async function ensureMagick(): Promise<void> {
  if (magickReady) return;
  const { initializeImageMagick } = await import("@imagemagick/magick-wasm");
  const res = await fetch("/wasm-magick.wasm");
  if (!res.ok) throw new Error(`magick: failed to load /wasm-magick.wasm (${res.status})`);
  await initializeImageMagick(await res.arrayBuffer());
  magickReady = true;
}

const MAGICK_FORMAT_BY_EXT: Record<string, string> = {
  png: "Png",
  jpg: "Jpeg",
  jpeg: "Jpeg",
  webp: "WebP",
  gif: "Gif",
  tiff: "Tiff",
  tif: "Tiff",
  bmp: "Bmp",
  ico: "Ico",
  heic: "Heic",
  heif: "Heif",
};

async function runMagick(
  inputName: string,
  inputBytes: Uint8Array,
  to: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<Uint8Array> {
  await ensureMagick();
  const { ImageMagick, MagickFormat } = await import("@imagemagick/magick-wasm");
  const fmt = MagickFormat as unknown as Record<string, string>;
  const outKey = MAGICK_FORMAT_BY_EXT[to];
  const outFmt = outKey ? fmt[outKey] : undefined;
  if (!outFmt) throw new Error(`magick: unsupported output format .${to}`);
  const inKey = MAGICK_FORMAT_BY_EXT[inputExtension(inputName)];
  const inFmt = inKey ? fmt[inKey] : undefined;

  const data = (
    inFmt
      ? await ImageMagick.read(inputBytes, inFmt as never, (img) => {
          if (to === "ico" && (img.width > 256 || img.height > 256)) {
            const ratio = Math.min(256 / img.width, 256 / img.height);
            img.resize(Math.max(1, Math.round(img.width * ratio)), Math.max(1, Math.round(img.height * ratio)));
          }
          return img.write(outFmt as never, (d) => d.slice(0));
        })
      : await ImageMagick.read(inputBytes, (img) => img.write(outFmt as never, (d) => d.slice(0)))
  ) as Uint8Array;
  if (!data.byteLength) throw new Error("magick: empty output produced");
  emit(onEvent, { type: "success", message: `magick: ${inputName} → .${to} (${formatBytes(data.byteLength)})` });
  return data;
}

/* ── PDF-Lib ────────────────────────────────────────────────────────── */

async function runPdfLib(
  inputName: string,
  inputBytes: Uint8Array,
  to: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<Uint8Array> {
  if (to !== "pdf") throw new Error("pdflib: only pdf→pdf supported");
  const doc = await PDFDocument.load(inputBytes, { ignoreEncryption: true });
  const out = await doc.save({ useObjectStreams: true });
  emit(onEvent, { type: "success", message: `pdflib: ${inputName} normalized (${formatBytes(out.length)})` });
  return new Uint8Array(out);
}

/* ── pdf.js ─────────────────────────────────────────────────────────── */

let pdfjsReady = false;

async function runPdfText(
  inputName: string,
  inputBytes: Uint8Array,
  to: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<Uint8Array> {
  await ensurePdfJs();
  const pdfjsLib = await import("pdfjs-dist");
  const task = pdfjsLib.getDocument({ data: inputBytes });
  const pdf = await task.promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    const line = tc.items
      .map((it) => ("str" in it ? it.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (line) parts.push(line);
    emit(onEvent, { type: "progress", message: `pdftext: extracting page ${i}/${pdf.numPages}`, progress: i / pdf.numPages });
  }
  const text = parts.join("\n\n");
  if (!text) throw new Error("pdftext: no extractable text in PDF (image-only?)");
  emit(onEvent, { type: "success", message: `pdftext: extracted ${text.length} chars → .${to}` });
  return new TextEncoder().encode(text);
}

async function ensurePdfJs(): Promise<void> {
  if (pdfjsReady) return;
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  pdfjsReady = true;
}

async function runPdfJs(
  inputName: string,
  inputBytes: Uint8Array,
  to: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<Uint8Array> {
  await ensurePdfJs();
  const pdfjsLib = await import("pdfjs-dist");
  const task = pdfjsLib.getDocument({ data: inputBytes });
  const pdf = await task.promise;
  const pageCount = pdf.numPages;
  const canvases: HTMLCanvasElement[] = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    canvases.push(canvas);
    emit(onEvent, { type: "progress", message: `pdfjs: rasterizing page ${i}/${pageCount}`, progress: i / pageCount });
  }
  // render all pages onto a single tall canvas
  const totalHeight = canvases.reduce((s, c) => s + c.height, 0);
  const width = Math.max(...canvases.map((c) => c.width));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = totalHeight;
  const ctx = canvas.getContext("2d")!;
  let y = 0;
  for (const c of canvases) {
    ctx.drawImage(c, 0, y);
    y += c.height;
  }
  const targetExt = to === "jpg" ? "jpeg" : to === "webp" ? "webp" : "png";
  const dataUrl = canvas.toDataURL(`image/${targetExt}`, 0.92);
  const bin = atob(dataUrl.split(",")[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  emit(onEvent, { type: "success", message: `pdfjs: ${pageCount} pages → .${targetExt}` });
  return arr;
}

/* ── DXF ────────────────────────────────────────────────────────────── */

async function runDxf(
  inputName: string,
  inputBytes: Uint8Array,
  to: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<Uint8Array> {
  const { default: DxfParser } = await import("dxf-parser");
  const parser = new DxfParser();
  const text = new TextDecoder().decode(inputBytes);
  const dxf = parser.parseSync(text);
  if (!dxf) throw new Error("dxf: parse failed");
  if (to === "txt") {
    const entities = (dxf as { entities?: unknown[] }).entities ?? [];
    const lines: string[] = [`DXF drawing: ${entities.length} entities`];
    for (const e of entities.slice(0, 200)) {
      const ent = e as { type?: string; layer?: string };
      lines.push(`- ${ent.type ?? "UNKNOWN"} on layer ${ent.layer ?? "0"}`);
    }
    const out = lines.join("\n");
    emit(onEvent, { type: "success", message: `dxf: ${inputName} → txt (${entities.length} entities)` });
    return new TextEncoder().encode(out);
  }
  const { renderDxfToSvg } = await import("./dxf-render");
  const rendered = renderDxfToSvg(dxf);
  if (to === "svg") {
    emit(onEvent, { type: "success", message: `dxf: ${inputName} → svg (${rendered.entities} entities)` });
    return new TextEncoder().encode(rendered.svg);
  }
  // svg → pdf via browser canvas
  const blob = new Blob([rendered.svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("dxf: svg rasterization failed"));
    img.src = url;
  });
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.floor(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  const pdf = await PDFDocument.create();
  const png = canvas.toDataURL("image/png");
  const bin = atob(png.split(",")[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  const embedded = await pdf.embedPng(arr);
  const page = pdf.addPage([canvas.width, canvas.height]);
  page.drawImage(embedded, { x: 0, y: 0, width: canvas.width, height: canvas.height });
  const out = await pdf.save();
  emit(onEvent, { type: "success", message: `dxf: ${inputName} → pdf` });
  return new Uint8Array(out);
}

/* ── SheetJS ────────────────────────────────────────────────────────── */

async function runSheets(
  inputName: string,
  inputBytes: Uint8Array,
  to: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<Uint8Array> {
  const mod = await import("xlsx");
  const XLSX = mod.default ?? mod;
  const wb = XLSX.read(inputBytes, { type: "array" });
  if (to === "xlsx") {
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    emit(onEvent, { type: "success", message: `sheets: ${inputName} → xlsx` });
    return new Uint8Array(out);
  }
  if (to === "csv" || to === "tsv") {
    const sep = to === "csv" ? "," : "\t";
    const parts: string[] = [];
    for (const name of wb.SheetNames) {
      const sheet = wb.Sheets[name];
      if (!sheet) continue;
      const csv = XLSX.utils.sheet_to_csv(sheet, { FS: sep, blankrows: false });
      parts.push(csv);
    }
    const text = parts.join("\n");
    emit(onEvent, { type: "success", message: `sheets: ${inputName} → ${to}` });
    return new TextEncoder().encode(text);
  }
  if (to === "json") {
    const out: Record<string, unknown>[] = [];
    for (const name of wb.SheetNames) {
      const sheet = wb.Sheets[name];
      if (!sheet) continue;
      out.push({ sheet: name, rows: XLSX.utils.sheet_to_json(sheet) });
    }
    const text = JSON.stringify(out, null, 2);
    emit(onEvent, { type: "success", message: `sheets: ${inputName} → json` });
    return new TextEncoder().encode(text);
  }
  if (to === "html") {
    const parts: string[] = ["<html><body>"];
    for (const name of wb.SheetNames) {
      const sheet = wb.Sheets[name];
      if (!sheet) continue;
      parts.push(`<h2>${name}</h2>`, XLSX.utils.sheet_to_html(sheet));
    }
    parts.push("</body></html>");
    const text = parts.join("");
    emit(onEvent, { type: "success", message: `sheets: ${inputName} → html` });
    return new TextEncoder().encode(text);
  }
  throw new Error(`sheets: unsupported target ${to}`);
}

/* ── Mammoth ────────────────────────────────────────────────────────── */

async function runMammoth(
  inputName: string,
  inputBytes: Uint8Array,
  to: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<Uint8Array> {
  const mod = await import("mammoth");
  const mammoth = mod.default ?? mod;
  if (to === "html") {
    const result = await mammoth.convertToHtml({ arrayBuffer: inputBytes.buffer as ArrayBuffer });
    emit(onEvent, { type: "success", message: `mammoth: ${inputName} → html (${result.messages.length} msgs)` });
    return new TextEncoder().encode(result.value);
  }
  if (to === "txt") {
    const result = await mammoth.extractRawText({ arrayBuffer: inputBytes.buffer as ArrayBuffer });
    emit(onEvent, { type: "success", message: `mammoth: ${inputName} → txt` });
    return new TextEncoder().encode(result.value);
  }
  throw new Error(`mammoth: unsupported target ${to}`);
}

/* ── dispatcher (direct + multi-hop universal router) ───────────────── */

async function runBridge(
  inputName: string,
  inputBytes: Uint8Array,
  to: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<Uint8Array> {
  if (to === "csv") {
    const text = new TextDecoder("utf-8").decode(inputBytes);
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const esc = (s: string) =>
      s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    const csv = lines.map(esc).join("\n") + "\n";
    emit(onEvent, { type: "success", message: `bridge: text → csv (${lines.length} rows)` });
    return new TextEncoder().encode(csv);
  }
  if (to === "svg") {
    const mime =
      /\.jpe?g$/i.test(inputName)
        ? "image/jpeg"
        : /\.gif$/i.test(inputName)
          ? "image/gif"
          : /\.webp$/i.test(inputName)
            ? "image/webp"
            : /\.bmp$/i.test(inputName)
              ? "image/bmp"
              : "image/png";
    const blob = new Blob([inputBytes as unknown as BlobPart], { type: mime });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image decode failed"));
        img.src = url;
      });
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
        `<image width="${w}" height="${h}" href="${dataUrl}"/></svg>`;
      emit(onEvent, { type: "success", message: `bridge: image → svg (${w}x${h})` });
      return new TextEncoder().encode(svg);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  throw new Error(`bridge: unsupported target ${to}`);
}

async function runEngine(
  engine: EngineId,
  inputName: string,
  inputBytes: Uint8Array,
  target: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<Uint8Array> {
  switch (engine) {
    case "pandoc":
      return runPandoc(inputName, inputBytes, target, onEvent);
    case "magick":
      return runMagick(inputName, inputBytes, target, onEvent);
    case "pdflib":
      return runPdfLib(inputName, inputBytes, target, onEvent);
    case "pdfjs":
      return runPdfJs(inputName, inputBytes, target, onEvent);
    case "pdftext":
      return runPdfText(inputName, inputBytes, target, onEvent);
    case "dxf":
      return runDxf(inputName, inputBytes, target, onEvent);
    case "sheets":
      return runSheets(inputName, inputBytes, target, onEvent);
    case "mammoth":
      return runMammoth(inputName, inputBytes, target, onEvent);
    case "office":
      return convertViaOffice(inputName, inputBytes, target, onEvent);
    case "bridge":
      return runBridge(inputName, inputBytes, target, onEvent);
    default:
      throw new Error(`unknown engine: ${String(engine)}`);
  }
}

export interface ConversionOptions {
  /** target paper size in twips — applied to docx before the office→pdf hop */
  paper?: { w: number; h: number };
}

export async function runConversion(
  inputName: string,
  inputBytes: Uint8Array,
  target: LowDocTarget,
  onEvent?: EngineEventHandler,
  opts?: ConversionOptions,
): Promise<Uint8Array> {
  const ext = inputExtension(inputName);
  const base = inputName.replace(/\.[^.]+$/, "");

  if (ext === target) {
    emit(onEvent, { type: "info", message: `passthrough: ${inputName} is already .${target}` });
    return inputBytes;
  }

  const direct = pickEngine(ext, target);
  if (direct) {
    emit(onEvent, { type: "info", message: `dispatch: ${inputName} (${ext}) → ${target} via ${direct}` });
    if (direct === "office" && opts?.paper && ext === "docx") {
      const { patchDocxPaperSize } = await import("./paper-patch");
      inputBytes = patchDocxPaperSize(inputBytes, { w: opts.paper.w, h: opts.paper.h });
      emit(onEvent, { type: "info", message: `paper: page size set to ${Math.round(opts.paper.w / 56.6929)}×${Math.round(opts.paper.h / 56.6929)} mm` });
    }
    return runEngine(direct, inputName, inputBytes, target, onEvent);
  }

  const path = findPath(ext, target);
  if (!path || path.length === 0) {
    throw new Error(`unsupported conversion: ${ext} → ${target}`);
  }

  const chain = path.map((h) => `${h.engine}→${h.via}`).join(" · ");
  emit(onEvent, { type: "info", message: `route: ${ext} → ${target} via [${chain}]` });

  let data = inputBytes;
  let currentExt = ext;
  for (const hop of path) {
    const hopName = `${base}.${currentExt}`;
    if (hop.engine === "office" && opts?.paper && currentExt === "docx") {
      const { patchDocxPaperSize } = await import("./paper-patch");
      data = patchDocxPaperSize(data, { w: opts.paper.w, h: opts.paper.h });
      emit(onEvent, { type: "info", message: `paper: page size set to ${Math.round(opts.paper.w / 56.6929)}×${Math.round(opts.paper.h / 56.6929)} mm` });
    }
    data = await runEngine(hop.engine, hopName, data, hop.via as LowDocTarget, onEvent);
    currentExt = hop.via;
  }
  emit(onEvent, { type: "success", message: `route: ${inputName} → ${target} done (${formatBytes(data.byteLength)})` });
  return data;
}

export async function runBatch(
  files: File[],
  target: LowDocTarget,
  onEvent?: EngineEventHandler,
): Promise<void> {
  const grouped = new Map<EngineId, File[]>();
  for (const f of files) {
    const ext = inputExtension(f.name);
    const direct = pickEngine(ext, target);
    const path = direct ? null : findPath(ext, target);
    if (!direct && (!path || path.length === 0)) {
      emit(onEvent, { type: "error", message: `skip ${f.name}: ${ext} → ${target} unsupported` });
      continue;
    }
    const engine = direct ?? path![0].engine;
    if (!grouped.has(engine)) grouped.set(engine, []);
    grouped.get(engine)!.push(f);
  }
  for (const [engine, group] of grouped) {
    emit(onEvent, { type: "info", message: `batch: ${group.length} file(s) via ${engine}` });
    for (const f of group) {
      const buf = new Uint8Array(await toArrayBuffer(f));
      await runConversion(f.name, buf, target, onEvent);
    }
  }
}