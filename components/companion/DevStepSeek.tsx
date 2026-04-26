"use client";

import { TREE } from "@/lib/conversation-tree";
import { PHASES } from "@/lib/constants";

const PHASE_LABEL = Object.fromEntries(
  PHASES.map((p) => [p.id, p.label]),
) as Record<string, string>;

const ALL_STEPS = Object.entries(TREE).map(([id, step]) => ({
  id,
  phase: step.phase,
  label: step.prompt,
}));

export function DevStepSeek({
  stepId,
  onSeek,
}: {
  stepId: string;
  onSeek: (next: string) => void;
}) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div
      className="border-y border-creamsicle-dream/10 bg-twilight-indigo/95 px-5 py-2 text-creamsicle-dream/70 sm:px-8"
      title="Dev only — jump to any step"
    >
      <label className="flex items-center gap-2 text-xs">
        <span aria-hidden>⚙</span>
        <span className="uppercase tracking-wide text-creamsicle-dream/40">
          dev seek
        </span>
        <select
          value={stepId}
          onChange={(e) => onSeek(e.target.value)}
          className="ml-1 flex-1 rounded-md border border-creamsicle-dream/20 bg-twilight-indigo/40 px-2 py-1 text-xs text-creamsicle-dream focus:border-sunlit-amber focus:outline-none"
        >
          {ALL_STEPS.map((s) => (
            <option key={s.id} value={s.id}>
              [{PHASE_LABEL[s.phase] ?? s.phase}] {s.id} — {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
