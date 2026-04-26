export interface GhlCalendar {
  id: string;
  name: string;
  isActive?: boolean;
  calendarType?: string;
}

export interface GhlContact {
  id: string;
  firstName?: string;
  lastName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  locationId?: string;
}

export interface GhlAppointmentContact {
  id?: string;
  contactId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface GhlAppointment {
  id: string;
  calendarId?: string;
  contactId?: string;
  contact?: GhlAppointmentContact;
  startTime?: string;
  endTime?: string;
  appointmentStatus?: string;
  title?: string;
  // Some shapes nest contact fields at top level
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class GhlApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "GhlApiError";
  }
}
