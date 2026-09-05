/* In-browser document rebuild engines (no server needed).
   - "docbuild": docx / xlsx / xls / txt / csv / tsv / html  →  PDF (vector, selectable text)
   - "pdfdocx":  pdf  →  DOCX (structural reconstruction, honest Limited fidelity)
   Uses: mammoth (docx→HTML), SheetJS (workbooks), pdf-lib (PDF authoring),
   pdf.js (text-layer reading), docx lib (DOCX authoring). */

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

export interface PaperMm {
  w: number;
  h: number;
}

const A4: PaperMm = { w: 210, h: 297 };
const MARGIN = 20; // mm
const MM = 2.83465; // pt per mm

type Run = { t: string; bold?: boolean; italic?: boolean; code?: boolean };
type Block =
  | { k: "h"; level: number; runs: Run[] }
  | { k: "p"; runs: Run[] }
  | { k: "li"; ordered: boolean; idx: number; indent: number; runs: Run[] }
  | { k: "code"; text: string }
  | { k: "table"; rows: string[][]; header: boolean }
  | { k: "img"; data: Uint8Array; png: boolean; w: number; h: number }
  | { k: "hr" }
  | { k: "pagebreak" };

/* ── HTML → blocks ─────────────────────────────────────────────────── */

function runsOf(el: Element): Run[] {
  const runs: Run[] = [];
  const walk = (node: Node, bold: boolean, italic: boolean, code: boolean) => {
    if (node.nodeType === 3) {
      const t = (node.textContent ?? "").replace(/\s+/g, " ");
      if (t.trim()) runs.push({ t, bold, italic, code });
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = (node as Element).tagName;
    if (tag === "BR") {
      runs.push({ t: "\n" });
      return;
    }
    walkChildren(
      node,
      bold || tag === "B" || tag === "STRONG",
      italic || tag === "I" || tag === "EM",
      code || tag === "CODE",
    );
  };
  const walkChildren = (node: Node, b: boolean, i: boolean, c: boolean) => {
    node.childNodes.forEach((ch) => walk(ch, b, i, c));
  };
  walkChildren(el, false, false, false);
  return runs;
}

function htmlToBlocks(root: Element, images: Map<string, { data: Uint8Array; png: boolean; w: number; h: number }>): Block[] {
  const blocks: Block[] = [];
  const listWalk = (ul: Element, ordered: boolean, indent: number) => {
    let idx = 1;
    ul.childNodes.forEach((ch) => {
      if (ch.nodeType === 1 && (ch as Element).tagName === "LI") {
        const li = ch as Element;
        // nested lists first
        li.childNodes.forEach((g) => {
          if (g.nodeType === 1 && ((g as Element).tagName === "UL" || (g as Element).tagName === "OL")) {
            listWalk(g as Element, (g as Element).tagName === "OL", indent + 1);
          }
        });
        const runs = runsOf(li).filter((r) => r.t !== "\n");
        if (runs.length) blocks.push({ k: "li", ordered, idx: idx++, indent, runs });
      }
    });
  };
  root.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      const t = (node.textContent ?? "").trim();
      if (t) blocks.push({ k: "p", runs: [{ t }] });
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as Element;
    const tag = el.tagName;
    if (/^H[1-6]$/.test(tag)) {
      const runs = runsOf(el);
      if (runs.length) blocks.push({ k: "h", level: parseInt(tag[1], 10), runs });
    } else if (tag === "P" || tag === "DIV") {
      const flat = runsOf(el);
      if (flat.some((r) => r.t.trim())) blocks.push({ k: "p", runs: flat });
    } else if (tag === "UL" || tag === "OL") {
      listWalk(el, tag === "OL", 0);
    } else if (tag === "PRE") {
      const t = el.textContent ?? "";
      if (t.trim()) blocks.push({ k: "code", text: t.replace(/\n{3,}/g, "\n\n").trim() });
    } else if (tag === "TABLE") {
      const rows: string[][] = [];
      let header = false;
      el.querySelectorAll("tr").forEach((tr, ri) => {
        const cells: string[] = [];
        tr.querySelectorAll("th,td").forEach((td) => {
          if (td.tagName === "TH") header = header || ri === 0;
          cells.push((td.textContent ?? "").replace(/\s+/g, " ").trim());
        });
        if (cells.length) rows.push(cells);
      });
      if (rows.length) blocks.push({ k: "table", rows, header });
    } else if (tag === "IMG") {
      const src = el.getAttribute("src") ?? "";
      const img = images.get(src);
      if (img) blocks.push({ k: "img", ...img });
    } else if (tag === "HR") {
      blocks.push({ k: "hr" });
    } else if (tag === "BLOCKQUOTE") {
      const runs = runsOf(el);
      if (runs.length) blocks.push({ k: "p", runs: [{ t: "“ " }, ...runs, { t: " ”", italic: true }] });
    } else if (tag === "BR") {
      blocks.push({ k: "p", runs: [{ t: " " }] });
    } else {
      // recurse into unknown containers (sections, spans at top level, body wrappers)
      blocks.push(...htmlToBlocks(el, images));
    }
  });
  return blocks;
}

