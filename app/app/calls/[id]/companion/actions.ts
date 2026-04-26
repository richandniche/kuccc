"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const noteSchema = z.object({
  step: z.string(),
  label: z.string(),
  text: z.string(),
  at: z.string(),
});

const completionSchema = z.object({
  outcome: z.enum(["enrolled", "needs_time", "not_a_fit", "no_show"]),
  recordingUrl: z.string().url().nullable(),
  durationSeconds: z.number().int().min(0),
  notes: z.array(noteSchema),
});

export async function completeCall(
  callId: string,
  raw: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();

  const parsed = completionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid completion data",
    };
  }

  const result = await db
    .update(schema.calls)
    .set({
      outcome: parsed.data.outcome,
      recordingUrl: parsed.data.recordingUrl,
      durationSeconds: parsed.data.durationSeconds,
      notes: parsed.data.notes,
      updatedAt: new Date(),
    })
    .where(
      and(eq(schema.calls.id, callId), eq(schema.calls.callerId, user.id)),
    )
    .returning({ id: schema.calls.id });

  if (result.length === 0) {
    return { ok: false, error: "Call not found" };
  }

  revalidatePath("/calls");
  revalidatePath(`/calls/${callId}`);
  return { ok: true };
}
