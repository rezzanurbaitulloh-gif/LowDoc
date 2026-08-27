"use client";

import { useState } from "react";
import { Send } from "lucide-react";

const CATEGORIES = ["Suggestion", "Bug report", "Format request", "Feature request", "UX feedback"] as const;
type Category = (typeof CATEGORIES)[number];

interface Entry {
  id: number;
  category: Category;
  message: string;
  contact: string;
  ts: number;
}

export default function SuggestionBox() {
  const [category, setCategory] = useState<Category>("Suggestion");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (message.trim().length < 5) return;
    setEntries((prev) => [
      { id: Date.now(), category, message: message.trim(), contact: contact.trim(), ts: Date.now() },
      ...prev,
    ]);
    setMessage("");
    setContact("");
    setSent(true);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`ld-chip ${category === c ? "ld-chip-selected" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <label htmlFor="suggestion-message" className="sr-only">Your message</label>
      <textarea
        id="suggestion-message"
        className="ld-input mt-3 min-h-24 resize-y"
        placeholder="Your message (required) — no login, no email needed"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          setSent(false);
        }}
        maxLength={2000}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label htmlFor="suggestion-contact" className="sr-only">Contact (optional)</label>
        <input
          id="suggestion-contact"
          className="ld-input !w-56"
          placeholder="Contact (optional)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={120}
        />
        <button type="button" className="ld-btn ld-btn-orange" onClick={submit} disabled={message.trim().length < 5}>
          <Send size={13} /> Send
        </button>
        <span className="font-mono text-[10px] text-[var(--ld-dim)] uppercase tracking-wider">
          stays in this session — nothing is stored on a server
        </span>
      </div>

      {sent && (
        <p className="mt-2 font-mono text-xs text-[var(--ld-ok)]">✓ Suggestion received for this session.</p>
      )}

      {entries.length > 0 && (
        <ul className="mt-4 divide-y divide-[var(--ld-border)] border border-[var(--ld-border)] rounded overflow-hidden">
          {entries.map((e) => (
            <li key={e.id} className="px-4 py-3 bg-[var(--ld-panel)]">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ld-dim)]">
                <span className="ld-chip !cursor-default !py-0.5 ld-chip-warn">{e.category}</span>
                {new Date(e.ts).toLocaleTimeString()}
              </div>
              <p className="mt-1.5 text-sm text-[var(--ld-text)] whitespace-pre-wrap">{e.message}</p>
              {e.contact && <p className="mt-1 font-mono text-[10px] text-[var(--ld-dim)]">contact: {e.contact}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
