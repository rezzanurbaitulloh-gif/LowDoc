"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { formatMm, paperById, searchPapers, type PaperSize } from "@/lib/lowdoc/paper";

export interface SelectedPaper {
  id: string;
  w: number;
  h: number;
}

export default function PaperSelector({
  value,
  onChange,
}: {
  value: SelectedPaper | null;
  onChange: (p: SelectedPaper | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState<{ w: string; h: string }>({ w: "", h: "" });

  const results = useMemo(() => searchPapers(query), [query]);

  const pick = (p: PaperSize) => {
    onChange({ id: p.id, w: p.w, h: p.h });
    setOpen(false);
    setQuery("");
  };

  const pickCustom = () => {
    const w = parseFloat(custom.w);
    const h = parseFloat(custom.h);
    if (!w || !h || w <= 0 || h <= 0) return;
    onChange({ id: "custom", w, h });
    setOpen(false);
  };

  const current = value ? paperById(value.id) : null;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="ld-chip"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {value
            ? `${current ? current.name : "Custom"} · ${formatMm(value.w, value.h)}`
            : "Source default"}
          <span className="text-[var(--ld-dim)]">▾</span>
        </button>
        {value && (
          <button
            type="button"
            className="ld-chip ld-chip-danger"
            onClick={() => onChange(null)}
            aria-label="Reset paper size"
          >
            <X size={11} /> reset
          </button>
        )}
        <span className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
          applied to real output, not just preview
        </span>
      </div>

      {open && (
        <div className="ld-panel absolute z-30 mt-2 w-full max-w-sm p-3 shadow-[var(--ld-press)]">
          <div className="flex items-center gap-2 border border-[var(--ld-border)] rounded px-2 py-1.5">
            <Search size={13} className="text-[var(--ld-dim)] shrink-0" aria-hidden="true" />
            <label htmlFor="paper-search" className="sr-only">Search paper sizes</label>
            <input
              id="paper-search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search paper… e.g. F4, Legal, 210x330, 8.27x11.69"
              className="w-full bg-transparent font-mono text-xs outline-none text-[var(--ld-text)] placeholder:text-[var(--ld-dim)]"
            />
          </div>
          <ul className="mt-2 max-h-56 overflow-auto divide-y divide-[var(--ld-border)]">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-3 px-2 py-1.5 text-left hover:bg-[var(--ld-panel-2)]"
                  onClick={() => pick(p)}
                >
                  <span className="text-sm font-medium">
                    {p.name}
                    <span className="ml-2 font-mono text-[10px] text-[var(--ld-dim)] uppercase">{p.series}</span>
                  </span>
                  <span className="font-mono text-[10px] text-[var(--ld-dim)]">{formatMm(p.w, p.h)}</span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-2 py-2 font-mono text-[10px] text-[var(--ld-dim)]">No match — use custom below</li>
            )}
          </ul>
          <div className="mt-2 flex items-center gap-2">
            <label htmlFor="custom-width" className="sr-only">Custom width in mm</label>
            <input
              id="custom-width"
              className="ld-input !w-20"
              placeholder="W mm"
              value={custom.w}
              onChange={(e) => setCustom((c) => ({ ...c, w: e.target.value }))}
              inputMode="decimal"
            />
            <span className="text-[var(--ld-dim)]" aria-hidden="true">×</span>
            <label htmlFor="custom-height" className="sr-only">Custom height in mm</label>
            <input
              id="custom-height"
              className="ld-input !w-20"
              placeholder="H mm"
              value={custom.h}
              onChange={(e) => setCustom((c) => ({ ...c, h: e.target.value }))}
              inputMode="decimal"
            />
            <button type="button" className="ld-btn !py-1 !px-3 text-xs" onClick={pickCustom}>
              Custom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
