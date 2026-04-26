import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/calls");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-twilight-indigo px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-creamsicle-dream">
            Clarity Call Companion
          </h1>
          <p className="mt-2 text-sm text-creamsicle-dream/70">
            Kundalini University · Admissions
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
