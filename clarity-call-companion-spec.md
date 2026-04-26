# Clarity Call Companion — Production Build Specification

## For Claude Code · Kundalini University · April 2026

---

## 1. What This Is

A real-time sales conversation guide for Kundalini University's admissions team. It guides a non-expert salesperson through a warm, pressure-free Clarity Call using a branching decision tree, suggested language, coaching tips, objection handling, inline note-taking, call logging, recording links, a built-in sales reference guide, and GoHighLevel CRM integration.

**Philosophy:** This is not a closing tool. It is a framework for a warm, honest conversation between two people ~ one who has been searching, and one who can show them the door.

**Primary user:** Camilla (sales/admissions). Single user initially, but build for multi-user from the start.

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14+ (App Router) | React-based, SSR, API routes, Vercel deployment |
| Styling | Tailwind CSS | Utility-first, maps to KU brand tokens |
| Database | Supabase (Postgres) | Auth, real-time, row-level security, free tier |
| Auth | Supabase Auth | Email/password for team members |
| Hosting | Vercel | Zero-config Next.js deployment |
| State | React state + SWR or React Query | Client-side call companion, server-synced call log |
| GHL Integration | Next.js API routes (server-side proxy) | Keeps API key on server, CORS-safe |

---

## 3. Database Schema

### 3.1 `team_members`

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admissions' CHECK (role IN ('admissions', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: users can only read their own row; admins can read all
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
```

### 3.2 `calls`

```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Who made the call
  caller_id UUID REFERENCES team_members(id) NOT NULL,
  
  -- Prospect info
  prospect_name TEXT NOT NULL,
  prospect_email TEXT,
  prospect_phone TEXT,
  program_interest TEXT CHECK (program_interest IN ('200hr', '300hr', 'unsure')) DEFAULT 'unsure',
  
  -- Call data
  duration_seconds INTEGER DEFAULT 0,
  outcome TEXT CHECK (outcome IN ('enrolled', 'needs_time', 'not_a_fit', 'no_show')),
  recording_url TEXT,
  
  -- Notes stored as JSONB array: [{ step: "disc_pain", label: "Explore what's not working.", text: "She mentioned..." }]
  notes JSONB DEFAULT '[]'::jsonb,
  
  -- GHL integration
  ghl_contact_id TEXT,
  ghl_appointment_id TEXT,
  ghl_tags_synced BOOLEAN DEFAULT false,
  
  -- Follow-up tracking
  follow_up_date DATE,
  follow_up_notes TEXT,
  follow_up_count INTEGER DEFAULT 0
);

-- RLS: users see only their own calls; admins see all
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own calls" ON calls
  FOR ALL USING (caller_id = auth.uid());

-- Index for common queries
CREATE INDEX idx_calls_caller ON calls(caller_id);
CREATE INDEX idx_calls_created ON calls(created_at DESC);
CREATE INDEX idx_calls_outcome ON calls(outcome);
```

### 3.3 `ghl_settings`

```sql
CREATE TABLE ghl_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL,
  api_key TEXT NOT NULL, -- encrypted at rest
  calendar_id TEXT, -- specific calendar for Clarity Calls
  connected BOOLEAN DEFAULT false,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Single row table (one GHL connection per instance)
