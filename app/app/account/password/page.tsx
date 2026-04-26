import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { ChangePasswordForm } from "./form";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const user = await getCurrentUser({ allowMustChange: true });
  const forced = user.passwordMustChange;

  return (
    <>
      {!forced && (
        <AppHeader>
          <Button href="/calls" variant="ghost" size="sm">
            ← Calls
          </Button>
        </AppHeader>
      )}
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
        <h1 className="font-heading text-3xl font-bold text-twilight-indigo">
          {forced ? "Set a new password" : "Change password"}
        </h1>
        <p className="mt-2 text-twilight-indigo/70">
          {forced
            ? "An admin created your account with a temporary password. Please choose a new one to continue."
            : "Use a password that's at least 8 characters."}
        </p>

        <div className="mt-8 rounded-2xl border border-twilight-indigo/10 bg-white/40 p-6">
          <ChangePasswordForm />
        </div>
      </main>
    </>
  );
}
