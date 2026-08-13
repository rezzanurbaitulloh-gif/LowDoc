"use client";

import type { LogLine } from "@/lib/formats";

export const ConsoleLog = ({ logs = [] }: { logs?: LogLine[] }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 font-mono text-sm">
      {logs.length === 0 ? (
        <p className="text-gray-400">No logs yet...</p>
      ) : (
        logs.map((log) => (
          <div key={log.seq} className={`log-line log-${log.level} mb-1`}>
            <span className="text-gray-400">[{log.timestamp.toLocaleTimeString()}]</span>
            <span className={`ml-2 log-level-${log.level}`}>[{log.level.toUpperCase()}]</span>
            <span className="ml-2">{log.message}</span>
          </div>
        ))
      )}
    </div>
  );
};