-- RLS: admins only
ALTER TABLE ghl_settings ENABLE ROW LEVEL SECURITY;
```

---

## 4. Project Structure

```
clarity-call-companion/
├── app/
│   ├── layout.tsx                 # Root layout with fonts, metadata
│   ├── page.tsx                   # Redirect to /calls
│   ├── login/
│   │   └── page.tsx               # Auth login page
│   ├── calls/
│   │   ├── page.tsx               # Call log (home screen)
│   │   ├── new/
│   │   │   └── page.tsx           # Pre-call prep / intake
│   │   └── [id]/
│   │       ├── page.tsx           # Call review
│   │       └── companion/
│   │           └── page.tsx       # Active call companion
│   ├── guide/
│   │   └── page.tsx               # Full-page sales guide
│   ├── settings/
│   │   └── page.tsx               # GHL settings
│   └── api/
│       ├── calls/
│       │   ├── route.ts           # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts       # GET, PATCH, DELETE
│       ├── ghl/
│       │   ├── connect/
│       │   │   └── route.ts       # POST: test connection, save settings
│       │   ├── appointments/
│       │   │   └── route.ts       # GET: import booked calls from GHL
│       │   ├── contacts/
│       │   │   └── route.ts       # GET: lookup contact by email
│       │   └── tags/
│       │       └── route.ts       # POST: sync show/no-show tags
│       └── auth/
│           └── route.ts           # Auth helpers
├── components/
│   ├── ui/                        # Shared UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Label.tsx
│   ├── layout/
│   │   ├── Header.tsx             # App header with nav
│   │   └── Sidebar.tsx            # Slide-out sidebar (notes, guide)
│   ├── calls/
│   │   ├── CallList.tsx           # Call log list
│   │   ├── CallCard.tsx           # Individual call row
│   │   ├── CallReview.tsx         # Review view
│   │   ├── ProspectForm.tsx       # Intake form
│   │   └── OutcomeSelector.tsx    # End-of-call outcome buttons
│   ├── companion/
│   │   ├── CompanionShell.tsx     # Main companion layout
│   │   ├── PhaseTabs.tsx          # Welcome/Discovery/Present/Objections/Close tabs
│   │   ├── StepView.tsx           # Current step: prompt, say, tip, followups
│   │   ├── SayBox.tsx             # Suggested language display
│   │   ├── TipBox.tsx             # Coaching tip display
│   │   ├── FollowupButtons.tsx    # Navigation buttons
│   │   ├── NoteInput.tsx          # Quick note field
│   │   ├── NotesSidebar.tsx       # All notes panel
│   │   ├── PricingRef.tsx         # Pricing toggle cards
│   │   ├── CallTimer.tsx          # Timer display + controls
│   │   └── CallComplete.tsx       # End screen with outcome + recording
│   └── guide/
│       ├── GuideShell.tsx         # Guide layout with tabs
│       ├── LanguageGuide.tsx      # Say this / not that
│       ├── ObjectionFramework.tsx # 4-step pattern
│       ├── ProgramReference.tsx   # 200hr + 300hr cards
│       ├── FollowUpCadence.tsx    # Post-call cadence
│       └── ProspectAvatar.tsx     # Maren profile
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server Supabase client
│   │   └── middleware.ts          # Auth middleware
│   ├── ghl/
│   │   ├── client.ts              # GHL API wrapper
│   │   └── types.ts               # GHL response types
│   ├── conversation-tree.ts       # TREE constant + types
│   ├── constants.ts               # PHASES, PRICING, PROGRAM_LABELS, OUTCOME_STYLES
│   └── utils.ts                   # formatSeconds, formatDate, formatTime
├── hooks/
│   ├── useTimer.ts                # Call timer hook
│   ├── useCalls.ts                # SWR hook for call log
│   └── useCompanion.ts            # Companion state machine
├── types/
│   └── index.ts                   # TypeScript types
├── tailwind.config.ts             # KU brand tokens
├── .env.local                     # Supabase + GHL keys
└── middleware.ts                  # Auth redirect
```

---

## 5. Screens + Requirements

### 5.1 Login (`/login`)

Simple email/password login via Supabase Auth. KU-branded. No public registration — team members are added by admin.

### 5.2 Call Log — Home (`/calls`)

**This is the main screen.**

- Header: app title, "Sales Guide" button, "GHL" button (with green dot if connected), "+ New Call" button
- GHL settings panel (collapsible, in header area) — API key, location ID, connect/disconnect, import booked calls
- Call count
- List of past calls, sorted by date descending, showing:
  - Prospect name (large, bold)
  - Outcome badge (Enrolled / Needs Time / Not a Fit / No Show) with colour coding
  - Date, time, duration, program interest
  - Click anywhere on row → opens call review
- Empty state with "Start First Call" CTA

### 5.3 Pre-Call Prep (`/calls/new`)

Dark background (Twilight Indigo). This is NOT a login — it's part of the sales workflow.

- "← Calls" back button
- Heading: "Preparing for your call"
- Subtext: "Fill in what you know. Their name appears in suggested language."
- Fields:
  - Name (required) *
  - Email (optional)
  - Phone (optional)
  - Program Interest: 200-Hour / 300-Hour / Not sure yet (toggle buttons)
- "Begin Call" button (disabled until name is filled)
- On submit: creates call record in DB with status "in_progress", navigates to companion

### 5.4 Active Call Companion (`/calls/[id]/companion`)

**The core of the app.** Must be fast and distraction-free.

**Header:**
- ← back button (with confirmation prompt: "Leave call? Unsaved notes will be lost.")
- "Clarity Call" title
- Prospect name pill (amber background)
- Timer: start/pause toggle + MM:SS display (monospace, 24px+)
- "Guide" button → opens sales guide sidebar
- "Notes" button → opens notes sidebar (with count badge)

**Phase Tabs:**
- Welcome (✦ sage), Discovery (◈ amber), Present (◉ mauve), Objections (◆ red), Close (✧ plum)
- Non-linear: user can jump to any phase tab at any time
- Active tab highlighted with bottom border in phase colour

**Step Content (main area):**
- Phase badge (coloured pill)
- Back button (if history > 1)
- Prompt heading (Quattrocento, 26px, bold)
- Say Box (if step has `say`): sage left border, suggested language at 19px, with [Name] replaced by prospect's first name
- Tip Box (if step has `tip`): amber left border, coaching tip at 17px
- Pricing Reference (if step has `pricingRef`): toggle buttons for 200hr / 300hr pricing cards
- Followup Buttons: full-width, stacked vertically, accent buttons in dark, hover darkens
- Note Input: text field with Enter-to-save, shows saved notes for current step below

**Call Complete (when step `close_end` is reached):**
- ✦ icon + "Call Complete" heading
- Prospect info card
- Timer display (large)
- Recording URL input field
- Outcome selector: 4 buttons (Enrolled, Needs Time, Not a Fit, No Show)
- On outcome click: saves call to DB, navigates to call log
- Notes summary with "Copy All" button

**Sidebars (slide from right, absolute positioned):**
- Guide Sidebar: tabbed (Language, Objections, Programs, Follow-Up, Prospect) with full guide content
- Notes Sidebar: all notes taken during call, "Copy All Notes" button

### 5.5 Call Review (`/calls/[id]`)

- "← Calls" back button
- Prospect card: name, email, phone, outcome badge
- Stats grid: date, duration, program
- Recording section: display link if present, "+ Add recording link" if not, "Edit" button
- GHL section (if connected): "Sync Tags" button, "View in GHL" button
- Notes section: all notes from the call, "Copy All Notes" button
- Delete button (with confirmation)

### 5.6 Sales Guide (`/guide`)

Full-page version of the guide with tab navigation:

**Language tab:**
- "Say This, Not That" table: two columns, red strikethrough on left, green on right
- Trust Words list
- Words to Avoid list

**Objections tab:**
- The Four-Step Pattern: Validate → Clarify → Reframe → Invite (numbered steps with descriptions)
- Callout: "Every objection is a request for safety."

**Programs tab:**
- Kundalini Foundations 200hr reference card (all details)
- Radical Expansions 300hr reference card (all details)

**Follow-Up tab:**
- Post-call cadence: Day 1, Day 5-7, Day 14, Day 21-28
- Callout: "Three follow-ups maximum."

**Prospect tab:**
- Maren avatar card (name, age, role, location, situation)
- "She Tells Herself" list
- "She Secretly Wants" list
- Callout: "Trigger RECOGNITION."

### 5.7 Settings (`/settings`)

- GHL connection management
- Team member management (admin only)

---

## 6. Complete Conversation Tree

This is the full branching logic. Store as a TypeScript constant.

```typescript
// types/index.ts

