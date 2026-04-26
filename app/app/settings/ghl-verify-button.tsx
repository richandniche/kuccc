"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";

export function GhlVerifyButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const verify = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/ghl/connect?verify=1");
      const data = (await res.json()) as
        | { connected: true; calendars: Array<{ id: string; name: string }> }
        | { connected: false; error?: string; reason?: string };
      if (!res.ok || data.connected === false) {
        setMessage(
          `✕ ${("error" in data && data.error) || ("reason" in data && data.reason) || `HTTP ${res.status}`}`,
        );
        return;
      }
      setMessage(
        `✓ Verified · ${data.calendars.length} calendar${
          data.calendars.length === 1 ? "" : "s"
        } found.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to verify");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={verify}
        disabled={busy}
        className={cx(
          "rounded-full bg-twilight-indigo px-4 py-2 text-sm font-medium text-creamsicle-dream",
          "hover:bg-midnight-plum disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        {busy ? "Verifying…" : "Verify Credentials"}
      </button>
      {message && (
        <span className="text-sm text-twilight-indigo/70">{message}</span>
      )}
    </div>
  );
}
