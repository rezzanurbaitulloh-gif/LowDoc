"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Eye, RefreshCw, ShieldCheck } from "lucide-react";
import Header from "@/components/lowdoc/header";
import ControlBar from "@/components/lowdoc/control-bar";
import HeroDropzone from "@/components/lowdoc/hero-dropzone";
import ConvertQueue from "@/components/lowdoc/convert-queue";
import ConsoleLog from "@/components/lowdoc/console-log";
import PdfToolkit from "@/components/lowdoc/pdf-toolkit";
import PreviewModal, { type Previewable } from "@/components/lowdoc/preview-modal";
import {
  consoleBus,
  downloadTaskOutput,
  downloadAllAsZip,
  officeAvailable,
  runBatch,
  runCompress,
  runMerge,
  runResizeImage,
  runSplit,
  type ConsoleMessage,
  type ConversionTask,
  type PdfToolkitTask,
} from "@/lib/lowdoc/pipeline";
import { parseRanges, extractPages, deletePages, reorderPages, rotatePages, addWatermark, addPageNumbers, addText } from "@/lib/lowdoc/pdf-toolkit";
import PaperSelector, { type SelectedPaper } from "@/components/lowdoc/paper-selector";
import ArchiveToolkit from "@/components/lowdoc/archive-toolkit";
import ImageToolkit, { type ImageToolkitOp } from "@/components/lowdoc/image-toolkit";
import Diagnostics from "@/components/lowdoc/diagnostics";
import HistoryPanel from "@/components/lowdoc/history-panel";
import { mmToTwips } from "@/lib/lowdoc/paper";
import { recommendAuto } from "@/lib/lowdoc/auto";
import { pickEngine } from "@/lib/lowdoc/matrix";
import { analyzeFile, describeAnalysis, compareAnalyses } from "@/lib/lowdoc/analyzer";
import type { ToolkitOp } from "@/components/lowdoc/pdf-toolkit";

type Mode = "convert" | "tools" | "images";