export interface TreeStep {
  phase: 'intro' | 'discovery' | 'present' | 'objections' | 'closing';
  prompt: string;
  say: string | null;
  tip: string;
  followups: Followup[];
  pricingRef?: boolean;
  isEnd?: boolean;
}

export interface Followup {
  label: string;
  next: string;
  accent?: boolean;
  icon?: string;
}

export type ConversationTree = Record<string, TreeStep>;
```

**The complete tree data (copy this exactly into `lib/conversation-tree.ts`):**

```typescript
export const TREE: ConversationTree = {
  welcome: {
    phase: "intro",
    prompt: "Open with warmth. Set the tone.",
    say: "Hi [Name], it's so lovely to meet you. Thank you for taking the time to connect with us.\n\nBefore we dive in, I just want you to know ~ this is really just a conversation. There is no pressure here. I'm here to learn about you, share what we offer, and help you figure out if this is the right fit.\n\nSound good?",
    tip: "Match their energy. If nervous, slow down. If eager, lean in.",
    followups: [
      { label: "They seem relaxed", next: "opening_q" },
      { label: "They seem nervous", next: "ease_nerves" }
    ]
  },
  ease_nerves: {
    phase: "intro",
    prompt: "They seem nervous. Slow down.",
    say: "I can tell you're being really thoughtful about this, and I love that. Honestly, think of this as two people having a conversation over tea ~ no agenda, no pitch. I'm just genuinely curious about your story.",
    tip: "Let the silence breathe. Don't rush to fill it.",
    followups: [{ label: "Continue to opening question", next: "opening_q" }]
  },
  opening_q: {
    phase: "intro",
    prompt: "The most important question of the call.",
    say: "So, tell me a little about yourself. What brought you to Kundalini University?",
    tip: "LISTEN. This answer tells you everything. Note what they've tried, what's missing, what they hope for, what they fear.",
    followups: [
      { label: "They have yoga background", next: "discovery" },
      { label: "They're new to yoga", next: "discovery" },
      { label: "They found Guru Singh online", next: "discovery" }
    ]
  },
  discovery: {
    phase: "discovery",
    prompt: "Choose 3~5 questions. This is where 80% of the work happens.",
    say: null,
    tip: "The more THEY talk, the better. Use silence. Mirror their language.",
    followups: [
      { label: "Ask about background", next: "disc_background" },
      { label: "Ask about current practice", next: "disc_current" },
      { label: "Ask about pain / frustration", next: "disc_pain" },
      { label: "Ask about vision / desire", next: "disc_desire" },
      { label: "Ask about concerns", next: "disc_concerns" },
      { label: "→ Ready to present", next: "present", accent: true }
    ]
  },
  disc_background: {
    phase: "discovery",
    prompt: "Understanding their path so far.",
    say: "Tell me about your yoga or spiritual background. Where have you been so far on this path?",
    tip: "Listen for: how long, what modalities, whether they teach.",
    followups: [
      { label: "Experienced teacher", next: "disc_teacher_deeper" },
      { label: "Tried many things", next: "disc_tried_many" },
      { label: "Relatively new", next: "disc_new" },
      { label: "← Back", next: "discovery" }
    ]
  },
  disc_teacher_deeper: {
    phase: "discovery",
    prompt: "They already teach. Go deeper.",
    say: "That's wonderful. How is your teaching going? Do you feel like you're teaching from a place that feels authentically yours, or are you still working from someone else's framework?",
    tip: "If they're 'going through the motions,' bridge to Radical Expansions.",
    followups: [
      { label: "Stuck in teaching", next: "disc_pain" },
      { label: "Want to add Kundalini", next: "disc_desire" },
      { label: "← Back", next: "discovery" }
    ]
  },
  disc_tried_many: {
    phase: "discovery",
    prompt: "Accumulated experiences without depth.",
    say: "It sounds like you've explored a lot. What has been the most meaningful experience so far ~ and what was missing from it?",
    tip: "Listen for: 'temporary,' 'faded,' 'no community,' 'no depth.'",
    followups: [
      { label: "Retreats fading", next: "disc_pain" },
      { label: "Missing community", next: "disc_desire" },
      { label: "← Back", next: "discovery" }
    ]
  },
  disc_new: {
    phase: "discovery",
    prompt: "They're newer to this world.",
    say: "What drew you to Kundalini specifically? Was there a moment or a piece of content that caught your attention?",
    tip: "If they mention Guru Singh, lean into that.",
    followups: [
      { label: "They found Guru Singh", next: "disc_guru_singh" },
      { label: "Curious about Kundalini", next: "disc_desire" },
      { label: "← Back", next: "discovery" }
    ]
  },
  disc_guru_singh: {
    phase: "discovery",
    prompt: "Guru Singh drew them in.",
    say: "I love that. What was it about him that resonated? There's something about his presence that people feel even through a screen.",
    tip: "Let them describe it. Mirror it back later.",
    followups: [{ label: "← Back", next: "discovery" }]
  },
  disc_current: {
    phase: "discovery",
    prompt: "Their current life + practice.",
    say: "What does your practice look like right now? Is there a daily rhythm, or is it more occasional?",
    tip: "No judgment. Normalise inconsistency.",
    followups: [
      { label: "Daily practice", next: "disc_daily_deeper" },
      { label: "Inconsistent", next: "disc_inconsistent" },
      { label: "← Back", next: "discovery" }
    ]
  },
  disc_daily_deeper: {
    phase: "discovery",
    prompt: "They have structure. Explore depth.",
    say: "That's beautiful. Does it feel like it's taking you where you want to go ~ or do you sense there's a deeper layer waiting?",
    tip: "Consistent practitioners often feel the ceiling.",
    followups: [{ label: "← Back", next: "discovery" }]
  },
  disc_inconsistent: {
    phase: "discovery",
    prompt: "Practice is inconsistent.",
    say: "That's really honest. When you DO practise, what does it feel like? And what gets in the way?",
    tip: "Don't prescribe. Listen for the real block.",
    followups: [{ label: "← Back", next: "discovery" }]
  },
  disc_pain: {
    phase: "discovery",
    prompt: "Explore what's not working.",
    say: "What have you tried before that didn't quite land the way you hoped?",
    tip: "Listen for: surface seeking, credentials without confidence, isolation.",
    followups: [
      { label: "Stuck / plateaued", next: "disc_pain_stuck" },
      { label: "Scattered", next: "disc_pain_scattered" },
      { label: "← Back", next: "discovery" }
    ]
  },
  disc_pain_stuck: {
    phase: "discovery",
    prompt: "They feel stuck. Go deeper.",
    say: "When you say 'stuck' ~ can you describe what that feels like day-to-day?",
    tip: "Their specific language is what you mirror back later.",
    followups: [{ label: "← Back", next: "discovery" }]
  },
  disc_pain_scattered: {
    phase: "discovery",
    prompt: "Scattered across modalities.",
    say: "Is there something you keep circling back to ~ a feeling or question that won't resolve?",
    tip: "This often leads to 'I'm tired of seeking.'",
    followups: [{ label: "← Back", next: "discovery" }]
  },
  disc_desire: {
    phase: "discovery",
    prompt: "Explore what they want.",
    say: "If this training gave you exactly what you needed, what would your life look like in a year?",
    tip: "Let them paint the picture. Use their words when presenting.",
    followups: [
      { label: "Want to teach", next: "disc_desire_teach" },
      { label: "Want personal depth", next: "disc_desire_depth" },
      { label: "← Back", next: "discovery" }
    ]
  },
  disc_desire_teach: {
    phase: "discovery",
    prompt: "They want to teach.",
    say: "What does teaching mean to you? Career, or something deeper ~ like having something real to offer?",
    tip: "Most who want to 'teach' actually want to transmit.",
    followups: [{ label: "← Back", next: "discovery" }]
  },
  disc_desire_depth: {
    phase: "discovery",
    prompt: "Personal transformation, not teaching.",
    say: "That's really what this training is at its core ~ personal transformation. The certification is a byproduct.",
    tip: "Free them from the training = career assumption.",
    followups: [{ label: "← Back", next: "discovery" }]
  },
  disc_concerns: {
    phase: "discovery",
    prompt: "Surface fears before presenting.",
    say: "Is there anything giving you pause? I'd rather we talk about it now.",
    tip: "Address what they name BEFORE the invitation.",
    followups: [
      { label: "Price", next: "obj_investment" },
      { label: "Time", next: "obj_time" },
      { label: "Lineage", next: "obj_lineage" },
      { label: "Online", next: "obj_online" },
      { label: "Too intense", next: "obj_vocabulary" },
      { label: "Guru Singh's age", next: "obj_continuity" },
      { label: "Already certified", next: "obj_credentials" },
      { label: "No concerns", next: "discovery" }
    ]
  },
  present: {
    phase: "present",
    prompt: "Bridge from discovery. Use THEIR words.",
    say: "From what you've shared, it sounds like you've done a tremendous amount of inner work ~ and what you're really looking for now is not more information, but a practice and a teacher that can take you deeper.\n\nIs that right?",
    tip: "Wait for confirmation. This is the moment of recognition.",
    followups: [
      { label: "Yes ~ they confirm", next: "present_program" },
      { label: "Not quite ~ clarify", next: "present_clarify" }
    ]
  },
  present_clarify: {
    phase: "present",
    prompt: "Didn't fully resonate. Adjust.",
    say: "Help me understand better ~ what would the ideal next step look like for you?",
    tip: "Let them correct you. This builds trust.",
    followups: [{ label: "Try again", next: "present_program" }]
  },
  present_program: {
    phase: "present",
    prompt: "Introduce the program. 60~90 seconds.",
    say: "That's exactly what Kundalini Foundations was built for. It's a six-month immersion with Guru Singh live, twice a week, through 22 modules.\n\nBut the real transformation isn't the curriculum ~ it's the container. Showing up consistently with a living teacher and a community that holds you accountable.",
    tip: "Choose 2~3 features connected to what they said.",
    followups: [
      { label: "Emphasise Guru Singh", next: "present_guru" },
      { label: "Emphasise community", next: "present_community" },
      { label: "Emphasise flexibility", next: "present_flexibility" },
      { label: "→ Check in", next: "present_check", accent: true }
    ]
  },
  present_guru: {
    phase: "present",
    prompt: "Nobody else has Guru Singh.",
    say: "The thing that sets this apart is Guru Singh himself. 81 years old, over fifty years of practice.\n\nWhen you sit with him, even on Zoom, you feel the transmission. The window to learn from him directly is open right now.",
    tip: "This is fact, not urgency as tactic.",
    followups: [{ label: "→ Check in", next: "present_check", accent: true }]
  },
  present_community: {
    phase: "present",
    prompt: "They mentioned isolation.",
    say: "You're not watching lectures ~ you're in practice pods, sharing circles, a private community where people show up for each other.\n\nFor many, it's the first time their spiritual life has felt held by a real group.",
    tip: "Use if they mentioned isolation or fading community.",
    followups: [{ label: "→ Check in", next: "present_check", accent: true }]
  },
  present_flexibility: {
    phase: "present",
    prompt: "Worried about fitting it in.",
    say: "One live call per week ~ Wednesday evening or Saturday morning. Everything recorded with lifetime replay. Students include single parents, freelancers, all time zones.",
    tip: "Normalise. Don't minimise.",
    followups: [{ label: "→ Check in", next: "present_check", accent: true }]
  },
  present_check: {
    phase: "present",
    prompt: "Check in before the invitation.",
    say: "How does that land for you? Does this feel like what you've been looking for?",
    tip: "Not a trial close. A genuine question.",
    followups: [
      { label: "Yes ~ resonating", next: "close", accent: true },
      { label: "Concerns", next: "obj_menu" },
      { label: "Unsure", next: "present_unsure" }
    ]
  },
  present_unsure: {
    phase: "present",
    prompt: "On the fence. Don't push.",
    say: "I can feel you thinking about it, and that's a good sign. What specifically is on your mind?",
    tip: "Silence. Let them name it.",
    followups: [
      { label: "They name a concern", next: "obj_menu" },
      { label: "Need time", next: "close_needs_time" }
    ]
  },
  obj_menu: {
    phase: "objections",
    prompt: "What concern are they raising?",
    say: null,
    tip: "Validate → Clarify → Reframe → Invite. Never argue.",
    followups: [
      { label: "Lineage — Safety + Integrity", next: "obj_lineage", icon: "★" },
      { label: "Online — Transmission?", next: "obj_online", icon: "★" },
      { label: "Credentials — Starting Over?", next: "obj_credentials" },
      { label: "Vocabulary — Too Esoteric?", next: "obj_vocabulary" },
      { label: "Guru Singh's Age", next: "obj_continuity" },
      { label: "Investment — Disappointment", next: "obj_investment", icon: "★" },
      { label: "Time — Constraints", next: "obj_time", icon: "★" },
      { label: "Quiet — Nothing Changes?", next: "obj_quiet" }
    ]
  },
  obj_lineage: {
    phase: "objections",
    prompt: "Yogi Bhajan or community safety.",
    say: "Thank you for raising that. We welcome it.\n\nKU is built around Guru Singh's living lineage, not any single historical figure. No affiliation to 3HO. His teaching stands on its own ~ rooted in integrity, compassion, and transparency.",
    tip: "Zero defensiveness. Head-on with warmth.",
    followups: [
      { label: "Reassured", next: "present_check" },
      { label: "Want a graduate", next: "close_needs_time" },
      { label: "← Back", next: "obj_menu" }
    ]
  },
  obj_online: {
    phase: "objections",
    prompt: "Can online deliver depth?",
    say: "You're not watching recordings. You're live with Guru Singh, twice a week, for six months. You can ask questions, be seen, practise in real time.\n\nGraduates say it was more connected than in-person trainings — because of the consistency.",
    tip: "Sell the sustained relationship, not the platform.",
    followups: [
      { label: "Resonates", next: "present_check" },
      { label: "Want a clip", next: "close_needs_time" },
      { label: "← Back", next: "obj_menu" }
    ]
  },
  obj_credentials: {
    phase: "objections",
    prompt: "Already have 200hr.",
    say: "You're not starting over. Where your 200hr gave you the foundation, this gives you the depth ~ emotional intelligence, subtle anatomy, Krya science, your own voice.\n\nGraduates say this is where they stopped teaching from someone else's playbook.",
    tip: "Mirror their words back.",
    followups: [
      { label: "Reframed", next: "present_check" },
      { label: "← Back", next: "obj_menu" }
    ]
  },
  obj_vocabulary: {
    phase: "objections",
    prompt: "Overwhelmed by language.",
    say: "Guru Singh is probably the least esoteric Kundalini teacher you'll encounter. Warm, grounded, practical, often funny.\n\nYou won't be expected to arrive knowing any of it ~ that's what the training is for.",
    tip: "Normalise. Don't make them feel ignorant.",
    followups: [
      { label: "Eased", next: "present_check" },
      { label: "← Back", next: "obj_menu" }
    ]
  },
  obj_continuity: {
    phase: "objections",
    prompt: "What happens long-term.",
    say: "Your Yoga Alliance certification stands on its own for life.\n\nGuru Singh is actively building a community to carry the teachings forward. His vitality at 81 is a rare window, not a risk.",
    tip: "This shows deep investment. Honour it.",
    followups: [
      { label: "Reframed", next: "present_check" },
      { label: "← Back", next: "obj_menu" }
    ]
  },
  obj_investment: {
    phase: "objections",
    prompt: "Financial concern.",
    say: "It is a meaningful investment. Many students spent thousands on retreats that gave a weekend of transformation but no lasting container.\n\nThis is six months of sustained practice with a living teacher and lifetime access. For many graduates, it's the investment that made all the others finally make sense.",
    tip: "Never diminish or apologise for the price.",
    pricingRef: true,
    followups: [
      { label: "Payment plan helps", next: "close", accent: true },
      { label: "Still too much", next: "obj_investment_firm" },
      { label: "← Back", next: "obj_menu" }
    ]
  },
  obj_investment_firm: {
    phase: "objections",
    prompt: "Genuinely a barrier.",
    say: "I completely understand. The training runs every year, and you'll always be welcome.",
    tip: "No additional discounts. Warmth.",
    followups: [{ label: "→ Close warmly", next: "close_needs_time", accent: true }]
  },
  obj_time: {
    phase: "objections",
    prompt: "Fitting it into life.",
    say: "One live call per week. Wednesday evening or Saturday morning. Everything recorded with lifetime replay.\n\nWhat our busiest students say: the practice becomes the thing that makes everything else work.",
    tip: "Acknowledge THEIR specific constraints.",
    followups: [
      { label: "Eased", next: "present_check" },
      { label: "← Back", next: "obj_menu" }
    ]
  },
  obj_quiet: {
    phase: "objections",
    prompt: "Deeper hesitation: 'What if nothing changes?'",
    say: "Almost every student carries a version of this question. The people who carry it transform the most ~ because they're not looking for a quick fix.\n\nThe training asks you to remember the sovereignty you were born with ~ and build a practice sturdy enough to sustain it.",
    tip: "The most sacred objection. Reverence, not salesmanship.",
    followups: [
      { label: "Resonates deeply", next: "present_check" },
      { label: "Need time", next: "close_needs_time" },
      { label: "← Back", next: "obj_menu" }
    ]
  },
  close: {
    phase: "closing",
    prompt: "They're ready.",
    say: "It sounds like this is really speaking to you. Would you like me to walk you through the investment?",
    tip: "Calm confidence.",
    followups: [
      { label: "Yes ~ pricing", next: "close_pricing", accent: true },
      { label: "Hesitate", next: "obj_menu" }
    ]
  },
  close_pricing: {
    phase: "closing",
    prompt: "Present the investment.",
    say: "Regular tuition is $3,500 for six months. Because you're enrolling early, you have access to our Early Bird pricing.\n\nThat includes everything ~ live calls, replays, manuals, community, pre-course, and Yoga Alliance certification.",
    tip: "Say the number. Pause. Don't fill silence.",
    pricingRef: true,
    followups: [
      { label: "They want to enrol", next: "close_enrolled", accent: true },
      { label: "Need time", next: "close_needs_time" },
      { label: "Price objection", next: "obj_investment" }
    ]
  },
  close_enrolled: {
    phase: "closing",
    prompt: "They're in.",
    say: "Wonderful. I'm genuinely excited for you. You'll get instant access to the pre-course today, and live calls begin October 7.",
    tip: "Send link. Confirm email. Connect Circle.",
    followups: [{ label: "✅ Call complete", next: "close_end", accent: true }]
  },
  close_needs_time: {
    phase: "closing",
    prompt: "They need time.",
    say: "[Name], it was really lovely talking with you. I respect how thoughtful you are.\n\nI'll send the info package and a direct link. No rush. Trust your timing.",
    tip: "Follow up within 24 hours.",
    followups: [{ label: "✅ Call complete", next: "close_end", accent: true }]
  },
  close_not_fit: {
    phase: "closing",
    prompt: "Not the right fit.",
    say: "I'm glad we connected. If anything changes, you know where to find us.",
    tip: "Never burn a bridge.",
    followups: [{ label: "✅ Call complete", next: "close_end", accent: true }]
  },
  close_end: {
    phase: "closing",
    prompt: "Call complete. Log your notes.",
    say: null,
    tip: "Send personal follow-up within 24 hours referencing something specific.",
    followups: [],
    isEnd: true
  }
};
```

---

## 7. Constants

```typescript
// lib/constants.ts