async function decodeDataUrl(src: string): Promise<{ data: Uint8Array; png: boolean; w: number; h: number } | null> {
  const m = src.match(/^data:(image\/(png|jpeg|jpg));base64,([\s\S]*)$/);
  if (!m) return null;
  try {
    const bin = atob(m[3]);
    const data = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
    const bmp = await createImageBitmap(new Blob([data as unknown as BlobPart]));
    const out = { data, png: m[2] === "png", w: bmp.width, h: bmp.height };
    bmp.close();
    return out;
  } catch {
    return null;
  }
}

/* ── CSV → blocks ──────────────────────────────────────────────────── */

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const t = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (quoted) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      cell = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
    } else if (c === "\r") {
      /* skip */
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows;
}

/* ── PDF renderer ──────────────────────────────────────────────────── */

interface Ctx {
  doc: PDFDocument;
  fonts: Record<string, PDFFont>;
  pageW: number;
  pageH: number;
  ml: number;
  mr: number;
  mt: number;
  mb: number;
  page: ReturnType<PDFDocument["getPage"]>;
  y: number;
}

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([ctx.pageW, ctx.pageH]);
  ctx.y = ctx.pageH - ctx.mt;
}

function fontFor(ctx: Ctx, r: Run): PDFFont {
  if (r.code) return ctx.fonts.mono;
  if (r.bold && r.italic) return ctx.fonts.bi;
  if (r.bold) return ctx.fonts.b;
  if (r.italic) return ctx.fonts.i;
  return ctx.fonts.r;
}

function wrapRuns(ctx: Ctx, runs: Run[], size: number, maxW: number): { font: PDFFont; size: number; text: string }[][] {
  // split runs into words, then greedily pack lines
  const words: { font: PDFFont; size: number; text: string; w: number }[] = [];
  for (const r of runs) {
    if (r.t === "\n") {
      words.push({ font: fontFor(ctx, r), size, text: "\n", w: 0 });
      continue;
    }
    const font = fontFor(ctx, r);
    for (const piece of r.t.split(/(\s+)/)) {
      if (!piece) continue;
      if (/^\s+$/.test(piece)) {
        words.push({ font, size, text: " ", w: font.widthOfTextAtSize(" ", size) });
      } else {
        words.push({ font, size, text: piece, w: font.widthOfTextAtSize(piece, size) });
      }
    }
  }
  const lines: { font: PDFFont; size: number; text: string }[][] = [];
  let line: { font: PDFFont; size: number; text: string }[] = [];
  let lw = 0;
  const flush = () => {
    if (line.length) lines.push(line);
    line = [];
    lw = 0;
  };
  for (const w of words) {
    if (w.text === "\n") {
      flush();
      continue;
    }
    if (lw + w.w > maxW && line.length) flush();
    // drop leading spaces at line start
    if (line.length === 0 && w.text === " ") continue;
    line.push(w);
    lw += w.w;
  }
  flush();
  return lines;
}

