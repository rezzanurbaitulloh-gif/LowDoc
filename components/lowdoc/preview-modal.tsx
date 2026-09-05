"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, FileText, X } from "lucide-react";

const PAPER_FORMATS: Record<string, { w: number; h: number }> = {
  A5: { w: 148, h: 210 },
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
  Letter: { w: 216, h: 279 },
  Legal: { w: 216, h: 356 },
};

export interface Previewable {
  outputName?: string;
  outputUrl?: string;
  outputType?: string;
  outputSize?: number;
}

interface PdfPage {
  dataUrl: string;
  width: number;
  height: number;
}

function stripXml(xml: string): string {
  return xml
    .replace(/<text:p[^>]*>/g, "")
    .replace(/<\/text:p>/g, "\n")
    .replace(/<table:table-row[^>]*>/g, "")
    .replace(/<\/table:table-row>/g, "\n")
    .replace(/<\/table:table-cell>/g, "\t")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractText(blob: Blob, name: string): Promise<string> {
  const lower = name.toLowerCase();
  if (lower.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer: await blob.arrayBuffer() });
    return result.value;
  }
  if (/\.(xlsx|xlsm|xlsb|xls)$/.test(lower)) {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(await blob.arrayBuffer(), { type: "array" });
    const out: string[] = [];
    for (const sheet of wb.SheetNames) {
      out.push(`── ${sheet} ──\n${XLSX.utils.sheet_to_csv(wb.Sheets[sheet])}`);
    }
    return out.join("\n\n");
  }
  if (/\.(pptx|odt|ods|odp)$/.test(lower)) {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const names =
      lower.endsWith(".pptx")
        ? Object.keys(zip.files)
            .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        : ["content.xml"];
    const parts: string[] = [];
    for (const n of names) {
      const file = zip.file(n);
      if (!file) continue;
      const xml = await file.async("string");
      parts.push(stripXml(xml));
    }
    return parts.join("\n\n").trim();
  }
  return blob.text();
}