export const PHASES = [
  { id: 'intro', label: 'Welcome', icon: '✦', color: '#96AA9F' },
  { id: 'discovery', label: 'Discovery', icon: '◈', color: '#EEBE55' },
  { id: 'present', label: 'Present', icon: '◉', color: '#9DA7EA' },
  { id: 'objections', label: 'Objections', icon: '◆', color: '#F25C54' },
  { id: 'closing', label: 'Close', icon: '✧', color: '#530E36' },
] as const;

export const PHASE_FIRST_STEP: Record<string, string> = {
  intro: 'welcome',
  discovery: 'discovery',
  present: 'present',
  objections: 'obj_menu',
  closing: 'close',
};

export const PRICING_200 = [
  { tier: 'Super Early Bird', full: '$2,450', plan: '9 × $286.11', deadline: 'April 25, 2026', save: '$1,050' },
  { tier: 'Early Bird', full: '$2,800', plan: '9 × $326.67', deadline: 'June 25, 2026', save: '$700' },
  { tier: 'Full Retail', full: '$3,500', plan: '9 × $408.33', deadline: 'Ongoing', save: null },
];

export const PRICING_300 = [
  { tier: 'Super Early Bird', full: '$2,950', plan: '10 × $328', deadline: 'May 31, 2026', save: '$2,300' },
  { tier: 'Early Bird', full: '$3,500', plan: '10 × $395', deadline: 'July 15, 2026', save: '$1,750' },
  { tier: 'Special Price', full: '$4,450', plan: '10 × $495', deadline: '—', save: '$800' },
];

