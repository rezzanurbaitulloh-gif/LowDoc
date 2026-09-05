"use client";

import { useState } from "react";
import { Archive, Download, Eye, FileUp, PackageOpen, ShieldAlert, X } from "lucide-react";
import { createZip, extractArchive, inspectArchive, previewText, type ArchiveEntry } from "@/lib/lowdoc/archive";

type ArchiveMode = "inspect" | "extract" | "create";

interface Extracted {
  name: string;
  url: string;
  size: number;
}

export default function ArchiveToolkit() {
  const [mode, setMode] = useState<ArchiveMode>("inspect");
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<ArchiveEntry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [extracted, setExtracted] = useState<Extracted[] | null>(null);
  const [preview, setPreview] = useState<{ name: string; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [createFiles, setCreateFiles] = useState<File[]>([]);

  const reset = () => {
    setEntries(null);
    setExtracted(null);
    setPreview(null);
    setError(null);
  };

  const pickZip = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    reset();
    if (mode !== "create") void doInspect(f);
  };

  const doInspect = async (f: File) => {
    setRunning(true);
    setError(null);
    try {
      const r = await inspectArchive(f);
      setEntries(r.entries);
      setTotal(r.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setEntries(null);
    } finally {
      setRunning(false);
    }
  };

  const doExtract = async () => {
    if (!file) return;
    setRunning(true);
    setError(null);
    try {
      const files = await extractArchive(file);
      setExtracted(
        files.map((f) => ({
          name: f.name,
          url: URL.createObjectURL(new Blob([f.data as unknown as BlobPart])),
          size: f.data.byteLength,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setExtracted(null);
    } finally {
      setRunning(false);
    }
  };

  const doPreview = async (name: string, url: string) => {
    const buf = new Uint8Array(await (await fetch(url)).arrayBuffer());
    setPreview({ name, text: previewText(buf) });
  };

  const doCreate = async () => {
    if (createFiles.length === 0) return;
    setRunning(true);
    setError(null);
    try {
      const data = await createZip(createFiles);
      const url = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: "application/zip" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "lowdoc-archive.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="ld-card">
      <div className="ld-card-title">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
          Archive tools — zip inspect · extract · create
        </span>
      </div>
      <div className="ld-seg" role="tablist" aria-label="Archive tool">
        {(
          [
            ["inspect", "Inspect"],
            ["extract", "Extract"],
            ["create", "Create ZIP"],
          ] as [ArchiveMode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={`ld-seg-btn ${mode === m ? "ld-seg-btn-active" : ""}`}
            onClick={() => {
              setMode(m);
              reset();
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "create" ? (
        <div className="mt-3">
          <label className="ld-btn ld-btn-ghost cursor-pointer">
            <FileUp size={14} aria-hidden="true" /> Choose files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                setCreateFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
                e.target.value = "";
              }}
            />
          </label>
          {createFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {createFiles.map((f) => (
                <span key={f.name} className="ld-chip !cursor-default">
                  {f.name}
                  <button
                    type="button"
                    aria-label={`Remove ${f.name}`}
                    className="text-[var(--ld-dim)] hover:text-[var(--ld-red)]"
                    onClick={() => setCreateFiles((prev) => prev.filter((x) => x.name !== f.name))}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="mt-3">
            <button type="button" className="ld-btn ld-btn-primary" disabled={running || createFiles.length === 0} onClick={doCreate}>
              <Archive size={14} aria-hidden="true" /> {running ? "Working…" : "Create ZIP"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <label className="ld-btn ld-btn-ghost cursor-pointer">
            <FileUp size={14} aria-hidden="true" /> Choose .zip
            <input
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => {
                pickZip(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {file && <span className="ml-2 font-mono text-xs">{file.name}</span>}
          {mode === "extract" && file && (
            <div className="mt-3">
              <button type="button" className="ld-btn ld-btn-primary" disabled={running} onClick={doExtract}>
                <PackageOpen size={14} aria-hidden="true" /> {running ? "Working…" : "Extract all"}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 flex items-start gap-2 font-mono text-xs text-[var(--ld-err)]" role="alert">
          <ShieldAlert size={14} aria-hidden="true" className="shrink-0 mt-0.5" /> {error}
        </p>
      )}

      {entries && (
        <ul className="mt-3 max-h-64 overflow-auto divide-y divide-[var(--ld-border)] border border-[var(--ld-border)] rounded font-mono text-[11px]">
          {entries.map((e) => (
            <li key={e.name} className="flex items-center gap-2 px-3 py-1.5">
              <span className="flex-1 truncate text-[var(--ld-text)]">{e.name}</span>
              <span className="text-[var(--ld-dim)]">{(e.size / 1024).toFixed(1)} KB</span>
            </li>
          ))}
        </ul>
      )}
      {entries && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ld-dim)]">
          {entries.length} entries · {(total / 1024).toFixed(1)} KB uncompressed
        </p>
      )}

      {extracted && (
        <ul className="mt-3 max-h-64 overflow-auto divide-y divide-[var(--ld-border)] border border-[var(--ld-border)] rounded font-mono text-[11px]">
          {extracted.map((f) => (
            <li key={f.name} className="flex items-center gap-2 px-3 py-1.5">
              <span className="flex-1 truncate text-[var(--ld-text)]">{f.name}</span>
              <button
                type="button"
                className="ld-chip"
                onClick={() => doPreview(f.name, f.url)}
                aria-label={`Preview ${f.name}`}
              >
                <Eye size={11} aria-hidden="true" /> preview
              </button>
              <a className="ld-chip" href={f.url} download={f.name.split("/").pop()}>
                <Download size={11} aria-hidden="true" /> save
              </a>
            </li>
          ))}
        </ul>
      )}

      {preview && (
        <div className="mt-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--ld-dim)]">Preview — {preview.name}</div>
          <pre className="ld-console p-3 mt-1 whitespace-pre-wrap break-words text-xs max-h-48 overflow-y-auto">
            {preview.text || "(binary — no text preview)"}
          </pre>
        </div>
      )}
    </section>
  );
}
