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
  | "bmp";

export type LowDocEngine =
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
  bmp: "BMP",
};

export const ENGINE_LABELS: Record<LowDocEngine, string> = {
  pandoc: "Pandoc WASM",
  magick: "ImageMagick WASM",
  pdflib: "PDF-Lib",
  pdfjs: "pdf.js",
  pdftext: "PDF Text Layer",
  dxf: "DXF Parser",
  sheets: "SheetJS",
  mammoth: "Mammoth",
  office: "LibreOffice",
  bridge: "Bridge",
};

export const ENGINE_BADGE: Record<LowDocEngine, string> = {
  pandoc: "PW",
  magick: "IM",
  pdflib: "PL",
  pdfjs: "PJ",
  pdftext: "PT",
  dxf: "DX",
  sheets: "SJ",
  mammoth: "MM",
  office: "LO",
  bridge: "BR",
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
    targets: ["png", "jpg", "webp", "gif", "tiff", "ico", "bmp", "svg"],
  },
];

const PANDOC_PAIRS: [string, LowDocTarget[]][] = [
  ["md", ["html", "docx", "epub", "odt", "rtf", "tex", "org", "rst", "adoc", "txt", "json", "xml", "pptx"]],
  ["html", ["md", "docx", "epub", "odt", "rtf", "tex", "txt", "json", "xml", "org", "rst", "adoc", "pptx"]],
  ["txt", ["md", "html", "docx", "epub", "odt", "rtf", "tex", "org", "rst", "adoc", "json", "xml", "pptx"]],
  ["tex", ["md", "html", "docx", "epub", "odt", "rtf", "txt", "org", "rst", "adoc", "json", "xml", "pptx"]],
  ["org", ["md", "html", "docx", "epub", "odt", "rtf", "tex", "txt", "rst", "adoc", "json", "xml", "pptx"]],
  ["rst", ["md", "html", "docx", "epub", "odt", "rtf", "tex", "txt", "org", "adoc", "json", "xml", "pptx"]],
  ["adoc", ["md", "html", "docx", "epub", "odt", "rtf", "tex", "txt", "org", "rst", "json", "xml", "pptx"]],
  ["json", ["md", "html", "docx", "epub", "odt", "rtf", "tex", "txt", "org", "rst", "adoc", "xml", "pptx"]],
  ["xml", ["md", "html", "docx", "epub", "odt", "rtf", "tex", "txt", "org", "rst", "adoc", "json", "pptx"]],
  ["csv", ["md", "html", "docx", "epub", "odt", "rtf", "tex", "txt", "org", "rst", "adoc", "xml", "pptx"]],
];

const MAGICK_PAIRS: [string, LowDocTarget[]][] = [
  ["jpg", ["png", "webp", "tiff", "gif", "ico"]],
  ["jpeg", ["png", "webp", "tiff", "gif", "ico"]],
  ["png", ["jpg", "webp", "tiff", "gif", "ico"]],
  ["webp", ["png", "jpg", "tiff", "gif", "ico"]],
  ["tiff", ["png", "jpg", "webp", "gif", "ico"]],
  ["gif", ["png", "jpg", "webp", "tiff", "ico"]],
  ["bmp", ["png", "jpg", "webp", "tiff", "gif", "ico"]],
  ["ico", ["png", "jpg", "webp", "tiff", "gif"]],
];

const PDFLIB_PAIRS: [string, LowDocTarget[]][] = [
  ["pdf", ["pdf"]],
];

const PDFJS_PAIRS: [string, LowDocTarget[]][] = [
  ["pdf", ["jpg", "png", "webp"]],
];

// Text-layer extraction via pdf.js getTextContent (LibreOffice cannot export PDF→txt)
const PDFTEXT_PAIRS: [string, LowDocTarget[]][] = [
  ["pdf", ["txt"]],
];

