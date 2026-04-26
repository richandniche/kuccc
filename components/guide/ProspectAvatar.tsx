const TELLS_HERSELF = [
  '"Maybe I\'m just a dabbler"',
  '"I should be further along"',
  "\"If it doesn't work, I'm the problem\"",
  '"Kundalini feels intense"',
];

const SECRETLY_WANTS = [
  "To feel chosen by a teacher",
  "Permission to stop seeking",
  "To teach something with fire",
  "Spiritual + real life as one",
];

export function ProspectAvatar({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-5" : "space-y-6"}>
      <article className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-6">
        <header className="flex items-baseline gap-3">
          <h2 className="font-heading text-3xl font-bold text-twilight-indigo">
            Maren
          </h2>
          <span className="text-twilight-indigo/60">43</span>
        </header>
        <p className="mt-1 text-twilight-indigo/70">
          RYT-200 Vinyasa teacher · freelance designer · Boulder, CO
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-twilight-indigo">
          She&apos;s hit a ceiling in her teaching and practice. She&apos;s
          done retreats, workshops, and apps, but nothing has cohered. She&apos;s
          restless, spiritually serious, and afraid of choosing wrong again.
        </p>
      </article>

      <div
        className={`grid grid-cols-1 gap-4 ${compact ? "" : "md:grid-cols-2"}`}
      >
        <Section title="She Tells Herself" items={TELLS_HERSELF} accent="#974320" />
        <Section title="She Secretly Wants" items={SECRETLY_WANTS} accent="#1C423E" />
      </div>

      <blockquote className="rounded-2xl border-l-4 border-midnight-plum bg-midnight-plum/5 px-5 py-4 italic text-twilight-indigo">
        Trigger RECOGNITION. Not aspiration, not fear.{" "}
        <span className="not-italic">
          &ldquo;Someone put words to what I&apos;ve been feeling.&rdquo;
        </span>
      </blockquote>
    </div>
  );
}

function Section({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border bg-white/30 p-5"
      style={{ borderColor: accent + "33" }}
    >
      <h3
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: accent }}
      >
        {title}
      </h3>
      <ul className="mt-3 space-y-1.5 text-[15px] text-twilight-indigo">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden style={{ color: accent }}>
              ◇
            </span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
