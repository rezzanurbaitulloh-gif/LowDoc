"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp, RotateCw, RotateCcw, Trash2, GripVertical, Plus, Minus, Type, Image, Layout, FileText, Scissors, RotateCw as RotateCwIcon, RotateCcw as RotateCcwIcon, FlipHorizontal, FlipVertical, Download, X } from "lucide-react";
import type { PdfToolkitTask } from "@/lib/lowdoc/pipeline";
import { loadImageDims, resizeQualityLabel } from "@/lib/lowdoc/pdf-toolkit";

export type ToolkitOp = "merge" | "split" | "compress" | "resize" | "extract" | "delete" | "reorder" | "rotate" | "watermark" | "pagenumbers" | "text";

export default function PdfToolkit({
  onRun,
}: {
  onRun: (
    op: ToolkitOp,
    files: File[],
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
    },
  ) => Promise<void>;
}) {
  const [mode, setMode] = useState<ToolkitOp>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [ranges, setRanges] = useState("");
  const [scale, setScale] = useState(100);
  const [imgFormat, setImgFormat] = useState<"png" | "jpg" | "webp">("png");
  const [origDims, setOrigDims] = useState<{ width: number; height: number } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [pagesToDelete, setPagesToDelete] = useState<string>("");
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkOpacity, setWatermarkOpacity] = useState(30);
  const [pageNumberFormat, setPageNumberFormat] = useState("Page {n} of {total}");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [textContent, setTextContent] = useState("");
  const [textPage, setTextPage] = useState(1);
  const [textFontSize, setTextFontSize] = useState(12);
  const [textColor, setTextColor] = useState({ r: 0, g: 0, b: 0 });
  const [textFont, setTextFont] = useState("Helvetica");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [running, setRunning] = useState(false);
  
  // Image toolkit state
  const [format, setFormat] = useState<"png" | "jpg" | "webp" | "avif">("webp");
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [cropData, setCropData] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [removeMetadata, setRemoveMetadata] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrigDims(null);
    if (mode === "resize" || mode === "rotate") {
      if (files[0]) {
        loadImageDims(files[0])
          .then(setOrigDims)
          .catch(() => setOrigDims(null));
      }
    }
  }, [mode, files]);

  const pickFiles = (list: FileList | null) => {
    if (!list) return;
    const isImageMode = mode === "resize" || mode === "rotate" || mode === "watermark";
    const accepted = isImageMode
      ? Array.from(list).filter((f) => /\.(png|jpe?g|webp|gif|bmp|tiff?|heic|ico|avif)$/i.test(f.name))
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
      const opts: any = {};
      if (mode === "resize") {
        opts.width = width || undefined;
        opts.height = height || undefined;
        opts.maintainAspect = maintainAspect;
        opts.format = format;
        opts.quality = quality;
      } else if (mode === "compress") {
        opts.quality = quality;
        opts.format = format;
      } else if (mode === "rotate") {
        opts.rotation = rotation;
        opts.format = format;
        opts.quality = quality;
      } else if (mode === "extract" || mode === "delete") {
        opts.pages = (mode === "delete" ? pagesToDelete : ranges)
          .split(",")
          .map((n) => parseInt(n.trim(), 10))
          .filter((n) => !isNaN(n));
      } else if (mode === "reorder") {
        opts.pageOrder = pageOrder;
      } else if (mode === "watermark") {
        opts.watermarkText = watermarkText;
        opts.watermarkOpacity = watermarkOpacity;
        opts.watermarkImage = watermarkImage ?? undefined;
      } else if (mode === "pagenumbers") {
        opts.pageNumberFormat = pageNumberFormat;
      } else if ((mode as ToolkitOp) === "text") {
        opts.textContent = textContent;
        opts.textPosition = textPosition;
        opts.textFontSize = textFontSize;
        opts.textColor = textColor;
        opts.textFont = textFont;
        opts.textPage = textPage;
      }
      await onRun(mode, files, ranges, opts);
    } finally {
      setRunning(false);
    }
  };

  const targetW = origDims ? Math.max(1, Math.round((origDims.width * (width || 100)) / 100)) : 0;
  const targetH = origDims ? Math.max(1, Math.round((origDims.height * (height || 100)) / 100)) : 0;

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
              ["extract", "Extract Pages"],
              ["delete", "Delete Pages"],
              ["reorder", "Reorder Pages"],
              ["rotate", "Rotate Pages"],
              ["watermark", "Watermark"],
              ["pagenumbers", "Page Numbers"],
              ["text", "Add Text"],
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
          {(mode as ToolkitOp) === "merge"
            ? "Select 2+ PDFs to merge"
            : (mode as ToolkitOp) === "split"
              ? "Select the PDF to split"
              : (mode as ToolkitOp) === "compress"
                ? "Select the PDF to compress"
                : (mode as ToolkitOp) === "extract" || (mode as ToolkitOp) === "delete" || (mode as ToolkitOp) === "reorder" || (mode as ToolkitOp) === "rotate" || (mode as ToolkitOp) === "watermark" || (mode as ToolkitOp) === "pagenumbers"
                  ? "Select PDF"
                  : (mode as ToolkitOp) === "compress"
                    ? "Select the PDF to compress"
                    : "Select an image (PNG / JPG / WebP / GIF / TIFF / BMP / HEIC / ICO)"}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={mode === "resize" || mode === "rotate" ? "image/*" : "application/pdf"}
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

      {mode === "extract" && (
        <div className="mt-3">
          <label htmlFor="extract-pages" className="ld-label">Page numbers to extract (comma-separated, e.g. 1,3,5-7)</label>
          <input
            id="extract-pages"
            className="ld-input"
            placeholder="1,3,5-7"
            value={ranges}
            onChange={(e) => setRanges(e.target.value)}
          />
        </div>
      )}

      {mode === "delete" && (
        <div className="mt-3">
          <label htmlFor="delete-pages" className="ld-label">Page numbers to delete (comma-separated, e.g. 1,3,5-7)</label>
          <input
            id="delete-pages"
            className="ld-input"
            placeholder="1,3,5-7"
            value={pagesToDelete}
            onChange={(e) => setPagesToDelete(e.target.value)}
          />
        </div>
      )}

      {mode === "reorder" && (
        <div className="mt-3">
          <label htmlFor="reorder-pages" className="ld-label">Page order (comma-separated page numbers, e.g. 3,1,2 for 3→1→2)</label>
          <input
            id="reorder-pages"
            className="ld-input"
            placeholder="3,1,2"
            value={pageOrder.join(",")}
            onChange={(e) => setPageOrder(e.target.value.split(",").map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n)))}
          />
          <p className="text-xs text-[var(--ld-muted)] mt-1">Enter new page order. Current PDF pages will be reordered accordingly.</p>
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
            {(["png", "jpg", "webp"] as const).map((f) => (
              <button key={f} type="button" className={`ld-chip ${imgFormat === f ? "ld-chip-selected" : ""}`} onClick={() => setImgFormat(f)}>{f.toUpperCase()}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Quality</span>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(parseInt(e.target.value, 10))} className="w-48 h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]" aria-label="Quality" />
            <span className="font-mono text-xs text-[var(--ld-dim)]">{quality}%</span>
          </div>
        </div>
      )}

      {mode === "watermark" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="ld-label">Text Watermark</span>
            <input
              type="text"
              className="ld-input flex-1 min-w-48"
              placeholder="CONFIDENTIAL"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Opacity</span>
            <input type="range" min={0} max={100} step={5} value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(parseInt(e.target.value, 10))} className="w-48 h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]" />
            <span className="font-mono text-xs text-[var(--ld-dim)]">{watermarkOpacity}%</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setWatermarkImage(e.target.files?.[0] || null)} />
              <button type="button" className="ld-btn ld-btn-ghost !px-3 !py-1" onClick={() => (document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement)?.click()}>
                <Image size={14} aria-hidden="true" /> Image Watermark
              </button>
              {watermarkImage && <span className="text-xs text-[var(--ld-ok)]">{watermarkImage.name}</span>}
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="ld-label">Format</span>
            {(["png", "jpg", "webp"] as const).map((f) => (
              <button key={f} type="button" className={`ld-chip ${imgFormat === f ? "ld-chip-selected" : ""}`} onClick={() => setImgFormat(f)}>{f.toUpperCase()}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Quality</span>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(parseInt(e.target.value, 10))} className="w-48 h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]" aria-label="Quality" />
            <span className="font-mono text-xs text-[var(--ld-dim)]">{quality}%</span>
          </div>
        </div>
      )}

      {mode === "pagenumbers" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="page-number-format" className="ld-label">Format</label>
            <input
              id="page-number-format"
              className="ld-input flex-1 min-w-48"
              placeholder="Page {n} of {total}"
              value={pageNumberFormat}
              onChange={(e) => setPageNumberFormat(e.target.value)}
            />
            <span className="text-xs text-[var(--ld-dim)]">Use &#123;n&#125; for page number, &#123;total&#125; for total pages</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Format</span>
            {(["png", "jpg", "webp"] as const).map((f) => (
              <button key={f} type="button" className={`ld-chip ${imgFormat === f ? "ld-chip-selected" : ""}`} onClick={() => setImgFormat(f)}>{f.toUpperCase()}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="ld-label">Quality</span>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(parseInt(e.target.value, 10))} className="w-48 h-2 appearance-none rounded-full bg-[var(--ld-panel-2)] accent-[var(--ld-orange)]" aria-label="Quality" />
            <span className="font-mono text-xs text-[var(--ld-dim)]">{quality}%</span>
          </div>
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

      {(mode as ToolkitOp) === "text" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="text-content" className="ld-label">Text Content</label>
            <textarea
              id="text-content"
              className="ld-input min-h-24 resize-y flex-1"
              placeholder="Enter text to add..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              maxLength={5000}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="text-page" className="ld-label">Page</label>
            <input
              id="text-page"
              type="number"
              min={1}
              value={textPage}
              onChange={(e) => setTextPage(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="ld-input !w-20"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={false}
                disabled
                className="w-4 h-4 accent-[var(--ld-orange)]"
              />
              <span className="font-mono text-xs text-[var(--ld-muted)]">All pages</span>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="text-x" className="ld-label">X</label>
            <input
              id="text-x"
              type="number"
              min={0}
              value={textPosition.x}
              onChange={(e) => setTextPosition(p => ({ ...p, x: parseInt(e.target.value, 10) || 0 }))}
              className="ld-input !w-20"
            />
            <label htmlFor="text-y" className="ld-label">Y</label>
            <input
              id="text-y"
              type="number"
              min={0}
              value={textPosition.y}
              onChange={(e) => setTextPosition(p => ({ ...p, y: parseInt(e.target.value, 10) || 0 }))}
              className="ld-input !w-20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="text-font-size" className="ld-label">Font Size</label>
            <input
              id="text-font-size"
              type="number"
              min={6}
              max={200}
              value={textFontSize}
              onChange={(e) => setTextFontSize(Math.max(6, Math.min(200, parseInt(e.target.value, 10) || 12)))}
              className="ld-input !w-20"
            />
            <span className="ld-label">Font</span>
            <select
              id="text-font"
              className="ld-select"
              value={textFont}
              onChange={(e) => setTextFont(e.target.value)}
            >
              <option value="Helvetica">Helvetica</option>
              <option value="Helvetica-Bold">Helvetica Bold</option>
              <option value="Helvetica-Oblique">Helvetica Oblique</option>
              <option value="Times-Roman">Times Roman</option>
              <option value="Times-Bold">Times Bold</option>
              <option value="Courier">Courier</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="ld-label">Color</label>
            <input
              type="color"
              value={`rgb(${textColor.r},${textColor.g},${textColor.b})`}
              onChange={(e) => {
                const hex = e.target.value;
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                setTextColor({ r, g, b });
              }}
              className="w-10 h-8 rounded border border-[var(--ld-border)]"
            />
          </div>
        </div>
      )}

        </div>
      )}

      <button
        type="button"
        className="ld-btn ld-btn-primary mt-4"
        disabled={running || files.length === 0 || (mode === "split" && !ranges.trim()) || (mode === "delete" && !pagesToDelete.trim()) || (mode === "reorder" && pageOrder.length === 0) || (mode === "watermark" && !watermarkText && !watermarkImage)}
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
                : mode === "extract"
                  ? "Extract"
                  : mode === "delete"
                    ? "Delete"
                    : mode === "reorder"
                      ? "Reorder"
                      : mode === "rotate"
                        ? "Rotate"
                        : mode === "watermark"
                          ? "Apply Watermark"
  : mode === "pagenumbers"
                          ? "Add Page Numbers"
                          : (mode as ToolkitOp) === "text"
                            ? "Add Text"
                            : "Run"}
      </button>
    </section>
  );
}