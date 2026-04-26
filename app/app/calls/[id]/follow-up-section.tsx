"use client";

import { useState, useTransition } from "react";
import { cx } from "@/lib/utils";

export function FollowUpSection({
  followUpDate,
  followUpNotes,
  followUpCount,
  updateAction,
  markSentAction,
}: {
  followUpDate: string | null;
  followUpNotes: string | null;
  followUpCount: number;
  updateAction: (formData: FormData) => void | Promise<void>;
  markSentAction: () => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(!followUpDate && !followUpNotes);
  const [pending, startTransition] = useTransition();
  const [pendingMark, startMark] = useTransition();
  const overLimit = followUpCount >= 3;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
          Follow-up
        </h2>
        <div className="flex items-center gap-3">
          <span
            className={cx(
              "rounded-full px-3 py-1 text-xs font-medium",
              overLimit
                ? "bg-scarlet-ember/15 text-scarlet-ember"
                : "bg-twilight-indigo/5 text-twilight-indigo/70",
            )}
            title={
              overLimit
                ? "3 follow-ups maximum — trust their timing"
                : `${3 - followUpCount} touchpoints left`
            }
          >
            {followUpCount}/3 sent
          </span>
        </div>
      </div>

      {!editing ? (
        <div className="space-y-2">
          {followUpDate ? (
            <p className="text-twilight-indigo">
              <span className="text-xs uppercase tracking-wide text-twilight-indigo/50 mr-2">
                Next
              </span>
              {followUpDate}
            </p>
          ) : (
            <p className="text-twilight-indigo/60">No follow-up scheduled.</p>
          )}
          {followUpNotes && (
            <p className="whitespace-pre-line border-l-2 border-sunlit-amber/60 pl-3 text-[15px] text-twilight-indigo">
              {followUpNotes}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full border border-twilight-indigo/15 bg-white/60 px-3 py-1.5 text-sm text-twilight-indigo hover:border-twilight-indigo/30"
            >
              {followUpDate || followUpNotes ? "Edit" : "Schedule follow-up"}
            </button>
            <button
              type="button"
              onClick={() => startMark(() => markSentAction())}
              disabled={pendingMark || overLimit}
              className={cx(
                "rounded-full bg-twilight-indigo px-3 py-1.5 text-sm text-creamsicle-dream hover:bg-midnight-plum",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
              title={
                overLimit
                  ? "3 follow-ups maximum"
                  : "Increment the follow-up counter"
              }
            >
              {pendingMark ? "…" : "Mark follow-up sent"}
            </button>
          </div>
        </div>
      ) : (
        <form
          action={(fd) => {
            startTransition(async () => {
              await updateAction(fd);
              setEditing(false);
            });
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
              Next touchpoint
            </span>
            <input
              type="date"
              name="followUpDate"
              defaultValue={followUpDate ?? ""}
              className="w-full rounded-xl border border-twilight-indigo/15 bg-white px-4 py-3 text-twilight-indigo focus:border-sunlit-amber focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
              Notes
            </span>
            <textarea
              name="followUpNotes"
              defaultValue={followUpNotes ?? ""}
              rows={3}
              className="w-full rounded-xl border border-twilight-indigo/15 bg-white px-4 py-3 text-twilight-indigo focus:border-sunlit-amber focus:outline-none"
              placeholder="What to send · what to reference"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-twilight-indigo px-4 py-2 text-sm font-medium text-creamsicle-dream hover:bg-midnight-plum disabled:opacity-40"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full px-4 py-2 text-sm text-twilight-indigo/70 hover:bg-twilight-indigo/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
