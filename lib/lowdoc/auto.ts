/* Smart AUTO (PRD §37) — recommend a target format with a human reason. */

export interface AutoRecommendation {
  target: string;
  label: string;
  reason: string;
}

const RULES: Array<{
  matches: (ext: string) => boolean;
  rec: (ext: string) => AutoRecommendation | null;
}> = [
  {
    matches: (e) => ["doc", "docx", "odt", "rtf", "dotx", "docm", "sxw", "wpd", "sdw"].includes(e),
    rec: () => ({ target: "pdf", label: "PDF", reason: "Best for sharing and printing — layout stays fixed" }),
  },
  {
    matches: (e) => ["ppt", "pptx", "ppsx", "odp", "pot", "potx"].includes(e),
    rec: () => ({ target: "pdf", label: "PDF", reason: "Presentations travel safest as PDF" }),
  },
  {
    matches: (e) => ["jpg", "jpeg", "png", "bmp", "tiff", "gif"].includes(e),
    rec: (e) =>
      e === "png"
        ? { target: "webp", label: "WebP", reason: "Typically 25-35% smaller than PNG at equal quality" }
        : { target: "png", label: "PNG", reason: "Lossless and universally supported" },
  },
  {
    matches: (e) => ["csv", "tsv"].includes(e),
    rec: () => ({ target: "xlsx", label: "XLSX", reason: "Adds types, formulas and multiple sheets" }),
  },
  {
    matches: (e) => ["xlsx", "xls", "xlsm", "xlsb", "ods"].includes(e),
    rec: () => ({ target: "csv", label: "CSV", reason: "Universal data interchange" }),
  },
  {
    matches: (e) => ["md", "html", "tex", "org", "rst", "adoc"].includes(e),
    rec: () => ({ target: "pdf", label: "PDF", reason: "Rendered, paginated and ready to share" }),
  },
  {
    matches: (e) => ["pdf"].includes(e),
    rec: () => ({ target: "txt", label: "TXT", reason: "Extract the text layer for reuse" }),
  },
  {
    matches: (e) => ["epub"].includes(e),
    rec: () => ({ target: "pdf", label: "PDF", reason: "Fixed layout for print or review" }),
  },
  {
    matches: (e) => ["dxf"].includes(e),
    rec: () => ({ target: "svg", label: "SVG", reason: "Vector preview viewable anywhere" }),
  },
  {
    matches: (e) => ["json", "xml"].includes(e),
    rec: () => ({ target: "pdf", label: "PDF", reason: "Readable listing for review" }),
  },
];

export function recommendAuto(ext: string): AutoRecommendation | null {
  const e = ext.toLowerCase();
  for (const rule of RULES) {
    if (rule.matches(e)) {
      return rule.rec(e);
    }
  }
  return null;
}
