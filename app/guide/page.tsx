import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { GuideShell } from "@/components/guide/GuideShell";

export const dynamic = "force-dynamic";

export default function GuidePage() {
  return (
    <>
      <AppHeader>
        <Button href="/calls" variant="ghost" size="sm">
          ← Calls
        </Button>
      </AppHeader>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="font-heading text-3xl font-bold text-twilight-indigo">
          Sales Guide
        </h1>
        <p className="mt-1 text-twilight-indigo/60">
          Reference material for warm, pressure-free Clarity Calls.
        </p>
        <div className="mt-8">
          <GuideShell variant="page" />
        </div>
      </main>
    </>
  );
}
