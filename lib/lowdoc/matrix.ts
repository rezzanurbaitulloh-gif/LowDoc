"use client";

export type LowDocTarget =
  | "pdf"
  | "docx"
  | "doc"
  | "docm"
  | "dotx"
  | "odt"
  | "ods"
  | "odp"
  | "xlsx"
  | "xls"
  | "xlsm"
  | "xlsb"
  | "pptx"
  | "ppt"
  | "ppsx"
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
  | "png"
  | "jpg"
  | "webp"
  | "gif"
  | "tiff"
  | "ico"
  | "heic"
  | "bmp";

export type LowDocEngine =
  | "pandoc"
  | "magick"
  | "pdflib"
  | "pdfjs"
  | "dxf"
  | "sheets"
  | "mammoth"
  | "office"
  | "bridge";

export const TARGETS: LowDocTarget[] = [
  "pdf",
  "docx",
  "xlsx",
  "pptx",
  "odt",
  "html",
  "md",
  "txt",
  "csv",
  "rtf",
  "epub",
  "tex",
  "org",
  "rst",
  "adoc",
  "tsv",
  "json",
  "xml",
  "svg",
  "png",
  "jpg",
  "webp",
  "gif",
  "tiff",
  "ico",
  "heic",
  "bmp",
  "doc",
  "docm",
  "dotx",
  "xls",
  "xlsm",
  "xlsb",
  "ods",
  "ppt",
  "ppsx",
  "odp",
];

