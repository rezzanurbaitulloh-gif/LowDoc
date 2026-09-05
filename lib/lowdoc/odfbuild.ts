/* ODT + PPTX browser fallbacks (no server needed).
   ODT: full block-model parse — paragraphs, headings, styled spans, tables
   (incl. repeated rows/cols), nested lists, embedded images.
   PPTX: slide text extraction — title + body runs per slide (Limited). */

import type { PaperMm } from "./docbuild";

type Run = { t: string; bold?: boolean; italic?: boolean; code?: boolean };
type Block =
  | { k: "h"; level: number; runs: Run[] }
  | { k: "p"; runs: Run[] }
  | { k: "li"; ordered: boolean; idx: number; indent: number; runs: Run[] }
  | { k: "table"; rows: string[][]; header: boolean }
  | { k: "img"; data: Uint8Array; png: boolean; w: number; h: number };

const ODF_TEXT = "urn:oasis:names:text";
const ODF_TABLE = "urn:oasis:names:table";
const ODF_FO = "urn:oasis:names:xsl-fo";
const XLINK = "http://www.w3.org/1999/xlink";

function odfText(el: Element): string {
  let out = "";
  const walk = (n: Node): void => {
    if (n.nodeType === 3) {
      out += n.textContent ?? "";
      return;
    }
    if (n.nodeType !== 1) return;
    const e = n as Element;
    const local = e.localName;
    if (local === "s") out += " ".repeat(Math.max(1, parseInt(e.getAttributeNS(ODF_TEXT, "c") ?? "1", 10) || 1));
    else if (local === "tab") out += "  ";
    else if (local === "line-break") out += "\n";
    else e.childNodes.forEach(walk);
  };
  el.childNodes.forEach(walk);
  return out.replace(/\s+/g, " ");
}

