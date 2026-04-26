"use client";

import type { Followup } from "@/lib/conversation-tree";
import { cx } from "@/lib/utils";

export function FollowupButtons({
  followups,
  onSelect,
}: {
  followups: Followup[];
  onSelect: (next: string) => void;
}) {
  if (followups.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {followups.map((f) => (
        <button
          key={`${f.next}-${f.label}`}
          type="button"
          onClick={() => onSelect(f.next)}
          className={cx(
            "w-full rounded-2xl border px-5 py-4 text-left text-[17px] font-medium transition-colors",
            f.accent
              ? "border-twilight-indigo bg-twilight-indigo text-creamsicle-dream hover:bg-midnight-plum"
              : "border-twilight-indigo/15 bg-white/40 text-twilight-indigo hover:bg-white/70",
          )}
        >
          {f.icon ? <span aria-hidden className="mr-2">{f.icon}</span> : null}
          {f.label}
        </button>
      ))}
    </div>
  );
}
