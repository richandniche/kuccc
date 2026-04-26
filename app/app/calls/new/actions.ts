"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const intakeSchema = z.object({
  prospectName: z.string().trim().min(1, "Name is required").max(120),
  prospectEmail: z
    .string()
    .trim()
    .email("Invalid email")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  prospectPhone: z.string().trim().max(40).optional().or(z.literal("").transform(() => undefined)),
  programInterest: z.enum(["200hr", "300hr", "unsure"]).default("unsure"),
});

export async function createCall(formData: FormData) {
  const user = await getCurrentUser();

  const parsed = intakeSchema.safeParse({
    prospectName: formData.get("prospectName"),
    prospectEmail: formData.get("prospectEmail") || undefined,
    prospectPhone: formData.get("prospectPhone") || undefined,
    programInterest: formData.get("programInterest") || "unsure",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const [row] = await db
    .insert(schema.calls)
    .values({
      callerId: user.id,
      prospectName: parsed.data.prospectName,
      prospectEmail: parsed.data.prospectEmail ?? null,
      prospectPhone: parsed.data.prospectPhone ?? null,
      programInterest: parsed.data.programInterest,
    })
    .returning({ id: schema.calls.id });

  revalidatePath("/calls");
  redirect(`/calls/${row.id}/companion`);
}
