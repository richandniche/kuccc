import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getGhlClientOrNull } from "@/lib/ghl/storage";
import { GhlApiError } from "@/lib/ghl/types";
import { OUTCOME_TAGS } from "@/lib/ghl/client";

const tagsSchema = z.object({
  callId: z.string().uuid(),
  // contactId optional — we'll fall back to the call row's stored ghl_contact_id
  contactId: z.string().trim().min(1).optional(),
  outcome: z.enum(["enrolled", "needs_time", "not_a_fit", "no_show"]),
});

/** POST /api/ghl/tags — sync the outcome tag to the GHL contact. */
export async function POST(req: Request) {
  const user = await getCurrentUser();

  const ghl = await getGhlClientOrNull();
  if (!ghl) {
    return NextResponse.json(
      { error: "GHL is not connected." },
      { status: 400 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = tagsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { callId, outcome } = parsed.data;
  let contactId = parsed.data.contactId ?? null;

  // Confirm call belongs to current user and pull contact id if needed
  const [call] = await db
    .select({
      id: schema.calls.id,
      ghlContactId: schema.calls.ghlContactId,
      prospectEmail: schema.calls.prospectEmail,
    })
    .from(schema.calls)
    .where(and(eq(schema.calls.id, callId), eq(schema.calls.callerId, user.id)))
    .limit(1);

  if (!call) {
    return NextResponse.json({ error: "Call not found" }, { status: 404 });
  }

  contactId ??= call.ghlContactId ?? null;

  // If we still don't have a contactId, try email lookup
  if (!contactId && call.prospectEmail) {
    try {
      const contact = await ghl.client.lookupContactByEmail(call.prospectEmail);
      contactId = contact?.id ?? null;
      if (contactId) {
        await db
          .update(schema.calls)
          .set({ ghlContactId: contactId, updatedAt: new Date() })
          .where(eq(schema.calls.id, callId));
      }
    } catch (err) {
      const status = err instanceof GhlApiError ? err.status : 502;
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Failed to lookup contact",
        },
        { status },
      );
    }
  }

  if (!contactId) {
    return NextResponse.json(
      { error: "No GHL contact found for this call (no email match)." },
      { status: 404 },
    );
  }

  const tag = OUTCOME_TAGS[outcome];
  if (!tag) {
    return NextResponse.json({ error: "Unknown outcome" }, { status: 400 });
  }

  try {
    await ghl.client.addContactTags(contactId, [tag]);
  } catch (err) {
    const status = err instanceof GhlApiError ? err.status : 502;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add tag" },
      { status },
    );
  }

  await db
    .update(schema.calls)
    .set({ ghlTagsSynced: true, updatedAt: new Date() })
    .where(eq(schema.calls.id, callId));

  return NextResponse.json({ ok: true, contactId, tag });
}
