"use client";

import { CheckCircle2, Download, Loader2, TriangleAlert, XCircle } from "lucide-react";
import { formatBytes } from "@/lib/lowdoc/pipeline";
import type { ConversionTask } from "@/lib/lowdoc/pipeline";

export default function ConvertQueue({
  tasks,
  onDownload,
  onRemove,
}: {
  tasks: ConversionTask[];
  onDownload: (task: ConversionTask) => void;
  onRemove: (id: string) => void;
}) {
  if (tasks.length === 0) return null;

  const done = tasks.filter((t) => t.status === "done").length;
  const failed = tasks.filter((t) => t.status === "error").length;

  return (
    <section className="px-5 pb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
          Queue — {tasks.length} task(s) · {done} done · {failed} failed
        </span>
      </div>
      <div className="ld-panel divide-y divide-[var(--ld-border)]">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-5 shrink-0">
              {t.status === "done" && <CheckCircle2 size={16} className="text-[#86efac]" />}
              {t.status === "error" && <XCircle size={16} className="text-[#fca5a5]" />}
              {(t.status === "running" || t.status === "pending") && (
                <Loader2 size={16} className="text-[#93c5fd] animate-spin" />
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
                <div className="mt-1.5 h-1 bg-[var(--ld-bg)]">
                  <div
                    className="h-full bg-[var(--ld-accent)] transition-all"
                    style={{ width: `${Math.round(t.progress * 100)}%` }}
                  />
                </div>
              )}
              {t.status === "done" && t.outputName && (
                <div className="font-mono text-[10px] text-[#86efac] mt-0.5">
                  → {t.outputName} ({formatBytes(t.outputSize ?? 0)})
                </div>
              )}
              {t.status === "error" && (
                <div className="flex items-center gap-1 font-mono text-[10px] text-[#fca5a5] mt-0.5">
                  <TriangleAlert size={10} />
                  {t.error}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {t.status === "done" && (
                <button
                  type="button"
                  className="ld-btn ld-btn-ghost !px-2.5 !py-1"
                  onClick={() => onDownload(t)}
                  title="Download"
                >
                  <Download size={13} />
                </button>
              )}
              {(t.status === "done" || t.status === "error") && (
                <button
                  type="button"
                  className="ld-btn ld-btn-ghost !px-2.5 !py-1"
                  onClick={() => onRemove(t.id)}
                  title="Remove"
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