import Link from "next/link";
import { auth } from "@/auth";
import { UserMenu } from "./UserMenu";

export async function AppHeader({ children }: { children?: React.ReactNode }) {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email ?? null;

  return (
    <header className="border-b border-twilight-indigo/10 bg-creamsicle-dream">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-5">
        <Link
          href="/calls"
          className="font-heading text-2xl font-bold text-twilight-indigo hover:text-midnight-plum"
        >
          Clarity Call Companion
        </Link>
        <div className="flex items-center gap-3">
          {children}
          {name && <UserMenu name={name} />}
        </div>
      </div>
    </header>
  );
}
