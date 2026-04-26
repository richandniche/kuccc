export function TipBox({ text }: { text: string }) {
  return (
    <div className="rounded-r-xl border-l-4 border-sunlit-amber bg-sunlit-amber/10 px-5 py-4">
      <div className="text-xs font-medium uppercase tracking-wide text-rustic-copper">
        Coaching Tip
      </div>
      <p className="mt-2 text-[17px] leading-relaxed text-twilight-indigo">
        {text}
      </p>
    </div>
  );
}
