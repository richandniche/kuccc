"use client";

import { useState } from "react";
import { PRICING_200, PRICING_300 } from "@/lib/constants";
import { cx } from "@/lib/utils";

type Program = "200hr" | "300hr";

export function PricingRef() {
  const [program, setProgram] = useState<Program>("200hr");
  const tiers = program === "200hr" ? PRICING_200 : PRICING_300;

  return (
    <div className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-twilight-indigo/60">
          Pricing reference
        </div>
        <div className="inline-flex rounded-full border border-twilight-indigo/15 bg-white/60 p-1 text-xs">
          {(["200hr", "300hr"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProgram(p)}
              className={cx(
                "rounded-full px-3 py-1 transition-colors",
                program === p
                  ? "bg-twilight-indigo text-creamsicle-dream"
                  : "text-twilight-indigo/70 hover:text-twilight-indigo",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.tier}
            className="rounded-xl border border-twilight-indigo/10 bg-creamsicle-dream/40 p-3"
          >
            <div className="text-xs uppercase tracking-wide text-twilight-indigo/60">
              {t.tier}
            </div>
            <div className="mt-1 font-heading text-xl font-bold text-twilight-indigo">
              {t.full}
            </div>
            <div className="text-sm text-twilight-indigo/70">{t.plan}</div>
            <div className="mt-1 text-xs text-twilight-indigo/50">
              by {t.deadline}
              {t.save ? ` · save ${t.save}` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
