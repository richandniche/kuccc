"use client";

import { useEffect } from "react";
import { GuideShell } from "@/components/guide/GuideShell";
import { cx } from "@/lib/utils";

export function GuideSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Scrim — closes on click */}
      <div
        className={cx(
          "absolute inset-0 z-30 bg-twilight-indigo/30 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        aria-hidden={!open}
        className={cx(
          "absolute right-0 top-0 z-40 flex h-full w-full max-w-xl flex-col",
          "border-l border-twilight-indigo/10 bg-creamsicle-dream shadow-2xl",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-twilight-indigo/10 bg-creamsicle-dream px-6 py-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-twilight-indigo/50">
              Reference
            </div>
            <h2 className="font-heading text-xl font-bold leading-tight text-twilight-indigo">
              Sales Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-twilight-indigo/60 hover:bg-twilight-indigo/5 hover:text-twilight-indigo"
            aria-label="Close guide"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10 pt-5">
          <GuideShell variant="sidebar" />
        </div>
      </aside>
    </>
  );
}
