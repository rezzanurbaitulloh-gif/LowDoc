"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, X } from "lucide-react";

interface Row {
  label: string;
  state: "ok" | "warn" | "off";
  detail: string;
}

async function probe(): Promise<Row[]> {
  const rows: Row[] = [];
  const ok = (label: string, detail = ""): Row => ({ label, state: "ok", detail });
  const warn = (label: string, detail: string): Row => ({ label, state: "warn", detail });
  const off = (label: string, detail: string): Row => ({ label, state: "off", detail });

  rows.push(ok("Browser", navigator.userAgent.includes("Firefox") ? "Firefox" : navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome") ? "Safari" : "Chromium"));

  rows.push(
    typeof WebAssembly === "object"
      ? ok("WebAssembly")
      : off("WebAssembly", "conversion engines unavailable"),
  );

  rows.push(
    typeof Worker !== "undefined" ? ok("Web Workers") : off("Web Workers", "heavy tasks run on main thread"),
  );

  try {
    const idb = indexedDB.open("lowdoc-diag-probe");
    idb.onsuccess = () => idb.result.close();
    rows.push(ok("IndexedDB", "local history available"));
  } catch {
    rows.push(off("IndexedDB", "history disabled"));
  }

  rows.push(
    "serviceWorker" in navigator ? ok("Service Worker", "offline shell") : off("Service Worker", "no offline shell"),
  );

  rows.push(
    "showOpenFilePicker" in window
      ? ok("File System API")
      : warn("File System API", "falls back to download links"),
  );

  const nav = navigator as Navigator & { deviceMemory?: number };
  rows.push(
    nav.deviceMemory
      ? { label: "Memory", state: nav.deviceMemory >= 4 ? "ok" : "warn", detail: `~${nav.deviceMemory} GB` }
      : warn("Memory", "unknown"),
  );

  const wasmOk = typeof WebAssembly === "object";
  rows.push(wasmOk ? ok("PDF Engine", "pdf.js ready") : off("PDF Engine", "blocked"));
  rows.push(wasmOk ? ok("Image Engine", "ImageMagick wasm") : off("Image Engine", "blocked"));
  rows.push(wasmOk ? ok("Text Engine", "Pandoc wasm") : off("Text Engine", "blocked"));

  try {
    const res = await fetch("/api/lowdoc/office/health", { signal: AbortSignal.timeout(6000) });
    const j = await res.json();
    rows.push(j.status === "ok" ? ok("Office Engine", `LibreOffice ${j.version ?? ""}`) : warn("Office Engine", "helper not responding"));
  } catch {
    rows.push(warn("Office Engine", "helper unreachable — office routes unavailable"));
  }

  return rows;
}

export default function Diagnostics({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let alive = true;
    probe().then((r) => {
      if (alive) setRows(r);
    });
    return () => {
      alive = false;
    };
  }, []);

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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        ref={modalRef}
        className="ld-card w-full max-w-md !bg-[var(--ld-panel)]"
        role="dialog"
        aria-modal="true"
        aria-label="LowDoc diagnostics"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ld-card-title">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
            <Activity size={13} aria-hidden="true" /> LowDoc Diagnostics
          </span>
          <button type="button" className="ld-btn ld-btn-ghost !px-2 !py-1" onClick={onClose} aria-label="Close diagnostics">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
        <ul className="divide-y divide-[var(--ld-border)] font-mono text-xs">
          {(rows ?? []).map((r) => (
            <li key={r.label} className="flex items-center gap-3 py-2">
              <span
                className={
                  r.state === "ok" ? "text-[var(--ld-ok)]" : r.state === "warn" ? "text-[var(--ld-yellow)]" : "text-[var(--ld-err)]"
                }
              >
                {r.state === "ok" ? "✓" : r.state === "warn" ? "▲" : "✖"}
              </span>
              <span className="w-32 shrink-0 text-[var(--ld-text)]">{r.label}</span>
              <span className="text-[var(--ld-dim)] truncate">{r.detail || (r.state === "ok" ? "Ready" : "Unavailable")}</span>
            </li>
          ))}
          {!rows && <li className="py-3 text-[var(--ld-dim)]">Probing…</li>}
        </ul>
        <p className="mt-3 font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
          Runs locally — nothing is uploaded
        </p>
      </div>
    </div>
  );
}
