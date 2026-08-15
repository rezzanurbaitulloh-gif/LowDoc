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
        <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-[var(--ld-accent)] text-white font-mono font-bold text-sm">
          LD
        </div>
        <div className="min-w-0">
          <div className="font-sans font-bold text-base tracking-tight">
            LowDoc
          </div>
          <div className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider truncate">
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