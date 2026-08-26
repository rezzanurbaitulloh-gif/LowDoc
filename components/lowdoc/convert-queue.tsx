"use client";

import { CheckCircle2, Download, Eye, Loader2, TriangleAlert, XCircle } from "lucide-react";
import { formatBytes } from "@/lib/lowdoc/pipeline";
import type { ConversionTask } from "@/lib/lowdoc/pipeline";

export default function ConvertQueue({
  tasks,
  onDownload,
  onDownloadAll,
  onRetryFailed,
  onRemove,
  onPreview,
  className = "",
}: {
  tasks: ConversionTask[];
  onDownload: (task: ConversionTask) => void;
  onDownloadAll?: () => void;
  onRetryFailed?: () => void;
  onRemove: (id: string) => void;
  onPreview: (task: ConversionTask) => void;
  className?: string;
}) {
  if (tasks.length === 0) return null;

  const done = tasks.filter((t) => t.status === "done").length;
  const failed = tasks.filter((t) => t.status === "error").length;

  return (
    <section className={`ld-card ${className}`}>
      <div className="ld-card-title">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
          Queue — {tasks.length} task(s) · {done} done · {failed} failed
        </span>
        {failed > 0 && onRetryFailed && (
          <button type="button" className="ld-chip ld-chip-warn" onClick={onRetryFailed}>
            retry {failed}
          </button>
        )}
        {done > 1 && onDownloadAll && (
          <button type="button" className="ld-chip ld-chip-success" onClick={onDownloadAll}>
            <Download size={11} /> all (.zip)
          </button>
        )}
      </div>
      <div className="divide-y divide-[var(--ld-border)]">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 py-3">
            <div className="w-5 shrink-0">
              {t.status === "done" && <CheckCircle2 size={16} className="text-[var(--ld-ok)]" />}
              {t.status === "error" && <XCircle size={16} className="text-[var(--ld-err)]" />}
              {(t.status === "running" || t.status === "pending") && (
                <Loader2 size={16} className="text-[var(--ld-info)] animate-spin" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-[var(--ld-text)] truncate">{t.name}</span>
                <span className="font-mono text-[10px] text-[var(--ld-dim)] shrink-0">
                  {formatBytes(t.size)}
                </span>
                <span className="font-mono text-[10px] uppercase text-[var(--ld-dim)] shrink-0">
                  {t.engine}
                </span>
              </div>
              {t.status === "running" && (
                <div className="mt-1.5 h-1 bg-[var(--ld-panel-2)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--ld-accent)] rounded-full transition-all"
                    style={{ width: `${Math.round(t.progress * 100)}%` }}
                  />
                </div>
              )}
              {t.status === "done" && t.outputName && (
                <div className="font-mono text-[10px] text-[var(--ld-ok)] mt-0.5">
                  → {t.outputName} ({formatBytes(t.outputSize ?? 0)})
                </div>
              )}
              {t.status === "done" && t.fidelityLine && (
                <div
                  className={`font-mono text-[10px] mt-0.5 ${
                    t.fidelityVerdict === "match"
                      ? "text-[var(--ld-ok)]"
                      : t.fidelityVerdict === "changed"
                        ? "text-[var(--ld-yellow)]"
                        : "text-[var(--ld-dim)]"
                  }`}
                >
                  {t.fidelityVerdict === "match" ? "✓ " : t.fidelityVerdict === "changed" ? "⚠ " : "· "}
                  {t.fidelityLine}
                </div>
              )}
              {t.status === "error" && (
                <div className="flex items-center gap-1 font-mono text-[10px] text-[var(--ld-err)] mt-0.5">
                  <TriangleAlert size={10} />
                  {t.error}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {t.status === "done" && (
                <>
                  <button
                    type="button"
                    className="ld-btn ld-btn-ghost !px-2.5 !py-1"
                    onClick={() => onPreview(t)}
                    title="Preview"
                    aria-label="Preview output"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    type="button"
                    className="ld-btn ld-btn-ghost !px-2.5 !py-1"
                    onClick={() => onDownload(t)}
                    title="Download"
                    aria-label="Download output"
                  >
                    <Download size={13} />
                  </button>
                </>
              )}
              {(t.status === "done" || t.status === "error") && (
                <button
                  type="button"
                  className="ld-btn ld-btn-ghost !px-2.5 !py-1"
                  onClick={() => onRemove(t.id)}
                  title="Remove"
                  aria-label={`Remove task ${t.name}`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}