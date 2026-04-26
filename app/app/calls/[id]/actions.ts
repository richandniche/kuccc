"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function deleteCall(callId: string) {
  const user = await getCurrentUser();
  await db
    .delete(schema.calls)
    .where(and(eq(schema.calls.id, callId), eq(schema.calls.callerId, user.id)));
  revalidatePath("/calls");
  redirect("/calls");
}

const recordingSchema = z.object({
  recordingUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .or(z.literal("").transform(() => null)),
});

export async function updateRecordingUrl(callId: string, formData: FormData) {
  const user = await getCurrentUser();
  const parsed = recordingSchema.safeParse({
    recordingUrl: formData.get("recordingUrl") ?? "",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid URL");
  }
  await db
    .update(schema.calls)
    .set({
      recordingUrl: parsed.data.recordingUrl || null,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.calls.id, callId), eq(schema.calls.callerId, user.id)));
  revalidatePath(`/calls/${callId}`);
}

const followUpSchema = z.object({
  followUpDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .or(z.literal("").transform(() => null)),
  followUpNotes: z.string().trim().max(2000).or(z.literal("").transform(() => "")),
});

export async function updateFollowUp(callId: string, formData: FormData) {
  const user = await getCurrentUser();
  const parsed = followUpSchema.safeParse({
    followUpDate: formData.get("followUpDate") ?? "",
    followUpNotes: formData.get("followUpNotes") ?? "",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  await db
    .update(schema.calls)
    .set({
      followUpDate: parsed.data.followUpDate,
      followUpNotes: parsed.data.followUpNotes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.calls.id, callId), eq(schema.calls.callerId, user.id)));
  revalidatePath(`/calls/${callId}`);
}

export async function markFollowUpSent(callId: string) {
  const user = await getCurrentUser();
  await db
    .update(schema.calls)
    .set({
      followUpCount: sql`${schema.calls.followUpCount} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.calls.id, callId), eq(schema.calls.callerId, user.id)));
  revalidatePath(`/calls/${callId}`);
}
