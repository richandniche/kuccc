"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schemaZ = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export async function changePasswordAction(
  _prev: { error: string | null; success: boolean } | null,
  formData: FormData,
): Promise<{ error: string | null; success: boolean }> {
  const user = await getCurrentUser({ allowMustChange: true });
  const parsed = schemaZ.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      success: false,
    };
  }
  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return { error: "Current password is incorrect.", success: false };

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db
    .update(schema.teamMembers)
    .set({ passwordHash: newHash, passwordMustChange: false })
    .where(eq(schema.teamMembers.id, user.id));

  revalidatePath("/calls");
  redirect("/calls");
}
