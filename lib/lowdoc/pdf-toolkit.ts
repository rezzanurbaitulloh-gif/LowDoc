"use client";

import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

export interface SplitRange {
  start: number;
  end: number;
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    for (const page of pages) merged.addPage(page);
  }
  return merged.save({ useObjectStreams: true });
}

export async function splitPdf(input: Uint8Array, ranges: SplitRange[]): Promise<{ name: string; data: Uint8Array }[]> {
  const src = await PDFDocument.load(input, { ignoreEncryption: true });
  const total = src.getPageCount();
  const parts: { name: string; data: Uint8Array }[] = [];
  for (const range of ranges) {
    const start = Math.max(1, range.start);
    const end = Math.min(total, range.end);
    if (start > end || start > total) continue;
    const doc = await PDFDocument.create();
    const idx: number[] = [];
    for (let i = start - 1; i < end; i++) idx.push(i);
    const pages = await doc.copyPages(src, idx);
    for (const page of pages) doc.addPage(page);
    const data = await doc.save({ useObjectStreams: true });
    parts.push({ name: `split-${start}-${end}.pdf`, data: new Uint8Array(data) });
  }
  return parts;
}

export function parseRanges(text: string, totalPages: number): SplitRange[] {
  const ranges: SplitRange[] = [];
  const tokens = text.split(/[,;\s]+/).filter(Boolean);
  if (tokens.length === 0) throw new Error("no ranges specified");
  for (const token of tokens) {
    const m = token.match(/^(\d+)-(\d+)$/);
    if (m) {
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      if (a < 1 || b < 1 || a > b) throw new Error(`invalid range: ${token}`);
      ranges.push({ start: a, end: b });
    } else if (/^\d+$/.test(token)) {
      const p = parseInt(token, 10);
      if (p < 1 || p > totalPages) throw new Error(`page out of range: ${token}`);
      ranges.push({ start: p, end: p });
    } else {
      throw new Error(`invalid token: ${token}`);
    }
  }
  return ranges;
}

export async function compressPdf(input: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(input, { ignoreEncryption: true });
  return doc.save({ useObjectStreams: true });
}

/* ---- new PDF operations ---------------------------------------------------------------------------------------------- */

export async function extractPages(input: Uint8Array, pages: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(input, { ignoreEncryption: true });
  const total = src.getPageCount();
  const doc = await PDFDocument.create();
  for (const p of pages) {
    if (p >= 1 && p <= total) {
      const pages = await doc.copyPages(src, [p - 1]);
      for (const page of pages) doc.addPage(page);
    }
  }
  return doc.save({ useObjectStreams: true });
}

export async function deletePages(input: Uint8Array, pagesToDelete: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(input, { ignoreEncryption: true });
  const total = src.getPageCount();
  const doc = await PDFDocument.create();
  const keepIndices: number[] = [];
  for (let i = 0; i < total; i++) {
    if (!pagesToDelete.includes(i + 1)) keepIndices.push(i);
  }
  const pages = await doc.copyPages(src, keepIndices);
  for (const page of pages) doc.addPage(page);
  return doc.save({ useObjectStreams: true });
}

export async function reorderPages(input: Uint8Array, order: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(input, { ignoreEncryption: true });
  const total = src.getPageCount();
  const doc = await PDFDocument.create();
  const validOrder = order.filter(p => p >= 1 && p <= total);
  const pages = await doc.copyPages(src, validOrder.map(p => p - 1));
  for (const page of pages) doc.addPage(page);
  return doc.save({ useObjectStreams: true });
}

export async function rotatePages(input: Uint8Array, rotation: number, pages?: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(input, { ignoreEncryption: true });
  const total = src.getPageCount();
  const angle = (rotation % 360 + 360) % 360;
  const targetPages = pages && pages.length > 0 ? pages : Array.from({ length: src.getPageCount() }, (_, i) => i + 1);
  for (const p of targetPages) {
    if (p >= 1 && p <= total) {
      const page = src.getPage(p - 1);
      page.setRotation(degrees(angle));
    }
  }
  return src.save({ useObjectStreams: true });
}

