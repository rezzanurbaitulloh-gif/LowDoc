"use client";

import { useEffect, useRef } from "react";
import { consoleBus, type ConsoleMessage } from "@/lib/lowdoc/pipeline";

export default function ConsoleLog({ lines }: { lines: ConsoleMessage[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  return (
    <section className="px-5 pb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ld-dim)]">
          Console
        </span>
        <button
          type="button"
          className="ld-chip"
          onClick={() => consoleBus.clear()}
        >
          Clear
        </button>
      </div>
      <div ref={ref} className="ld-console max-h-72 overflow-y-auto">
        {lines.length === 0 && (
          <div className="px-3 py-2 font-mono text-[10px] text-[var(--ld-dim)]">
            // no activity — drop files and run a conversion
          </div>
        )}
        {lines.map((line) => (
          <div
            key={line.id}
            className={`ld-console-line ld-console-${line.type}`}
            data-type={line.type}
          >
            <span className="ld-console-time">
              {new Date(line.ts).toLocaleTimeString("en-GB", { hour12: false })}
            </span>
            <span className="ld-console-message">{line.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}