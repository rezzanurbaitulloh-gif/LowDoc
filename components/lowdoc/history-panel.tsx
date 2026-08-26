"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, Trash2 } from "lucide-react";
import { loadHistory, clearHistory, type HistoryRecord } from "@/lib/lowdoc/storage";
import { formatBytes } from "@/lib/lowdoc/pipeline";

const DISABLE_KEY = "ld-history-disabled";

export default function HistoryPanel() {
  const [rows, setRows] = useState<HistoryRecord[] | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setDisabled(localStorage.getItem(DISABLE_KEY) === "1");
    } catch {
      /* noop */
    }
    if (!disabled) {
      loadHistory().then(setRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(() => {
    const next = !disabled;
    setDisabled(next);
    try {
      localStorage.setItem(DISABLE_KEY, next ? "1" : "0");
    } catch {
      /* noop */
    }
    if (next) {
      void clearHistory();
      setRows([]);
    } else {
      loadHistory().then(setRows);
    }
  }, [disabled]);

  if (!open) {
    return (
      <div className="px-5 pb-3 max-w-[1440px] mx-auto">
        <button type="button" className="ld-chip" onClick={() => setOpen(true)}>
          <Clock size={11} /> local history
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pb-3 max-w-[1440px] mx-auto">
      <section className="ld-card">
        <div className="ld-card-title">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
            Local history — metadata only, stored in this browser
          </span>
          <span className="flex items-center gap-2">
            <button
              type="button"
              className={`ld-chip ${disabled ? "ld-chip-warn" : "ld-chip-success"}`}
              onClick={toggle}
            >
              {disabled ? "disabled" : "enabled"}
            </button>
            <button
              type="button"
              className="ld-chip ld-chip-danger"
              onClick={() => {
                void clearHistory();
                setRows([]);
              }}
              aria-label="Clear history"
            >
              <Trash2 size={11} /> clear
            </button>
            <button type="button" className="ld-chip" onClick={() => setOpen(false)}>
              hide
            </button>
          </span>
        </div>
        {disabled ? (
          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--ld-dim)]">
            History is off — new conversions are not recorded.
          </p>
        ) : !rows || rows.length === 0 ? (
          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--ld-dim)]">
            No conversions recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--ld-border)] font-mono text-[11px]">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2">
                <span className="text-[var(--ld-text)] truncate max-w-[240px]">{r.name}</span>
                <span className="text-[var(--ld-dim)]">{r.engine}</span>
                <span className="text-[var(--ld-dim)]">→ {r.outputName}</span>
                <span className="text-[var(--ld-dim)]">{formatBytes(r.outputSize)}</span>
                <span className="ml-auto text-[var(--ld-dim)]">
                  {new Date(r.ts).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
