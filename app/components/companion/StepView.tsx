"use client";

import { PHASES } from "@/lib/constants";
import type { TreeStep } from "@/lib/conversation-tree";
import { fillName } from "@/hooks/useCompanion";
import type { CallNote } from "@/lib/db/schema";
import { SayBox } from "./SayBox";
import { TipBox } from "./TipBox";
import { FollowupButtons } from "./FollowupButtons";
import { PricingRef } from "./PricingRef";
import { NoteInput } from "./NoteInput";

export function StepView({
  step,
  stepId,
  prospectName,
  canGoBack,
  onBack,
  onSelect,
  notes,
  onAddNote,
  onRemoveNote,
}: {
  step: TreeStep;
  stepId: string;
  prospectName: string;
  canGoBack: boolean;
  onBack: () => void;
  onSelect: (next: string) => void;
  notes: CallNote[];
  onAddNote: (text: string) => void;
  onRemoveNote: (index: number) => void;
}) {
  const phaseInfo = PHASES.find((p) => p.id === step.phase);
  const say = fillName(step.say, prospectName);
  const prompt = fillName(step.prompt, prospectName) ?? step.prompt;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {phaseInfo && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
            style={{ backgroundColor: phaseInfo.color + "22", color: phaseInfo.color }}
          >
            <span aria-hidden>{phaseInfo.icon}</span>
            {phaseInfo.label}
          </span>
        )}
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full px-2 py-1 text-xs text-twilight-indigo/60 hover:bg-twilight-indigo/5 hover:text-twilight-indigo"
          >
            ← Back
          </button>
        )}
      </div>

      <h2 className="font-heading text-[28px] font-bold leading-[1.15] text-twilight-indigo sm:text-[30px]">
        {prompt}
      </h2>

      <div className="space-y-4">
        {say && <SayBox text={say} />}
        <TipBox text={step.tip} />
        {step.pricingRef && <PricingRef />}
      </div>

      <div className="pt-1">
        <FollowupButtons followups={step.followups} onSelect={onSelect} />
      </div>

      <NoteInput
        stepId={stepId}
        notes={notes}
        onAdd={onAddNote}
        onRemove={onRemoveNote}
      />
    </div>
  );
}