export const PROGRAM_LABELS: Record<string, string> = {
  '200hr': '200-Hour Kundalini Foundations',
  '300hr': '300-Hour Radical Expansions',
  'unsure': 'Unsure',
};

export const OUTCOME_STYLES: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  enrolled: { label: 'Enrolled', bg: '#96AA9F22', color: '#1C423E', icon: '✓' },
  needs_time: { label: 'Needs Time', bg: '#EEBE5522', color: '#974320', icon: '◷' },
  not_a_fit: { label: 'Not a Fit', bg: '#F25C5418', color: '#F25C54', icon: '—' },
  no_show: { label: 'No Show', bg: '#38315418', color: '#383154', icon: '✕' },
};
```

---

## 8. Brand Design Tokens (Tailwind Config)

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'twilight-indigo': '#383154',
        'sunlit-amber': '#EEBE55',
        'midnight-plum': '#530E36',
        'forest-shadow': '#1C423E',
        'creamsicle-dream': '#FCF0DD',
        'sage-stone': '#96AA9F',
        'rustic-copper': '#974320',
        'scarlet-ember': '#F25C54',
        'rosy-blush': '#F4B6C3',
        'ethereal-lavender': '#DEDDFC',
        'misty-mauve': '#9DA7EA',
        'minty-frost': '#D7FFE9',
      },
      fontFamily: {
        heading: ['Quattrocento', 'serif'],
        body: ['Questrial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

### Typography Scale (minimum sizes for readability)

| Element | Size | Font |
|---------|------|------|
| Page headings | 26-32px | Quattrocento Bold |
| Step prompts | 24-26px | Quattrocento Bold |
| Suggested language (say box) | 18-19px | Questrial |
| Coaching tips | 16-17px | Questrial |
| Followup buttons | 16-17px | Questrial |
| Body text | 16px | Questrial |
| Labels | 13px uppercase | Questrial Bold |
| Timer display | 24px | monospace |
| Note text | 15-16px | Questrial |

### Spelling Conventions

- British spelling: enrol/enrolment (not enroll/enrollment)
- Krya (not KRYA or Kriya)
- Shastra (not Sastra)
- Tilde (~) as soft connector
- Plus (+) in place of "and" in select instances
- No em dashes — use ellipses, commas, or restructure

---

## 9. GHL API Integration

### 9.1 API Routes (Server-Side Proxy)

All GHL API calls go through Next.js API routes to keep the API key on the server.

**Base URL:** `https://services.leadconnectorhq.com`

