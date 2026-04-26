import Link from "next/link";
import { createCall } from "./actions";
import { ProspectIntakeForm } from "./form";

export const dynamic = "force-dynamic";

export default function NewCallPage() {
  return (
    <main className="flex min-h-screen flex-col bg-twilight-indigo text-creamsicle-dream">
      <div className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
        <Link
          href="/calls"
          className="inline-flex items-center text-sm text-creamsicle-dream/70 hover:text-creamsicle-dream"
        >
          ← Calls
        </Link>

        <h1 className="mt-8 font-heading text-4xl font-bold">
          Preparing for your call
        </h1>
        <p className="mt-2 text-creamsicle-dream/70">
          Fill in what you know. Their name appears in suggested language.
        </p>

        <div className="mt-10">
          <ProspectIntakeForm action={createCall} />
        </div>
      </div>
    </main>
  );
}
