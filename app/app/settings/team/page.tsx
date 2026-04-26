import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { CreateUserForm } from "./create-form";
import { TeamRow } from "./team-row";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const me = await requireAdmin();
  const users = await db
    .select({
      id: schema.teamMembers.id,
      name: schema.teamMembers.name,
      email: schema.teamMembers.email,
      role: schema.teamMembers.role,
      passwordMustChange: schema.teamMembers.passwordMustChange,
      createdAt: schema.teamMembers.createdAt,
    })
    .from(schema.teamMembers)
    .orderBy(asc(schema.teamMembers.createdAt));

  return (
    <>
      <AppHeader>
        <Button href="/settings" variant="ghost" size="sm">
          ← Settings
        </Button>
      </AppHeader>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 space-y-8">
        <header>
          <h1 className="font-heading text-3xl font-bold text-twilight-indigo">
            Team
          </h1>
          <p className="mt-1 text-twilight-indigo/70">
            Add admissions team members. New users receive a temporary password
            and must change it on first login.
          </p>
        </header>

        <section className="rounded-2xl border border-twilight-indigo/10 bg-white/40 p-6">
          <h2 className="font-heading text-lg font-bold text-twilight-indigo">
            Add user
          </h2>
          <div className="mt-4">
            <CreateUserForm />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-bold text-twilight-indigo">
            Members ({users.length})
          </h2>
          <ul className="space-y-2">
            {users.map((u) => (
              <TeamRow
                key={u.id}
                user={{
                  ...u,
                  createdAt: formatDate(u.createdAt),
                }}
                isSelf={u.id === me.id}
              />
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
