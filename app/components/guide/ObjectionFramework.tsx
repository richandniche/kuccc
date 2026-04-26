const STEPS = [
  {
    n: 1,
    name: "Validate",
    line: '"Thank you for raising that."',
    body: "Show the concern is welcome. Never argue.",
  },
  {
    n: 2,
    name: "Clarify",
    line: "Find the real fear underneath.",
    body: "The stated objection is rarely the actual fear.",
  },
  {
    n: 3,
    name: "Reframe",
    line: "Offer a new lens.",
    body: "Use graduate stories and Guru Singh as proof.",
  },
  {
    n: 4,
    name: "Invite",
    line: "Return naturally.",
    body: '"Does that resonate?"',
  },
];

export function ObjectionFramework({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-5" : "space-y-6"}>
      <header>
        <h2
          className={`font-heading font-bold text-twilight-indigo ${compact ? "text-lg" : "text-2xl"}`}
        >
          The Four-Step Pattern
        </h2>
        <p className="mt-1 text-twilight-indigo/70">
          Used at every objection. Validate → Clarify → Reframe → Invite.
        </p>
      </header>

      <ol className="space-y-3">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="flex gap-4 rounded-2xl border border-twilight-indigo/10 bg-white/40 p-5"
          >
            <div
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-twilight-indigo text-creamsicle-dream font-heading text-xl font-bold"
            >
              {s.n}
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-twilight-indigo">
                {s.name}
              </h3>
              <p className="text-twilight-indigo">{s.line}</p>
              <p className="mt-1 text-sm text-twilight-indigo/70">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <blockquote className="rounded-2xl border-l-4 border-midnight-plum bg-midnight-plum/5 px-5 py-4 italic text-twilight-indigo">
        Every objection is a request for safety. The people who voice concerns
        are doing you a favour.
      </blockquote>
    </div>
  );
}
