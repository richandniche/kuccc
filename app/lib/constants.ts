export const PHASES = [
  { id: "intro", label: "Welcome", icon: "✦", color: "#96AA9F" },
  { id: "discovery", label: "Discovery", icon: "◈", color: "#EEBE55" },
  { id: "present", label: "Present", icon: "◉", color: "#9DA7EA" },
  { id: "objections", label: "Objections", icon: "◆", color: "#F25C54" },
  { id: "closing", label: "Close", icon: "✧", color: "#530E36" },
] as const;

export const PHASE_FIRST_STEP: Record<string, string> = {
  intro: "welcome",
  discovery: "discovery",
  present: "present",
  objections: "obj_menu",
  closing: "close",
};

export const PRICING_200 = [
  { tier: "Super Early Bird", full: "$2,450", plan: "9 × $286.11", deadline: "April 25, 2026", save: "$1,050" },
  { tier: "Early Bird",       full: "$2,800", plan: "9 × $326.67", deadline: "June 25, 2026",  save: "$700" },
  { tier: "Full Retail",      full: "$3,500", plan: "9 × $408.33", deadline: "Ongoing",        save: null },
];

export const PRICING_300 = [
  { tier: "Super Early Bird", full: "$2,950", plan: "10 × $328", deadline: "May 31, 2026", save: "$2,300" },
  { tier: "Early Bird",       full: "$3,500", plan: "10 × $395", deadline: "July 15, 2026", save: "$1,750" },
  { tier: "Special Price",    full: "$4,450", plan: "10 × $495", deadline: "—",            save: "$800" },
];

export const PROGRAM_LABELS: Record<string, string> = {
  "200hr": "200-Hour Kundalini Foundations",
  "300hr": "300-Hour Radical Expansions",
  unsure: "Unsure",
};

export const OUTCOME_STYLES: Record<
  string,
  { label: string; bg: string; color: string; icon: string }
> = {
  enrolled:    { label: "Enrolled",   bg: "#96AA9F22", color: "#1C423E", icon: "✓" },
  needs_time:  { label: "Needs Time", bg: "#EEBE5522", color: "#974320", icon: "◷" },
  not_a_fit:   { label: "Not a Fit",  bg: "#F25C5418", color: "#F25C54", icon: "—" },
  no_show:     { label: "No Show",    bg: "#38315418", color: "#383154", icon: "✕" },
};

export type OutcomeKey = keyof typeof OUTCOME_STYLES;
export type ProgramKey = keyof typeof PROGRAM_LABELS;
