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
import { parseRanges } from "@/lib/lowdoc/pdf-toolkit";
import PaperSelector, { type SelectedPaper } from "@/components/lowdoc/paper-selector";
import { mmToTwips } from "@/lib/lowdoc/paper";
import type { ToolkitOp } from "@/components/lowdoc/pdf-toolkit";

type Mode = "convert" | "tools";

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
  }, []);

  const handleRemoveFile = useCallback((name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }, []);

  const handleClear = useCallback(() => {
    setFiles([]);
    setTasks([]);
    consoleBus.info("queue cleared");
  }, []);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;
    setRunning(true);
    consoleBus.info(`convert: ${files.length} file(s) → ${target || "auto"}`);
    try {
      const paperOpts = paper ? { paper: { w: mmToTwips(paper.w), h: mmToTwips(paper.h) } } : undefined;
      if (paper) consoleBus.info(`paper: ${paper.id} (${paper.w}×${paper.h} mm)`);
      await runBatch(files, (target || "pdf") as never, (t) => {
        setTasks((prev) => {
          const i = prev.findIndex((x) => x.id === t.id);
          if (i === -1) return [...prev, t];
          const next = [...prev];
          next[i] = t;
          return next;
        });
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
      opts?: { scale: number; format: "png" | "jpg" | "webp" },
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
    <main className="min-h-screen">
      <Header officeOnline={officeOnline} officeVersion={officeVersion} />

      {/* mode tabs */}
      <div className="flex flex-wrap items-center gap-3 px-5 pt-5">
        <div className="ld-seg" role="tablist" aria-label="Mode">
          {(
            [
              ["convert", "Convert"],
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
          <ShieldCheck size={12} className="text-[var(--ld-ok)]" />
          local-first · no accounts · no cloud
        </div>
      </div>

      {mode === "convert" && (
        <div className="ld-bento px-5 pt-4 pb-2 max-w-[1440px] mx-auto">
          <HeroDropzone
            className="lg:col-span-2 lg:row-span-2"
            onFiles={handleFiles}
            onRemoveFile={handleRemoveFile}
            files={files}
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

          <div className="lg:col-span-2">
            <button
              type="button"
              className="ld-btn ld-btn-orange w-full !py-3 !text-sm"
              disabled={running || files.length === 0}
              onClick={handleConvert}
            >
              <RefreshCw size={15} className={running ? "animate-spin" : ""} />
              {running ? "Converting…" : `Convert ${files.length > 0 ? `${files.length} file(s)` : ""}`}
            </button>
          </div>

          <ConvertQueue
            className="lg:col-span-2"
            tasks={tasks}
            onDownload={(t) => downloadTaskOutput(t)}
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

      {mode === "tools" && (
        <div className="px-5 pt-4 pb-2 max-w-[1440px] mx-auto">
          <PdfToolkit onRun={handleToolkitRun} />
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

      <ConsoleLog lines={consoleLines} />

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />

      <footer className="border-t border-[var(--ld-border)] px-5 py-4 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
          LowDoc v0.1 — WASM-powered · privacy-first
        </span>
        <span className="font-mono text-[10px] text-[var(--ld-dim)]">
          Zero database · files erased when tab closes
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