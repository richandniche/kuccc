"use client";

import { useState } from "react";
import type { CallNote } from "@/lib/db/schema";
import { formatTime } from "@/lib/utils";

export function NoteInput({
  stepId,
  notes,
  onAdd,
  onRemove,
}: {
  stepId: string;
  notes: CallNote[];
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
}) {
  const [value, setValue] = useState("");

  const stepNotes = notes
    .map((n, i) => ({ note: n, index: i }))
    .filter(({ note }) => note.step === stepId);

  return (
    <div className="rounded-2xl border border-twilight-indigo/10 bg-white/30 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) {
            onAdd(value);
            setValue("");
          }
        }}
        className="flex items-stretch gap-2"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Quick note · press Enter to save"
          className="flex-1 rounded-xl border border-twilight-indigo/15 bg-white/70 px-4 py-3 text-[15px] text-twilight-indigo placeholder:text-twilight-indigo/40 focus:border-sunlit-amber focus:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="rounded-xl bg-twilight-indigo px-4 py-3 text-sm font-medium text-creamsicle-dream transition-colors hover:bg-midnight-plum disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save
        </button>
      </form>

      {stepNotes.length > 0 && (
        <ul className="mt-3 space-y-2">
          {stepNotes.map(({ note, index }) => (
            <li
              key={index}
              className="flex items-start justify-between gap-3 rounded-lg bg-white/40 px-3 py-2 text-[15px] text-twilight-indigo"
            >
              <div className="flex-1">
                <span className="text-xs uppercase tracking-wide text-twilight-indigo/40 mr-2">
                  {formatTime(note.at)}
                </span>
                {note.text}
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-xs text-twilight-indigo/40 hover:text-scarlet-ember"
                aria-label="Remove note"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
