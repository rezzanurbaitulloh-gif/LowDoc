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
    <header className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--ld-border)] bg-[var(--ld-panel)]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center bg-[var(--ld-orange)] text-[#0F172A] font-mono font-bold text-sm">
          LD
        </div>
        <div>
          <div className="font-mono font-bold text-sm tracking-widest uppercase">
            LowDoc
          </div>
          <div className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
            Universal Document Converter
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${
            officeOnline ? "text-[#86efac]" : "text-[var(--ld-dim)]"
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