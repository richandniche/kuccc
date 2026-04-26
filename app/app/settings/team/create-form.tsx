"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTeamMember } from "./actions";
import { cx } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-twilight-indigo/15 bg-white px-4 py-3 text-twilight-indigo placeholder:text-twilight-indigo/40 focus:border-sunlit-amber focus:outline-none";

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createTeamMember, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form on successful create so the next add starts fresh
  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input name="name" required className={fieldClass} placeholder="Jane Doe" autoComplete="off" />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={fieldClass} placeholder="jane@example.com" autoComplete="off" />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Temporary password">
          <input
            name="password"
            type="text"
            required
            minLength={8}
            className={`${fieldClass} font-mono`}
            placeholder="At least 8 characters"
            autoComplete="off"
          />
        </Field>
        <Field label="Role">
          <select name="role" defaultValue="admissions" className={fieldClass}>
            <option value="admissions">Admissions</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
      </div>

      {state?.error && (
        <div className="rounded-xl border border-scarlet-ember/30 bg-scarlet-ember/10 px-4 py-3 text-sm text-scarlet-ember">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-xl border border-sage-stone/40 bg-sage-stone/15 px-4 py-3 text-sm text-forest-shadow">
          {state.success}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cx(
          "rounded-full bg-twilight-indigo px-5 py-2.5 text-sm font-medium text-creamsicle-dream",
          "hover:bg-midnight-plum disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        {pending ? "Adding…" : "Add user"}
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
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
        {label}
      </span>
      {children}
    </label>
  );
}
