"use server";

import { revalidatePath } from "next/cache";
import { eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admissions", "admin"]).default("admissions"),
});

export async function createTeamMember(
  _prev: { error: string | null; success: string | null } | null,
  formData: FormData,
): Promise<{ error: string | null; success: string | null }> {
  await requireAdmin();
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "admissions",
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      success: null,
    };
  }

  // Reject duplicate emails
  const [existing] = await db
    .select({ id: schema.teamMembers.id })
    .from(schema.teamMembers)
    .where(eq(schema.teamMembers.email, parsed.data.email))
    .limit(1);
  if (existing) {
    return { error: "A user with that email already exists.", success: null };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.insert(schema.teamMembers).values({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: parsed.data.role,
    passwordMustChange: true,
  });

  revalidatePath("/settings/team");
  return {
    error: null,
    success: `Created ${parsed.data.email}. They must change the temporary password on first login.`,
  };
}

const resetSchema = z.object({
  userId: z.string().uuid(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function resetTeamPassword(formData: FormData) {
  await requireAdmin();
  const parsed = resetSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db
    .update(schema.teamMembers)
    .set({ passwordHash, passwordMustChange: true })
    .where(eq(schema.teamMembers.id, parsed.data.userId));
  revalidatePath("/settings/team");
}

export async function setTeamMemberRole(formData: FormData) {
  const me = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (role !== "admin" && role !== "admissions") {
    throw new Error("Invalid role");
  }
  if (userId === me.id) {
    throw new Error("You can't change your own role.");
  }
  await db
    .update(schema.teamMembers)
    .set({ role })
    .where(eq(schema.teamMembers.id, userId));
  revalidatePath("/settings/team");
}

export async function deleteTeamMember(userId: string) {
  const me = await requireAdmin();
  if (userId === me.id) {
    throw new Error("You can't delete your own account.");
  }
  // Prevent deleting the last admin
  const admins = await db
    .select({ id: schema.teamMembers.id })
    .from(schema.teamMembers)
    .where(eq(schema.teamMembers.role, "admin"));
  if (admins.length <= 1 && admins.some((a) => a.id === userId)) {
    throw new Error("Can't delete the last admin.");
  }
  await db
    .delete(schema.teamMembers)
    .where(eq(schema.teamMembers.id, userId));
  revalidatePath("/settings/team");
}

export async function listOtherUsers() {
  const me = await requireAdmin();
  return db
    .select({
      id: schema.teamMembers.id,
      name: schema.teamMembers.name,
      email: schema.teamMembers.email,
      role: schema.teamMembers.role,
      passwordMustChange: schema.teamMembers.passwordMustChange,
      createdAt: schema.teamMembers.createdAt,
    })
    .from(schema.teamMembers)
    .where(ne(schema.teamMembers.id, me.id));
}
