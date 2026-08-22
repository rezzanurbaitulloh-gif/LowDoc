"use client";

import {
  checkOffice,
  convertViaOffice,
  downloadBytes,
  formatBytes,
  mimeFor,
  runConversion as engineRunConversion,
  type EngineEvent,
} from "./engines";
import { pickEngine, findPath, type LowDocTarget } from "./matrix";
import { saveHistory, type HistoryRecord } from "./storage";

/* ── console bus ────────────────────────────────────────────────────── */

export interface ConsoleMessage {
  id: number;
  ts: number;
  type: EngineEvent["type"];
  message: string;
}

let _seq = 0;
let _listeners: Array<(m: ConsoleMessage) => void> = [];

function emitConsole(type: ConsoleMessage["type"], message: string) {
  _seq += 1;
  const msg: ConsoleMessage = { id: _seq, ts: Date.now(), type, message };
  for (const l of _listeners) l(msg);
}

export const consoleBus = {
  subscribe(fn: (m: ConsoleMessage) => void): () => void {
    _listeners.push(fn);
    return () => {
      _listeners = _listeners.filter((l) => l !== fn);
    };
  },
  info(message: string) {
    emitConsole("info", message);
  },
  success(message: string) {
    emitConsole("success", message);
  },
  warn(message: string) {
    emitConsole("warn", message);
  },
  error(message: string) {
    emitConsole("error", message);
  },
  clear() {
    _seq = 0;
    for (const l of _listeners) l({ id: 0, ts: Date.now(), type: "info", message: "__clear__" });
  },
};

/* ── conversion task types ──────────────────────────────────────────── */

export type TaskStatus = "pending" | "running" | "done" | "error";

export interface ConversionTask {
  id: string;
  name: string;
  size: number;
  engine: string;
  target: LowDocTarget;
  status: TaskStatus;
  progress: number;
  outputName?: string;
  outputType?: string;
  outputUrl?: string;
  outputSize?: number;
  error?: string;
}

export interface PdfToolkitTask {
  id: string;
  name: string;
  engine: "merge" | "split" | "compress" | "resize";
  status: TaskStatus;
  outputName?: string;
  outputUrl?: string;
  outputSize?: number;
  outputType?: string;
  outputDims?: string;
  error?: string;
  extra?: Array<{ name: string; url: string; size: number }>;
}

/* ── conversions ────────────────────────────────────────────────────── */

export async function runConversion(
  file: File,
  target: LowDocTarget,
  onEvent?: (e: EngineEvent) => void,
): Promise<{ data: Uint8Array; engine: string }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const path = findPath(ext, target);
  const engine = pickEngine(ext, target) ?? path?.[0]?.engine ?? "unknown";
  const data = await engineRunConversion(file.name, bytes, target, (e) => {
    if (onEvent) onEvent(e);
    emitConsole(e.type, e.message);
  });
  return { data, engine };
}

export async function runBatch(
  files: File[],
  target: LowDocTarget,
  onProgress: (task: ConversionTask) => void,
): Promise<void> {
  const ext = files[0]?.name.split(".").pop()?.toLowerCase() ?? "";
  const path = findPath(ext, target);
  const engine = pickEngine(ext, target) ?? path?.[0]?.engine ?? "unknown";
  const tasks: ConversionTask[] = files.map((f) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: f.name,
    size: f.size,
    engine,
    target,
    status: "pending",
    progress: 0,
  }));
  for (const t of tasks) onProgress(t);

  for (const t of tasks) {
    const file = files.find((f) => f.name === t.name);
    if (!file) continue;
    t.status = "running";
    t.progress = 0.05;
    onProgress({ ...t });
    try {
      const { data, engine: usedEngine } = await runConversion(file, target, (e) => {
        if (e.type === "progress") {
          t.progress = 0.1 + (e.progress ?? 0) * 0.85;
          onProgress({ ...t });
        }
      });
      t.engine = usedEngine;
      t.status = "done";
      t.progress = 1;
      t.outputName = file.name.replace(/\.[^.]+$/, "") + "." + target;
      t.outputType = mimeFor(target);
      t.outputSize = data.byteLength;
      t.outputUrl = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: t.outputType }));
      onProgress({ ...t });
      await saveHistory({
        id: t.id,
        name: t.name,
        size: t.size,
        engine: usedEngine,
        outputName: t.outputName,
        outputSize: t.outputSize ?? 0,
        ts: Date.now(),
      });
    } catch (err) {
      t.status = "error";
      t.error = err instanceof Error ? err.message : String(err);
      onProgress({ ...t });
    }
  }
}

