import { cx } from "@/lib/utils";

const SAY_THIS = [
  ["Sign up", "Enrol ~ step in"],
  ["Buy / purchase", "Invest in ~ commit to"],
  ["Program features", "What you'll experience"],
  ["Limited spots", "The cohort begins in October"],
  ["Don't miss out", "The early bird rate is available until [date]"],
  ["This will change your life", "Our graduates describe it as…"],
  ["Trust me", "What our students tell us is…"],
  ["Ready to commit?", "How does this feel?"],
  ["I (centering yourself)", "We ~ Our community ~ Guru Singh"],
];

const TRUST_WORDS =
  "practice · lineage · transmission · devotion · grounded · embodiment · integration · coherence · sovereignty · container · community · living teacher";

const AVOID_WORDS =
  "manifest · unlock your potential · guaranteed · proven · hack · hustle · don't miss out · last chance · sign up · limited time · journey (casual) · trauma (casual) · abundance (standalone) · living master (use \"living teacher\" or Guru Singh by name)";

export function LanguageGuide({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cx(compact ? "space-y-5" : "space-y-8")}>
      <section>
        <h2
          className={cx(
            "font-heading font-bold text-twilight-indigo",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          Say This, Not That
        </h2>
        {compact ? (
          <ul className="mt-3 space-y-2.5">
            {SAY_THIS.map(([dont, say]) => (
              <li
                key={dont}
                className="rounded-xl border border-twilight-indigo/10 bg-white/40 px-4 py-3"
              >
                <div className="text-[13px] text-scarlet-ember/80 line-through">
                  {dont}
                </div>
                <div className="mt-1 text-[15px] text-forest-shadow">
                  {say}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-twilight-indigo/10 bg-white/40">
            <table className="w-full text-[15px]">
              <thead className="bg-twilight-indigo/5 text-xs uppercase tracking-wide text-twilight-indigo/60">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Don&apos;t Say</th>
                  <th className="px-4 py-3 text-left font-medium">Say Instead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-twilight-indigo/10">
                {SAY_THIS.map(([dont, say]) => (
                  <tr key={dont} className="align-top">
                    <td className="px-4 py-3 text-scarlet-ember/80 line-through">
                      {dont}
                    </td>
                    <td className="px-4 py-3 text-forest-shadow">{say}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border-l-4 border-sage-stone bg-sage-stone/10 px-5 py-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-sage-stone">
          Trust Words
        </h3>
        <p className="mt-2 text-twilight-indigo">{TRUST_WORDS}</p>
      </section>

      <section className="rounded-2xl border-l-4 border-scarlet-ember bg-scarlet-ember/5 px-5 py-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-scarlet-ember">
          Words to Avoid
        </h3>
        <p className="mt-2 text-twilight-indigo">{AVOID_WORDS}</p>
      </section>
    </div>
  );
}
