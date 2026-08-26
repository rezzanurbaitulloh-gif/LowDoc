/* Rewrite w:pgSz inside a .docx so LibreOffice exports PDF at the chosen paper size (PRD §16). */
import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";

export interface PaperOverride {
  /** twips */
  w: number;
  /** twips */
  h: number;
}

export function patchDocxPaperSize(bytes: Uint8Array, paper: PaperOverride): Uint8Array {
  const files = unzipSync(bytes);
  const docName = Object.keys(files).find((n) => n === "word/document.xml") ?? "word/document2.xml";
  const xmlBytes = files[docName];
  if (!xmlBytes) throw new Error("paper: not a valid docx (no word/document.xml)");
  let xml = strFromU8(xmlBytes);

  const szTag = /<w:pgSz\b[^>]*\/>/;
  const replacement = `<w:pgSz w:w="${paper.w}" w:h="${paper.h}" w:orient="${paper.w > paper.h ? "landscape" : "portrait"}"/>`;
  if (szTag.test(xml)) {
    xml = xml.replace(szTag, replacement);
  } else {
    // no sectPr pgSz — inject into the last sectPr
    xml = xml.replace(/<\/w:sectPr>/, `${replacement.replace("/>", ` w:type="portrait"/>`)}</w:sectPr>`);
  }

  files[docName] = strToU8(xml);
  return zipSync(files, { level: 6 });
}