**Auth Header:** `Authorization: Bearer {api_key}`

### 9.2 `POST /api/ghl/connect`

Tests the GHL connection and saves settings.

```typescript
// Request
{ locationId: string, apiKey: string }

// Calls GHL
GET /calendars/?locationId={locationId}

// Response
{ connected: boolean, calendars: Calendar[] }
```

### 9.3 `GET /api/ghl/appointments`

Imports booked Clarity Calls.

```typescript
// Calls GHL
GET /calendars/events?locationId={locationId}&calendarId={calendarId}&startTime={startTime}&endTime={endTime}&status=booked

// Maps each appointment to a call record:
{
  prospect_name: appointment.contact.name,
  prospect_email: appointment.contact.email,
  prospect_phone: appointment.contact.phone,
  ghl_appointment_id: appointment.id,
  ghl_contact_id: appointment.contact.id,
  outcome: null, // not yet called
}
```

### 9.4 `GET /api/ghl/contacts?email={email}`

Looks up a contact by email.

```typescript
// Calls GHL
GET /contacts/lookup?locationId={locationId}&email={email}

// Response
{ contact: Contact | null }
```

### 9.5 `POST /api/ghl/tags`

Syncs show/no-show tags to a GHL contact.

```typescript
// Request
{ contactId: string, outcome: 'enrolled' | 'needs_time' | 'not_a_fit' | 'no_show' }

// Maps outcomes to GHL tags:
// enrolled → "Clarity Call ~ Enrolled"
// needs_time → "Clarity Call ~ Show"
// not_a_fit → "Clarity Call ~ Show"
// no_show → "Clarity Call ~ No Show"

// Calls GHL
POST /contacts/{contactId}/tags
Body: { tags: ["Clarity Call ~ Show"] }

// Also updates call record: ghl_tags_synced = true
```

