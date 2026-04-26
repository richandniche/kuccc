"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";

export function RecordingForm({
  currentUrl,
  action,
}: {
  currentUrl: string | null;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing && currentUrl) {
    return (
      <div className="flex items-center justify-between gap-3">
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-twilight-indigo underline hover:text-midnight-plum"
        >
          {currentUrl}
        </a>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs uppercase tracking-wide text-twilight-indigo/60 hover:text-twilight-indigo"
        >
          Edit
        </button>
      </div>
    );
  }

  if (!editing && !currentUrl) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-twilight-indigo/70 underline hover:text-twilight-indigo"
      >
        + Add recording link
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await action(fd);
        setEditing(false);
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        name="recordingUrl"
        type="url"
        defaultValue={currentUrl ?? ""}
        autoFocus
        placeholder="https://…"
        className={cx(
          "flex-1 min-w-0 rounded-xl border border-twilight-indigo/20 bg-white px-3 py-2 text-twilight-indigo",
          "focus:border-sunlit-amber focus:outline-none",
        )}
      />
      <button
        type="submit"
        className="rounded-full bg-twilight-indigo px-4 py-2 text-sm text-creamsicle-dream hover:bg-midnight-plum"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-full px-4 py-2 text-sm text-twilight-indigo/70 hover:bg-twilight-indigo/5"
      >
        Cancel
      </button>
    </form>
  );
}
