ALTER TABLE "calls" ADD COLUMN "scheduled_for" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "password_must_change" boolean DEFAULT false NOT NULL;