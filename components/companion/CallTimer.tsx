"use client";

import { formatSeconds } from "@/lib/utils";
import { cx } from "@/lib/utils";

export function CallTimer({
  seconds,
  running,
  onToggle,
}: {
  seconds: number;
  running: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cx(
        "inline-flex items-center gap-2.5 rounded-full border px-4 py-2 transition-colors",
        running
          ? "border-sage-stone/60 bg-sage-stone/15 text-creamsicle-dream"
          : "border-creamsicle-dream/20 bg-creamsicle-dream/5 text-creamsicle-dream/80 hover:border-creamsicle-dream/40",
      )}
      aria-label={running ? "Pause timer" : "Start timer"}
      title={running ? "Pause" : "Start"}
    >
      <span
        aria-hidden
        className={cx(
          "h-2 w-2 rounded-full transition-colors",
          running ? "animate-pulse bg-sage-stone" : "bg-creamsicle-dream/40",
        )}
      />
      <span className="font-mono text-lg tabular-nums leading-none">
        {formatSeconds(seconds)}
      </span>
    </button>
  );
}