---

## 10. Sales Guide Content

Store this as a constant or as a set of components. The guide is accessible both as a full page (`/guide`) and as a sidebar within the companion.

### Language Tab

**Say This, Not That:**

| Don't Say | Say Instead |
|-----------|-------------|
| Sign up | Enrol ~ step in |
| Buy / purchase | Invest in ~ commit to |
| Program features | What you'll experience |
| Limited spots | The cohort begins in October |
| Don't miss out | The early bird rate is available until [date] |
| This will change your life | Our graduates describe it as... |
| Trust me | What our students tell us is... |
| Ready to commit? | How does this feel? |
| I (centering yourself) | We ~ Our community ~ Guru Singh |

**Trust Words:** practice · lineage · transmission · devotion · grounded · embodiment · integration · coherence · sovereignty · container · community · living teacher

**Words to Avoid:** manifest · unlock your potential · guaranteed · proven · hack · hustle · don't miss out · last chance · sign up · limited time · journey (casual) · trauma (casual) · abundance (standalone) · living master (use "living teacher" or Guru Singh by name)

### Objections Tab

**The Four-Step Pattern:**
1. **Validate** — "Thank you for raising that." Show the concern is welcome.
2. **Clarify** — Find the real fear underneath. The stated objection is rarely the actual fear.
3. **Reframe** — Offer a new lens. Use graduate stories and Guru Singh as proof.
4. **Invite** — Return naturally. "Does that resonate?"

