"use client";

import { useState } from "react";
import type { CallNote } from "@/lib/db/schema";
import { formatTime } from "@/lib/utils";
import { cx } from "@/lib/utils";

export function NotesSidebar({
  open,
  onClose,
  notes,
}: {
  open: boolean;
  onClose: () => void;
  notes: CallNote[];
}) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const copyAll = async () => {
    const text = notes.map((n) => `[${n.label}] ${n.text}`).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <aside
      className={cx(
        "absolute right-0 top-0 z-30 h-full w-full max-w-sm overflow-y-auto",
        "border-l border-twilight-indigo/10 bg-creamsicle-dream shadow-xl",
      )}
    >
      <div className="flex items-center justify-between border-b border-twilight-indigo/10 px-5 py-4">
        <h2 className="font-heading text-lg font-bold text-twilight-indigo">
          Notes ({notes.length})
        </h2>
        <div className="flex items-center gap-2">
          {notes.length > 0 && (
            <button
              type="button"
              onClick={copyAll}
              className="rounded-full bg-twilight-indigo px-3 py-1.5 text-xs font-medium text-creamsicle-dream hover:bg-midnight-plum"
            >
              {copied ? "Copied ✓" : "Copy All"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-twilight-indigo/60 hover:text-twilight-indigo"
            aria-label="Close notes"
          >
            ✕
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="px-5 py-6 text-twilight-indigo/60">
          Notes you save during the call appear here.
        </p>
      ) : (
        <ul className="divide-y divide-twilight-indigo/10">
          {notes.map((n, i) => (
            <li key={i} className="px-5 py-4">
              <div className="text-xs uppercase tracking-wide text-twilight-indigo/50">
                {n.label} · {formatTime(n.at)}
              </div>
              <p className="mt-1 text-twilight-indigo">{n.text}</p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
