"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, X } from "lucide-react";
import { describeAnalysis } from "@/lib/lowdoc/analyzer";

export default function HeroDropzone({
  onFiles,
  onRemoveFile,
  files,
  analyses = {},
  className = "",
}: {
  onFiles: (files: File[]) => void;
  onRemoveFile: (name: string) => void;
  files: File[];
  analyses?: Record<string, import("@/lib/lowdoc/analyzer").FileAnalysis | null>;
  className?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length) onFiles(dropped);
    },
    [onFiles],
  );

  return (
    <section className={`ld-card ${className}`}>
      <div
        className={`ld-dropzone ${dragging ? "ld-dropzone-drag" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="ld-dropzone-icon">
          <FileUp size={28} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="text-sm text-[var(--ld-muted)]">
          Drop files here or <span className="text-[var(--ld-orange)] font-semibold underline decoration-solid underline-offset-4">browse</span>
        </div>
        <div className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
          Local-first conversion · office formats use your self-hosted helper
        </div>
        <label htmlFor="file-upload" className="sr-only">Upload files</label>
        <input
          id="file-upload"
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          aria-label="Upload files"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            if (picked.length) onFiles(picked);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((f) => {
            const info = describeAnalysis(analyses[f.name] ?? null);
            return (
              <span key={f.name} className="ld-chip !cursor-default flex-col !items-start !gap-0.5">
                <span className="flex items-center gap-1.5">
                  {f.name}
                  <span className="text-[var(--ld-dim)]">({(f.size / 1024).toFixed(1)} KB)</span>
                  <button
                    type="button"
                    className="text-[var(--ld-dim)] hover:text-[var(--ld-red)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(f.name);
                    }}
                    aria-label={`Remove ${f.name}`}
                  >
                    <X size={12} />
                  </button>
                </span>
                {info && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ld-orange)]">
                    § {info}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}