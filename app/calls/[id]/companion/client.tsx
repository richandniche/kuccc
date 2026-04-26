"use client";

import { CompanionShell } from "@/components/companion/CompanionShell";
import type { CallNote } from "@/lib/db/schema";
import type { OutcomeKey } from "@/lib/constants";
import { completeCall } from "./actions";

export function CompanionClient({
  callId,
  prospectName,
  prospectEmail,
  prospectPhone,
  programInterest,
}: {
  callId: string;
  prospectName: string;
  prospectEmail: string | null;
  prospectPhone: string | null;
  programInterest: string;
}) {
  const onComplete = async (input: {
    outcome: OutcomeKey;
    recordingUrl: string | null;
    durationSeconds: number;
    notes: CallNote[];
  }) => {
    const result = await completeCall(callId, input);
    if (!result.ok) throw new Error(result.error);
  };

  return (
    <CompanionShell
      callId={callId}
      prospectName={prospectName}
      prospectEmail={prospectEmail}
      prospectPhone={prospectPhone}
      programInterest={programInterest}
      onComplete={onComplete}
    />
  );
}
