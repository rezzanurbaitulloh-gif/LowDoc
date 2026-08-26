"use client";

import { CATEGORY_LABELS, CATEGORY_ORDER, FORMATS } from "@/lib/lowdoc/formats";
import { OUTPUT_GROUPS, TARGET_LABELS, findPath, getCapability, CAP_LABELS } from "@/lib/lowdoc/matrix";

const INPUT_EXTENSIONS = [
  "docx", "doc", "docm", "dotx", "odt", "rtf", "txt",
  "xlsx", "xls", "xlsm", "xlsb", "ods",
  "pptx", "ppt", "ppsx", "odp",
  "pages", "numbers", "key",
  "wpd", "sdw", "sxw",
  "html", "md", "epub", "tex", "org", "rst", "adoc", "json", "xml",
  "csv", "tsv", "pdf", "dxf",
  "png", "jpg", "jpeg", "webp", "tiff", "gif", "bmp", "ico", "heic",
];

export default function ControlBar({
  selectedFormat,
  onFormatChange,
  onClear,
  fileCount,
  srcExt,
  className = "",
}: {
  selectedFormat: string;
  onFormatChange: (key: string) => void;
  onClear: () => void;
  fileCount: number;
  srcExt?: string;
  className?: string;
}) {
  const cap = srcExt && selectedFormat ? getCapability(srcExt, selectedFormat) : null;
  const needsServer = (t: string) => {
    if (!srcExt) return false;
    const p = findPath(srcExt, t);
    return !!p && p.some((h) => h.engine === "office");
  };

  return (
    <section className={`ld-card ${className}`}>
      {/* output groups */}
      <div className="flex flex-wrap items-start gap-x-5 gap-y-3">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
            Output
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`ld-chip ${selectedFormat === "" ? "ld-chip-selected" : ""}`}
              onClick={() => onFormatChange("")}
            >
              AUTO
            </button>
          </div>
        </div>
        {OUTPUT_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
              {group.label}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {group.targets.map((t) => (
                <button
                  key={t}
                  type="button"
                  title={needsServer(t) ? "Requires the self-hosted office helper" : undefined}
                  className={`ld-chip ${selectedFormat === t ? "ld-chip-selected" : ""}`}
                  onClick={() => onFormatChange(t)}
                >
                  {TARGET_LABELS[t]}
                  {needsServer(t) && selectedFormat === t && <span className="opacity-70">⌂</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
        {fileCount > 0 && (
          <button
            type="button"
            className="ld-chip ld-chip-danger ml-auto mt-5"
            onClick={onClear}
          >
            Clear ({fileCount})
          </button>
        )}
      </div>

      {cap && (
        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
          <span className="ld-chip !cursor-default ld-chip-success">{CAP_LABELS[cap.status]}</span>
          <span
            className={`ld-chip !cursor-default ${cap.local ? "ld-chip-success" : "ld-chip-warn"}`}
            title={cap.local ? "Runs entirely in your browser" : "Uses the self-hosted office helper (LibreOffice)"}
          >
            {cap.local ? "100% local" : "server-assisted ⌂"}
          </span>
          <span className="text-[var(--ld-dim)] normal-case">{cap.note}</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)] mr-1">
          Input
        </span>
        {CATEGORY_ORDER.map((cat) => (
          <span
            key={cat}
            className="ld-chip !cursor-default"
            title={`${CATEGORY_LABELS[cat]}: ${FORMATS.filter((f) => f.category === cat)
              .flatMap((f) => f.extensions)
              .join(", ")}`}
          >
            {CATEGORY_LABELS[cat]}
            <span className="text-[var(--ld-dim)]">
              {FORMATS.filter((f) => f.category === cat).length}
            </span>
          </span>
        ))}
      </div>

      <div className="mt-2 font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
        Supported input: {INPUT_EXTENSIONS.join(", ")}
      </div>
    </section>
  );
}