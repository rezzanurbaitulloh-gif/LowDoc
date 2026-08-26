/* Paper Size Engine (PRD §11–13) — registry, detection, search. */

export interface PaperSize {
  id: string;
  name: string;
  series: string;
  /** portrait dimensions in mm */
  w: number;
  h: number;
}

const iso = (series: "A" | "B" | "C", w0: number, h0: number): PaperSize[] => {
  const out: PaperSize[] = [];
  let w = w0;
  let h = h0;
  for (let i = 0; i <= 10; i++) {
    out.push({ id: `${series}${i}`, name: `${series}${i}`, series: `ISO ${series}`, w: Math.round(w), h: Math.round(h) });
    // each next size: halve the longer side
    const nw = Math.floor(h / 2);
    const nh = w;
    w = nw;
    h = nh;
  }
  return out;
};

export const PAPER_SIZES: PaperSize[] = [
  ...iso("A", 841, 1189),
  ...iso("B", 1000, 1414),
  ...iso("C", 917, 1297),
  { id: "letter", name: "Letter", series: "US", w: 215.9, h: 279.4 },
  { id: "legal", name: "Legal", series: "US", w: 215.9, h: 355.6 },
  { id: "tabloid", name: "Tabloid", series: "US", w: 279.4, h: 431.8 },
  { id: "ledger", name: "Ledger", series: "US", w: 431.8, h: 279.4 },
  { id: "executive", name: "Executive", series: "US", w: 184.15, h: 266.7 },
  { id: "statement", name: "Statement", series: "US", w: 139.7, h: 215.9 },
  { id: "folio", name: "Folio", series: "Regional", w: 215.9, h: 330.2 },
  { id: "f4", name: "F4", series: "Regional", w: 210, h: 330 },
  { id: "quarto", name: "Quarto", series: "Regional", w: 229, h: 279 },
];

export const POPULAR_PAPERS = ["f4", "a4", "letter", "legal", "a3", "a5", "folio"];

export function paperById(id: string): PaperSize | null {
  return PAPER_SIZES.find((p) => p.id === id) ?? null;
}

export interface CustomPaper {
  custom: true;
  w: number;
  h: number;
}

/** mm → twips (1 mm = 56.6929 twips) */
export const mmToTwips = (mm: number) => Math.round(mm * 56.6929);

export interface PaperMatch {
  paper: PaperSize;
  orientation: "portrait" | "landscape";
}

/** Match measured page dimensions (mm) to the closest registry entry. */
export function matchPaper(wMm: number, hMm: number): PaperMatch | "custom" {
  const portraitW = Math.min(wMm, hMm);
  const portraitH = Math.max(wMm, hMm);
  const orientation: PaperMatch["orientation"] = wMm <= hMm ? "portrait" : "landscape";
  let best: PaperSize | null = null;
  let bestDist = Infinity;
  for (const p of PAPER_SIZES) {
    const dw = Math.abs(p.w - portraitW);
    const dh = Math.abs(p.h - portraitH);
    // tolerance: within 2mm on both sides
    if (dw <= 2 && dh <= 2 && dw + dh < bestDist) {
      bestDist = dw + dh;
      best = p;
    }
  }
  if (!best) return "custom";
  return { paper: best, orientation };
}

export function formatMm(w: number, h: number): string {
  return `${trim(w)} × ${trim(h)} mm`;
}

const trim = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** Search by name, id, series, or dimensions ("210x330", "8.27 x 11.69 in"). */
export function searchPapers(query: string, limit = 12): PaperSize[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return POPULAR_PAPERS.map((id) => paperById(id)!).filter(Boolean);
  }
  const dim = q.match(/([\d.]+)\s*[x×]\s*([\d.]+)/);
  if (dim) {
    let w = parseFloat(dim[1]);
    let h = parseFloat(dim[2]);
    // inches heuristic: values < 20 → treat as inches
    if (w < 20 && h < 20) {
      w *= 25.4;
      h *= 25.4;
    }
    const portraitW = Math.min(w, h);
    const portraitH = Math.max(w, h);
    return PAPER_SIZES.filter((p) => {
      const dw = Math.abs(p.w - portraitW);
      const dh = Math.abs(p.h - portraitH);
      return (dw <= 2.5 && dh <= 2.5) || (Math.abs(p.w - portraitH) <= 2.5 && Math.abs(p.h - portraitW) <= 2.5);
    }).slice(0, limit);
  }
  const scored = PAPER_SIZES.map((p) => {
    const hay = `${p.id} ${p.name} ${p.series} ${formatMm(p.w, p.h)}`.toLowerCase();
    const idx = hay.indexOf(q);
    return { p, score: idx === -1 ? Infinity : idx };
  })
    .filter((s) => s.score !== Infinity)
    .sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.p);
}
