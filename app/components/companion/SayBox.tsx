export function SayBox({ text }: { text: string }) {
  return (
    <div className="rounded-r-xl border-l-4 border-sage-stone bg-sage-stone/10 px-5 py-4">
      <div className="text-xs font-medium uppercase tracking-wide text-sage-stone">
        Suggested Language
      </div>
      <p className="mt-2 whitespace-pre-line text-[19px] leading-relaxed text-twilight-indigo">
        {text}
      </p>
    </div>
  );
}
