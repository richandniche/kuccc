const STEPS = [
  {
    when: "Day 1",
    body: "Personal email with info package. Reference something specific.",
  },
  {
    when: "Day 5~7",
    body: "Gentle check-in: \"Any questions came up?\"",
  },
  {
    when: "Day 14",
    body: "Share relevant content (Guru Singh clip, testimonial).",
  },
  {
    when: "Day 21~28",
    body: "Final touchpoint. No further unless they re-engage.",
  },
];

export function FollowUpCadence({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-5" : "space-y-6"}>
      <header>
        <h2
          className={`font-heading font-bold text-twilight-indigo ${compact ? "text-lg" : "text-2xl"}`}
        >
          Post-Call Cadence
        </h2>
      </header>

      <ol className="space-y-3">
        {STEPS.map((s) => (
          <li
            key={s.when}
            className="flex items-start gap-4 rounded-2xl border border-twilight-indigo/10 bg-white/40 p-5"
          >
            <div className="font-heading text-lg font-bold text-twilight-indigo whitespace-nowrap">
              {s.when}
            </div>
            <p className="text-[15px] text-twilight-indigo">{s.body}</p>
          </li>
        ))}
      </ol>

      <blockquote className="rounded-2xl border-l-4 border-sunlit-amber bg-sunlit-amber/10 px-5 py-4 italic text-twilight-indigo">
        Three follow-ups maximum. After that, trust their timing.
      </blockquote>
    </div>
  );
}