export async function addText(input: Uint8Array, options: {
  text: string;
  page?: number;
  x?: number;
  y?: number;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  font?: string;
}): Promise<Uint8Array> {
  const src = await PDFDocument.load(input, { ignoreEncryption: true });
  const total = src.getPageCount();
  const pageIndex = (options.page ?? 1) - 1;
  if (pageIndex < 0 || pageIndex >= src.getPageCount()) throw new Error("page out of range");
  
  const page = src.getPage(pageIndex);
  const font = await src.embedFont(StandardFonts.Helvetica);
  const fontSize = options.fontSize ?? 12;
  const color = options.color ?? { r: 0, g: 0, b: 0 };
  const x = options.x ?? 50;
  const y = options.y ?? 50;
  
  const pageDims = src.getPage(0).getSize();
  const pageWidth = pageDims.width;
  const pageHeight = pageDims.height;
  
  const pageToDraw = src.getPage(pageIndex);
  pageToDraw.drawText(options.text, {
    x,
    y: pageHeight - y,
    size: fontSize,
    font,
    color: rgb(color.r / 255, color.g / 255, color.b / 255),
  });
  
  return src.save({ useObjectStreams: true });
}

export async function addImage(input: Uint8Array, options: {
  imageData: Uint8Array;
  mimeType: "image/png" | "image/jpeg";
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}): Promise<Uint8Array> {
  const src = await PDFDocument.load(input, { ignoreEncryption: true });
  const pageIndex = (options.page ?? 1) - 1;
  if (pageIndex < 0 || pageIndex >= src.getPageCount()) throw new Error("page out of range");
  
  let image;
  if (options.mimeType === "image/png") {
    image = await src.embedPng(options.imageData);
  } else if (options.mimeType === "image/jpeg") {
    image = await src.embedJpg(options.imageData);
  }
  
  if (!image) return input;
  
  const page = src.getPage((options.page ?? 1) - 1);
  const x = options.x ?? 50;
  const y = options.y ?? 50;
  const width = options.width ?? 100;
  const height = options.height ?? 100;
  
  page.drawImage(image, {
    x,
    y,
    width,
    height,
  });
  
  return src.save({ useObjectStreams: true });
}

export async function addWatermark(input: Uint8Array, options: {
  text: string;
  opacity?: number;
}): Promise<Uint8Array> {
  const src = await PDFDocument.load(input, { ignoreEncryption: true });
  const font = await src.embedFont(StandardFonts.HelveticaBold);
  const opacity = Math.min(1, Math.max(0, (options.opacity ?? 30) / 100));
  for (const page of src.getPages()) {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 8;
    const textWidth = font.widthOfTextAtSize(options.text, fontSize);
    page.drawText(options.text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.55, 0.55, 0.55),
      opacity,
      rotate: degrees(30),
    });
  }
  return src.save({ useObjectStreams: true });
}

export async function addPageNumbers(input: Uint8Array, format = "Page {n} of {total}"): Promise<Uint8Array> {
  const src = await PDFDocument.load(input, { ignoreEncryption: true });
  const font = await src.embedFont(StandardFonts.Helvetica);
  const total = src.getPageCount();
  src.getPages().forEach((page, i) => {
    const { width } = page.getSize();
    const label = format.split("{n}").join(String(i + 1)).split("{total}").join(String(total));
    const fontSize = 9;
    const textWidth = font.widthOfTextAtSize(label, fontSize);
    page.drawText(label, {
      x: width / 2 - textWidth / 2,
      y: 24,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });
  return src.save({ useObjectStreams: true });
}

/* ---- image resize (resolution converter) ------------------------------------------------------------ */

export type ResizeFormat = "png" | "jpg" | "webp" | "avif";

export interface ResizedImage {
  data: Uint8Array;
  width: number;
  height: number;
  format: ResizeFormat;
}

export function resizeQualityLabel(width: number): string {
  if (width < 320) return "Burik (pixelated)";
  if (width < 640) return "Very Low";
  if (width < 1280) return "SD";
  if (width < 1920) return "HD";
  if (width < 2560) return "Full HD";
  if (width < 3840) return "2K";
  return "4K / Ultra HD";
}

export async function loadImageDims(file: File): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image decode failed"));
      img.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function resizeImage(
  file: File,
  scalePercent: number,
  format: ResizeFormat,
): Promise<{ data: Uint8Array; width: number; height: number; format: ResizeFormat }> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image decode failed"));
      img.src = url;
    });

    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    const scale = Math.max(0.01, scalePercent / 100);
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    if (scale < 0.3) {
      ctx.imageSmoothingEnabled = false;
    } else {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }
    ctx.drawImage(img, 0, 0, w, h);

    const mime =
      format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : format === "avif" ? "image/avif" : "image/png";
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), mime, 0.92),
    );
    const data = new Uint8Array(await blob.arrayBuffer());
    return { data, width: w, height: h, format };
  } finally {
    URL.revokeObjectURL(url);
  }
}