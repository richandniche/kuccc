const PROGRAMS = [
  {
    title: "200-Hour Kundalini Foundations",
    accent: "#96AA9F",
    bullets: [
      "Duration: ~6 months (Oct 2026 ~ Apr 2027)",
      "Calls Begin: October 7, 2026",
      "Schedule: Wed 9~11 AM PST / Fri 4~6 PM PST",
      "Attendance: 1 call/week (same material)",
      "22 Krya Modules · 3 learning journeys",
      "Guru Singh + faculty",
      "RYT-200 Yoga Alliance",
      "Immediate pre-course access (6 modules)",
    ],
  },
  {
    title: "300-Hour Radical Expansions",
    accent: "#9DA7EA",
    bullets: [
      "Duration: ~9 months (Oct 2026 ~ Jun 2027)",
      "Calls Begin: October 21, 2026",
      "Schedule: Wed 4~6:30 PM / Fri 9~11:30 AM PST",
      "1 call/week + 12 Saturday workshops",
      "13 Shastras",
      "Guru Singh",
      "RYT-300 Yoga Alliance",
    ],
  },
];

export function ProgramReference({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 ${compact ? "" : "lg:grid-cols-2"}`}
    >
      {PROGRAMS.map((p) => (
        <article
          key={p.title}
          className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-5"
          style={{ borderTopWidth: 4, borderTopColor: p.accent }}
        >
          <h3 className="font-heading text-xl font-bold text-twilight-indigo">
            {p.title}
          </h3>
          <ul className="mt-3 space-y-1.5 text-[15px] text-twilight-indigo">
            {p.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span
                  aria-hidden
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: p.accent }}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
