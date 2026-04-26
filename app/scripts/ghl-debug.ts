import { getGhlConfig } from "../lib/ghl/storage";

async function probe(path: string, query: Record<string, string>) {
  const config = getGhlConfig();
  if (!config) {
    console.error("GHL not configured.");
    process.exit(1);
  }
  const url = new URL("https://services.leadconnectorhq.com" + path);
  for (const [k, v] of Object.entries(query)) {
    url.searchParams.set(k, v);
  }

  console.log(`\n→ ${url.pathname}${url.search}`);
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      Version: "2021-07-28",
      Accept: "application/json",
    },
  });
  console.log(`  status: ${res.status} ${res.statusText}`);
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    console.log("  body:", JSON.stringify(json, null, 2).slice(0, 1500));
  } catch {
    console.log("  body (text):", text.slice(0, 800));
  }
}

async function main() {
  const config = getGhlConfig()!;
  console.log("locationId:", config.locationId);
  console.log("calendarId:", config.calendarId);

  const now = Date.now();
  const past = now - 60 * 24 * 60 * 60 * 1000;
  const future = now + 60 * 24 * 60 * 60 * 1000;

  // 1) ISO strings (what we use)
  await probe("/calendars/events", {
    locationId: config.locationId,
    calendarId: config.calendarId!,
    startTime: new Date(past).toISOString(),
    endTime: new Date(future).toISOString(),
  });

  // 2) Epoch millis
  await probe("/calendars/events", {
    locationId: config.locationId,
    calendarId: config.calendarId!,
    startTime: String(past),
    endTime: String(future),
  });

  // 3) No calendarId (whole location)
  await probe("/calendars/events", {
    locationId: config.locationId,
    startTime: String(past),
    endTime: String(future),
  });

  // 4) groupId path variant
  await probe("/calendars/blocked-slots", {
    locationId: config.locationId,
    calendarId: config.calendarId!,
    startDate: String(past),
    endDate: String(future),
  });

  // 5) verify the calendar itself
  await probe(`/calendars/${config.calendarId}`, {
    locationId: config.locationId,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