export async function odtToBlocks(
  inputBytes: Uint8Array,
  onEvent?: (t: string, m: string) => void,
): Promise<{ blocks: Block[]; note: string }> {
  const emit = (m: string) => onEvent?.("info", m);
  emit("docbuild: parsing odt");
  const { unzipSync } = await import("fflate");
  const files = unzipSync(inputBytes.slice(0));
  const names = Object.keys(files);
  if (!names.includes("content.xml")) throw new Error("docbuild: not a valid odt (no content.xml)");
  const xml = new TextDecoder().decode(files["content.xml"]);
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("docbuild: unreadable odt content.xml");

  const styles = new Map<string, { bold: boolean; italic: boolean }>();
  doc.querySelectorAll("automatic-styles style").forEach((st) => {
    const name = st.getAttribute("style:name") ?? "";
    let bold = false;
    let italic = false;
    st.querySelectorAll("text-properties").forEach((tp) => {
      if ((tp.getAttribute("fo:font-weight") ?? "").includes("bold")) bold = true;
      if ((tp.getAttribute("fo:font-style") ?? "").includes("italic")) italic = true;
    });
    if (name) styles.set(name, { bold, italic });
  });

  const pictures = new Map<string, Uint8Array>();
  for (const n of names) {
    if (n.startsWith("Pictures/") && !n.endsWith("/")) pictures.set(n, files[n]);
  }
  const imgCache = new Map<string, { data: Uint8Array; png: boolean; w: number; h: number }>();
  const imgFor = async (href: string) => {
    if (imgCache.has(href)) return imgCache.get(href)!;
    const data = pictures.get(href.replace(/^\.\//, ""));
    if (!data) return null;
    try {
      const bmp = await createImageBitmap(new Blob([data as unknown as BlobPart]));
      const entry = { data, png: !/\.jpe?g$/i.test(href), w: bmp.width, h: bmp.height };
      bmp.close();
      imgCache.set(href, entry);
      return entry;
    } catch {
      return null;
    }
  };

  const runsOfP = (p: Element): Run[] => {
    const runs: Run[] = [];
    const walk = (n: Node, bold: boolean, italic: boolean): void => {
      if (n.nodeType === 3) {
        const t = (n.textContent ?? "").replace(/\s+/g, " ");
        if (t.trim()) runs.push({ t, bold, italic });
        return;
      }
      if (n.nodeType !== 1) return;
      const e = n as Element;
      if (e.localName === "span") {
        const st = styles.get(e.getAttributeNS(ODF_TEXT, "style-name") ?? "");
        e.childNodes.forEach((c) => walk(c, bold || !!st?.bold, italic || !!st?.italic));
        return;
      }
      e.childNodes.forEach((c) => walk(c, bold, italic));
    };
    p.childNodes.forEach((c) => walk(c, false, false));
    return runs;
  };

  const blocks: Block[] = [];
  const pending: Array<() => Promise<void>> = [];
  const walkBlock = (el: Element, listIndent: number): void => {
    const local = el.localName;
    if (local === "p" || local === "h") {
      const runs = runsOfP(el);
      if (!runs.length) return;
      if (local === "h") {
        const level = Math.min(6, Math.max(1, parseInt(el.getAttributeNS(ODF_TEXT, "outline-level") ?? "1", 10) || 1));
        blocks.push({ k: "h", level, runs });
      } else blocks.push({ k: "p", runs });
    } else if (local === "list") {
      const ordered = /num|ordered|outline/i.test(el.getAttributeNS(ODF_TEXT, "style-name") ?? "");
      let idx = 1;
      el.childNodes.forEach((ch) => {
        if (ch.nodeType === 1 && (ch as Element).localName === "list-item") {
          const item = ch as Element;
          const runs: Run[] = [];
          item.childNodes.forEach((g) => {
            if (g.nodeType !== 1) return;
            const tag = (g as Element).localName;
            if (tag === "list") walkBlock(g as Element, listIndent + 1);
            else if (tag === "p" || tag === "h") runs.push(...runsOfP(g as Element));
          });
          if (runs.length) blocks.push({ k: "li", ordered, idx: idx++, indent: listIndent, runs });
        }
      });
    } else if (local === "table") {
      const rows: string[][] = [];
      Array.from(el.getElementsByTagNameNS(ODF_TABLE, "table-row")).forEach((tr) => {
        const trel = tr as unknown as Element;
        const repeat = Math.max(1, parseInt(trel.getAttributeNS(ODF_TABLE, "number-rows-repeated") ?? "1", 10) || 1);
        const cells: string[] = [];
        trel.childNodes.forEach((td) => {
          if (td.nodeType !== 1) return;
          const tag = (td as Element).localName;
          if (tag !== "table-cell" && tag !== "covered-table-cell") return;
          const nrep = Math.max(1, parseInt((td as Element).getAttributeNS(ODF_TABLE, "number-columns-repeated") ?? "1", 10) || 1);
          const texts: string[] = [];
          Array.from((td as Element).getElementsByTagNameNS(ODF_TEXT, "p")).forEach((pp) => texts.push(odfText(pp as unknown as Element)));
          for (let i = 0; i < nrep; i++) cells.push(texts.join(" "));
        });
        for (let i = 0; i < repeat; i++) rows.push(cells);
      });
      if (rows.length) blocks.push({ k: "table", rows, header: true });
    } else if (local === "image" || local === "frame") {
      const href =
        el.getAttributeNS(XLINK, "href") ??
        el.querySelector("image")?.getAttributeNS(XLINK, "href") ??
        "";
      if (href) {
        pending.push(async () => {
          const img = await imgFor(href);
          if (img) blocks.push({ k: "img", ...img });
        });
      }
    } else {
      el.childNodes.forEach((ch) => {
        if (ch.nodeType === 1) walkBlock(ch as Element, listIndent);
      });
    }
  };
  const bodies = doc.getElementsByTagNameNS(ODF_TEXT, "body");
  const root: Element = bodies.length ? (bodies[0] as unknown as Element) : doc.documentElement;
  root.childNodes.forEach((ch) => {
    if (ch.nodeType === 1) walkBlock(ch as Element, 0);
  });
  for (const fn of pending) await fn();
  if (!blocks.length) throw new Error("docbuild: no readable content in odt");
  emit(`docbuild: rendering ${blocks.length} block(s)`);
  void ODF_FO;
  return { blocks, note: "odt" };
}

export async function renderOdtToPdf(
  inputBytes: Uint8Array,
  paper: PaperMm,
  render: (blocks: Block[], paper: PaperMm) => Promise<Uint8Array>,
  onEvent?: (t: string, m: string) => void,
): Promise<Uint8Array> {
  const { blocks } = await odtToBlocks(inputBytes, onEvent);
  return render(blocks, paper);
}

export async function renderPptxToPdf(
  inputBytes: Uint8Array,
  paper: PaperMm,
  render: (blocks: Block[], paper: PaperMm) => Promise<Uint8Array>,
  onEvent?: (t: string, m: string) => void,
): Promise<Uint8Array> {
  const emit = (m: string) => onEvent?.("info", m);
  emit("docbuild: extracting slide text");
  const { unzipSync } = await import("fflate");
  const files = unzipSync(inputBytes.slice(0));
  const names = Object.keys(files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n));
  if (!names.length) throw new Error("docbuild: no slides found");
  names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const dec = new TextDecoder();
  const NS = "http://schemas.openxmlformats.org/drawingml/2006/main";
  const blocks: Block[] = [];
  names.forEach((n, si) => {
    const xml = dec.decode(files[n]);
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    if (doc.querySelector("parsererror")) return;
    blocks.push({ k: "h", level: 2, runs: [{ t: `Slide ${si + 1}` }] });
    const paras = doc.getElementsByTagNameNS(NS, "p");
    for (let i = 0; i < paras.length; i++) {
      const runs: Run[] = [];
      Array.from((paras[i] as unknown as Element).getElementsByTagNameNS(NS, "t")).forEach((t) => {
        runs.push({ t: (t as unknown as Element).textContent ?? "" });
      });
      const text = runs
        .map((r) => r.t)
        .join("")
        .trim();
      if (!text) continue;
      if (i === 0) blocks.push({ k: "h", level: 3, runs: [{ t: text }] });
      else blocks.push({ k: "p", runs: [{ t: text }] });
    }
    blocks.push({ k: "pagebreak" } as unknown as Block);
  });
  if (!blocks.length) throw new Error("docbuild: no extractable slide text");
  emit(`docbuild: rendering ${names.length} slide(s)`);
  return render(blocks, paper);
}
