"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";

type Program = "200hr" | "300hr" | "unsure";

const PROGRAM_OPTIONS: Array<{ value: Program; label: string }> = [
  { value: "200hr", label: "200-Hour" },
  { value: "300hr", label: "300-Hour" },
  { value: "unsure", label: "Not sure yet" },
];

const fieldClass =
  "w-full rounded-xl border border-creamsicle-dream/20 bg-creamsicle-dream/5 px-4 py-3 text-creamsicle-dream placeholder:text-creamsicle-dream/40 focus:border-sunlit-amber focus:outline-none";

export function ProspectIntakeForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [program, setProgram] = useState<Program>("unsure");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action={async (fd) => {
        setSubmitting(true);
        try {
          await action(fd);
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-6"
    >
      <Field label="Name" required>
        <input
          name="prospectName"
          required
          autoFocus
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
          placeholder="First and last name"
        />
      </Field>

      <Field label="Email (optional)">
        <input
          name="prospectEmail"
          type="email"
          autoComplete="off"
          className={fieldClass}
          placeholder="prospect@example.com"
        />
      </Field>

      <Field label="Phone (optional)">
        <input
          name="prospectPhone"
          type="tel"
          autoComplete="off"
          className={fieldClass}
          placeholder="+1 555 555 5555"
        />
      </Field>

      <Field label="Program Interest">
        <input type="hidden" name="programInterest" value={program} />
        <div className="grid grid-cols-3 gap-2">
          {PROGRAM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setProgram(opt.value)}
              className={cx(
                "rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                program === opt.value
                  ? "border-sunlit-amber bg-sunlit-amber/20 text-creamsicle-dream"
                  : "border-creamsicle-dream/20 text-creamsicle-dream/70 hover:border-creamsicle-dream/40",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      <button
        type="submit"
        disabled={!name.trim() || submitting}
        className={cx(
          "mt-4 inline-flex w-full items-center justify-center rounded-full bg-sunlit-amber px-6 py-4 text-lg font-medium text-twilight-indigo transition-colors",
          "hover:bg-sunlit-amber/90 disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        {submitting ? "Starting…" : "Begin Call"}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-creamsicle-dream/60">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
