"use client";

export type LowDocCategory =
  | "office"
  | "apple"
  | "data"
  | "publish"
  | "cad"
  | "legacy"
  | "markup"
  | "image";

export interface LowDocFormat {
  key: string;
  name: string;
  extensions: string[];
  category: LowDocCategory;
  description: string;
  kind: "text" | "binary";
}

export const CATEGORY_LABELS: Record<LowDocCategory, string> = {
  office: "Office",
  apple: "Apple Ecosystem",
  data: "Data & Spreadsheets",
  publish: "E-Books & Publishing",
  cad: "CAD & Engineering",
  legacy: "Legacy Systems",
  markup: "Text & Markup",
  image: "Document Images",
};

export const CATEGORY_ORDER: LowDocCategory[] = [
  "office",
  "apple",
  "data",
  "publish",
  "cad",
  "legacy",
  "markup",
  "image",
];

export const FORMATS: LowDocFormat[] = [
  // office
  { key: "docx", name: "Word Document", extensions: ["docx"], category: "office", kind: "binary", description: "Office Open XML (2007+)" },
  { key: "doc", name: "Word 97-2003", extensions: ["doc"], category: "office", kind: "binary", description: "Legacy OLE2 binary" },
  { key: "docm", name: "Word Macro-Enabled", extensions: ["docm"], category: "office", kind: "binary", description: "OOXML with macros" },
  { key: "dotx", name: "Word Template", extensions: ["dotx"], category: "office", kind: "binary", description: "OOXML template" },
  { key: "xlsx", name: "Excel Workbook", extensions: ["xlsx"], category: "office", kind: "binary", description: "OOXML spreadsheet" },
  { key: "xls", name: "Excel 97-2003", extensions: ["xls"], category: "office", kind: "binary", description: "Legacy BIFF binary" },
  { key: "xlsm", name: "Excel Macro-Enabled", extensions: ["xlsm"], category: "office", kind: "binary", description: "OOXML workbook" },
  { key: "xlsb", name: "Excel Binary", extensions: ["xlsb"], category: "office", kind: "binary", description: "Binary workbook" },
  { key: "pptx", name: "PowerPoint", extensions: ["pptx"], category: "office", kind: "binary", description: "OOXML presentation" },
  { key: "ppt", name: "PowerPoint 97-2003", extensions: ["ppt"], category: "office", kind: "binary", description: "Legacy presentation" },
  { key: "ppsx", name: "PowerPoint Show", extensions: ["ppsx"], category: "office", kind: "binary", description: "OOXML slideshow" },
  { key: "odt", name: "ODF Text", extensions: ["odt"], category: "office", kind: "binary", description: "OpenDocument Text" },
  { key: "ods", name: "ODF Spreadsheet", extensions: ["ods"], category: "office", kind: "binary", description: "OpenDocument Calc" },
  { key: "odp", name: "ODF Presentation", extensions: ["odp"], category: "office", kind: "binary", description: "OpenDocument Impress" },
  { key: "rtf", name: "Rich Text", extensions: ["rtf"], category: "office", kind: "text", description: "Rich Text Format" },
  { key: "txt", name: "Plain Text", extensions: ["txt"], category: "office", kind: "text", description: "UTF-8 text" },
  // apple
  { key: "pages", name: "Pages", extensions: ["pages"], category: "apple", kind: "binary", description: "Apple Pages" },
  { key: "numbers", name: "Numbers", extensions: ["numbers"], category: "apple", kind: "binary", description: "Apple Numbers" },
  { key: "key", name: "Keynote", extensions: ["key"], category: "apple", kind: "binary", description: "Apple Keynote" },
  // data
  { key: "csv", name: "CSV", extensions: ["csv"], category: "data", kind: "text", description: "Comma-separated values" },
  { key: "tsv", name: "TSV", extensions: ["tsv"], category: "data", kind: "text", description: "Tab-separated values" },
  { key: "json", name: "JSON", extensions: ["json"], category: "data", kind: "text", description: "JavaScript Object Notation" },
  { key: "xml", name: "XML", extensions: ["xml"], category: "data", kind: "text", description: "eXtensible Markup Language" },
  { key: "html", name: "HTML", extensions: ["html", "htm"], category: "data", kind: "text", description: "HyperText Markup Language" },
  // publish
  { key: "epub", name: "EPUB", extensions: ["epub"], category: "publish", kind: "binary", description: "Open eBook format" },
  { key: "md", name: "Markdown", extensions: ["md", "markdown"], category: "publish", kind: "text", description: "Markdown text" },
  { key: "tex", name: "LaTeX", extensions: ["tex"], category: "publish", kind: "text", description: "LaTeX source" },
  // cad
  { key: "dxf", name: "DXF", extensions: ["dxf"], category: "cad", kind: "text", description: "Drawing Exchange Format" },
  { key: "svg", name: "SVG", extensions: ["svg"], category: "cad", kind: "text", description: "Scalable Vector Graphics" },
  // legacy
  { key: "wpd", name: "WordPerfect", extensions: ["wpd"], category: "legacy", kind: "binary", description: "WordPerfect document" },
  { key: "sdw", name: "StarWriter", extensions: ["sdw"], category: "legacy", kind: "binary", description: "StarOffice Writer" },
  { key: "sxw", name: "OpenOffice 1.x", extensions: ["sxw"], category: "legacy", kind: "binary", description: "OpenOffice.org Writer" },
  // markup
  { key: "org", name: "Org Mode", extensions: ["org"], category: "markup", kind: "text", description: "Emacs Org-mode" },
  { key: "rst", name: "reStructuredText", extensions: ["rst"], category: "markup", kind: "text", description: "Docutils reST" },
  { key: "adoc", name: "AsciiDoc", extensions: ["adoc", "asciidoc"], category: "markup", kind: "text", description: "AsciiDoc markup" },
  // image
  { key: "pdf", name: "PDF", extensions: ["pdf"], category: "image", kind: "binary", description: "Portable Document Format" },
  { key: "png", name: "PNG", extensions: ["png"], category: "image", kind: "binary", description: "Portable Network Graphics" },
  { key: "jpg", name: "JPEG", extensions: ["jpg", "jpeg"], category: "image", kind: "binary", description: "Joint Photographic Experts Group" },
  { key: "webp", name: "WebP", extensions: ["webp"], category: "image", kind: "binary", description: "Google WebP image" },
  { key: "gif", name: "GIF", extensions: ["gif"], category: "image", kind: "binary", description: "Graphics Interchange Format" },
  { key: "tiff", name: "TIFF", extensions: ["tiff", "tif"], category: "image", kind: "binary", description: "Tagged Image File Format" },
  { key: "bmp", name: "BMP", extensions: ["bmp"], category: "image", kind: "binary", description: "Windows Bitmap" },
  { key: "ico", name: "ICO", extensions: ["ico"], category: "image", kind: "binary", description: "Windows Icon" },
];

export const FORMAT_BY_KEY: Record<string, LowDocFormat> = Object.fromEntries(
  FORMATS.map((f) => [f.key, f]),
);

export function formatByExtension(ext: string): LowDocFormat | undefined {
  const e = ext.toLowerCase().replace(/^\./, "");
  return FORMATS.find((f) => f.extensions.includes(e));
}