function drawLines(ctx: Ctx, lines: { font: PDFFont; size: number; text: string }[][], size: number, indent = 0) {
  const lh = size * 1.35;
  for (const line of lines) {
    if (ctx.y - lh < ctx.mb) newPage(ctx);
    let x = ctx.ml + indent;
    for (const w of line) {
      ctx.page.drawText(w.text, { x, y: ctx.y - lh + size * 0.25, size: w.size, font: w.font, color: rgb(0.13, 0.11, 0.07) });
      x += w.font.widthOfTextAtSize(w.text, w.size);
    }
    ctx.y -= lh;
  }
}

function paraGap(ctx: Ctx, size: number) {
  ctx.y -= size * 0.45;
  if (ctx.y < ctx.mb) newPage(ctx);
}

function renderBlocks(ctx: Ctx, blocks: Block[]) {
  const CW = ctx.pageW - ctx.ml - ctx.mr;
  const HSIZE = [0, 19, 16, 14, 12.5, 11.5, 11];
  for (const b of blocks) {
    if (b.k === "pagebreak") {
      newPage(ctx);
      continue;
    }
    if (b.k === "hr") {
      if (ctx.y - 14 < ctx.mb) newPage(ctx);
      ctx.y -= 7;
      ctx.page.drawLine({ start: { x: ctx.ml, y: ctx.y }, end: { x: ctx.pageW - ctx.mr, y: ctx.y }, thickness: 0.75, color: rgb(0.72, 0.66, 0.55) });
      ctx.y -= 7;
      continue;
    }
    if (b.k === "h") {
      const size = HSIZE[Math.min(6, Math.max(1, b.level))];
      paraGap(ctx, 12);
      drawLines(ctx, wrapRuns(ctx, b.runs.map((r) => ({ ...r, bold: true })), size, CW), size);
      paraGap(ctx, 12);
      continue;
    }
    if (b.k === "p") {
      const size = 11;
      drawLines(ctx, wrapRuns(ctx, b.runs, size, CW), size);
      paraGap(ctx, size);
      continue;
    }
    if (b.k === "li") {
      const size = 11;
      const bullet = b.ordered ? `${b.idx}. ` : "• ";
      const indent = b.indent * 18;
      const bf = ctx.fonts.b;
      const bw = bf.widthOfTextAtSize(bullet, size);
      drawLines(ctx, wrapRuns(ctx, [{ t: bullet, bold: true }, ...b.runs], size, CW - indent - bw - 6), size, indent);
      paraGap(ctx, size * 0.6);
      continue;
    }
    if (b.k === "code") {
      const size = 9.5;
      const lines = wrapRuns(ctx, [{ t: b.text, code: true }], size, CW - 16);
      const h = lines.length * size * 1.35 + 10;
      if (ctx.y - h < ctx.mb) newPage(ctx);
      ctx.page.drawRectangle({ x: ctx.ml, y: ctx.y - h, width: CW, height: h, color: rgb(0.93, 0.9, 0.84) });
      const saveY = ctx.y - 5;
      ctx.y = saveY;
      drawLines(ctx, lines.map((l) => l.map((w) => ({ ...w, font: ctx.fonts.mono }))), size, 8);
      paraGap(ctx, size);
      continue;
    }
    if (b.k === "table") {
      renderTable(ctx, b.rows, b.header, CW);
      continue;
    }
  }
}


