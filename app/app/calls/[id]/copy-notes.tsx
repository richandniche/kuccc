"use client";

import { useState } from "react";
import type { CallNote } from "@/lib/db/schema";

export function CopyAllNotes({ notes }: { notes: CallNote[] }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        const text = notes
          .map((n) => `[${n.label}] ${n.text}`)
          .join("\n\n");
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs uppercase tracking-wide text-twilight-indigo/60 hover:text-twilight-indigo"
    >
      {copied ? "Copied ✓" : "Copy All"}
    </button>
  );
}