export const TARGET_LABELS: Record<LowDocTarget, string> = {
  pdf: "PDF",
  docx: "DOCX",
  doc: "DOC",
  docm: "DOCM",
  dotx: "DOTX",
  odt: "ODT",
  ods: "ODS",
  odp: "ODP",
  xlsx: "XLSX",
  xls: "XLS",
  xlsm: "XLSM",
  xlsb: "XLSB",
  pptx: "PPTX",
  ppt: "PPT",
  ppsx: "PPSX",
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
  png: "PNG",
  jpg: "JPG",
  webp: "WebP",
  gif: "GIF",
  tiff: "TIFF",
  ico: "ICO",
  heic: "HEIC",
  bmp: "BMP",
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

export const EXTENSION_OF: Record<LowDocTarget, string> = {  pdf: "pdf",
  docx: "docx",
  doc: "doc",
  docm: "docm",
  dotx: "dotx",
  odt: "odt",
  ods: "ods",
  odp: "odp",
  xlsx: "xlsx",
  xls: "xls",
  xlsm: "xlsm",
  xlsb: "xlsb",
  pptx: "pptx",
  ppt: "ppt",
  ppsx: "ppsx",
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
  png: "png",
  jpg: "jpg",
  webp: "webp",
  gif: "gif",
  tiff: "tiff",
  ico: "ico",
  heic: "heic",
  bmp: "bmp",
};

export const OUTPUT_GROUPS: { label: string; targets: LowDocTarget[] }[] = [
  {
    label: "Document",
    targets: ["pdf", "docx", "doc", "docm", "dotx", "odt", "rtf", "txt", "html", "epub", "md", "tex", "org", "rst", "adoc"],
  },
  {
    label: "Spreadsheet & Data",
    targets: ["xlsx", "xls", "xlsm", "xlsb", "ods", "csv", "tsv", "json", "xml"],
  },
  {
    label: "Presentation",
    targets: ["pptx", "ppt", "ppsx", "odp"],
  },
  {
    label: "Image",
    targets: ["png", "jpg", "webp", "gif", "tiff", "ico", "heic", "bmp", "svg"],
  },
];

const PANDOC_PAIRS: [string, LowDocTarget[]][] = [
  ["md", ["html", "docx", "pdf", "epub", "odt", "rtf", "tex", "org", "rst", "adoc", "txt", "json", "xml", "pptx"]],
  ["html", ["md", "docx", "pdf", "epub", "odt", "rtf", "tex", "txt", "json", "xml", "org", "rst", "adoc", "pptx"]],
  ["docx", ["md", "html", "pdf", "epub", "odt", "rtf", "tex", "txt", "json", "xml", "org", "rst", "adoc", "pptx"]],
  ["odt", ["md", "html", "docx", "pdf", "epub", "rtf", "tex", "txt", "json", "xml", "pptx"]],
  ["epub", ["md", "html", "docx", "pdf", "odt", "rtf", "txt", "pptx"]],
  ["rtf", ["md", "html", "docx", "pdf", "odt", "txt", "pptx"]],
  ["tex", ["md", "html", "docx", "pdf", "odt", "rtf", "txt", "pptx"]],
  ["org", ["md", "html", "docx", "pdf", "odt", "rtf", "tex", "txt", "rst", "adoc", "pptx"]],
  ["rst", ["md", "html", "docx", "pdf", "odt", "rtf", "tex", "txt", "org", "adoc", "pptx"]],
  ["adoc", ["md", "html", "docx", "pdf", "odt", "rtf", "tex", "txt", "org", "rst", "pptx"]],
  ["txt", ["md", "html", "docx", "pdf", "epub", "odt", "rtf", "tex", "org", "rst", "adoc", "pptx"]],
  ["json", ["md", "html", "docx", "pdf", "txt", "pptx"]],
  ["xml", ["md", "html", "docx", "pdf", "txt", "pptx"]],
  ["csv", ["md", "html", "docx", "pdf", "epub", "odt", "rtf", "tex", "txt", "org", "rst", "adoc", "json", "xml", "pptx"]],
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
  ["pdf", ["png", "jpg", "webp", "tiff", "gif", "ico", "heic", "bmp"]],
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
  ["xlsx", ["csv", "tsv", "json", "html", "xlsx", "xlsb"]],
  ["xls", ["csv", "tsv", "json", "html", "xlsx", "xlsb"]],
  ["xlsm", ["csv", "tsv", "json", "html", "xlsx", "xlsb"]],
  ["xlsb", ["csv", "tsv", "json", "html", "xlsx", "xlsb"]],
  ["ods", ["csv", "tsv", "json", "html", "xlsx", "xlsb"]],
  ["csv", ["xlsx", "tsv", "json", "html", "xlsb"]],
  ["tsv", ["xlsx", "csv", "json", "html", "xlsb"]],
  ["json", ["xlsx", "csv", "tsv", "html", "xlsb"]],
];

const MAMMOTH_PAIRS: [string, LowDocTarget[]][] = [
  ["docx", ["html", "txt"]],
  ["docm", ["html", "txt"]],
  ["dotx", ["html", "txt"]],
];

const OFFICE_PAIRS: [string, LowDocTarget[]][] = [
  // Writer-family sources (LibreOffice probe-verified)
  ["doc", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "txt", "html", "epub", "md", "png", "jpg"]],
  ["docm", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "txt", "html", "png", "jpg"]],
  ["dotx", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "txt", "html", "png", "jpg"]],
  ["pages", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "txt", "html", "png", "jpg"]],
  ["rtf", ["pdf", "docx", "docm", "dotx", "odt", "txt", "html", "md", "png", "jpg"]],
  ["txt", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "html", "md", "png", "jpg"]],
  ["html", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "md", "png", "jpg"]],
  ["md", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "html", "png", "jpg"]],
  ["docx", ["pdf", "doc", "docm", "dotx", "odt", "rtf", "txt", "html", "md", "epub", "png", "jpg"]],
  ["odt", ["pdf", "doc", "docm", "dotx", "docx", "rtf", "txt", "html", "md", "epub", "png", "jpg"]],
  ["epub", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "txt", "html", "png", "jpg"]],
  ["xml", ["pdf", "docx", "docm", "dotx", "odt", "html", "png", "jpg"]],
  ["wpd", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "txt", "html", "md", "png", "jpg"]],
  ["sdw", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "txt", "html", "png", "jpg"]],
  ["sxw", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "txt", "html", "png", "jpg"]],
  ["pdf", ["docx", "doc", "docm", "dotx", "odt", "rtf", "txt", "html", "md", "epub", "png", "jpg"]],
  // Calc-family sources
  ["xlsx", ["pdf", "xls", "xlsm", "ods", "csv", "html", "png", "jpg"]],
  ["xls", ["pdf", "xlsx", "xls", "xlsm", "ods", "csv", "html", "png", "jpg"]],
  ["xlsm", ["pdf", "xlsx", "xls", "xlsm", "ods", "csv", "html", "png", "jpg"]],
  ["xlsb", ["pdf", "xlsx", "xls", "xlsm", "ods", "csv", "html", "png", "jpg"]],
  ["ods", ["pdf", "xlsx", "xls", "xlsm", "ods", "csv", "html", "png", "jpg"]],
  ["csv", ["pdf", "xlsx", "xls", "xlsm", "ods", "html", "png", "jpg"]],
  ["numbers", ["pdf", "xlsx", "xls", "xlsm", "ods", "csv", "tsv", "html", "png", "jpg"]],
  // Impress-family sources
  ["ppt", ["pdf", "pptx", "ppt", "ppsx", "odp", "html", "png", "jpg", "svg"]],
  ["pptx", ["pdf", "ppt", "ppsx", "odp", "html", "png", "jpg", "svg"]],
  ["ppsx", ["pdf", "pptx", "ppt", "ppsx", "odp", "html", "png", "jpg", "svg"]],
  ["odp", ["pdf", "pptx", "ppt", "ppsx", "html", "png", "jpg", "svg"]],
  ["key", ["pdf", "pptx", "ppt", "ppsx", "odp", "html", "png", "jpg", "svg"]],
];