function renderTable(ctx: Ctx, rows: string[][], header: boolean, CW: number) {
  const size = 9.5;
  const cols = Math.max(...rows.map((r) => r.length));
  if (!cols) return;
  // measure natural widths
  const nat: number[] = new Array(cols).fill(40);
  for (const row of rows) {
    for (let c = 0; c < cols; c++) {
      const cell = row[c] ?? "";
      const w = ctx.fonts.b.widthOfTextAtSize(cell, size) + 12;
      if (w > nat[c]) nat[c] = w;
    }
  }
  const totalNat = nat.reduce((a, b) => a + b, 0);
  const scale = totalNat > CW ? CW / totalNat : 1;
  const widths = nat.map((w) => Math.max(24, w * scale));
  paraGap(ctx, 10);
  rows.forEach((row, ri) => {
    const cellLines = row.map((_, c) => wrapRuns(ctx, [{ t: row[c] ?? "", bold: header && ri === 0 }], size, widths[c] - 8));
    // pad missing cells
    while (cellLines.length < cols) cellLines.push([]);
    const rh = Math.max(1, ...cellLines.map((l) => l.length)) * size * 1.35 + 8;
    if (ctx.y - rh < ctx.mb) newPage(ctx);
    let x = ctx.ml;
    cellLines.forEach((lines, c) => {
      const cw = widths[c];
      if (header && ri === 0) {
        ctx.page.drawRectangle({ x, y: ctx.y - rh, width: cw, height: rh, color: rgb(0.88, 0.84, 0.75) });
      }
      ctx.page.drawRectangle({ x, y: ctx.y - rh, width: cw, height: rh, borderColor: rgb(0.6, 0.55, 0.45), borderWidth: 0.5 });
      let ly = ctx.y - 4;
      for (const line of lines) {
        let lx = x + 4;
        for (const w of line) {
          ctx.page.drawText(w.text, { x: lx, y: ly - size, size: w.size, font: w.font, color: rgb(0.13, 0.11, 0.07) });
          lx += w.font.widthOfTextAtSize(w.text, w.size);
        }
        ly -= size * 1.35;
      }
      x += cw;
    });
    ctx.y -= rh;
  });
  paraGap(ctx, 10);
}

export async function renderPdf(blocks: Block[], paper: PaperMm): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fonts = {
    r: await doc.embedFont(StandardFonts.Helvetica),
    b: await doc.embedFont(StandardFonts.HelveticaBold),
    i: await doc.embedFont(StandardFonts.HelveticaOblique),
    bi: await doc.embedFont(StandardFonts.HelveticaBoldOblique),
    mono: await doc.embedFont(StandardFonts.Courier),
  };
  const pageW = paper.w * MM;
  const pageH = paper.h * MM;
  // pre-embed images (renderer is sync)
  const embedded = new Map<number, { img: unknown; w: number; h: number }>();
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.k !== "img") continue;
    try {
      const img = b.png ? await doc.embedPng(b.data) : await doc.embedJpg(b.data);
      embedded.set(i, { img, w: b.w, h: b.h });
    } catch {
      /* mark undecodable */
      embedded.set(i, { img: null, w: 0, h: 0 });
    }
  }
  const ctx: Ctx = {
    doc,
    fonts,
    pageW,
    pageH,
    ml: MARGIN * MM,
    mr: MARGIN * MM,
    mt: MARGIN * MM,
    mb: MARGIN * MM,
    page: doc.addPage([pageW, pageH]),
    y: pageH - MARGIN * MM,
  };
  // swap image blocks to use pre-embedded handles
  const resolved = blocks.map((b, i) => {
    if (b.k !== "img") return b;
    const e = embedded.get(i);
    if (!e || !e.img) return { k: "p", runs: [{ t: "[image]" }] } as Block;
    return { ...b, _img: e.img } as Block & { _img: unknown };
  });
  // render with embedded images
  renderBlocksWithImages(ctx, resolved);
  return doc.save({ useObjectStreams: true });
}

