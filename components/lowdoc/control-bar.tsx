"use client";

import { CATEGORY_LABELS, CATEGORY_ORDER, FORMATS, type LowDocCategory } from "@/lib/lowdoc/formats";
import { TARGETS, TARGET_LABELS } from "@/lib/lowdoc/matrix";

export default function ControlBar({
  selectedFormat,
  onFormatChange,
  onClear,
  fileCount,
}: {
  selectedFormat: string;
  onFormatChange: (key: string) => void;
  onClear: () => void;
  fileCount: number;
}) {
  return (
    <section className="border-b border-[var(--ld-border)] bg-[var(--ld-panel)] px-5 py-3">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)] mr-1">
          Format
        </span>
        <button
          type="button"
          className={`ld-chip ${selectedFormat === "" ? "ld-chip-selected" : ""}`}
          onClick={() => onFormatChange("")}
        >
          AUTO
        </button>
        {TARGETS.map((t) => (
          <button
            key={t}
            type="button"
            className={`ld-chip ${selectedFormat === t ? "ld-chip-selected" : ""}`}
            onClick={() => onFormatChange(t)}
          >
            {TARGET_LABELS[t]}
          </button>
        ))}
        {fileCount > 0 && (
          <button
            type="button"
            className="ld-chip ld-chip-danger ml-auto"
            onClick={onClear}
          >
            Clear ({fileCount})
          </button>
        )}
      </div>
    </section>
  );
}