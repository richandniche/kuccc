import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { OutcomeBadge } from "@/components/ui/Badge";
import { PROGRAM_LABELS } from "@/lib/constants";
import { formatDate, formatTime, formatSeconds } from "@/lib/utils";
import { getGhlConfig } from "@/lib/ghl/storage";
import { GhlImportButton } from "@/components/calls/GhlImportButton";

export const dynamic = "force-dynamic";

export default async function CallsPage() {
  const user = await getCurrentUser();
  const rows = await db
    .select()
    .from(schema.calls)
    .where(eq(schema.calls.callerId, user.id))
    .orderBy(
      desc(sql`coalesce(${schema.calls.scheduledFor}, ${schema.calls.createdAt})`),
    );
  const ghlConfig = getGhlConfig();

  return (
    <>
      <AppHeader>
        <Button href="/guide" variant="ghost" size="sm">
          Sales Guide
        </Button>
        <Button href="/settings" variant="ghost" size="sm">
          Settings
        </Button>
        <Button href="/calls/new" variant="primary" size="md">
          + New Call
        </Button>
      </AppHeader>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-3xl font-bold text-twilight-indigo">Call Log</h1>
          <div className="flex items-center gap-4">
            <GhlImportButton
              connected={!!ghlConfig}
              hasCalendar={!!ghlConfig?.calendarId}
            />
            <p className="text-sm text-twilight-indigo/60">
              {rows.length} {rows.length === 1 ? "call" : "calls"}
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-3">
            {rows.map((call) => (
              <li key={call.id}>
                <Link
                  href={
                    call.outcome
                      ? `/calls/${call.id}`
                      : `/calls/${call.id}/companion`
                  }
                  className="block rounded-2xl border border-twilight-indigo/10 bg-white/40 p-5 transition-colors hover:border-twilight-indigo/30 hover:bg-white/70"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-twilight-indigo">
                        {call.prospectName}
                      </h2>
                      <p className="mt-1 text-sm text-twilight-indigo/70">
                        {PROGRAM_LABELS[call.programInterest]}
                        {(() => {
                          const when = call.scheduledFor ?? call.createdAt;
                          const prefix = call.scheduledFor && !call.outcome ? "Scheduled" : "On";
                          return (
                            <>
                              {" · "}
                              <span title={prefix}>
                                {formatDate(when)} at {formatTime(when)}
                              </span>
                            </>
                          );
                        })()}
                        {call.outcome
                          ? ` · ${formatSeconds(call.durationSeconds)}`
                          : ""}
                      </p>
                    </div>
                    <OutcomeBadge
                      outcome={call.outcome}
                      scheduled={!!call.ghlAppointmentId}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-twilight-indigo/20 bg-white/30 p-12 text-center">
      <p className="font-heading text-2xl text-twilight-indigo">
        No calls yet
      </p>
      <p className="mt-2 text-twilight-indigo/60">
        Your call log lives here. When you start a Clarity Call, it will appear
        with the prospect, outcome, and notes.
      </p>
      <div className="mt-6">
        <Button href="/calls/new" variant="primary" size="lg">
          Start First Call
        </Button>
      </div>
    </div>
  );
}