function renderBlocksWithImages(ctx: Ctx, blocks: (Block & { _img?: unknown })[]) {
  const CW = ctx.pageW - ctx.ml - ctx.mr;
  const HSIZE = [0, 19, 16, 14, 12.5, 11.5, 11];
  for (const b of blocks) {
    if (b.k === "img" && b._img) {
      const maxW = CW;
      const scale = Math.min(1, maxW / b.w);
      const w = b.w * scale;
      const h = b.h * scale;
      if (ctx.y - h < ctx.mb) newPage(ctx);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx.page.drawImage(b._img as any, { x: ctx.ml, y: ctx.y - h, width: w, height: h });
      ctx.y -= h;
      paraGap(ctx, 11);
      continue;
    }
    renderBlocks(ctx, [b]);
  }
}

/* ── inputs ────────────────────────────────────────────────────────── */

export async function docxToPdf(
  inputBytes: Uint8Array,
  paper: PaperMm = A4,
  onEvent?: (t: string, m: string) => void,
): Promise<Uint8Array> {
  const emit = (m: string) => onEvent?.("info", m);
  emit("docbuild: parsing docx");
  const mammoth = await import("mammoth");
  const result = await mammoth.convertToHtml(
    { arrayBuffer: inputBytes.slice(0).buffer as ArrayBuffer },
    {
      convertImage: mammoth.images.imgElement((img: { read: (enc: string) => Promise<string>; contentType: string }) =>
        img.read("base64").then((src: string) => ({ src: `data:${img.contentType};base64,${src}` })),
      ),
    },
  );
  const messages = (result.messages ?? []).filter((m: { type?: string }) => m.type === "warning");
  if (messages.length) emit(`docbuild: ${messages.length} layout warning(s) — check output`);
  const doc = new DOMParser().parseFromString(`<body>${result.value}</body>`, "text/html");
  const images = new Map<string, { data: Uint8Array; png: boolean; w: number; h: number }>();
  for (const el of Array.from(doc.querySelectorAll("img"))) {
    const src = el.getAttribute("src") ?? "";
    if (!src || images.has(src)) continue;
    const decoded = await decodeDataUrl(src);
    if (decoded) images.set(src, decoded);
  }
  const blocks = htmlToBlocks(doc.body, images);
  emit(`docbuild: rendering ${blocks.length} block(s)`);
  return renderPdf(blocks, paper);
}

export async function xlsxToPdf(
  inputBytes: Uint8Array,
  sheet: string | undefined,
  paper: PaperMm = A4,
  onEvent?: (t: string, m: string) => void,
): Promise<Uint8Array> {
  const emit = (m: string) => onEvent?.("info", m);
  const mod = await import("xlsx");
  const XLSX = mod.default ?? mod;
  const wb = XLSX.read(inputBytes.slice(0), { type: "array" });
  const names = sheet ? wb.SheetNames.filter((n: string) => n === sheet) : wb.SheetNames;
  if (!names.length) throw new Error(`docbuild: sheet "${sheet}" not found`);
  const blocks: Block[] = [];
  for (const name of names) {
    const ws = wb.Sheets[name];
    if (!ws) continue;
    if (names.length > 1 || (sheet === undefined && wb.SheetNames.length > 1)) {
      blocks.push({ k: "h", level: 2, runs: [{ t: name }] });
    }
    const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });
    if (rows.length) blocks.push({ k: "table", rows: rows.map((r) => r.map(String)), header: true });
  }
  if (!blocks.length) throw new Error("docbuild: workbook has no data");
  emit(`docbuild: rendering sheet(s) ${names.join(", ")}`);
  return renderPdf(blocks, paper);
}

export async function textToPdf(text: string, paper: PaperMm = A4): Promise<Uint8Array> {
  const blocks: Block[] = [];
  for (const para of text.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const t = para.trim();
    if (t) blocks.push({ k: "p", runs: [{ t }] });
  }
  if (!blocks.length) blocks.push({ k: "p", runs: [{ t: " " }] });
  return renderPdf(blocks, paper);
}