> Every objection is a request for safety. The people who voice concerns are doing you a favour.

### Programs Tab

**200-Hour Kundalini Foundations:**
- Duration: ~6 months (Oct 2026 ~ Apr 2027)
- Calls Begin: October 7, 2026
- Schedule: Wed 4~6 PM PST / Sat 9~11 AM PST
- Attendance: 1 call/week (same material)
- 22 Krya Modules, 3 learning journeys
- Guru Singh + faculty
- RYT-200 Yoga Alliance
- Immediate pre-course access (6 modules)

**300-Hour Radical Expansions:**
- Duration: ~9 months (Oct 2026 ~ Jun 2027)
- Calls Begin: October 21, 2026
- Schedule: Wed 4~6:30 PM / Fri 9~11:30 AM PST
- 1 call/week + 12 Saturday workshops
- 13 Shastras
- Guru Singh
- RYT-300 Yoga Alliance

### Follow-Up Tab

1. **Day 1** — Personal email with info package. Reference something specific.
2. **Day 5~7** — Gentle check-in: "Any questions came up?"
3. **Day 14** — Share relevant content (Guru Singh clip, testimonial).
4. **Day 21~28** — Final touchpoint. No further unless they re-engage.

> Three follow-ups maximum. After that, trust their timing.

### Prospect Tab

**Maren, 43** — RYT-200 Vinyasa teacher, freelance designer, Boulder CO

She's hit a ceiling in her teaching and practice. She's done retreats, workshops, and apps, but nothing has cohered. She's restless, spiritually serious, and afraid of choosing wrong again.

**She Tells Herself:** "Maybe I'm just a dabbler" · "I should be further along" · "If it doesn't work, I'm the problem" · "Kundalini feels intense"

**She Secretly Wants:** To feel chosen by a teacher · Permission to stop seeking · To teach something with fire · Spiritual + real life as one

> Trigger RECOGNITION. Not aspiration, not fear. "Someone put words to what I've been feeling."

---

## 11. Environment Variables

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# GHL (stored in DB, not env — but needed for initial setup)
# GHL_API_KEY and GHL_LOCATION_ID are stored in ghl_settings table
```

---

## 12. Build Sequence

### Session 1: Scaffold + Data Layer
1. `npx create-next-app@latest clarity-call-companion --typescript --tailwind --app --src-dir=false`
2. Install: `@supabase/supabase-js`, `@supabase/ssr`
3. Set up Supabase project, create tables from schema above
4. Configure Tailwind with KU brand tokens
5. Add Google Fonts (Quattrocento, Questrial) to layout
6. Build `/calls` page with real Supabase CRUD
7. Build `/calls/new` intake form
8. Build `/calls/[id]` review page
9. Test: create a call, view it in the log, review it

### Session 2: Conversation Companion
1. Add `lib/conversation-tree.ts` with full TREE constant
2. Build `useCompanion` hook (step navigation, history, name replacement)
3. Build `useTimer` hook
4. Build `/calls/[id]/companion` page with all companion components
5. Wire call completion to Supabase (update call record with outcome, notes, duration, recording URL)
6. Test: full call flow from intake through companion to completion

### Session 3: GHL Integration
1. Build `/api/ghl/connect` route
2. Build `/api/ghl/appointments` route
3. Build `/api/ghl/contacts` route
4. Build `/api/ghl/tags` route
5. Build `/settings` page with GHL connection UI
6. Add "Import Booked Calls" to call log
7. Add "Sync Tags" + "View in GHL" to call review
8. Test: connect GHL, import appointments, sync tags

### Session 4: Sales Guide + Polish
1. Build `/guide` page with all 5 tabs
2. Build guide sidebar component for companion
3. Add auth (Supabase login, middleware redirect)
4. Add follow-up tracking fields to call review
5. Deploy to Vercel
6. Test: full end-to-end flow

---

## 13. Key UX Principles

1. **Readability during a live call.** Font sizes must be large enough to glance at while talking. Minimum 16px for any readable text, 18-19px for suggested language.

2. **Non-linear navigation.** The salesperson must be able to jump to any phase at any time. The conversation tree is a guide, not a script.

3. **Speed over animation.** No loading spinners during the call. Companion state is client-side. Database writes happen in the background.

4. **Notes are sacred.** Note input should be fast (Enter to save), visible on every step, and exportable at the end.

5. **No pressure in the UI.** The design should feel warm and unhurried, matching the philosophy of the calls themselves. KU brand colours, generous spacing, Quattrocento headings.

---

*Kundalini University · Empowered clarity, presence + purpose for a conscious world.*
