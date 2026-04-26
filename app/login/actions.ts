"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  _prev: { error: string | null } | null,
  formData: FormData,
): Promise<{ error: string | null }> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/calls",
    });
    return { error: null };
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        return { error: "Email or password is incorrect." };
      }
      return { error: "Sign-in failed. Please try again." };
    }
    // signIn() throws a special redirect — let it bubble
    throw err;
  }
}
