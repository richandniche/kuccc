"use client";

import { useActionState } from "react";
import { changePasswordAction } from "./actions";
import { cx } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-twilight-indigo/15 bg-white px-4 py-3 text-twilight-indigo placeholder:text-twilight-indigo/40 focus:border-sunlit-amber focus:outline-none";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Current password">
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className={fieldClass}
        />
      </Field>
      <Field label="New password">
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClass}
        />
      </Field>
      <Field label="Confirm new password">
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClass}
        />
      </Field>
      {state?.error && (
        <div className="rounded-xl border border-scarlet-ember/30 bg-scarlet-ember/10 px-4 py-3 text-sm text-scarlet-ember">
          {state.error}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className={cx(
          "inline-flex w-full items-center justify-center rounded-full bg-twilight-indigo px-6 py-3 text-base font-medium text-creamsicle-dream transition-colors",
          "hover:bg-midnight-plum disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
        {label}
      </span>
      {children}
    </label>
  );
}