const DXF_PAIRS: [string, LowDocTarget[]][] = [
  ["dxf", ["svg", "pdf", "txt"]],
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
  ["html", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "md"]],
  ["md", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "html", "png", "jpg"]],
  ["docx", ["pdf", "doc", "docm", "dotx", "odt", "rtf", "txt", "html", "md", "epub", "png", "jpg"]],
  ["odt", ["pdf", "doc", "docm", "dotx", "docx", "rtf", "txt", "html", "md", "epub", "png", "jpg"]],
  // epub as SOURCE removed: pandoc-wasm cannot read binary stdin and LibreOffice
  // fails to load EPUBs it did not author itself ("source file could not be loaded").
  ["xml", ["pdf", "docx", "docm", "dotx", "odt", "html", "png", "jpg"]],
  ["wpd", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "txt", "html", "md", "png", "jpg"]],
  ["sdw", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "txt", "html", "png", "jpg"]],
  ["sxw", ["pdf", "docx", "docm", "dotx", "odt", "rtf", "txt", "html", "png", "jpg"]],
  ["pdf", ["docx", "doc", "docm", "dotx", "odt", "rtf", "html", "md", "epub", "png", "jpg"]],
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
const PDFTEXT_MAP = pairMap(PDFTEXT_PAIRS);
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
for (const ext of Object.keys(PDFTEXT_MAP)) register(ext, "pdftext", PDFTEXT_MAP[ext], 4);
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
  "pdftext",
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
    [PDFTEXT_MAP, "pdftext"],
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
/* ── capability states (PRD §8) ─────────────────────────────────────── */

export type Capability = "high" | "supported" | "limited" | "experimental";

export interface CapabilityInfo {
  status: Capability;
  note: string;
  /** true when the whole path runs in-browser (no server hop) */
  local: boolean;
}

const ENGINE_CAP: Record<LowDocEngine, { cap: Capability; note: string }> = {
  pandoc: { cap: "high", note: "Structure-preserving text conversion" },
  sheets: { cap: "high", note: "Spreadsheet data preserved" },
  pdflib: { cap: "supported", note: "PDF page operations" },
  mammoth: { cap: "limited", note: "Semantic HTML from DOCX — visual layout not preserved" },
  office: { cap: "high", note: "Full layout via LibreOffice" },
  magick: { cap: "supported", note: "Raster image conversion" },
  pdfjs: { cap: "limited", note: "Pages rendered as image — text not selectable" },
  pdftext: { cap: "limited", note: "Text layer only — layout not preserved" },
  bridge: { cap: "supported", note: "Intermediate re-encode" },
  dxf: { cap: "experimental", note: "Experimental CAD support" },
};

const CAP_RANK: Record<Capability, number> = { high: 3, supported: 2, limited: 1, experimental: 0 };
export const CAP_LABELS: Record<Capability, string> = {
  high: "High Fidelity",
  supported: "Supported",
  limited: "Limited",
  experimental: "Experimental",
};

const PAIR_OVERRIDES: Record<string, { cap: Capability; note: string }> = {
  "pdf:docx": { cap: "limited", note: "Structural reconstruction — layout may shift" },
  "pdf:html": { cap: "limited", note: "Reconstructed structure, not original markup" },
  "json:pdf": { cap: "limited", note: "Plain-JSON fallback renders as text listing" },
};

export function getCapability(src: string, tgt: string): CapabilityInfo | null {
  const path = findPath(src, tgt);
  if (!path) return null;
  const override = PAIR_OVERRIDES[`${src}:${tgt}`];
  const local = path.length === 0 || !path.some((h) => h.engine === "office");

  if (override) return { status: override.cap, note: override.note, local };
  if (path.length === 0) return { status: "high", note: "Already in target format — direct copy", local: true };

  let worst: Capability = "high";
  let worstNote = "";
  for (const hop of path) {
    const e = ENGINE_CAP[hop.engine];
    if (CAP_RANK[e.cap] < CAP_RANK[worst]) {
      worst = e.cap;
      worstNote = e.note;
    }
  }
  if (!worstNote) worstNote = ENGINE_CAP[path[0].engine].note;
  return { status: worst, note: worstNote, local };
}
