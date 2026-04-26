import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getGhlClientOrNull } from "@/lib/ghl/storage";
import { GhlApiError, type GhlAppointment, type GhlContact } from "@/lib/ghl/types";

/**
 * GET /api/ghl/appointments — import booked Clarity Calls from GHL.
 *
 * Query params:
 *  - startTime, endTime (ISO 8601 OR epoch millis). Default: -7d → +60d.
 *  - calendarId (overrides GHL_CALENDAR_ID).
 *  - debug=1 → returns the raw events for inspection.
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();

  const ghl = getGhlClientOrNull();
  if (!ghl) {
    return NextResponse.json(
      { error: "GHL is not configured. Set GHL_LOCATION_ID and GHL_API_KEY in .env.local." },
      { status: 400 },
    );
  }

  const url = new URL(req.url);
  const calendarId = url.searchParams.get("calendarId") ?? ghl.calendarId;
  if (!calendarId) {
    return NextResponse.json(
      { error: "No calendar configured. Set GHL_CALENDAR_ID in .env.local." },
      { status: 400 },
    );
  }

  const now = Date.now();
  // Default to a wider window than the spec's +30d so historical bookings show up too.
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const sixtyDaysAhead = now + 60 * 24 * 60 * 60 * 1000;
  const startTime = url.searchParams.get("startTime") ?? String(sevenDaysAgo);
  const endTime = url.searchParams.get("endTime") ?? String(sixtyDaysAhead);
  const debug = url.searchParams.get("debug") === "1";

  let events: GhlAppointment[];
  try {
    events = await ghl.client.listAppointments({
      calendarId,
      startTime,
      endTime,
    });
  } catch (err) {
    const status = err instanceof GhlApiError ? err.status : 502;
    const message =
      err instanceof Error ? err.message : "Failed to fetch appointments";
    return NextResponse.json({ error: message }, { status });
  }

  if (debug) {
    return NextResponse.json({ count: events.length, events });
  }

  // Filter out cancelled. Treat anything else as bookable.
  const booked = events.filter((e) => {
    const status = (e.appointmentStatus ?? "").toLowerCase();
    return status !== "cancelled" && status !== "noshow";
  });

  if (booked.length === 0) {
    return NextResponse.json({ imported: 0, skipped: 0, total: 0 });
  }

  // Dedupe — find which ghl_appointment_ids we already have
  const ghlIds = booked.map((e) => e.id).filter(Boolean);
  const existing =
    ghlIds.length > 0
      ? await db
          .select({ id: schema.calls.ghlAppointmentId })
          .from(schema.calls)
          .where(inArray(schema.calls.ghlAppointmentId, ghlIds))
      : [];
  const existingSet = new Set(existing.map((r) => r.id).filter(Boolean) as string[]);
  const newOnes = booked.filter((e) => !existingSet.has(e.id));

  // Enrich each appointment with the contact's email/phone via /contacts/{id}.
  // Cache per contactId to avoid duplicate calls when one contact has multiple appointments.
  const contactCache = new Map<string, GhlContact | null>();
  const enriched = await Promise.all(
    newOnes.map(async (appt) => {
      const contactId = appt.contactId ?? appt.contact?.contactId ?? appt.contact?.id ?? null;
      let contact: GhlContact | null = null;
      if (contactId) {
        if (contactCache.has(contactId)) {
          contact = contactCache.get(contactId) ?? null;
        } else {
          contact = await ghl.client.getContact(contactId).catch(() => null);
          contactCache.set(contactId, contact);
        }
      }
      return mapAppointmentToCall(appt, contact, user.id);
    }),
  );

  let imported = 0;
  if (enriched.length > 0) {
    const inserted = await db
      .insert(schema.calls)
      .values(enriched)
      .returning({ id: schema.calls.id });
    imported = inserted.length;
  }

  return NextResponse.json({
    imported,
    skipped: booked.length - imported,
    total: booked.length,
  });
}

function mapAppointmentToCall(
  appt: GhlAppointment,
  contact: GhlContact | null,
  callerId: string,
): typeof schema.calls.$inferInsert {
  const contactId =
    appt.contactId ?? appt.contact?.contactId ?? appt.contact?.id ?? null;

  // Prefer contact name fields; fall back to extracting from title; fall back to title itself.
  const firstName =
    contact?.firstName ?? appt.contact?.firstName ?? appt.firstName ?? "";
  const lastName =
    contact?.lastName ?? appt.contact?.lastName ?? appt.lastName ?? "";
  let prospectName = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (!prospectName) {
    prospectName = contact?.contactName ?? "";
  }
  if (!prospectName && appt.title) {
    // GHL titles look like "First Last - Kundalini University Clarity Call"
    prospectName = appt.title.split(" - ")[0]?.trim() || appt.title;
  }
  if (!prospectName) prospectName = "Imported prospect";

  const email =
    contact?.email ?? appt.contact?.email ?? appt.email ?? null;
  const phone =
    contact?.phone ?? appt.contact?.phone ?? appt.phone ?? null;

  const scheduledFor = appt.startTime ? new Date(appt.startTime) : null;

  return {
    callerId,
    prospectName,
    prospectEmail: email,
    prospectPhone: phone,
    programInterest: "unsure",
    scheduledFor,
    ghlAppointmentId: appt.id,
    ghlContactId: contactId,
  };
}
