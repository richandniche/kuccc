import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { OutcomeBadge } from "@/components/ui/Badge";
import { PROGRAM_LABELS } from "@/lib/constants";
import { formatDate, formatTime, formatSeconds } from "@/lib/utils";
import { RecordingForm } from "./recording-form";
import { DeleteButton } from "./delete-button";
import { CopyAllNotes } from "./copy-notes";
import { GhlSection } from "./ghl-section";
import { FollowUpSection } from "./follow-up-section";
import {
  deleteCall,
  updateRecordingUrl,
  updateFollowUp,
  markFollowUpSent,
} from "./actions";
import { getGhlConfig } from "@/lib/ghl/storage";
import type { OutcomeKey } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CallReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [call] = await db
    .select()
    .from(schema.calls)
    .where(and(eq(schema.calls.id, id), eq(schema.calls.callerId, user.id)))
    .limit(1);

  if (!call) notFound();

  const updateAction = updateRecordingUrl.bind(null, call.id);
  const deleteAction = deleteCall.bind(null, call.id);
  const followUpUpdateAction = updateFollowUp.bind(null, call.id);
  const followUpMarkAction = markFollowUpSent.bind(null, call.id);
  const ghlConfig = getGhlConfig();

  return (
    <>
      <AppHeader>
        <Button href="/calls" variant="ghost" size="sm">
          ← Calls
        </Button>
      </AppHeader>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 space-y-8">
        {/* Prospect card */}
        <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-3xl font-bold text-twilight-indigo">
                {call.prospectName}
              </h1>
              {call.prospectEmail && (
                <p className="mt-1 text-twilight-indigo/70">{call.prospectEmail}</p>
              )}
              {call.prospectPhone && (
                <p className="text-twilight-indigo/70">{call.prospectPhone}</p>
              )}
            </div>
            <OutcomeBadge
              outcome={call.outcome}
              scheduled={!!call.ghlAppointmentId}
            />
          </div>

          {!call.outcome && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-sunlit-amber/40 bg-sunlit-amber/15 px-4 py-3">
              <p className="flex-1 text-sm text-rustic-copper">
                {call.ghlAppointmentId
                  ? "Imported from GHL — ready to run when the prospect joins."
                  : "This call hasn't been completed yet."}
              </p>
              <Button
                href={`/calls/${call.id}/companion`}
                variant="primary"
                size="md"
              >
                Start Call →
              </Button>
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3">
          <Stat
            label={call.scheduledFor && !call.outcome ? "Scheduled" : "Date"}
            value={`${formatDate(call.scheduledFor ?? call.createdAt)} · ${formatTime(call.scheduledFor ?? call.createdAt)}`}
          />
          <Stat label="Duration" value={formatSeconds(call.durationSeconds)} />
          <Stat label="Program" value={PROGRAM_LABELS[call.programInterest]} />
        </section>

        {/* Recording */}
        <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
            Recording
          </h2>
          <div className="mt-3">
            <RecordingForm
              currentUrl={call.recordingUrl}
              action={updateAction}
            />
          </div>
        </section>

        {/* Notes */}
        <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
              Notes ({call.notes.length})
            </h2>
            {call.notes.length > 0 && <CopyAllNotes notes={call.notes} />}
          </div>
          {call.notes.length === 0 ? (
            <p className="mt-3 text-twilight-indigo/60">No notes recorded.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {call.notes.map((n, i) => (
                <li
                  key={i}
                  className="border-l-2 border-sunlit-amber/60 pl-4 py-1"
                >
                  <div className="text-xs uppercase tracking-wide text-twilight-indigo/50">
                    {n.label} · {formatTime(n.at)}
                  </div>
                  <p className="mt-1 text-twilight-indigo">{n.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Follow-up */}
        <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-6">
          <FollowUpSection
            followUpDate={
              call.followUpDate ? String(call.followUpDate) : null
            }
            followUpNotes={call.followUpNotes}
            followUpCount={call.followUpCount}
            updateAction={followUpUpdateAction}
            markSentAction={followUpMarkAction}
          />
        </section>

        {ghlConfig && (
          <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-6">
            <GhlSection
              callId={call.id}
              outcome={call.outcome as OutcomeKey | null}
              contactId={call.ghlContactId}
              locationId={ghlConfig.locationId}
              alreadySynced={call.ghlTagsSynced}
            />
          </section>
        )}

        {/* Time-stamp footer */}
        <p className="text-xs text-twilight-indigo/50">
          Created {formatDate(call.createdAt)} · last updated{" "}
          {formatDate(call.updatedAt)}
        </p>

        {/* Delete */}
        <section className="border-t border-twilight-indigo/10 pt-6">
          <DeleteButton action={deleteAction} prospectName={call.prospectName} />
        </section>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-twilight-indigo/10 bg-white/40 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
        {label}
      </div>
      <div className="mt-1 font-heading text-lg text-twilight-indigo">
        {value}
      </div>
    </div>
  );
}
