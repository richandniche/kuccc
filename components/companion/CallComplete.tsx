"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OUTCOME_STYLES, type OutcomeKey, PROGRAM_LABELS } from "@/lib/constants";
import type { CallNote } from "@/lib/db/schema";
import { formatSeconds } from "@/lib/utils";
import { cx } from "@/lib/utils";

const OUTCOMES: OutcomeKey[] = ["enrolled", "needs_time", "not_a_fit", "no_show"];

export function CallComplete({
  callId,
  prospectName,
  prospectEmail,
  prospectPhone,
  programInterest,
  durationSeconds,
  notes,
  onComplete,
}: {
  callId: string;
  prospectName: string;
  prospectEmail: string | null;
  prospectPhone: string | null;
  programInterest: string;
  durationSeconds: number;
  notes: CallNote[];
  onComplete: (input: {
    outcome: OutcomeKey;
    recordingUrl: string | null;
    durationSeconds: number;
    notes: CallNote[];
  }) => Promise<void>;
}) {
  const router = useRouter();
  const [recordingUrl, setRecordingUrl] = useState("");
  const [pending, setPending] = useState<OutcomeKey | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (outcome: OutcomeKey) => {
    setPending(outcome);
    try {
      await onComplete({
        outcome,
        recordingUrl: recordingUrl.trim() || null,
        durationSeconds,
        notes,
      });
      router.push(`/calls/${callId}`);
    } catch (err) {
      setPending(null);
      alert(err instanceof Error ? err.message : "Failed to save call");
    }
  };

  const copyAll = async () => {
    const text = notes.map((n) => `[${n.label}] ${n.text}`).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-stone/20 text-3xl text-sage-stone">
          ✦
        </div>
        <h2 className="mt-3 font-heading text-3xl font-bold text-twilight-indigo">
          Call Complete
        </h2>
      </div>

      <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-5">
        <h3 className="font-heading text-xl font-bold text-twilight-indigo">
          {prospectName}
        </h3>
        {prospectEmail && (
          <p className="text-twilight-indigo/70">{prospectEmail}</p>
        )}
        {prospectPhone && (
          <p className="text-twilight-indigo/70">{prospectPhone}</p>
        )}
        <p className="mt-2 text-sm text-twilight-indigo/60">
          {PROGRAM_LABELS[programInterest] ?? programInterest}
        </p>
      </section>

      <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-5 text-center">
        <div className="text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
          Duration
        </div>
        <div className="mt-1 font-mono text-4xl tabular-nums text-twilight-indigo">
          {formatSeconds(durationSeconds)}
        </div>
      </section>

      <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-5">
        <label className="block text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
          Recording URL (optional)
        </label>
        <input
          type="url"
          value={recordingUrl}
          onChange={(e) => setRecordingUrl(e.target.value)}
          placeholder="https://…"
          className="mt-2 w-full rounded-xl border border-twilight-indigo/15 bg-white/70 px-4 py-3 text-twilight-indigo focus:border-sunlit-amber focus:outline-none"
        />
      </section>

      <section className="space-y-3">
        <div className="text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
          Outcome
        </div>
        <div className="grid grid-cols-2 gap-2">
          {OUTCOMES.map((o) => {
            const style = OUTCOME_STYLES[o];
            const loading = pending === o;
            const disabled = pending !== null;
            return (
              <button
                key={o}
                type="button"
                onClick={() => submit(o)}
                disabled={disabled}
                className={cx(
                  "rounded-2xl border-2 px-4 py-4 text-left transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  loading ? "ring-2 ring-twilight-indigo/30" : "",
                )}
                style={{
                  backgroundColor: style.bg,
                  color: style.color,
                  borderColor: style.color + "33",
                }}
              >
                <div className="text-2xl" aria-hidden>
                  {style.icon}
                </div>
                <div className="mt-1 font-medium">{style.label}</div>
                {loading && <div className="text-xs opacity-70">Saving…</div>}
              </button>
            );
          })}
        </div>
      </section>

      {notes.length > 0 && (
        <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
              Notes ({notes.length})
            </h4>
            <button
              type="button"
              onClick={copyAll}
              className="text-xs uppercase tracking-wide text-twilight-indigo/60 hover:text-twilight-indigo"
            >
              {copied ? "Copied ✓" : "Copy All"}
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {notes.map((n, i) => (
              <li
                key={i}
                className="border-l-2 border-sunlit-amber/50 pl-3 text-[15px] text-twilight-indigo"
              >
                <span className="text-xs uppercase tracking-wide text-twilight-indigo/50">
                  {n.label}
                </span>
                <div>{n.text}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
