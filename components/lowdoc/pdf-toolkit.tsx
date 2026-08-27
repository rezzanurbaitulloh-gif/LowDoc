"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import type { PdfToolkitTask } from "@/lib/lowdoc/pipeline";
import { loadImageDims, resizeQualityLabel } from "@/lib/lowdoc/pdf-toolkit";

export type ToolkitOp = "merge" | "split" | "compress" | "resize";

export default function PdfToolkit({
  onRun,
}: {
  onRun: (
    op: ToolkitOp,
    files: File[],
    rangesText: string,
    opts?: { scale: number; format: "png" | "jpg" | "webp" },
  ) => Promise<void>;
}) {
  const [mode, setMode] = useState<ToolkitOp>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [ranges, setRanges] = useState("");
  const [scale, setScale] = useState(100);
  const [imgFormat, setImgFormat] = useState<"png" | "jpg" | "webp">("png");
  const [origDims, setOrigDims] = useState<{ width: number; height: number } | null>(null);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrigDims(null);
    if (mode === "resize" && files[0]) {
      loadImageDims(files[0])
        .then(setOrigDims)
        .catch(() => setOrigDims(null));
    }
  }, [mode, files]);

  const pickFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted =
      mode === "resize"
        ? Array.from(list).filter((f) => /\.(png|jpe?g|webp|gif|bmp|tiff?|heic|ico)$/i.test(f.name))
        : Array.from(list).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.name));
      return [...prev, ...accepted.filter((f) => !seen.has(f.name))];
    });
  };

  const run = async () => {
    if (files.length === 0) return;
    setRunning(true);
    try {
      await onRun(mode, files, ranges, { scale, format: imgFormat });
    } finally {
      setRunning(false);
    }
  };

  const targetW = origDims ? Math.max(1, Math.round((origDims.width * scale) / 100)) : 0;
  const targetH = origDims ? Math.max(1, Math.round((origDims.height * scale) / 100)) : 0;

  return (
    <section className="ld-card">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="ld-seg" role="tablist" aria-label="PDF tool">
          {(
            [
              ["merge", "Merge PDFs"],
              ["split", "Split PDF"],
              ["compress", "Compress PDF"],
              ["resize", "Image Resolution"],
            ] as [ToolkitOp, string][]
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
        <div className="ld-dropzone-icon !w-12 !h-12">
          <FileUp size={22} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="text-xs text-[var(--ld-muted)]">
          {mode === "merge"
            ? "Select 2+ PDFs to merge"
            : mode === "split"
              ? "Select the PDF to split"
              : mode === "compress"
                ? "Select the PDF to compress"
                : "Select an image (PNG / JPG / WebP / GIF / TIFF / BMP / HEIC / ICO)"}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={mode === "resize" ? "image/*" : "application/pdf"}
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
            <span key={f.name} className="ld-chip !cursor-default">
              {f.name}
              <button
                type="button"
                className="text-[var(--ld-dim)] hover:text-[var(--ld-red)]"
                onClick={() => setFiles((prev) => prev.filter((x) => x.name !== f.name))}
                aria-label={`Remove ${f.name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {mode === "split" && (
        <div className="mt-3">
          <label htmlFor="split-ranges" className="ld-label">Page ranges (e.g. 1-3, 5, 8-10)</label>
          <input
            id="split-ranges"
            className="ld-input"
            placeholder="1-3, 5, 8-10"
            value={ranges}
            onChange={(e) => setRanges(e.target.value)}
          />
        </div>
      )}

      {mode === "resize" && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span id="img-format-label" className="ld-label !mb-0">Format</span>
              {(["png", "jpg", "webp"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`ld-chip ${imgFormat === f ? "ld-chip-selected" : ""}`}
                  onClick={() => setImgFormat(f)}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="resize-scale" className="ld-label">Resize scale percentage</label>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-[var(--ld-orange)] uppercase tracking-wider">
                ◀ downgrade
              </span>
              <span className="font-mono text-xs text-[var(--ld-text)]">
                {scale}% {scale === 100 ? "(original)" : scale > 100 ? "(upscale ↑)" : "(downscale ↓)"}
              </span>
              <span className="font-mono text-[10px] text-[var(--ld-ok)] uppercase tracking-wider">
                upgrade ▶
              </span>
            </div>
            <input
              id="resize-scale"
              type="range"
              min={5}
              max={400}
              step={5}
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value, 10))}
              className="w-full h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]"
              aria-label="Resize scale percentage"
            />
            <div className="flex justify-between font-mono text-[9px] text-[var(--ld-dim)] uppercase tracking-wider mt-1">
              <span>5% · burik</span>
              <span>100% · asli</span>
              <span>400% · 4K</span>
            </div>
          </div>

          {origDims && (
            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[11px]">
              <span className="text-[var(--ld-muted)]">
                {origDims.width}×{origDims.height} px →{" "}
                <span className="text-[var(--ld-text)]">
                  {targetW}×{targetH} px
                </span>
              </span>
              <span
                className={`ld-chip !cursor-default ${
                  scale > 100 ? "ld-chip-success" : scale < 100 ? "ld-chip-warn" : ""
                }`}
              >
                {scale === 100 ? "Original" : scale > 100 ? "Upscale" : "Downscale"} · {resizeQualityLabel(targetW)}
              </span>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="ld-btn ld-btn-primary mt-4"
        disabled={running || files.length === 0 || (mode === "split" && !ranges.trim())}
        onClick={run}
      >
        {running
          ? "Working…"
          : mode === "merge"
            ? "Merge"
            : mode === "split"
              ? "Split"
              : mode === "compress"
                ? "Compress"
                : "Resize Image"}
      </button>
    </section>
  );
}