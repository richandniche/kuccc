import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getGhlClientOrNull } from "@/lib/ghl/storage";
import { GhlApiError } from "@/lib/ghl/types";

/** GET /api/ghl/contacts?email=foo@bar.com — lookup contact by email. */
export async function GET(req: Request) {
  await getCurrentUser();

  const ghl = await getGhlClientOrNull();
  if (!ghl) {
    return NextResponse.json(
      { error: "GHL is not connected." },
      { status: 400 },
    );
  }

  const email = new URL(req.url).searchParams.get("email")?.trim();
  if (!email) {
    return NextResponse.json(
      { error: "email query param is required" },
      { status: 400 },
    );
  }

  try {
    const contact = await ghl.client.lookupContactByEmail(email);
    return NextResponse.json({ contact });
  } catch (err) {
    const status = err instanceof GhlApiError ? err.status : 502;
    const message =
      err instanceof Error ? err.message : "Failed to look up contact";
    return NextResponse.json({ error: message }, { status });
  }
}
