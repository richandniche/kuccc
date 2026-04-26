"use client";

import { useState } from "react";
import { LanguageGuide } from "./LanguageGuide";
import { ObjectionFramework } from "./ObjectionFramework";
import { ProgramReference } from "./ProgramReference";
import { FollowUpCadence } from "./FollowUpCadence";
import { ProspectAvatar } from "./ProspectAvatar";
import { cx } from "@/lib/utils";

export type GuideTab =
  | "language"
  | "objections"
  | "programs"
  | "followup"
  | "prospect";

const TABS: Array<{ id: GuideTab; label: string }> = [
  { id: "language", label: "Language" },
  { id: "objections", label: "Objections" },
  { id: "programs", label: "Programs" },
  { id: "followup", label: "Follow-Up" },
  { id: "prospect", label: "Prospect" },
];

export function GuideShell({
  initial = "language",
  variant = "page",
}: {
  initial?: GuideTab;
  variant?: "page" | "sidebar";
}) {
  const [tab, setTab] = useState<GuideTab>(initial);
  const isSidebar = variant === "sidebar";

  return (
    <div className={cx(isSidebar ? "space-y-5" : "space-y-7")}>
      <nav
        aria-label="Guide tabs"
        className={cx(
          "scrollbar-none -mx-1 flex overflow-x-auto border-b border-twilight-indigo/10",
          isSidebar
            ? "sticky top-0 z-10 -mt-2 bg-creamsicle-dream/95 px-1 pt-2 backdrop-blur"
            : "",
        )}
      >
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cx(
                "relative shrink-0 px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "text-twilight-indigo"
                  : "text-twilight-indigo/50 hover:text-twilight-indigo/80",
              )}
            >
              {t.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-twilight-indigo"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div>
        {tab === "language" && <LanguageGuide compact={isSidebar} />}
        {tab === "objections" && <ObjectionFramework compact={isSidebar} />}
        {tab === "programs" && <ProgramReference compact={isSidebar} />}
        {tab === "followup" && <FollowUpCadence compact={isSidebar} />}
        {tab === "prospect" && <ProspectAvatar compact={isSidebar} />}
      </div>
    </div>
  );
}
