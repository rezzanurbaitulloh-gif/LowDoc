"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, X } from "lucide-react";

export default function HeroDropzone({
  onFiles,
  onRemoveFile,
  files,
}: {
  onFiles: (files: File[]) => void;
  onRemoveFile: (name: string) => void;
  files: File[];
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
    <section className="px-5 py-6">
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
        <FileUp size={28} strokeWidth={1.5} className="text-[var(--ld-orange)]" />
        <div className="font-mono text-sm text-[var(--ld-muted)]">
          Drop files here or <span className="text-[var(--ld-text)] underline decoration-dashed underline-offset-4">browse</span>
        </div>
        <div className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
          Converted in your browser — files never leave your device
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            if (picked.length) onFiles(picked);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((f) => (
            <span key={f.name} className="ld-chip">
              {f.name}
              <span className="text-[var(--ld-dim)]">({(f.size / 1024).toFixed(1)} KB)</span>
              <button
                type="button"
                className="text-[var(--ld-dim)] hover:text-[var(--ld-red)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(f.name);
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}