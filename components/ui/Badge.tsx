import { OUTCOME_STYLES, type OutcomeKey } from "@/lib/constants";

export function OutcomeBadge({
  outcome,
  scheduled = false,
}: {
  outcome: OutcomeKey | null | undefined;
  /** True when the call has no outcome yet but was imported from GHL. */
  scheduled?: boolean;
}) {
  if (!outcome) {
    if (scheduled) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-misty-mauve/20 px-3 py-1 text-xs font-medium uppercase tracking-wide text-twilight-indigo">
          <span aria-hidden>◌</span>
          Scheduled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-twilight-indigo/5 px-3 py-1 text-xs uppercase tracking-wide text-twilight-indigo/60">
        ◐ In Progress
      </span>
    );
  }
  const style = OUTCOME_STYLES[outcome];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      <span aria-hidden>{style.icon}</span>
      {style.label}
    </span>
  );
}
