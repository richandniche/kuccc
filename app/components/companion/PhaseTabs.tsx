"use client";

import { PHASES } from "@/lib/constants";
import type { Phase } from "@/lib/conversation-tree";
import { cx } from "@/lib/utils";

export function PhaseTabs({
  current,
  onJump,
}: {
  current: Phase;
  onJump: (phase: Phase) => void;
}) {
  return (
    <nav
      aria-label="Call phases"
      className="bg-twilight-indigo/95"
    >
      <div className="mx-auto flex max-w-4xl items-stretch gap-0.5 px-2 sm:px-6">
        {PHASES.map((p) => {
          const active = p.id === current;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onJump(p.id as Phase)}
              className={cx(
                "group relative flex flex-1 flex-col items-center justify-center gap-1 px-1 py-3 text-xs font-medium transition-colors sm:flex-row sm:gap-2 sm:py-3.5 sm:text-sm",
                active
                  ? "text-creamsicle-dream"
                  : "text-creamsicle-dream/45 hover:text-creamsicle-dream/75",
              )}
              aria-current={active ? "step" : undefined}
            >
              <span aria-hidden className="text-base sm:text-sm" style={{ color: p.color }}>
                {p.icon}
              </span>
              <span className="leading-none">{p.label}</span>
              <span
                aria-hidden
                className={cx(
                  "absolute inset-x-1 bottom-0 h-[3px] rounded-t-full transition-opacity sm:inset-x-2",
                  active ? "opacity-100" : "opacity-0",
                )}
                style={{ backgroundColor: p.color }}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
