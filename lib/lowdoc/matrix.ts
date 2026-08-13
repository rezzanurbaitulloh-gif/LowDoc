"use client";

export type LowDocTarget =
  | "pdf"
  | "docx"
  | "odt"
  | "html"
  | "epub"
  | "md"
  | "rtf"
  | "tex"
  | "txt"
  | "org"
  | "rst"
  | "adoc"
  | "csv"
  | "tsv"
  | "json"
  | "xml"
  | "svg"
  | "xlsx";

export type LowDocEngine =
  | "pandoc"
  | "magick"
  | "pdflib"
  | "pdfjs"
  | "dxf"
  | "sheets"
  | "mammoth"
  | "office";

export const TARGETS: LowDocTarget[] = [
  "pdf",
  "docx",
  "odt",
  "html",
  "epub",
  "md",
  "rtf",
  "tex",
  "txt",
  "org",
  "rst",
  "adoc",
  "csv",
  "tsv",
  "json",
  "xml",
  "svg",
  "xlsx",
];

export const TARGET_LABELS: Record<LowDocTarget, string> = {
  pdf: "PDF",
  docx: "DOCX",
  odt: "ODT",
  html: "HTML",
  epub: "EPUB",
  md: "Markdown",
  rtf: "RTF",
  tex: "LaTeX",
  txt: "TXT",
  org: "Org Mode",
  rst: "reStructuredText",
  adoc: "AsciiDoc",
  csv: "CSV",
  tsv: "TSV",
  json: "JSON",
  xml: "XML",
  svg: "SVG",
  xlsx: "XLSX",
};

export const ENGINE_LABELS: Record<LowDocEngine, string> = {
  pandoc: "Pandoc WASM",
  magick: "ImageMagick WASM",
  pdflib: "PDF-Lib",
  pdfjs: "pdf.js",
  dxf: "DXF Parser",
  sheets: "SheetJS",
  mammoth: "Mammoth",
  office: "LibreOffice",
};

export const ENGINE_BADGE: Record<LowDocEngine, string> = {
  pandoc: "PW",
  magick: "IM",
  pdflib: "PL",
  pdfjs: "PJ",
  dxf: "DX",
  sheets: "SJ",
  mammoth: "MM",
  office: "LO",
};

export const EXTENSION_OF: Record<LowDocTarget, string> = {
  pdf: "pdf",
  docx: "docx",
  odt: "odt",
  html: "html",
  epub: "epub",
  md: "md",
  rtf: "rtf",
  tex: "tex",
  txt: "txt",
  org: "org",
  rst: "rst",
  adoc: "adoc",
  csv: "csv",
  tsv: "tsv",
  json: "json",
  xml: "xml",
  svg: "svg",
  xlsx: "xlsx",
};

const PANDOC_PAIRS: [string, LowDocTarget[]][] = [
  ["md", ["html", "docx", "pdf", "epub", "odt", "rtf", "tex", "org", "rst", "adoc", "txt", "json", "xml", "html"]],
  ["html", ["md", "docx", "pdf", "epub", "odt", "rtf", "tex", "txt", "json", "xml", "org", "rst", "adoc"]],
  ["docx", ["md", "html", "pdf", "epub", "odt", "rtf", "tex", "txt", "json", "xml", "org", "rst", "adoc"]],
  ["odt", ["md", "html", "docx", "pdf", "epub", "rtf", "tex", "txt", "json", "xml"]],
  ["epub", ["md", "html", "docx", "pdf", "odt", "rtf", "txt"]],
  ["rtf", ["md", "html", "docx", "pdf", "odt", "txt"]],
  ["tex", ["md", "html", "docx", "pdf", "odt", "rtf", "txt"]],
  ["org", ["md", "html", "docx", "pdf", "odt", "rtf", "tex", "txt", "rst", "adoc"]],
  ["rst", ["md", "html", "docx", "pdf", "odt", "rtf", "tex", "txt", "org", "adoc"]],
  ["adoc", ["md", "html", "docx", "pdf", "odt", "rtf", "tex", "txt", "org", "rst"]],
  ["txt", ["md", "html", "docx", "pdf", "epub", "odt", "rtf", "tex", "org", "rst", "adoc"]],
  ["json", ["md", "html", "docx", "pdf", "txt"]],
  ["xml", ["md", "html", "docx", "pdf", "txt"]],
];

