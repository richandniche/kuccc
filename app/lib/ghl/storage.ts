import { GhlClient } from "./client";

export interface GhlConfig {
  locationId: string;
  apiKey: string;
  calendarId: string | null;
}

/** Read GHL configuration from environment. Returns null if not fully configured. */
export function getGhlConfig(): GhlConfig | null {
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  const apiKey = process.env.GHL_API_KEY?.trim();
  const calendarId = process.env.GHL_CALENDAR_ID?.trim() || null;
  if (!locationId || !apiKey) return null;
  return { locationId, apiKey, calendarId };
}

export function getGhlClientOrNull(): {
  client: GhlClient;
  calendarId: string | null;
  locationId: string;
} | null {
  const config = getGhlConfig();
  if (!config) return null;
  return {
    client: new GhlClient({
      apiKey: config.apiKey,
      locationId: config.locationId,
    }),
    calendarId: config.calendarId,
    locationId: config.locationId,
  };
}
