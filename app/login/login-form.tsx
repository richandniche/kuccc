"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { cx } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-creamsicle-dream/20 bg-creamsicle-dream/5 px-4 py-3 text-creamsicle-dream placeholder:text-creamsicle-dream/40 focus:border-sunlit-amber focus:outline-none";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          className={fieldClass}
        />
      </Field>
      <Field label="Password">
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
          "inline-flex w-full items-center justify-center rounded-full bg-sunlit-amber px-6 py-3 text-base font-medium text-twilight-indigo transition-colors",
          "hover:bg-sunlit-amber/90 disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        {pending ? "Signing in…" : "Sign In"}
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
      <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-creamsicle-dream/60">
        {label}
      </span>
      {children}
    </label>
  );
}
