"use client";

import { useState, useTransition } from "react";

export function DeleteButton({
  action,
  prospectName,
}: {
  action: () => void | Promise<void>;
  prospectName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-twilight-indigo">
          Delete the call with <strong>{prospectName}</strong>?
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => action())}
          className="rounded-full bg-scarlet-ember/15 px-4 py-2 text-sm font-medium text-scarlet-ember hover:bg-scarlet-ember/25 disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full px-4 py-2 text-sm text-twilight-indigo/70 hover:bg-twilight-indigo/5"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm text-scarlet-ember/80 hover:text-scarlet-ember"
    >
      Delete this call
    </button>
  );
}
