import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { getGhlConfig } from "@/lib/ghl/storage";
import { getCurrentUser } from "@/lib/auth";
import { GhlVerifyButton } from "./ghl-verify-button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const config = getGhlConfig();
  const connected = !!config;

  return (
    <>
      <AppHeader>
        <Button href="/calls" variant="ghost" size="sm">
          ← Calls
        </Button>
      </AppHeader>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 space-y-8">
        <h1 className="font-heading text-3xl font-bold text-twilight-indigo">
          Settings
        </h1>

        <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-twilight-indigo">
              GoHighLevel
            </h2>
            <ConnectionDot connected={connected} />
          </div>

          <p className="text-sm text-twilight-indigo/60">
            GHL is configured via environment variables. Edit{" "}
            <code className="rounded bg-twilight-indigo/5 px-1 py-0.5 text-xs">
              .env.local
            </code>{" "}
            and restart the dev server to change credentials.
          </p>

          {connected ? (
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Item label="Location ID" value={config!.locationId} mono />
              <Item
                label="Calendar ID"
                value={config!.calendarId ?? "(not set — Import Booked disabled)"}
                mono={!!config!.calendarId}
              />
            </dl>
          ) : (
            <div className="rounded-xl border border-rustic-copper/30 bg-sunlit-amber/15 px-4 py-3 text-sm text-rustic-copper">
              <p className="font-medium">Not configured.</p>
              <p className="mt-1">
                Set <code>GHL_LOCATION_ID</code> and <code>GHL_API_KEY</code> in{" "}
                <code>.env.local</code> (and optionally{" "}
                <code>GHL_CALENDAR_ID</code>), then restart the server.
              </p>
            </div>
          )}

          {connected && <GhlVerifyButton />}
        </section>

        <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-6 space-y-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-twilight-indigo">
              Account
            </h2>
            <p className="mt-1 text-sm text-twilight-indigo/60">
              Signed in as <strong>{user.email}</strong> ({user.role})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/account/password"
              className="rounded-full border border-twilight-indigo/15 bg-white/60 px-4 py-2 text-sm text-twilight-indigo hover:border-twilight-indigo/30"
            >
              Change password
            </Link>
            {user.role === "admin" && (
              <Link
                href="/settings/team"
                className="rounded-full bg-twilight-indigo px-4 py-2 text-sm font-medium text-creamsicle-dream hover:bg-midnight-plum"
              >
                Manage team →
              </Link>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function ConnectionDot({ connected }: { connected: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide"
      style={{ color: connected ? "#1C423E" : "#974320" }}
    >
      <span
        aria-hidden
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: connected ? "#96AA9F" : "#EEBE55" }}
      />
      {connected ? "Connected" : "Not connected"}
    </span>
  );
}

function Item({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-twilight-indigo/10 bg-white/50 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
        {label}
      </dt>
      <dd
        className={`mt-1 text-twilight-indigo break-all ${mono ? "font-mono text-sm" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
