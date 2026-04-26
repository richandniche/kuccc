"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanion } from "@/hooks/useCompanion";
import { useTimer } from "@/hooks/useTimer";
import type { CallNote } from "@/lib/db/schema";
import type { OutcomeKey } from "@/lib/constants";
import { PhaseTabs } from "./PhaseTabs";
import { CallTimer } from "./CallTimer";
import { StepView } from "./StepView";
import { NotesSidebar } from "./NotesSidebar";
import { GuideSidebar } from "./GuideSidebar";
import { CallComplete } from "./CallComplete";
import { DevStepSeek } from "./DevStepSeek";

type CompletionInput = {
  outcome: OutcomeKey;
  recordingUrl: string | null;
  durationSeconds: number;
  notes: CallNote[];
};

export function CompanionShell({
  callId,
  prospectName,
  prospectEmail,
  prospectPhone,
  programInterest,
  onComplete,
}: {
  callId: string;
  prospectName: string;
  prospectEmail: string | null;
  prospectPhone: string | null;
  programInterest: string;
  onComplete: (input: CompletionInput) => Promise<void>;
}) {
  const router = useRouter();
  const companion = useCompanion(prospectName);
  const timer = useTimer(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // Auto-start the timer on mount
  useEffect(() => {
    timer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn on browser close / refresh while call is active
  useEffect(() => {
    if (companion.step.isEnd) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [companion.step.isEnd]);

  const leaveCall = () => {
    if (companion.step.isEnd) {
      router.push("/calls");
      return;
    }
    if (
      confirm(
        "Leave call? Unsaved notes will be lost and this call will not be marked complete.",
      )
    ) {
      router.push("/calls");
    }
  };

  if (companion.step.isEnd) {
    return (
      <main className="flex-1 px-6 py-10">
        <CallComplete
          callId={callId}
          prospectName={prospectName}
          prospectEmail={prospectEmail}
          prospectPhone={prospectPhone}
          programInterest={programInterest}
          durationSeconds={timer.seconds}
          notes={companion.notes}
          onComplete={onComplete}
        />
      </main>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="bg-twilight-indigo text-creamsicle-dream shadow-sm">
        <div className="mx-auto max-w-4xl px-5 py-4 sm:px-8">
          {/* Row 1 — back, prospect, actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={leaveCall}
              className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-creamsicle-dream/60 hover:bg-creamsicle-dream/10 hover:text-creamsicle-dream"
              aria-label="Leave call"
            >
              ←
            </button>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-creamsicle-dream/50">
                Clarity Call
              </div>
              <div className="truncate font-heading text-xl font-bold leading-tight text-creamsicle-dream sm:text-2xl">
                {prospectName}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CallTimer
                seconds={timer.seconds}
                running={timer.running}
                onToggle={timer.toggle}
              />
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="hidden rounded-full border border-creamsicle-dream/20 bg-creamsicle-dream/5 px-4 py-2 text-sm text-creamsicle-dream/85 hover:border-creamsicle-dream/40 hover:text-creamsicle-dream sm:inline-flex"
              >
                Guide
              </button>
              <button
                type="button"
                onClick={() => setNotesOpen(true)}
                className="relative inline-flex items-center gap-1.5 rounded-full border border-creamsicle-dream/20 bg-creamsicle-dream/5 px-4 py-2 text-sm text-creamsicle-dream/85 hover:border-creamsicle-dream/40 hover:text-creamsicle-dream"
              >
                Notes
                {companion.notes.length > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sunlit-amber px-1 text-xs font-medium text-twilight-indigo">
                    {companion.notes.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2 (mobile only) — Guide button */}
          <div className="mt-3 flex sm:hidden">
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="flex-1 rounded-full border border-creamsicle-dream/20 bg-creamsicle-dream/5 px-4 py-2 text-sm text-creamsicle-dream/85 hover:border-creamsicle-dream/40"
            >
              Open Sales Guide
            </button>
          </div>
        </div>
        <PhaseTabs current={companion.step.phase} onJump={companion.jumpToPhase} />
        <DevStepSeek stepId={companion.stepId} onSeek={companion.goTo} />
      </header>

      {/* Step content */}
      <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <StepView
            step={companion.step}
            stepId={companion.stepId}
            prospectName={prospectName}
            canGoBack={companion.history.length > 1}
            onBack={companion.back}
            onSelect={companion.goTo}
            notes={companion.notes}
            onAddNote={companion.addNote}
            onRemoveNote={companion.removeNote}
          />
        </div>
      </main>

      <NotesSidebar
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        notes={companion.notes}
      />
      <GuideSidebar
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
}
