import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getGhlConfig, getGhlClientOrNull } from "@/lib/ghl/storage";
import { GhlApiError } from "@/lib/ghl/types";

/**
 * GET /api/ghl/connect
 *
 * Reports current GHL configuration status (read from env vars). Optionally
 * verifies the credentials by listing calendars when ?verify=1 is passed.
 */
export async function GET(req: Request) {
  await getCurrentUser();
  const config = getGhlConfig();
  if (!config) {
    return NextResponse.json({
      connected: false,
      reason:
        "GHL_LOCATION_ID and GHL_API_KEY are not set. Add them to .env.local and restart.",
    });
  }

  const verify = new URL(req.url).searchParams.get("verify") === "1";
  if (!verify) {
    return NextResponse.json({
      connected: true,
      locationId: config.locationId,
      calendarId: config.calendarId,
    });
  }

  // Test the credentials and list available calendars
  const ghl = getGhlClientOrNull();
  if (!ghl) {
    return NextResponse.json({ connected: false }, { status: 500 });
  }
  try {
    const calendars = await ghl.client.listCalendars();
    return NextResponse.json({
      connected: true,
      locationId: config.locationId,
      calendarId: config.calendarId,
      calendars,
    });
  } catch (err) {
    const status = err instanceof GhlApiError ? err.status : 502;
    return NextResponse.json(
      {
        connected: false,
        error: err instanceof Error ? err.message : "Failed to verify GHL",
      },
      { status },
    );
  }
}
