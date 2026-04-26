"use client";

import { useState, useTransition } from "react";
import {
  deleteTeamMember,
  resetTeamPassword,
  setTeamMemberRole,
} from "./actions";
import { cx } from "@/lib/utils";

type Mode = "idle" | "reset" | "confirmDelete";

export function TeamRow({
  user,
  isSelf,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admissions" | "admin";
    passwordMustChange: boolean;
    createdAt: string;
  };
  isSelf: boolean;
}) {
  const [mode, setMode] = useState<Mode>("idle");
  const [tempPw, setTempPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <li className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-heading text-lg font-bold text-twilight-indigo">
              {user.name}
            </span>
            {isSelf && (
              <span className="rounded-full bg-sunlit-amber/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-rustic-copper">
                You
              </span>
            )}
            {user.passwordMustChange && (
              <span
                className="rounded-full bg-misty-mauve/25 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-twilight-indigo"
                title="Will be forced to change password on next login"
              >
                Pending password
              </span>
            )}
          </div>
          <div className="text-sm text-twilight-indigo/70">{user.email}</div>
          <div className="mt-1 text-xs text-twilight-indigo/50">
            Joined {user.createdAt}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RoleSelect
            userId={user.id}
            role={user.role}
            disabled={isSelf}
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-scarlet-ember/30 bg-scarlet-ember/10 px-3 py-2 text-sm text-scarlet-ember">
          {error}
        </div>
      )}

      {mode === "reset" && (
        <form
          className="mt-3 flex flex-wrap items-end gap-2"
          action={(fd) => {
            setError(null);
            startTransition(async () => {
              try {
                fd.set("userId", user.id);
                await resetTeamPassword(fd);
                setMode("idle");
                setTempPw("");
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to reset");
              }
            });
          }}
        >
          <label className="flex-1 min-w-[200px]">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
              New temporary password
            </span>
            <input
              name="password"
              type="text"
              required
              minLength={8}
              value={tempPw}
              onChange={(e) => setTempPw(e.target.value)}
              className="w-full rounded-xl border border-twilight-indigo/15 bg-white px-3 py-2 font-mono text-twilight-indigo focus:border-sunlit-amber focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={pending || tempPw.length < 8}
            className="rounded-full bg-twilight-indigo px-4 py-2 text-sm text-creamsicle-dream hover:bg-midnight-plum disabled:opacity-40"
          >
            {pending ? "Saving…" : "Reset"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("idle");
              setTempPw("");
            }}
            className="rounded-full px-4 py-2 text-sm text-twilight-indigo/70 hover:bg-twilight-indigo/5"
          >
            Cancel
          </button>
        </form>
      )}

      {mode === "confirmDelete" && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-scarlet-ember/30 bg-scarlet-ember/5 px-3 py-2">
          <span className="text-sm text-twilight-indigo">
            Delete <strong>{user.email}</strong> permanently?
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                try {
                  await deleteTeamMember(user.id);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed");
                  setMode("idle");
                }
              });
            }}
            className="rounded-full bg-scarlet-ember/15 px-3 py-1.5 text-sm font-medium text-scarlet-ember hover:bg-scarlet-ember/25 disabled:opacity-40"
          >
            {pending ? "Deleting…" : "Yes, delete"}
          </button>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="text-sm text-twilight-indigo/70 hover:text-twilight-indigo"
          >
            Cancel
          </button>
        </div>
      )}

      {mode === "idle" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("reset")}
            disabled={isSelf}
            title={isSelf ? "Use /account/password to change your own" : ""}
            className={cx(
              "rounded-full border border-twilight-indigo/15 bg-white/60 px-3 py-1.5 text-sm text-twilight-indigo",
              "hover:border-twilight-indigo/30 disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            Reset password
          </button>
          {!isSelf && (
            <button
              type="button"
              onClick={() => setMode("confirmDelete")}
              className="ml-auto text-sm text-scarlet-ember/80 hover:text-scarlet-ember"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: "admissions" | "admin";
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={role}
      disabled={disabled || pending}
      onChange={(e) => {
        const fd = new FormData();
        fd.set("userId", userId);
        fd.set("role", e.target.value);
        startTransition(() => setTeamMemberRole(fd));
      }}
      className="rounded-full border border-twilight-indigo/15 bg-white px-3 py-1.5 text-sm text-twilight-indigo focus:border-sunlit-amber focus:outline-none disabled:opacity-50"
      title={disabled ? "You can't change your own role" : "Change role"}
    >
      <option value="admissions">Admissions</option>
      <option value="admin">Admin</option>
    </select>
  );
}