export async function downloadTaskOutput(task: ConversionTask): Promise<void> {
  if (!task.outputUrl || !task.outputName) return;
  const a = document.createElement("a");
  a.href = task.outputUrl;
  a.download = task.outputName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ── PDF toolkit ────────────────────────────────────────────────────── */

export async function runMerge(
  files: File[],
  onEvent?: (e: EngineEvent) => void,
): Promise<Uint8Array> {
  const { mergePdfs } = await import("./pdf-toolkit");
  emitConsole("info", `merge: ${files.length} PDF(s)`);
  try {
    const data = await mergePdfs(files);
    emitConsole("success", `merge: combined ${files.length} file(s) → ${formatBytes(data.byteLength)}`);
    return data;
  } catch (err) {
    emitConsole("error", `merge: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  } finally {
    if (onEvent) onEvent({ type: "info", message: "merge complete" });
  }
}

export async function runSplit(
  fileName: string,
  inputBytes: Uint8Array,
  ranges: Array<{ start: number; end: number }>,
  onEvent?: (e: EngineEvent) => void,
): Promise<Array<{ name: string; data: Uint8Array }>> {
  const { splitPdf } = await import("./pdf-toolkit");
  emitConsole("info", `split: ${fileName} into ${ranges.length} part(s)`);
  try {
    const parts = await splitPdf(inputBytes, ranges);
    emitConsole("success", `split: produced ${parts.length} part(s)`);
    return parts;
  } catch (err) {
    emitConsole("error", `split: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  } finally {
    if (onEvent) onEvent({ type: "info", message: "split complete" });
  }
}

export async function runCompress(
  fileName: string,
  inputBytes: Uint8Array,
  onEvent?: (e: EngineEvent) => void,
): Promise<Uint8Array> {
  const { compressPdf } = await import("./pdf-toolkit");
  emitConsole("info", `compress: ${fileName}`);
  try {
    const data = await compressPdf(inputBytes);
    emitConsole("success", `compress: ${formatBytes(inputBytes.byteLength)} → ${formatBytes(data.byteLength)}`);
    return data;
  } catch (err) {
    emitConsole("error", `compress: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  } finally {
    if (onEvent) onEvent({ type: "info", message: "compress complete" });
  }
}

export interface ResizeResult {
  data: Uint8Array;
  width: number;
  height: number;
  format: "png" | "jpg" | "webp";
}

export async function runResizeImage(
  file: File,
  scalePercent: number,
  format: "png" | "jpg" | "webp",
  onEvent?: (e: EngineEvent) => void,
): Promise<ResizeResult> {
  const { resizeImage } = await import("./pdf-toolkit");
  emitConsole("info", `resize: ${file.name} at ${scalePercent}% → ${format.toUpperCase()}`);
  try {
    const result = await resizeImage(file, scalePercent, format);
    emitConsole(
      "success",
      `resize: ${file.name} ${result.width}x${result.height} ${result.format.toUpperCase()} (${formatBytes(result.data.byteLength)})`,
    );
    return result;
  } catch (err) {
    emitConsole("error", `resize: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  } finally {
    if (onEvent) onEvent({ type: "info", message: "resize complete" });
  }
}

/* ── office ─────────────────────────────────────────────────────────── */

export async function officeAvailable(
  onEvent?: (e: EngineEvent) => void,
): Promise<{ online: boolean; version?: string }> {
  const api = await checkOffice(onEvent);
  return { online: api.status === "ok", version: api.version };
}

export async function officeFallback(
  inputName: string,
  inputBytes: Uint8Array,
  target: LowDocTarget,
  onEvent?: (e: EngineEvent) => void,
): Promise<Uint8Array> {
  const data = await convertViaOffice(inputName, inputBytes, target, (e) => {
    if (onEvent) onEvent(e);
    emitConsole(e.type, e.message);
  });
  return data;
}

export { formatBytes, downloadBytes, mimeFor };