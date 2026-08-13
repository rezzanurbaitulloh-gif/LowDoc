"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import Header from "@/components/lowdoc/header";
import ControlBar from "@/components/lowdoc/control-bar";
import HeroDropzone from "@/components/lowdoc/hero-dropzone";
import ConvertQueue from "@/components/lowdoc/convert-queue";
import ConsoleLog from "@/components/lowdoc/console-log";
import PdfToolkit from "@/components/lowdoc/pdf-toolkit";
import {
  consoleBus,
  downloadTaskOutput,
  officeAvailable,
  runBatch,
  runCompress,
  runMerge,
  runSplit,
  type ConsoleMessage,
  type ConversionTask,
  type PdfToolkitTask,
} from "@/lib/lowdoc/pipeline";
import { parseRanges } from "@/lib/lowdoc/pdf-toolkit";

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
    officeAvailable().then((ok) => {
      setOfficeOnline(ok);
      setOfficeVersion(ok ? "probed" : undefined);
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
      await runBatch(files, (target || "pdf") as never, (t) => {
        setTasks((prev) => {
          const i = prev.findIndex((x) => x.id === t.id);
          if (i === -1) return [...prev, t];
          const next = [...prev];
          next[i] = t;
          return next;
        });
      });
    } finally {
      setRunning(false);
    }
  }, [files, target]);

  const handleToolkitRun = useCallback(
    async (op: "merge" | "split" | "compress", toolkitFiles: File[], rangesText: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const base: PdfToolkitTask = { id, name: op, engine: op, status: "running" };
      setToolkitTasks((prev) => [base, ...prev]);
      try {
        if (op === "merge") {
          const data = await runMerge(toolkitFiles);
          const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "done", outputName: "merged.pdf", outputUrl: url, outputSize: data.byteLength }
                : t,
            ),
          );
        } else if (op === "split") {
          const file = toolkitFiles[0];
          const bytes = new Uint8Array(await file.arrayBuffer());
          const ranges = parseRanges(rangesText, 1000);
          const parts = await runSplit(file.name, bytes, ranges);
          const outputs = parts.map((p) => {
            const url = URL.createObjectURL(new Blob([p.data], { type: "application/pdf" }));
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
                    extra: outputs,
                  }
                : t,
            ),
          );
        } else {
          const file = toolkitFiles[0];
          const bytes = new Uint8Array(await file.arrayBuffer());
          const data = await runCompress(file.name, bytes);
          const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
          setToolkitTasks((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "done", outputName: `${file.name.replace(/\.pdf$/i, "")}-compressed.pdf`, outputUrl: url, outputSize: data.byteLength }
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
      <div className="flex items-center gap-1 px-5 pt-4">
        {(
          [
            ["convert", "Convert"],
            ["tools", "PDF Tools"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            className={`ld-chip ${mode === m ? "ld-chip-selected" : ""}`}
            onClick={() => setMode(m)}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
          <ShieldCheck size={12} className="text-[#86efac]" />
          100% offline · no uploads
        </div>
      </div>

      {mode === "convert" && (
        <>
          <ControlBar
            selectedFormat={target}
            onFormatChange={(k) => {
              setTarget(k);
              consoleBus.info(`target format → ${k || "auto (pdf)"}`);
            }}
            onClear={handleClear}
            fileCount={files.length}
          />
          <HeroDropzone onFiles={handleFiles} onRemoveFile={handleRemoveFile} files={files} />
          <div className="px-5 pb-4">
            <button
              type="button"
              className="ld-btn ld-btn-orange"
              disabled={running || files.length === 0}
              onClick={handleConvert}
            >
              <RefreshCw size={13} className={running ? "animate-spin" : ""} />
              {running ? "Converting…" : `Convert ${files.length > 0 ? `${files.length} file(s)` : ""}`}
            </button>
          </div>
          <ConvertQueue
            tasks={tasks}
            onDownload={(t) => downloadTaskOutput(t)}
            onRemove={(id) => setTasks((prev) => prev.filter((x) => x.id !== id))}
          />
        </>
      )}

      {mode === "tools" && (
        <PdfToolkit onRun={handleToolkitRun} />
      )}

      {/* toolkit results */}
      {toolkitTasks.length > 0 && (
        <section className="px-5 pb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
            PDF Tool results
          </span>
          <div className="ld-panel mt-2 divide-y divide-[var(--ld-border)]">
            {toolkitTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <div className="font-mono text-xs">{t.engine.toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  {t.status === "done" && (
                    <span className="font-mono text-[10px] text-[#86efac]">{t.outputName}</span>
                  )}
                  {t.status === "error" && (
                    <span className="font-mono text-[10px] text-[#fca5a5]">{t.error}</span>
                  )}
                  {t.status === "running" && (
                    <span className="font-mono text-[10px] text-[#93c5fd]">working…</span>
                  )}
                </div>
                {t.status === "done" && (
                  <button
                    type="button"
                    className="ld-btn ld-btn-ghost !px-2.5 !py-1"
                    onClick={() => handleToolkitDownload(t)}
                  >
                    <Download size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <ConsoleLog lines={consoleLines} />

      <footer className="border-t border-[var(--ld-border)] px-5 py-4 flex items-center justify-between">
        <span className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
          LowDoc v0.1 — WASM-powered · privacy-first
        </span>
        <span className="font-mono text-[10px] text-[var(--ld-dim)]">
          Zero database · files erased when tab closes
        </span>
      </footer>
    </main>
  );
}