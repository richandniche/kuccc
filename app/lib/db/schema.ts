import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  date,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admissions", "admin"] })
    .notNull()
    .default("admissions"),
  passwordMustChange: boolean("password_must_change").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const calls = pgTable(
  "calls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    callerId: uuid("caller_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),

    prospectName: text("prospect_name").notNull(),
    prospectEmail: text("prospect_email"),
    prospectPhone: text("prospect_phone"),
    programInterest: text("program_interest", {
      enum: ["200hr", "300hr", "unsure"],
    })
      .notNull()
      .default("unsure"),

    /** When the call was scheduled for (e.g., GHL appointment startTime). Null for ad-hoc calls. */
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),

    durationSeconds: integer("duration_seconds").notNull().default(0),
    outcome: text("outcome", {
      enum: ["enrolled", "needs_time", "not_a_fit", "no_show"],
    }),
    recordingUrl: text("recording_url"),

    notes: jsonb("notes").$type<CallNote[]>().notNull().default([]),

    ghlContactId: text("ghl_contact_id"),
    ghlAppointmentId: text("ghl_appointment_id"),
    ghlTagsSynced: boolean("ghl_tags_synced").notNull().default(false),

    followUpDate: date("follow_up_date"),
    followUpNotes: text("follow_up_notes"),
    followUpCount: integer("follow_up_count").notNull().default(0),
  },
  (t) => [
    index("idx_calls_caller").on(t.callerId),
    index("idx_calls_created").on(t.createdAt.desc()),
    index("idx_calls_outcome").on(t.outcome),
  ],
);

export type CallNote = {
  step: string;
  label: string;
  text: string;
  at: string;
};

export type TeamMember = typeof teamMembers.$inferSelect;
export type Call = typeof calls.$inferSelect;
export type NewCall = typeof calls.$inferInsert;
