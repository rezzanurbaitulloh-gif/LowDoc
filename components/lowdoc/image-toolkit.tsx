"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileUp, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Download, X, Minus, Plus, Crop } from "lucide-react";
import { loadImageDims, resizeQualityLabel } from "@/lib/lowdoc/pdf-toolkit";

export type ImageToolkitOp = "resize" | "crop" | "compress" | "rotate" | "flip" | "convert" | "metadata" | "optimize";

export default function ImageToolkit({
  onRun,
}: {
  onRun: (
    op: ImageToolkitOp,
    files: File[],
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
  ) => Promise<void>;
}) {
  const [mode, setMode] = useState<ImageToolkitOp>("resize");
  const [files, setFiles] = useState<File[]>([]);
  const [running, setRunning] = useState(false);
  const [origDims, setOrigDims] = useState<{ width: number; height: number } | null>(null);
  const [cropData, setCropData] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<"png" | "jpg" | "webp" | "avif">("webp");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [targetSizeKB, setTargetSizeKB] = useState("");
  const [removeMetadata, setRemoveMetadata] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrigDims(null);
    setCropData(null);
    if (mode === "resize" || mode === "crop") {
      if (files[0]) {
        loadImageDims(files[0])
          .then(setOrigDims)
          .catch(() => setOrigDims(null));
      }
    }
  }, [mode, files]);

  const pickFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const accepted = Array.from(list).filter((f) => /\.(png|jpe?g|webp|gif|bmp|tiff?|heic|ico|avif)$/i.test(f.name));
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.name));
      return [...prev, ...accepted.filter((f) => !seen.has(f.name))];
    });
  }, []);

  const run = async () => {
    if (files.length === 0) return;
    setRunning(true);
    try {
      const opts: any = {};
      if (mode === "resize") {
        opts.width = width || undefined;
        opts.height = height || undefined;
        opts.maintainAspect = maintainAspect;
        opts.format = format;
        opts.quality = quality;
      } else if (mode === "crop") {
        opts.crop = cropData;
        opts.format = format;
        opts.quality = quality;
      } else if (mode === "compress") {
        opts.quality = quality;
        opts.format = format;
      } else if (mode === "rotate") {
        opts.rotation = rotation;
        opts.format = format;
        opts.quality = quality;
      } else if (mode === "flip") {
        opts.flipH = flipH;
        opts.flipV = flipV;
        opts.format = format;
        opts.quality = quality;
      } else if (mode === "convert") {
        opts.format = format;
        opts.quality = quality;
      } else if (mode === "optimize") {
        opts.format = format;
        opts.quality = quality;
        opts.removeMetadata = removeMetadata;
      } else if (mode === "metadata") {
        opts.removeMetadata = removeMetadata;
      }
      await onRun(mode, files, opts);
    } finally {
      setRunning(false);
    }
  };

  const targetW = origDims ? Math.max(1, Math.round((origDims.width * (width || 100)) / 100)) : 0;
  const targetH = origDims ? Math.max(1, Math.round((origDims.height * (height || 100)) / 100)) : 0;

  return (
    <section className="ld-card">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="ld-seg" role="tablist" aria-label="Image tool">
          {(
            [
              ["resize", "Resize"],
              ["crop", "Crop"],
              ["compress", "Compress"],
              ["rotate", "Rotate"],
              ["flip", "Flip"],
              ["convert", "Convert"],
              ["optimize", "Optimize"],
              ["metadata", "Metadata"],
            ] as [ImageToolkitOp, string][]
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
          {mode === "resize" || mode === "crop" || mode === "compress"
            ? "Select images (PNG, JPG, WebP, GIF, TIFF, BMP, HEIC, ICO, AVIF)"
            : mode === "rotate" || mode === "flip"
              ? "Select images to rotate/flip"
              : "Select images to convert/optimize"}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
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

      {mode === "resize" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="resize-width" className="ld-label">Width</label>
            <input
              id="resize-width"
              type="number"
              min={1}
              max={10000}
              value={width || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setWidth(val);
              }}
              className="ld-input !w-24"
            />
            <span className="text-[var(--ld-dim)]">×</span>
            <label htmlFor="resize-height" className="ld-label">Height</label>
            <input
              id="resize-height"
              type="number"
              min={1}
              max={10000}
              value={height || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setHeight(val);
              }}
              className="ld-input !w-24"
            />
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={maintainAspect}
                onChange={(e) => setMaintainAspect(e.target.checked)}
                className="w-4 h-4 accent-[var(--ld-orange)]"
              />
              <span className="font-mono text-xs text-[var(--ld-muted)]">Maintain aspect ratio</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="ld-label">Format</span>
            {(["png", "jpg", "webp", "avif"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`ld-chip ${format === f ? "ld-chip-selected" : ""}`}
                onClick={() => setFormat(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="ld-label">Quality</span>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value, 10))}
              className="w-48 h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]"
              aria-label="Quality"
            />
            <span className="font-mono text-xs text-[var(--ld-dim)]">{quality}%</span>
          </div>

          {origDims && (
            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[11px]">
              <span className="text-[var(--ld-muted)]">
                {origDims.width}×{origDims.height} px →{" "}
                <span className="text-[var(--ld-text)]">
                  {targetW}×{targetH} px
                </span>
              </span>
              <span className={`ld-chip !cursor-default ${targetW > 0 && targetH > 0 ? "ld-chip-success" : "ld-chip-warn"}`}>
                {resizeQualityLabel(targetW)}
              </span>
            </div>
          )}
        </div>
      )}

      {mode === "crop" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="ld-label">Crop area</span>
            <button
              type="button"
              className="ld-btn ld-btn-ghost !px-3 !py-1"
              onClick={() => {
                if (origDims) {
                  const size = Math.min(origDims.width, origDims.height) * 0.5;
                  setCropData({
                    x: Math.round((origDims.width - size) / 2),
                    y: Math.round((origDims.height - size) / 2),
                    width: Math.round(size),
                    height: Math.round(size),
                  });
                }
              }}
            >
              Square (center)
            </button>
            <button
              type="button"
              className="ld-btn ld-btn-ghost !px-3 !py-1"
              onClick={() => setCropData(origDims ? { x: 0, y: 0, width: origDims.width, height: origDims.height } : null)}
            >
              Full image
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="crop-x" className="ld-label">X</label>
            <input id="crop-x" type="number" min={0} value={cropData?.x || 0} onChange={(e) => setCropData((c) => ({ ...(c || { x: 0, y: 0, width: 0, height: 0 }), x: parseInt(e.target.value, 10) || 0 }))} className="ld-input !w-20" />
            <label htmlFor="crop-y" className="ld-label">Y</label>
            <input id="crop-y" type="number" min={0} value={cropData?.y || 0} onChange={(e) => setCropData((c) => ({ ...(c || { x: 0, y: 0, width: 0, height: 0 }), y: parseInt(e.target.value, 10) || 0 }))} className="ld-input !w-20" />
            <label htmlFor="crop-w" className="ld-label">Width</label>
            <input id="crop-w" type="number" min={1} value={cropData?.width || 0} onChange={(e) => setCropData((c) => ({ ...(c || { x: 0, y: 0, width: 0, height: 0 }), width: parseInt(e.target.value, 10) || 0 }))} className="ld-input !w-20" />
            <label htmlFor="crop-h" className="ld-label">Height</label>
            <input id="crop-h" type="number" min={1} value={cropData?.height || 0} onChange={(e) => setCropData((c) => ({ ...(c || { x: 0, y: 0, width: 0, height: 0 }), height: parseInt(e.target.value, 10) || 0 }))} className="ld-input !w-20" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="ld-label">Output Format</span>
            {(["png", "jpg", "webp", "avif"] as const).map((f) => (
              <button key={f} type="button" className={`ld-chip ${format === f ? "ld-chip-selected" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="ld-label">Quality</span>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(parseInt(e.target.value, 10))} className="w-48 h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]" aria-label="Quality" />
            <span className="font-mono text-xs text-[var(--ld-dim)]">{quality}%</span>
          </div>
        </div>
      )}

      {mode === "compress" && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="ld-label">Target size (KB)</span>
            <input type="number" min={1} value={targetSizeKB} onChange={(e) => setTargetSizeKB(e.target.value)} className="ld-input !w-24" placeholder="e.g. 500" />
            <span className="text-[var(--ld-dim)]">(optional)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Quality</span>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(parseInt(e.target.value, 10))} className="w-48 h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]" aria-label="Quality" />
            <span className="font-mono text-xs text-[var(--ld-dim)]">{quality}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Format</span>
            {(["png", "jpg", "webp", "avif"] as const).map((f) => (
              <button key={f} type="button" className={`ld-chip ${format === f ? "ld-chip-selected" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>
            ))}
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={removeMetadata} onChange={(e) => setRemoveMetadata(e.target.checked)} className="w-4 h-4 accent-[var(--ld-orange)]" />
            <span className="text-sm text-[var(--ld-muted)]">Remove metadata (EXIF, etc.)</span>
          </label>
        </div>
      )}

      {mode === "rotate" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="ld-label">Rotation</span>
            <button type="button" className="ld-btn ld-btn-ghost !px-3 !py-1" onClick={() => setRotation((r) => (r + 90) % 360)}><RotateCw size={14} aria-hidden="true" /> 90° CW</button>
            <button type="button" className="ld-btn ld-btn-ghost !px-3 !py-1" onClick={() => setRotation((r) => (r + 270) % 360)}><RotateCcw size={14} aria-hidden="true" /> 90° CCW</button>
            <button type="button" className="ld-btn ld-btn-ghost !px-3 !py-1" onClick={() => setRotation((r) => (r + 180) % 360)}>180°</button>
            <span className="font-mono text-xs text-[var(--ld-orange)]">{rotation}°</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Output Format</span>
            {(["png", "jpg", "webp", "avif"] as const).map((f) => (
              <button key={f} type="button" className={`ld-chip ${format === f ? "ld-chip-selected" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Quality</span>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(parseInt(e.target.value, 10))} className="w-48 h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]" aria-label="Quality" />
            <span className="font-mono text-xs text-[var(--ld-dim)]">{quality}%</span>
          </div>
        </div>
      )}

      {mode === "flip" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="ld-label">Flip</span>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} className="w-4 h-4 accent-[var(--ld-orange)]" />
              <span className="text-sm text-[var(--ld-text)]"><FlipHorizontal size={14} aria-hidden="true" /> Horizontal</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} className="w-4 h-4 accent-[var(--ld-orange)]" />
              <span className="text-sm text-[var(--ld-text)]"><FlipVertical size={14} aria-hidden="true" /> Vertical</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Output Format</span>
            {(["png", "jpg", "webp", "avif"] as const).map((f) => (
              <button key={f} type="button" className={`ld-chip ${format === f ? "ld-chip-selected" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Quality</span>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(parseInt(e.target.value, 10))} className="w-48 h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]" aria-label="Quality" />
            <span className="font-mono text-xs text-[var(--ld-dim)]">{quality}%</span>
          </div>
        </div>
      )}

      {mode === "convert" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="ld-label">Output Format</span>
            {(["png", "jpg", "webp", "avif"] as const).map((f) => (
              <button key={f} type="button" className={`ld-chip ${format === f ? "ld-chip-selected" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Quality</span>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(parseInt(e.target.value, 10))} className="w-48 h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]" aria-label="Quality" />
            <span className="font-mono text-xs text-[var(--ld-dim)]">{quality}%</span>
          </div>
        </div>
      )}

      {mode === "optimize" && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="ld-label">Format</span>
            {(["png", "jpg", "webp", "avif"] as const).map((f) => (
              <button key={f} type="button" className={`ld-chip ${format === f ? "ld-chip-selected" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Quality</span>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(parseInt(e.target.value, 10))} className="w-48 h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]" aria-label="Quality" />
            <span className="font-mono text-xs text-[var(--ld-dim)]">{quality}%</span>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={removeMetadata} onChange={(e) => setRemoveMetadata(e.target.checked)} className="w-4 h-4 accent-[var(--ld-orange)]" />
            <span className="text-sm text-[var(--ld-muted)]">Remove metadata (EXIF, ICC profile, etc.)</span>
          </label>
        </div>
      )}

      {mode === "metadata" && (
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={removeMetadata} onChange={(e) => setRemoveMetadata(e.target.checked)} className="w-4 h-4 accent-[var(--ld-orange)]" />
            <span className="text-sm text-[var(--ld-muted)]">Remove all metadata (EXIF, ICC profile, XMP, etc.)</span>
          </label>
          <p className="text-xs text-[var(--ld-muted)]">Keeps original format. Use Convert to change format.</p>
        </div>
      )}

      <button
        type="button"
        className="ld-btn ld-btn-primary mt-4"
        disabled={running || files.length === 0}
        onClick={run}
      >
        {running
          ? "Working…"
          : mode === "resize"
            ? "Resize"
            : mode === "crop"
              ? "Crop"
              : mode === "compress"
                ? "Compress"
                : mode === "rotate"
                  ? "Rotate"
                  : mode === "flip"
                    ? "Flip"
                    : mode === "convert"
                      ? "Convert"
                      : mode === "optimize"
                        ? "Optimize"
                        : "Strip Metadata"}
      </button>
    </section>
  );
}