const MAGICK_PAIRS: [string, LowDocTarget[]][] = [
  ["jpg", ["pdf", "png", "webp", "tiff", "gif", "ico", "heic"]],
  ["jpeg", ["pdf", "png", "webp", "tiff", "gif", "ico", "heic"]],
  ["png", ["pdf", "jpg", "webp", "tiff", "gif", "ico", "heic"]],
  ["webp", ["pdf", "png", "jpg", "tiff", "gif", "ico"]],
  ["tiff", ["pdf", "png", "jpg", "webp", "gif", "ico"]],
  ["gif", ["pdf", "png", "jpg", "webp", "tiff", "ico"]],
  ["bmp", ["pdf", "png", "jpg", "webp", "tiff", "gif", "ico"]],
  ["ico", ["pdf", "png", "jpg", "webp", "tiff", "gif"]],
  ["heic", ["pdf", "png", "jpg", "webp", "tiff", "gif"]],
];

const PDFLIB_PAIRS: [string, LowDocTarget[]][] = [
  ["pdf", ["pdf"]],
];

const PDFJS_PAIRS: [string, LowDocTarget[]][] = [
  ["pdf", ["jpg", "png", "webp"]],
];

const DXF_PAIRS: [string, LowDocTarget[]][] = [
  ["dxf", ["svg", "pdf"]],
];

const SHEETS_PAIRS: [string, LowDocTarget[]][] = [
  ["xlsx", ["csv", "tsv", "json", "html", "xlsx"]],
  ["xls", ["csv", "tsv", "json", "html", "xlsx"]],
  ["xlsm", ["csv", "tsv", "json", "html", "xlsx"]],
  ["xlsb", ["csv", "tsv", "json", "html", "xlsx"]],
  ["ods", ["csv", "tsv", "json", "html", "xlsx"]],
  ["csv", ["xlsx", "tsv", "json", "html"]],
  ["tsv", ["xlsx", "csv", "json", "html"]],
  ["json", ["xlsx", "csv", "tsv", "html"]],
];

const MAMMOTH_PAIRS: [string, LowDocTarget[]][] = [
  ["docx", ["html", "txt"]],
  ["docm", ["html", "txt"]],
  ["dotx", ["html", "txt"]],
];

const OFFICE_PAIRS: [string, LowDocTarget[]][] = [
  ["doc", ["pdf", "docx", "odt", "rtf", "txt", "html", "epub", "md"]],
  ["docm", ["pdf", "docx", "odt", "rtf", "txt", "html"]],
  ["dotx", ["pdf", "docx", "odt", "rtf", "txt", "html"]],
  ["ppt", ["pdf", "pptx", "odp", "html"]],
  ["pptx", ["pdf", "ppt", "odp", "html"]],
  ["ppsx", ["pdf", "pptx", "odp", "html"]],
  ["odp", ["pdf", "pptx", "ppt", "html"]],
  ["pages", ["pdf", "docx", "odt", "rtf", "txt", "html"]],
  ["numbers", ["pdf", "xlsx", "ods", "csv", "tsv", "html"]],
  ["key", ["pdf", "pptx", "odp", "html"]],
  ["rtf", ["pdf", "docx", "odt", "txt", "html", "md"]],
  ["txt", ["pdf", "docx", "odt", "rtf", "html", "md"]],
  ["csv", ["pdf", "docx", "odt", "xlsx", "ods"]],
  ["tsv", ["pdf", "docx", "odt", "xlsx", "ods"]],
  ["html", ["pdf", "docx", "odt", "rtf", "md"]],
  ["md", ["pdf", "docx", "odt", "rtf", "html"]],
  ["xml", ["pdf", "docx", "odt", "html"]],
  ["wpd", ["pdf", "docx", "odt", "rtf", "txt", "html", "md"]],
  ["sdw", ["pdf", "docx", "odt", "rtf", "txt", "html"]],
  ["sxw", ["pdf", "docx", "odt", "rtf", "txt", "html"]],
];

