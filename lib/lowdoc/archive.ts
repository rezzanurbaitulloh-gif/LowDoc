"use client";

/* Archive tools (PRD §33) — zip create / extract / inspect, fully local via fflate.
   Security: path-traversal rejection, filename sanitization, bomb limits. */

import { unzipSync, zipSync, strFromU8 } from "fflate";

const MAX_ENTRIES = 2000;
const MAX_TOTAL_UNCOMPRESSED = 500 * 1024 * 1024; // 500 MB
const MAX_RATIO = 200; // archive-bomb heuristic

export interface ArchiveEntry {
  name: string;
  size: number;
  dir: boolean;
}

function sanitize(name: string): string | null {
  const parts = name.replace(/\\/g, "/").split("/");
  const clean: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") return null; // path traversal
    clean.push(part);
  }
  if (clean.length === 0) return null;
  const joined = clean.join("/");
  if (joined.length > 512) return null;
  return joined;
}

export async function inspectArchive(file: File): Promise<{ entries: ArchiveEntry[]; total: number }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const files = unzipSync(bytes);
  const names = Object.keys(files);
  if (names.length > MAX_ENTRIES) throw new Error(`archive: too many entries (${names.length} > ${MAX_ENTRIES})`);
  const entries: ArchiveEntry[] = [];
  let total = 0;
  for (const raw of names) {
    const name = sanitize(raw);
    if (name === null) throw new Error(`archive: blocked unsafe path "${raw.slice(0, 80)}"`);
    const data = files[raw];
    total += data.byteLength;
    if (total > MAX_TOTAL_UNCOMPRESSED) throw new Error("archive: uncompressed size exceeds 500 MB safety limit");
    entries.push({ name, size: data.byteLength, dir: raw.endsWith("/") });
  }
  const ratio = total / Math.max(1, file.size);
  if (ratio > MAX_RATIO) throw new Error(`archive: suspicious compression ratio (${ratio.toFixed(0)}×) — possible archive bomb`);
  entries.sort((a, b) => a.name.localeCompare(b.name));
  return { entries, total };
}

export async function extractArchive(file: File): Promise<Array<{ name: string; data: Uint8Array }>> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const files = unzipSync(bytes);
  const names = Object.keys(files);
  if (names.length > MAX_ENTRIES) throw new Error(`archive: too many entries (${names.length})`);
  const out: Array<{ name: string; data: Uint8Array }> = [];
  let total = 0;
  for (const raw of names) {
    if (raw.endsWith("/")) continue;
    const name = sanitize(raw);
    if (name === null) throw new Error(`archive: blocked unsafe path "${raw.slice(0, 80)}"`);
    const data = files[raw];
    total += data.byteLength;
    if (total > MAX_TOTAL_UNCOMPRESSED) throw new Error("archive: exceeds 500 MB safety limit");
    out.push({ name, data });
  }
  return out;
}

export function isTextLike(name: string): boolean {
  return /\.(txt|md|json|xml|html?|css|js|ts|csv|tsv|log|yml|yaml)$/i.test(name);
}

export function previewText(data: Uint8Array, max = 4000): string {
  try {
    return strFromU8(data.slice(0, max));
  } catch {
    return "";
  }
}

export async function createZip(files: File[]): Promise<Uint8Array> {
  const entries: Record<string, Uint8Array> = {};
  const seen = new Set<string>();
  for (const f of files) {
    let name = sanitize(f.name) ?? "file";
    let n = name;
    let i = 1;
    while (seen.has(n)) {
      n = name.replace(/(\.[^.]+)?$/, `-${i}$1`);
      i++;
    }
    seen.add(n);
    entries[n] = new Uint8Array(await f.arrayBuffer());
  }
  return zipSync(entries, { level: 6 });
}
