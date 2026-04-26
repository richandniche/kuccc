"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OutcomeKey } from "@/lib/constants";
import { cx } from "@/lib/utils";

export function GhlSection({
  callId,
  outcome,
  contactId,
  locationId,
  alreadySynced,
}: {
  callId: string;
  outcome: OutcomeKey | null;
  contactId: string | null;
  locationId: string | null;
  alreadySynced: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sync = async () => {
    if (!outcome) {
      setMessage("Pick an outcome before syncing.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/ghl/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callId,
          outcome,
          ...(contactId ? { contactId } : {}),
        }),
      });
      const data = (await res.json()) as
        | { ok: true; tag: string }
        | { error: string };
      if (!res.ok || "error" in data) {
        setMessage("error" in data ? data.error : `HTTP ${res.status}`);
        return;
      }
      setMessage(`Synced tag: ${data.tag}`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to sync");
    } finally {
      setBusy(false);
    }
  };

  const ghlUrl =
    contactId && locationId
      ? `https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${contactId}`
      : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
          GoHighLevel
        </h2>
        {alreadySynced && (
          <span className="text-xs text-forest-shadow">✓ Tags synced</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={sync}
          disabled={busy || !outcome}
          className={cx(
            "rounded-full bg-twilight-indigo px-4 py-2 text-sm font-medium text-creamsicle-dream",
            "hover:bg-midnight-plum disabled:cursor-not-allowed disabled:opacity-40",
          )}
          title={
            !outcome
              ? "Set an outcome first"
              : alreadySynced
                ? "Re-sync the outcome tag"
                : "Push the outcome tag to GHL"
          }
        >
          {busy ? "Syncing…" : alreadySynced ? "Re-sync Tags" : "Sync Tags"}
        </button>
        {ghlUrl && (
          <a
            href={ghlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-twilight-indigo/15 bg-white/60 px-4 py-2 text-sm text-twilight-indigo hover:border-twilight-indigo/30"
          >
            View in GHL ↗
          </a>
        )}
        {!contactId && (
          <span className="text-xs text-twilight-indigo/60">
            No GHL contact linked. Sync will try email lookup if available.
          </span>
        )}
      </div>

      {message && (
        <p className="text-sm text-twilight-indigo/70">{message}</p>
      )}
    </div>
  );
}
