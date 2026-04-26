import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "./db";

/**
 * Returns the signed-in team member, or redirects to /login.
 * Use in server components and server actions.
 */
export async function getCurrentUser(opts?: { allowMustChange?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const [user] = await db
    .select()
    .from(schema.teamMembers)
    .where(eq(schema.teamMembers.id, session.user.id))
    .limit(1);
  if (!user) {
    // Stale session — force re-login
    redirect("/login");
  }
  if (user.passwordMustChange && !opts?.allowMustChange) {
    redirect("/account/password");
  }
  return user;
}

/** Admin-only variant — throws (effectively 403) when called by non-admins. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (user.role !== "admin") {
    redirect("/calls");
  }
  return user;
}