const BRIDGE_PAIRS: [string, LowDocTarget[]][] = [
  ["txt", ["csv"]],
  ["png", ["svg"]],
  ["jpg", ["svg"]],
  ["jpeg", ["svg"]],
  ["webp", ["svg"]],
  ["gif", ["svg"]],
  ["bmp", ["svg"]],
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
const BRIDGE_MAP = pairMap(BRIDGE_PAIRS);

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
for (const ext of Object.keys(BRIDGE_MAP)) register(ext, "bridge", BRIDGE_MAP[ext], 9);

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

/* ── universal multi-hop router ───────────────────────────────────────
   Any supported input format → any known target format.
   If no direct engine exists, BFS composes engine hops through hubs
   (pdf / html / csv / xlsx / png), e.g.:
     docx → pdf → png        (pandoc + pdfjs)
     xlsx → csv → markdown   (sheets + pandoc)
     pptx → html → docx      (office + pandoc)
     dxf  → pdf → png        (dxf + pdfjs)
   ─────────────────────────────────────────────────────────────────── */

export interface Hop {
  engine: LowDocEngine;
  via: string;
}

const ENGINE_READ_PRIORITY: LowDocEngine[] = [
  "pandoc",
  "sheets",
  "mammoth",
  "pdfjs",
  "magick",
  "dxf",
  "pdflib",
  "office",
  "bridge",
];

const MAX_HOPS = 4;

function buildEdges(): Record<string, Array<{ engine: LowDocEngine; to: string }>> {
  const edges: Record<string, Array<{ engine: LowDocEngine; to: string }>> = {};
  const sources: [Record<string, LowDocTarget[]>, LowDocEngine][] = [
    [PANDOC_MAP, "pandoc"],
    [SHEETS_MAP, "sheets"],
    [MAMMOTH_MAP, "mammoth"],
    [PDFJS_MAP, "pdfjs"],
    [MAGICK_MAP, "magick"],
    [DXF_MAP, "dxf"],
    [PDFLIB_MAP, "pdflib"],
    [OFFICE_MAP, "office"],
    [BRIDGE_MAP, "bridge"],
  ];
  for (const [map, engine] of sources) {
    for (const from of Object.keys(map)) {
      if (!edges[from]) edges[from] = [];
      for (const to of map[from]) {
        edges[from].push({ engine, to });
      }
    }
  }
  return edges;
}

const EDGES = buildEdges();

export function findPath(from: string, to: string): Hop[] | null {
  if (from === to) return [];
  const start = EDGES[from];
  if (!start) return null;
  let frontier: Array<{ ext: string; hops: Hop[] }> = start.map((e) => ({
    ext: e.to,
    hops: [{ engine: e.engine, via: e.to }],
  }));
  const visited = new Set<string>([from]);
  for (const f of frontier) visited.add(f.ext);
  for (let depth = 0; depth < MAX_HOPS; depth++) {
    frontier.sort(
      (a, b) =>
        ENGINE_READ_PRIORITY.indexOf(a.hops[0].engine) -
        ENGINE_READ_PRIORITY.indexOf(b.hops[0].engine),
    );
    for (const f of frontier) {
      if (f.ext === to) return f.hops;
    }
    const next: Array<{ ext: string; hops: Hop[] }> = [];
    for (const f of frontier) {
      const outs = EDGES[f.ext];
      if (!outs) continue;
      for (const e of outs) {
        if (visited.has(e.to)) continue;
        visited.add(e.to);
        next.push({ ext: e.to, hops: [...f.hops, { engine: e.engine, via: e.to }] });
      }
    }
    frontier = next;
    if (frontier.length === 0) return null;
  }
  return null;
}