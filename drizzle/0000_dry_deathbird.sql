CREATE TABLE "calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"caller_id" uuid NOT NULL,
	"prospect_name" text NOT NULL,
	"prospect_email" text,
	"prospect_phone" text,
	"program_interest" text DEFAULT 'unsure' NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"outcome" text,
	"recording_url" text,
	"notes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ghl_contact_id" text,
	"ghl_appointment_id" text,
	"ghl_tags_synced" boolean DEFAULT false NOT NULL,
	"follow_up_date" date,
	"follow_up_notes" text,
	"follow_up_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ghl_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" text NOT NULL,
	"api_key" text NOT NULL,
	"calendar_id" text,
	"connected" boolean DEFAULT false NOT NULL,
	"last_sync" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'admissions' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_caller_id_team_members_id_fk" FOREIGN KEY ("caller_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_calls_caller" ON "calls" USING btree ("caller_id");--> statement-breakpoint
CREATE INDEX "idx_calls_created" ON "calls" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_calls_outcome" ON "calls" USING btree ("outcome");