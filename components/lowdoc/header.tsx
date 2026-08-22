"use client";

import { FileDown, WifiOff } from "lucide-react";
import InstallButton from "./install-button";

export default function Header({
  officeOnline,
  officeVersion,
}: {
  officeOnline: boolean;
  officeVersion?: string;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-[var(--ld-border)] bg-[var(--ld-panel)]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 shrink-0 flex items-center justify-center border-2 border-[var(--ld-text)] bg-[var(--ld-orange)] text-[#fdfaf3] font-mono font-bold text-sm shadow-[2px_2px_0_var(--ld-text)] -rotate-2">
          LD
        </div>
        <div className="min-w-0">
          <div style={{ fontFamily: "var(--ld-display)" }} className="font-bold text-lg tracking-tight leading-none">
            LowDoc<span style={{ color: "var(--ld-orange)" }}>.</span>
          </div>
          <div className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-[0.18em] truncate mt-0.5">
            Universal Document Converter
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${
            officeOnline ? "text-[var(--ld-ok)]" : "text-[var(--ld-dim)]"
          }`}
          title={officeOnline ? `LibreOffice ${officeVersion ?? ""}` : "LibreOffice offline"}
        >
          {officeOnline ? (
            <>
              <FileDown size={12} /> LO {officeVersion ?? ""}
            </>
          ) : (
            <>
              <WifiOff size={12} /> LO offline
            </>
          )}
        </span>
        <InstallButton />
      </div>
    </header>
  );
}