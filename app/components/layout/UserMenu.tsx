"use client";

import { logoutAction } from "@/app/logout-action";

export function UserMenu({ name }: { name: string }) {
  return (
    <form action={logoutAction} className="inline-flex items-center gap-2">
      <span
        className="hidden rounded-full bg-twilight-indigo/5 px-3 py-1 text-xs font-medium text-twilight-indigo sm:inline"
        title="Signed in"
      >
        {name}
      </span>
      <button
        type="submit"
        className="rounded-full px-3 py-1.5 text-xs uppercase tracking-wide text-twilight-indigo/60 hover:text-twilight-indigo"
      >
        Sign out
      </button>
    </form>
  );
}
