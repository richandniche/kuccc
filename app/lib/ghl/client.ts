import {
  GhlApiError,
  type GhlAppointment,
  type GhlCalendar,
  type GhlContact,
} from "./types";

const BASE_URL = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";

export interface GhlClientOptions {
  apiKey: string;
  locationId: string;
}

export class GhlClient {
  constructor(private opts: GhlClientOptions) {}

  private async request<T>(
    path: string,
    init?: RequestInit & { query?: Record<string, string | number | undefined> },
  ): Promise<T> {
    const url = new URL(BASE_URL + path);
    if (init?.query) {
      for (const [k, v] of Object.entries(init.query)) {
        if (v !== undefined && v !== null && v !== "") {
          url.searchParams.set(k, String(v));
        }
      }
    }

    const res = await fetch(url.toString(), {
      ...init,
      headers: {
        Authorization: `Bearer ${this.opts.apiKey}`,
        Version: VERSION,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = await res.text().catch(() => undefined);
      }
      const message =
        (typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof (body as { message?: unknown }).message === "string"
          ? (body as { message: string }).message
          : null) ??
        `GHL API error: ${res.status} ${res.statusText}`;
      throw new GhlApiError(res.status, message, body);
    }

    return (await res.json()) as T;
  }

  /** GET /calendars/?locationId=… — returns active calendars for the location. */
  async listCalendars(): Promise<GhlCalendar[]> {
    const data = await this.request<{ calendars: GhlCalendar[] }>(
      `/calendars/`,
      { query: { locationId: this.opts.locationId } },
    );
    return data.calendars ?? [];
  }

  /**
   * GET /calendars/events?locationId=&calendarId=&startTime=&endTime=
   *
   * NOTE: GHL expects epoch *milliseconds* (as strings) for startTime/endTime.
   * ISO 8601 strings silently return an empty events array.
   */
  async listAppointments(params: {
    calendarId: string;
    startTime: string | Date | number; // accepts ISO/Date/millis — coerced to millis
    endTime: string | Date | number;
  }): Promise<GhlAppointment[]> {
    const startMs = toEpochMillis(params.startTime);
    const endMs = toEpochMillis(params.endTime);
    const data = await this.request<{ events: GhlAppointment[] }>(
      `/calendars/events`,
      {
        query: {
          locationId: this.opts.locationId,
          calendarId: params.calendarId,
          startTime: String(startMs),
          endTime: String(endMs),
        },
      },
    );
    return data.events ?? [];
  }

  /** GET /contacts/lookup?locationId=&email=  */
  async lookupContactByEmail(email: string): Promise<GhlContact | null> {
    try {
      const data = await this.request<{ contacts: GhlContact[] }>(
        `/contacts/lookup`,
        { query: { locationId: this.opts.locationId, email } },
      );
      return data.contacts?.[0] ?? null;
    } catch (err) {
      if (err instanceof GhlApiError && err.status === 404) return null;
      throw err;
    }
  }

  /** GET /contacts/{contactId} */
  async getContact(contactId: string): Promise<GhlContact | null> {
    try {
      const data = await this.request<{ contact: GhlContact }>(
        `/contacts/${encodeURIComponent(contactId)}`,
      );
      return data.contact ?? null;
    } catch (err) {
      if (err instanceof GhlApiError && err.status === 404) return null;
      throw err;
    }
  }

  /** POST /contacts/{contactId}/tags  body: { tags: [...] } */
  async addContactTags(contactId: string, tags: string[]): Promise<void> {
    await this.request<unknown>(
      `/contacts/${encodeURIComponent(contactId)}/tags`,
      {
        method: "POST",
        body: JSON.stringify({ tags }),
      },
    );
  }
}

function toEpochMillis(value: string | Date | number): number {
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  // numeric string?
  if (/^\d+$/.test(value)) return Number(value);
  return new Date(value).getTime();
}

/** Outcome → GHL tag mapping (spec §9.5). */
export const OUTCOME_TAGS: Record<string, string> = {
  enrolled: "Clarity Call ~ Enrolled",
  needs_time: "Clarity Call ~ Show",
  not_a_fit: "Clarity Call ~ Show",
  no_show: "Clarity Call ~ No Show",
};
