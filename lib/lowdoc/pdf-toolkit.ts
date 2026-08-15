"use client";

import { PDFDocument } from "pdf-lib";

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

/* ── image resize (resolution converter) ────────────────────────────── */

export type ResizeFormat = "png" | "jpg" | "webp";

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
): Promise<ResizedImage> {
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
    // "burik" look when heavily downscaled: nearest-neighbor without smoothing
    if (scale < 0.3) {
      ctx.imageSmoothingEnabled = false;
    } else {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }
    ctx.drawImage(img, 0, 0, w, h);

    const mime =
      format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), mime, 0.92),
    );
    const data = new Uint8Array(await blob.arrayBuffer());
    return { data, width: w, height: h, format };
  } finally {
    URL.revokeObjectURL(url);
  }
}