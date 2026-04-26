"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/utils";

export function GhlImportButton({
  connected,
  hasCalendar,
}: {
  connected: boolean;
  hasCalendar: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const importNow = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/ghl/appointments");
      const data = (await res.json()) as
        | { imported: number; skipped: number; total: number }
        | { error: string };
      if (!res.ok || "error" in data) {
        setMessage(`Error: ${"error" in data ? data.error : `HTTP ${res.status}`}`);
        return;
      }
      setMessage(
        data.imported > 0
          ? `Imported ${data.imported} new call${data.imported === 1 ? "" : "s"}.`
          : "Up to date — nothing new to import.",
      );
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to import");
    } finally {
      setBusy(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (!connected) {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-twilight-indigo/50">
        <span aria-hidden className="h-2 w-2 rounded-full bg-twilight-indigo/30" />
        GHL not connected
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="inline-flex items-center gap-2 text-xs font-medium text-forest-shadow"
        title={hasCalendar ? "GHL connected" : "GHL connected — pick a calendar in Settings"}
      >
        <span aria-hidden className="h-2 w-2 rounded-full bg-sage-stone" />
        GHL
      </span>
      <button
        type="button"
        onClick={importNow}
        disabled={busy || !hasCalendar}
        className={cx(
          "rounded-full border border-twilight-indigo/15 bg-white/60 px-3 py-1.5 text-sm text-twilight-indigo",
          "hover:border-twilight-indigo/30 disabled:cursor-not-allowed disabled:opacity-40",
        )}
        title={
          hasCalendar
            ? "Pull booked Clarity Calls from GHL"
            : "Pick a calendar in Settings first"
        }
      >
        {busy ? "Importing…" : "Import Booked"}
      </button>
      {message && (
        <span className="text-xs text-twilight-indigo/70">{message}</span>
      )}
    </div>
  );
}