export type MatrixEntry = {
  engine: LowDocEngine;
  supportsTarget: (target: LowDocTarget) => boolean;
  weight: number;
};

function pairMap(pairs: [string, LowDocTarget[]][]): Record<string, LowDocTarget[]> {
  const m: Record<string, LowDocTarget[]> = {};
  for (const [ext, targets] of pairs) m[ext] = targets;
  return m;
}

const PANDOC_MAP = pairMap(PANDOC_PAIRS);
const MAGICK_MAP = pairMap(MAGICK_PAIRS);
const PDFLIB_MAP = pairMap(PDFLIB_PAIRS);
const PDFJS_MAP = pairMap(PDFJS_PAIRS);
const DXF_MAP = pairMap(DXF_PAIRS);
const SHEETS_MAP = pairMap(SHEETS_PAIRS);
const MAMMOTH_MAP = pairMap(MAMMOTH_PAIRS);
const OFFICE_MAP = pairMap(OFFICE_PAIRS);

export const LOWDOC_MATRIX: Record<string, MatrixEntry[]> = {};

function register(ext: string, engine: LowDocEngine, targets: LowDocTarget[], weight: number) {
  if (!LOWDOC_MATRIX[ext]) LOWDOC_MATRIX[ext] = [];
  LOWDOC_MATRIX[ext].push({
    engine,
    supportsTarget: (t: LowDocTarget) => targets.includes(t),
    weight,
  });
}

for (const ext of Object.keys(PANDOC_MAP)) register(ext, "pandoc", PANDOC_MAP[ext], 1);
for (const ext of Object.keys(MAGICK_MAP)) register(ext, "magick", MAGICK_MAP[ext], 2);
for (const ext of Object.keys(PDFLIB_MAP)) register(ext, "pdflib", PDFLIB_MAP[ext], 3);
for (const ext of Object.keys(PDFJS_MAP)) register(ext, "pdfjs", PDFJS_MAP[ext], 4);
for (const ext of Object.keys(DXF_MAP)) register(ext, "dxf", DXF_MAP[ext], 5);
for (const ext of Object.keys(SHEETS_MAP)) register(ext, "sheets", SHEETS_MAP[ext], 6);
for (const ext of Object.keys(MAMMOTH_MAP)) register(ext, "mammoth", MAMMOTH_MAP[ext], 7);
for (const ext of Object.keys(OFFICE_MAP)) register(ext, "office", OFFICE_MAP[ext], 8);

export function isSupportedInput(ext: string): boolean {
  return !!LOWDOC_MATRIX[ext];
}

export function supportedTargets(ext: string): LowDocTarget[] {
  const entries = LOWDOC_MATRIX[ext];
  if (!entries) return [];
  const set = new Set<LowDocTarget>();
  for (const e of entries) {
    for (const t of TARGETS) {
      if (e.supportsTarget(t)) set.add(t);
    }
  }
  return TARGETS.filter((t) => set.has(t));
}

export function pickEngine(ext: string, target: LowDocTarget): LowDocEngine | null {
  const entries = LOWDOC_MATRIX[ext];
  if (!entries) return null;
  const sorted = [...entries].sort((a, b) => a.weight - b.weight);
  for (const e of sorted) {
    if (e.supportsTarget(target)) return e.engine;
  }
  return null;
}