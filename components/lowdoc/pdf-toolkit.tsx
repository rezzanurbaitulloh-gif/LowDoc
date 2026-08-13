"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import type { PdfToolkitTask } from "@/lib/lowdoc/pipeline";

export default function PdfToolkit({
  onRun,
}: {
  onRun: (op: "merge" | "split" | "compress", files: File[], rangesText: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<"merge" | "split" | "compress">("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [ranges, setRanges] = useState("");
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFiles = (list: FileList | null) => {
    if (!list) return;
    const pdfs = Array.from(list).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.name));
      return [...prev, ...pdfs.filter((f) => !seen.has(f.name))];
    });
  };

  const run = async () => {
    if (files.length === 0) return;
    setRunning(true);
    try {
      await onRun(mode, files, ranges);
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="px-5 py-6">
      <div className="flex items-center gap-2 mb-3">
        {(["merge", "split", "compress"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`ld-chip ${mode === m ? "ld-chip-selected" : ""}`}
            onClick={() => setMode(m)}
          >
            {m === "merge" ? "Merge PDFs" : m === "split" ? "Split PDF" : "Compress PDF"}
          </button>
        ))}
      </div>

      <div
        className="ld-dropzone !py-6"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pickFiles(e.dataTransfer.files);
        }}
      >
        <div className="font-mono text-xs text-[var(--ld-muted)]">
          {mode === "merge"
            ? "Select 2+ PDFs to merge"
            : mode === "split"
              ? "Select the PDF to split"
              : "Select the PDF to compress"}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            pickFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((f) => (
            <span key={f.name} className="ld-chip">
              {f.name}
              <button
                type="button"
                className="text-[var(--ld-dim)] hover:text-[var(--ld-red)]"
                onClick={() => setFiles((prev) => prev.filter((x) => x.name !== f.name))}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {mode === "split" && (
        <div className="mt-3">
          <label className="ld-label">Page ranges (e.g. 1-3, 5, 8-10)</label>
          <input
            className="ld-input"
            placeholder="1-3, 5, 8-10"
            value={ranges}
            onChange={(e) => setRanges(e.target.value)}
          />
        </div>
      )}

      <button
        type="button"
        className="ld-btn ld-btn-primary mt-4"
        disabled={running || files.length === 0 || (mode === "split" && !ranges.trim())}
        onClick={run}
      >
        {running ? "Working…" : mode === "merge" ? "Merge" : mode === "split" ? "Split" : "Compress"}
      </button>
    </section>
  );
}