export async function csvToPdf(text: string, paper: PaperMm = A4): Promise<Uint8Array> {
  const rows = parseCsv(text);
  if (!rows.length) throw new Error("docbuild: csv has no data");
  return renderPdf([{ k: "table", rows, header: true }], paper);
}

export async function htmlToPdf(html: string, paper: PaperMm = A4): Promise<Uint8Array> {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const images = new Map<string, { data: Uint8Array; png: boolean; w: number; h: number }>();
  for (const el of Array.from(doc.querySelectorAll("img"))) {
    const src = el.getAttribute("src") ?? "";
    if (src.startsWith("data:") && !images.has(src)) {
      const decoded = await decodeDataUrl(src);
      if (decoded) images.set(src, decoded);
    }
  }
  const blocks = htmlToBlocks(doc.body, images);
  if (!blocks.length) throw new Error("docbuild: no readable content");
  return renderPdf(blocks, paper);
}

/* ── pdf → docx (structural reconstruction) ────────────────────────── */

export async function pdfToDocx(inputBytes: Uint8Array, onEvent?: (t: string, m: string) => void): Promise<Uint8Array> {
  const emit = (m: string) => onEvent?.("info", m);
  emit("pdfdocx: reading text layer");
  const pdfjs = await import("pdfjs-dist");
  const doc = await pdfjs.getDocument({ data: inputBytes.slice(0) }).promise;
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak } = await import("docx");
  const children: unknown[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    if (p > 1) children.push(new PageBreak());
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    type Item = { x: number; y: number; h: number; s: string };
    const items: Item[] = [];
    for (const it of tc.items as unknown[]) {
      const t = it as { str?: string; transform?: number[]; height?: number };
      if (!t.str || !t.str.trim() || !t.transform) continue;
      items.push({ x: t.transform[4], y: t.transform[5], h: t.height ?? 10, s: t.str });
    }
    if (!items.length) continue;
    // group into lines by y
    items.sort((a, b) => b.y - a.y || a.x - b.x);
    const lines: Item[][] = [];
    for (const it of items) {
      const last = lines[lines.length - 1];
      if (last && Math.abs(last[0].y - it.y) <= Math.max(2, last[0].h * 0.4)) last.push(it);
      else lines.push([it]);
    }
    const heights = lines.map((l) => Math.max(...l.map((i) => i.h)));
    const median = [...heights].sort((a, b) => a - b)[Math.floor(heights.length / 2)] || 10;
    // group lines into paragraphs on vertical gaps
    const paras: Item[][][] = [];
    let cur: Item[][] = [];
    let prevY = Infinity;
    lines.forEach((line, i) => {
      const gap = prevY - line[0].y;
      if (cur.length && gap > heights[i] * 1.8) {
        paras.push(cur);
        cur = [];
      }
      cur.push(line);
      prevY = line[0].y;
    });
    if (cur.length) paras.push(cur);
    for (const para of paras) {
      const text = para.map((l) => l.map((i) => i.s).join("")).join(" ").replace(/\s+/g, " ").trim();
      if (!text) continue;
      const maxH = Math.max(...para.flat().map((i) => i.h));
      const P = Paragraph as unknown as new (o: unknown) => unknown;
      const TR = TextRun as unknown as new (o: unknown) => unknown;
      if (maxH > median * 1.35) children.push(new P({ heading: HeadingLevel.HEADING_1, children: [new TR(text)] }));
      else if (maxH > median * 1.15) children.push(new P({ heading: HeadingLevel.HEADING_2, children: [new TR(text)] }));
      else children.push(new P({ children: [new TR(text)] }));
    }
    emit(`pdfdocx: page ${p}/${doc.numPages}`);
  }
  await doc.destroy().catch(() => undefined);
  if (!children.length) throw new Error("pdfdocx: no extractable text found");
  const out = await Packer.toBuffer(new Document({ sections: [{ children: children as never[] }] }));
  return new Uint8Array(out);
}