export default function LowDocPage() {
  const [mode, setMode] = useState<Mode>("convert");
  const [files, setFiles] = useState<File[]>([]);
  const [target, setTarget] = useState<string>("");
  const [tasks, setTasks] = useState<ConversionTask[]>([]);
  const [toolkitTasks, setToolkitTasks] = useState<PdfToolkitTask[]>([]);
  const [running, setRunning] = useState(false);
  const [officeOnline, setOfficeOnline] = useState(false);
  const [officeVersion, setOfficeVersion] = useState<string | undefined>();
  const [consoleLines, setConsoleLines] = useState<ConsoleMessage[]>([]);
  const [previewItem, setPreviewItem] = useState<Previewable | null>(null);
  const [paper, setPaper] = useState<SelectedPaper | null>(null);
  const [sheet, setSheet] = useState<string>("__all__");
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [showDiag, setShowDiag] = useState(false);
  const [analyses, setAnalyses] = useState<Record<string, import("@/lib/lowdoc/analyzer").FileAnalysis | null>>({});
  const autoRec = files[0] ? recommendAuto(files[0].name.split(".").pop()?.toLowerCase() ?? "") : null;
  const effTarget = target || autoRec?.target.toLowerCase() || "";
  const needsOffice =
    files.length > 0 &&
    !!effTarget &&
    files.some((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      if (ext === effTarget) return false;
      // mirror execution routing: direct best-weight engine wins
      return pickEngine(ext, effTarget as never) === "office";
    });
  const officeBlocked = needsOffice && !officeOnline;
  const srcExt = files[0]?.name.split(".").pop()?.toLowerCase() ?? "";
  const showSheets =
    ["xlsx", "xls", "xlsm", "xlsb", "ods"].includes(srcExt) &&
    ["csv", "tsv", "json", "html", ""].includes(target);

  useEffect(() => {
    if (!showSheets || !files[0]) {
      setSheetNames([]);
      setSheet("__all__");
      return;
    }
    let alive = true;
    files[0]
      .arrayBuffer()
      .then((buf) => import("@/lib/lowdoc/engines").then((m) => m.listSheets(new Uint8Array(buf))))
      .then((names) => {
        if (alive) setSheetNames(names);
      })
      .catch(() => {
        if (alive) setSheetNames([]);
      });
    return () => {
      alive = false;
    };
  }, [files, target]);

  useEffect(() => {
    const unsub = consoleBus.subscribe((m) => {
      if (m.message === "__clear__") {
        setConsoleLines([]);
        return;
      }
      setConsoleLines((prev) => {
        const next = [...prev, m];
        return next.slice(-500);
      });
    });
    officeAvailable().then(({ online, version }) => {
      setOfficeOnline(online);
      if (online && version) setOfficeVersion(version);
    });
    return unsub;
  }, []);

  const handleFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.name));
      return [...prev, ...incoming.filter((f) => !seen.has(f.name))];
    });
    for (const f of incoming) {
      void analyzeFile(f).then((a) => {
        setAnalyses((prev) => ({ ...prev, [f.name]: a }));
        const desc = describeAnalysis(a);
        if (desc) consoleBus.info(`analyze: ${f.name} — ${desc}`);
      });
    }
  }, []);

  const handleRemoveFile = useCallback((name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }, []);

  const handleClear = useCallback(() => {
    setFiles([]);
    setTasks([]);
    consoleBus.info("queue cleared");
  }, []);

  const handleConvert = useCallback(async (list?: File[]) => {
    const batch = list ?? files;
    if (batch.length === 0) return;
    setRunning(true);
    consoleBus.info(`convert: ${batch.length} file(s) → ${target || "auto"}`);
    try {
      const convOpts: { paper?: { w: number; h: number }; sheet?: string } = {};
      if (paper) {
        convOpts.paper = { w: mmToTwips(paper.w), h: mmToTwips(paper.h) };
        consoleBus.info(`paper: ${paper.id} (${paper.w}×${paper.h} mm)`);
      }
      if (sheet !== "__all__") {
        convOpts.sheet = sheet;
        consoleBus.info(`sheet: ${sheet}`);
      }
      const paperOpts = Object.keys(convOpts).length > 0 ? convOpts : undefined;
      await runBatch(batch, (target || "pdf") as never, (t) => {
        setTasks((prev) => {
          const i = prev.findIndex((x) => x.id === t.id);
          if (i === -1) return [...prev, t];
          const next = [...prev];
          next[i] = t;
          return next;
        });
        if (t.status === "done" && t.outputUrl && !t.fidelityLine) {
          const ext = (t.outputName ?? "").split(".").pop()?.toLowerCase() ?? "";
          if (["pdf", "png", "jpg", "jpeg", "webp", "gif", "bmp"].includes(ext)) {
            void (async () => {
              try {
                const blob = await (await fetch(t.outputUrl!)).blob();
                const { analyzeBlob } = await import("@/lib/lowdoc/analyzer");
                const outA = await analyzeBlob(blob, t.outputName ?? "out");
                const rep = compareAnalyses(analyses[t.name] ?? null, outA);
                if (rep.line) {
                  setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, fidelityLine: rep.line, fidelityVerdict: rep.verdict } : x)));
                }
              } catch {
                /* fidelity check is best-effort */
              }
            })();
          }
        }
      }, paperOpts);
    } finally {
      setRunning(false);
    }
  }, [files, target, paper]);

  const handleToolkitRun = useCallback(
    async (
      op: ToolkitOp,
      toolkitFiles: File[],
      rangesText: string,
      opts?: { 
        scale: number; 
        format?: "png" | "jpg" | "webp" | "avif";
        rotation?: number;
        pages?: number[];
        pageOrder?: number[];
        watermarkText?: string;
        watermarkOpacity?: number;
        watermarkImage?: File;
        width?: number;
        height?: number;
        maintainAspect?: boolean;
        quality?: number;
        flipH?: boolean;
        flipV?: boolean;
        crop?: { x: number; y: number; width: number; height: number };
        removeMetadata?: boolean;
        textContent?: string;
        textPage?: number;
        textX?: number;
        textY?: number;
        textFontSize?: number;
        textColor?: { r: number; g: number; b: number };
      },
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const base: PdfToolkitTask = { id, name: op, engine: op, status: "running" };
      setToolkitTasks((prev) => [base, ...prev]);
      try {
        if (op === "merge") {
          const data = await runMerge(toolkitFiles);
          const url = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: "application/pdf" }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "done", outputName: "merged.pdf", outputUrl: url, outputSize: data.byteLength, outputType: "application/pdf" }
                : t,
            ),
          );
        } else if (op === "split") {
          const file = toolkitFiles[0];
          const bytes = new Uint8Array(await file.arrayBuffer());
          const ranges = parseRanges(rangesText, 1000);
          const parts = await runSplit(file.name, bytes, ranges);
          const outputs = parts.map((p) => {
            const url = URL.createObjectURL(new Blob([p.data as unknown as BlobPart], { type: "application/pdf" }));
            return { name: p.name, url, size: p.data.byteLength };
          });
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: "done",
                    outputName: outputs.map((o) => o.name).join(", "),
                    outputUrl: outputs[0]?.url,
                    outputSize: outputs.reduce((s, o) => s + o.size, 0),
                    outputType: "application/pdf",
                    extra: outputs,
                  }
                : t,
            ),
          );
        } else if (op === "compress") {
          const file = toolkitFiles[0];
          const bytes = new Uint8Array(await file.arrayBuffer());
          const data = await runCompress(file.name, bytes);
          const url = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: "application/pdf" }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "done", outputName: `${file.name.replace(/\.pdf$/i, "")}-compressed.pdf`, outputUrl: url, outputSize: data.byteLength, outputType: "application/pdf" }
                : t,
            ),
          );
        } else if (op === "resize") {
          const file = toolkitFiles[0];
          const scale = opts?.scale ?? 100;
          const format = opts?.format ?? "png";
          const result = await runResizeImage(file, scale, format);
          const mime = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
          const url = URL.createObjectURL(new Blob([result.data as unknown as BlobPart], { type: mime }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: "done",
                    outputName: `${file.name.replace(/\.[^.]+$/, "")}-resized-${scale}p.${format}`,
                    outputUrl: url,
                    outputSize: result.data.byteLength,
                    outputType: mime,
                    outputDims: `${result.width}×${result.height}`,
                  }
                : t,
            ),
          );
        } else if (op === "extract") {
          const file = toolkitFiles[0];
          const bytes = new Uint8Array(await file.arrayBuffer());
          const pages = (opts?.pages ?? []).filter(n => n > 0);
          const data = await extractPages(bytes, pages);
          const url = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: "application/pdf" }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "done", outputName: `extracted-pages.pdf`, outputUrl: url, outputSize: data.byteLength, outputType: "application/pdf" }
                : t,
            ),
          );
        } else if (op === "delete") {
          const file = toolkitFiles[0];
          const bytes = new Uint8Array(await file.arrayBuffer());
          const pages = (opts?.pages ?? []).filter(n => n > 0);
          const data = await deletePages(bytes, pages);
          const url = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: "application/pdf" }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "done", outputName: `${file.name.replace(/\.pdf$/i, "")}-pages-deleted.pdf`, outputUrl: url, outputSize: data.byteLength, outputType: "application/pdf" }
                : t,
            ),
          );
        } else if (op === "reorder") {
          const file = toolkitFiles[0];
          const bytes = new Uint8Array(await file.arrayBuffer());
          const order = (opts?.pageOrder ?? []).filter(n => n > 0);
          const data = await reorderPages(bytes, order);
          const url = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: "application/pdf" }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "done", outputName: `${file.name.replace(/\.pdf$/i, "")}-reordered.pdf`, outputUrl: url, outputSize: data.byteLength, outputType: "application/pdf" }
                : t,
            ),
          );
        } else if (op === "rotate") {
          const file = toolkitFiles[0];
          const bytes = new Uint8Array(await file.arrayBuffer());
          const rotation = opts?.rotation ?? 90;
          const pages = opts?.pages?.filter(n => n > 0) ?? [];
          const data = await rotatePages(bytes, rotation, pages.length > 0 ? pages : undefined);
          const url = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: "application/pdf" }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "done", outputName: `${file.name.replace(/\.pdf$/i, "")}-rotated-${rotation}.pdf`, outputUrl: url, outputSize: data.byteLength, outputType: "application/pdf" }
                : t,
            ),
          );
        } else if (op === "watermark") {
          const file = toolkitFiles[0];
          const bytes = new Uint8Array(await file.arrayBuffer());
          const data = await addWatermark(bytes, { text: opts?.watermarkText ?? "CONFIDENTIAL", opacity: opts?.watermarkOpacity ?? 30 });
          const wurl = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: "application/pdf" }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "done", outputName: `${file.name.replace(/\.pdf$/i, "")}-watermarked.pdf`, outputUrl: wurl, outputSize: data.byteLength, outputType: "application/pdf" }
                : t,
            ),
          );
        } else if (op === "pagenumbers") {
          const file = toolkitFiles[0];
          const bytes = new Uint8Array(await file.arrayBuffer());
          const data = await addPageNumbers(bytes, "Page {n} of {total}");
          const purl = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: "application/pdf" }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "done", outputName: `${file.name.replace(/\.pdf$/i, "")}-numbered.pdf`, outputUrl: purl, outputSize: data.byteLength, outputType: "application/pdf" }
                : t,
            ),
          );
        } else if (op === "text") {
          const file = toolkitFiles[0];
          const bytes = new Uint8Array(await file.arrayBuffer());
          const data = await addText(bytes, {
            text: opts?.textContent ?? "",
            page: opts?.textPage ?? 1,
            x: opts?.textX ?? 50,
            y: opts?.textY ?? 50,
            fontSize: opts?.textFontSize ?? 12,
            color: opts?.textColor ?? { r: 0, g: 0, b: 0 },
          });
          const turl = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: "application/pdf" }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "done", outputName: `${file.name.replace(/\.pdf$/i, "")}-text.pdf`, outputUrl: turl, outputSize: data.byteLength, outputType: "application/pdf" }
                : t,
            ),
          );
        }
      } catch (err) {
        setToolkitTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: "error", error: err instanceof Error ? err.message : String(err) } : t,
          ),
        );
      }
    },
    [],
  );

  const handleImageToolkitRun = useCallback(
    async (
      op: ImageToolkitOp,
      toolkitFiles: File[],
      opts?: {
        width?: number;
        height?: number;
        maintainAspect?: boolean;
        quality?: number;
        format?: "png" | "jpg" | "webp" | "avif";
        rotation?: number;
        flipH?: boolean;
        flipV?: boolean;
        crop?: { x: number; y: number; width: number; height: number };
        removeMetadata?: boolean;
      },
    ) => {
      const { imageToBlob } = await import("@/lib/lowdoc/image-operations");
      let ok = 0;
      for (const file of toolkitFiles) {
        try {
          const result = await imageToBlob(file, { op, ...opts });
          const url = URL.createObjectURL(new Blob([result.data as unknown as BlobPart], { type: result.mime }));
          const a = document.createElement("a");
          a.href = url;
          a.download = result.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          ok++;
          consoleBus.success(`image ${op}: ${file.name} → ${result.name}`);
        } catch (err) {
          consoleBus.error(`image ${op}: ${file.name} — ${err instanceof Error ? err.message : String(err)}`);
        }
      }
      consoleBus.info(`image ${op}: ${ok}/${toolkitFiles.length} done`);
    },
    [],
  );

  const handleToolkitDownload = useCallback((task: PdfToolkitTask) => {
    if (!task.outputUrl) return;
    const a = document.createElement("a");
    a.href = task.outputUrl;
    a.download = task.outputName ?? "output.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  return (
    <main id="main-content" className="min-h-screen">
      <Header officeOnline={officeOnline} officeVersion={officeVersion} />

      {/* mode tabs */}
      <div className="flex flex-wrap items-center gap-3 px-5 pt-5">
        <div className="ld-seg" role="tablist" aria-label="Mode">
          {(
            [
              ["convert", "Convert"],
              ["images", "Image Tools"],
              ["tools", "PDF Tools"],
            ] as [Mode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              className={`ld-seg-btn ${mode === m ? "ld-seg-btn-active" : ""}`}
              onClick={() => setMode(m)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
          <ShieldCheck size={12} className="text-[var(--ld-ok)]" aria-hidden="true" />
          local-first · no accounts · no cloud
        </div>
      </div>

      {mode === "convert" && (
        <div className="px-5 pt-5 max-w-[1440px] mx-auto">
          <h1 style={{ fontFamily: "var(--ld-display)" }} className="text-2xl sm:text-3xl font-bold tracking-tight">
            Private file tools. <span className="text-[var(--ld-orange)]">Built for your browser.</span>
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ld-dim)]">
            Convert · Resize · Compress · Preview · Preserve
          </p>
        </div>
      )}

      {mode === "convert" && (
        <div className="ld-bento px-5 pt-4 pb-2 max-w-[1440px] mx-auto">
          <HeroDropzone
            className="lg:col-span-2 lg:row-span-2"
            onFiles={handleFiles}
            onRemoveFile={handleRemoveFile}
            files={files}
            analyses={analyses}
          />

          <ControlBar
            className="lg:col-span-2"
            selectedFormat={target}
            srcExt={files[0]?.name.split(".").pop()?.toLowerCase()}
            onFormatChange={(k) => {
              setTarget(k);
              consoleBus.info(`target format → ${k || "auto (pdf)"}`);
            }}
            onClear={handleClear}
            fileCount={files.length}
          />

          {(target === "pdf" || target === "") && (
            <div className="lg:col-span-2 flex flex-wrap items-center gap-3 -mt-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
                Paper (pdf)
              </span>
              <PaperSelector value={paper} onChange={setPaper} />
            </div>
          )}
          {showSheets && sheetNames.length > 1 && (
            <div className="lg:col-span-2 flex flex-wrap items-center gap-3 -mt-1">
              <label htmlFor="sheet-select" className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
                Sheet
              </label>
              <select
                id="sheet-select"
                className="ld-select !w-auto"
                value={sheet}
                onChange={(e) => setSheet(e.target.value)}
              >
                <option value="__all__">All sheets</option>
                {sheetNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="lg:col-span-2">
            <button
              type="button"
              className="ld-btn ld-btn-orange w-full !py-3 !text-sm"
              disabled={running || files.length === 0 || officeBlocked}
              title={officeBlocked ? "Needs the self-hosted office helper" : undefined}
              onClick={() => void handleConvert()}
            >
              <RefreshCw size={15} className={running ? "animate-spin" : ""} aria-hidden="true" />
              {running ? "Converting…" : `Convert ${files.length > 0 ? `${files.length} file(s)` : ""}`}
            </button>
            {officeBlocked && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ld-err)]" role="alert">
                ⚠ This route needs the self-hosted office helper — unavailable in this deployment.{" "}
                <a href="/about" className="underline underline-offset-2">
                  How to self-host
                </a>
              </p>
            )}
            {!target && autoRec && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ld-dim)]">
                AUTO → {autoRec.label} · {autoRec.reason}
              </p>
            )}
          </div>

          <ConvertQueue
            className="lg:col-span-2"
            tasks={tasks}
            onDownload={(t) => downloadTaskOutput(t)}
            onDownloadAll={() => downloadAllAsZip(tasks)}
            onRetryFailed={() => {
              const failedNames = new Set(tasks.filter((t) => t.status === "error").map((t) => t.name));
              const retryFiles = files.filter((f) => failedNames.has(f.name));
              if (retryFiles.length === 0) return;
              consoleBus.info(`retry: ${retryFiles.length} failed task(s)`);
              setTasks((prev) => prev.filter((t) => !failedNames.has(t.name)));
              void handleConvert(retryFiles);
            }}
            onRemove={(id) => setTasks((prev) => prev.filter((x) => x.id !== id))}
            onPreview={(t) =>
              setPreviewItem({
                outputName: t.outputName,
                outputUrl: t.outputUrl,
                outputType: t.outputType,
                outputSize: t.outputSize,
              })
            }
          />

          {/* toolkit results */}
          {toolkitTasks.length > 0 && (
            <section className="ld-card lg:col-span-2">
              <div className="ld-card-title">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
                  PDF Tool results
                </span>
              </div>
              <div className="divide-y divide-[var(--ld-border)]">
                {toolkitTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 py-3">
                    <div className="font-mono text-xs">{t.engine.toUpperCase()}</div>
                    <div className="min-w-0 flex-1">
                      {t.status === "done" && (
                        <span className="font-mono text-[10px] text-[var(--ld-ok)]">
                          {t.outputName}
                          {t.outputDims ? ` · ${t.outputDims} px` : ""}
                        </span>
                      )}
                      {t.status === "error" && (
                        <span className="font-mono text-[10px] text-[var(--ld-err)]">{t.error}</span>
                      )}
                      {t.status === "running" && (
                        <span className="font-mono text-[10px] text-[var(--ld-info)]">working…</span>
                      )}
                    </div>
                    {t.status === "done" && (
                      <>
                        <button
                          type="button"
                          className="ld-btn ld-btn-ghost !px-2.5 !py-1"
                          onClick={() =>
                            setPreviewItem({
                              outputName: t.outputName,
                              outputUrl: t.outputUrl,
                              outputType: t.outputType ?? "application/pdf",
                              outputSize: t.outputSize,
                            })
                          }
                          title="Preview"
                          aria-label="Preview result"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="ld-btn ld-btn-ghost !px-2.5 !py-1"
                          onClick={() => handleToolkitDownload(t)}
                          title="Download"
                          aria-label="Download result"
                        >
                          <Download size={13} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {mode === "images" && (
        <div className="px-5 pt-4 pb-2 max-w-[1440px] mx-auto">
          <ImageToolkit onRun={handleImageToolkitRun} />
        </div>
      )}

      {mode === "tools" && (
        <div className="px-5 pt-4 pb-2 max-w-[1440px] mx-auto">
          <PdfToolkit onRun={handleToolkitRun} />
          <div className="mt-4">
            <ArchiveToolkit />
          </div>
          {toolkitTasks.length > 0 && (
            <section className="ld-card mt-4">
              <div className="ld-card-title">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
                  PDF Tool results
                </span>
              </div>
              <div className="divide-y divide-[var(--ld-border)]">
                {toolkitTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 py-3">
                    <div className="font-mono text-xs">{t.engine.toUpperCase()}</div>
                    <div className="min-w-0 flex-1">
                      {t.status === "done" && (
                        <span className="font-mono text-[10px] text-[var(--ld-ok)]">
                          {t.outputName}
                          {t.outputDims ? ` · ${t.outputDims} px` : ""}
                        </span>
                      )}
                      {t.status === "error" && (
                        <span className="font-mono text-[10px] text-[var(--ld-err)]">{t.error}</span>
                      )}
                      {t.status === "running" && (
                        <span className="font-mono text-[10px] text-[var(--ld-info)]">working…</span>
                      )}
                    </div>
                    {t.status === "done" && (
                      <>
                        <button
                          type="button"
                          className="ld-btn ld-btn-ghost !px-2.5 !py-1"
                          onClick={() =>
                            setPreviewItem({
                              outputName: t.outputName,
                              outputUrl: t.outputUrl,
                              outputType: t.outputType ?? "application/pdf",
                              outputSize: t.outputSize,
                            })
                          }
                          title="Preview"
                          aria-label="Preview result"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="ld-btn ld-btn-ghost !px-2.5 !py-1"
                          onClick={() => handleToolkitDownload(t)}
                          title="Download"
                          aria-label="Download result"
                        >
                          <Download size={13} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {mode === "convert" && (
        <div className="px-5 pt-2 pb-1 max-w-[1440px] mx-auto">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)] mr-1">
              Popular
            </span>
            {[
              { label: "DOCX → PDF", target: "pdf" },
              { label: "MD → PDF", target: "pdf" },
              { label: "JPG → WebP", target: "webp" },
              { label: "XLSX → CSV", target: "csv" },
              { label: "PDF → TXT", target: "txt" },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                className="ld-chip"
                onClick={() => {
                  setTarget(p.target);
                  consoleBus.info(`preset: ${p.label}`);
                }}
              >
                {p.label}
              </button>
            ))}
            {[
              "Compress PDF",
              "Resize Image",
              "Merge PDF",
            ].map((label) => (
              <button
                key={label}
                type="button"
                className="ld-chip"
                onClick={() => {
                  setMode("tools");
                  consoleBus.info(`preset: ${label} — pick the tool in PDF Tools`);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Fidelity First", "Layout, fonts and page geometry preserved whenever possible"],
              ["Local Processing", "WASM engines run on your device — files stay with you"],
              ["Universal Graph", "Formats route through a conversion graph, not a fixed list"],
              ["Free Core Tools", "No accounts, no limits, no database"],
            ].map(([t, d]) => (
              <div key={t} className="ld-panel-2 !rounded px-3 py-2.5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-orange)]">{t}</div>
                <div className="mt-1 text-xs text-[var(--ld-muted)] leading-snug">{d}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConsoleLog lines={consoleLines} />

      <HistoryPanel />

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      {showDiag && <Diagnostics onClose={() => setShowDiag(false)} />}

      <footer className="border-t border-[var(--ld-border)] px-5 py-4 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
          portoja v0.1 — WASM-powered · privacy-first
        </span>
        <span className="font-mono text-[10px] text-[var(--ld-dim)]">
          © 2026 portoja. All rights reserved. · Zero database · files erased when tab closes
        </span>
        <nav aria-label="Site" className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider">
          {[
            ["/about", "About"],
            ["/faq", "FAQ"],
            ["/privacy", "Privacy"],
            ["/terms", "Terms"],
            ["/licenses", "Licenses"],
            ["/support", "Support"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-[var(--ld-dim)] hover:text-[var(--ld-orange)]">
              {label}
            </a>
          ))}
          <button
            type="button"
            className="text-[var(--ld-dim)] hover:text-[var(--ld-orange)] uppercase tracking-wider"
            onClick={() => setShowDiag(true)}
          >
            Diagnostics
          </button>
        </nav>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "LowDoc",
            url: "https://lowdoc.vercel.app",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any (browser)",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description:
              "Privacy-first universal document converter. Convert, resize, compress and preview files locally in your browser.",
          }),
        }}
      />
    </main>
  );
}