export default function PreviewModal({
  item,
  onClose,
}: {
  item: Previewable | null;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current.focus();
    }
    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };
  const [paper, setPaper] = useState("A4");
  const [pageIdx, setPageIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pages, setPages] = useState<PdfPage[] | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{ w: number; h: number } | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item?.outputUrl) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPages(null);
    setPageIdx(0);
    setZoom(1);
    setImageData(null);
    setImageDims(null);
    setTextContent(null);

    (async () => {
      try {
        const res = await fetch(item.outputUrl!);
        const blob = await res.blob();
        if (cancelled) return;
        const type = item.outputType ?? blob.type;

        if (type === "application/pdf" || item.outputName?.toLowerCase().endsWith(".pdf")) {
          const { ensurePdfJs } = await import("@/lib/lowdoc/engines");
          await ensurePdfJs();
          const pdfjsLib = await import("pdfjs-dist");
          const pdf = await pdfjsLib.getDocument({ data: await blob.arrayBuffer() }).promise;
          const rendered: PdfPage[] = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
            rendered.push({
              dataUrl: canvas.toDataURL("image/png"),
              width: viewport.width,
              height: viewport.height,
            });
          }
          if (!cancelled) setPages(rendered);
        } else if (type.startsWith("image/")) {
          const url = URL.createObjectURL(blob);
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("image decode failed"));
            img.src = url;
          });
          if (!cancelled) {
            setImageData(url);
            setImageDims({ w: img.naturalWidth, h: img.naturalHeight });
          }
        } else {
          const text = await extractText(blob, item.outputName ?? "output");
          if (!cancelled) setTextContent(text.slice(0, 200_000));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [item]);

  if (!item) return null;

  const fmt = PAPER_FORMATS[paper];
  const sheetAspect = fmt.w / fmt.h;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="ld-panel w-full max-w-4xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Preview"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-[var(--ld-border)] px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Eye size={15} className="text-[var(--ld-orange)] shrink-0" aria-hidden="true" />
            <span className="font-mono text-xs text-[var(--ld-text)] truncate">
              {item.outputName ?? "Preview"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-1">
              {Object.keys(PAPER_FORMATS).map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`ld-chip !px-2 !py-1 !text-[9px] ${paper === name ? "ld-chip-selected" : ""}`}
                  onClick={() => setPaper(name)}
                  title={`Paper format ${name} (${PAPER_FORMATS[name].w}×${PAPER_FORMATS[name].h} mm)`}
                >
                  {name}
                </button>
              ))}
            </div>
            <button type="button" className="ld-btn ld-btn-ghost !px-2 !py-1" onClick={onClose} aria-label="Close preview">
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-4 bg-[var(--ld-bg)]">
          {loading && (
            <div className="py-16 text-center font-mono text-xs text-[var(--ld-dim)]">
              Rendering preview…
            </div>
          )}
          {error && (
            <div className="py-16 text-center font-mono text-xs text-[var(--ld-err)]">
              Preview failed: {error}
            </div>
          )}

          {/* PDF pages on paper sheets */}
          {pages && (
            <div className="flex flex-col items-center gap-4">
              <div className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
                {paper} · {fmt.w}×{fmt.h} mm · {pages.length} page(s)
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2" role="toolbar" aria-label="Preview controls">
                <button type="button" className="ld-chip" disabled={pageIdx <= 0} onClick={() => setPageIdx((i) => Math.max(0, i - 1))} aria-label="Previous page">‹ Prev</button>
                <span className="font-mono text-[11px] text-[var(--ld-text)]" aria-live="polite">
                  {Math.min(pageIdx + 1, pages.length)} / {pages.length}
                </span>
                <button type="button" className="ld-chip" disabled={pageIdx >= pages.length - 1} onClick={() => setPageIdx((i) => Math.min(pages.length - 1, i + 1))} aria-label="Next page">Next ›</button>
                <button type="button" className="ld-chip" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} aria-label="Zoom out">−</button>
                <span className="font-mono text-[11px] text-[var(--ld-text)]">{Math.round(zoom * 100)}%</span>
                <button type="button" className="ld-chip" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="Zoom in">+</button>
                <button type="button" className="ld-chip" onClick={() => setZoom(1)} aria-label="Reset zoom">Fit</button>
              </div>
              {(() => {
                const p = pages[Math.min(pageIdx, pages.length - 1)];
                const sheetH = Math.min(520, (p.width / sheetAspect) * 0.72 + 200) * zoom;
                const drawW = sheetH * sheetAspect;
                const drawH = sheetH;
                const ratio = Math.min(drawW / p.width, drawH / p.height);
                const w = Math.floor(p.width * ratio);
                const h = Math.floor(p.height * ratio);
                return (
                  <div key={Math.min(pageIdx, pages.length - 1)} className="w-full flex flex-col items-center gap-1.5">
                    <div className="font-mono text-[9px] text-[var(--ld-dim)]">
                      — page {Math.min(pageIdx, pages.length - 1) + 1} —
                    </div>
                    <div
                      className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-center max-w-full overflow-auto"
                      style={{ aspectRatio: `${fmt.w}/${fmt.h}`, height: sheetH, width: "auto", maxWidth: "100%" }}
                    >
                      <img
                        src={p.dataUrl}
                        alt={`page ${Math.min(pageIdx, pages.length - 1) + 1}`}
                        style={{ width: w, height: h, maxWidth: "none" }}
                        className="block"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* image preview */}
          {imageData && (
            <div className="flex flex-col items-center gap-3">
              <div className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
                {imageDims ? `${imageDims.w}×${imageDims.h} px` : "image"} · {item.outputName}
              </div>
              <div
                className="bg-[var(--ld-panel-2)] border border-[var(--ld-border)] p-3 flex items-center justify-center"
                style={{ maxWidth: "100%", maxHeight: "70vh" }}
              >
                <img
                  src={imageData}
                  alt="preview"
                  className="block"
                  style={{ maxWidth: "100%", maxHeight: "65vh", objectFit: "contain" }}
                />
              </div>
              <div className="font-mono text-[10px] text-[var(--ld-muted)]">
                {item.outputSize ? `${(item.outputSize / 1024).toFixed(1)} KB` : ""}
              </div>
            </div>
          )}

          {/* text preview */}
          {textContent !== null && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
                <FileText size={12} aria-hidden="true" />
                Text content
              </div>
              <pre className="ld-console p-3 whitespace-pre-wrap break-words text-xs text-[var(--ld-muted)] max-h-[60vh] overflow-y-auto">
                {textContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}