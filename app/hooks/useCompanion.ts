"use client";

import { useCallback, useMemo, useState } from "react";
import { TREE, type Phase, type TreeStep } from "@/lib/conversation-tree";
import { PHASE_FIRST_STEP } from "@/lib/constants";
import type { CallNote } from "@/lib/db/schema";

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function fillName(text: string | null, prospectName: string): string | null {
  if (text == null) return null;
  return text.replaceAll("[Name]", firstName(prospectName));
}

export interface CompanionState {
  stepId: string;
  step: TreeStep;
  history: string[];
  notes: CallNote[];
  prospectName: string;
  goTo(stepId: string): void;
  back(): void;
  jumpToPhase(phase: Phase): void;
  addNote(text: string): void;
  removeNote(index: number): void;
  reset(): void;
}

const STARTING_STEP = "welcome";

export function useCompanion(prospectName: string): CompanionState {
  const [stepId, setStepId] = useState(STARTING_STEP);
  const [history, setHistory] = useState<string[]>([STARTING_STEP]);
  const [notes, setNotes] = useState<CallNote[]>([]);

  const step = useMemo(() => TREE[stepId] ?? TREE[STARTING_STEP], [stepId]);

  const goTo = useCallback((next: string) => {
    if (!TREE[next]) return;
    setStepId(next);
    setHistory((h) => (h[h.length - 1] === next ? h : [...h, next]));
  }, []);

  const back = useCallback(() => {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const next = h.slice(0, -1);
      const last = next[next.length - 1];
      if (last) setStepId(last);
      return next;
    });
  }, []);

  const jumpToPhase = useCallback((phase: Phase) => {
    const target = PHASE_FIRST_STEP[phase];
    if (!target || !TREE[target]) return;
    setStepId(target);
    setHistory((h) => (h[h.length - 1] === target ? h : [...h, target]));
  }, []);

  const addNote = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setNotes((n) => [
        ...n,
        {
          step: stepId,
          label: step.prompt,
          text: trimmed,
          at: new Date().toISOString(),
        },
      ]);
    },
    [stepId, step.prompt],
  );

  const removeNote = useCallback((index: number) => {
    setNotes((n) => n.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setStepId(STARTING_STEP);
    setHistory([STARTING_STEP]);
    setNotes([]);
  }, []);

  return {
    stepId,
    step,
    history,
    notes,
    prospectName,
    goTo,
    back,
    jumpToPhase,
    addNote,
    removeNote,
    reset,
  };
}
