export type Phase =
  | "intro"
  | "discovery"
  | "present"
  | "objections"
  | "closing";

export interface Followup {
  label: string;
  next: string;
  accent?: boolean;
  icon?: string;
}

export interface TreeStep {
  phase: Phase;
  prompt: string;
  say: string | null;
  tip: string;
  followups: Followup[];
  pricingRef?: boolean;
  isEnd?: boolean;
}

export type ConversationTree = Record<string, TreeStep>;

export const TREE: ConversationTree = {
  welcome: {
    phase: "intro",
    prompt: "Open with warmth. Set the tone.",
    say: "Hi [Name], it's so lovely to meet you. Thank you for taking the time to connect with us.\n\nBefore we dive in, I just want you to know ~ this is really just a conversation. There is no pressure here. I'm here to learn about you, share what we offer, and help you figure out if this is the right fit.\n\nSound good?",
    tip: "Match their energy. If nervous, slow down. If eager, lean in.",
    followups: [
      { label: "They seem relaxed", next: "opening_q" },
      { label: "They seem nervous", next: "ease_nerves" },
    ],
  },
  ease_nerves: {
    phase: "intro",
    prompt: "They seem nervous. Slow down.",
    say: "I can tell you're being really thoughtful about this, and I love that. Honestly, think of this as two people having a conversation over tea ~ no agenda, no pitch. I'm just genuinely curious about your story.",
    tip: "Let the silence breathe. Don't rush to fill it.",
    followups: [{ label: "Continue to opening question", next: "opening_q" }],
  },
  opening_q: {
    phase: "intro",
    prompt: "The most important question of the call.",
    say: "So, tell me a little about yourself. What brought you to Kundalini University?",
    tip: "LISTEN. This answer tells you everything. Note what they've tried, what's missing, what they hope for, what they fear.",
    followups: [
      { label: "They have yoga background", next: "discovery" },
      { label: "They're new to yoga", next: "discovery" },
      { label: "They found Guru Singh online", next: "discovery" },
    ],
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
      { label: "→ Ready to present", next: "present", accent: true },
    ],
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
      { label: "← Back", next: "discovery" },
    ],
  },
  disc_teacher_deeper: {
    phase: "discovery",
    prompt: "They already teach. Go deeper.",
    say: "That's wonderful. How is your teaching going? Do you feel like you're teaching from a place that feels authentically yours, or are you still working from someone else's framework?",
    tip: "If they're 'going through the motions,' bridge to Radical Expansions.",
    followups: [
      { label: "Stuck in teaching", next: "disc_pain" },
      { label: "Want to add Kundalini", next: "disc_desire" },
      { label: "← Back", next: "discovery" },
    ],
  },
  disc_tried_many: {
    phase: "discovery",
    prompt: "Accumulated experiences without depth.",
    say: "It sounds like you've explored a lot. What has been the most meaningful experience so far ~ and what was missing from it?",
    tip: "Listen for: 'temporary,' 'faded,' 'no community,' 'no depth.'",
    followups: [
      { label: "Retreats fading", next: "disc_pain" },
      { label: "Missing community", next: "disc_desire" },
      { label: "← Back", next: "discovery" },
    ],
  },
  disc_new: {
    phase: "discovery",
    prompt: "They're newer to this world.",
    say: "What drew you to Kundalini specifically? Was there a moment or a piece of content that caught your attention?",
    tip: "If they mention Guru Singh, lean into that.",
    followups: [
      { label: "They found Guru Singh", next: "disc_guru_singh" },
      { label: "Curious about Kundalini", next: "disc_desire" },
      { label: "← Back", next: "discovery" },
    ],
  },
  disc_guru_singh: {
    phase: "discovery",
    prompt: "Guru Singh drew them in.",
    say: "I love that. What was it about him that resonated? There's something about his presence that people feel even through a screen.",
    tip: "Let them describe it. Mirror it back later.",
    followups: [{ label: "← Back", next: "discovery" }],
  },
  disc_current: {
    phase: "discovery",
    prompt: "Their current life + practice.",
    say: "What does your practice look like right now? Is there a daily rhythm, or is it more occasional?",
    tip: "No judgment. Normalise inconsistency.",
    followups: [
      { label: "Daily practice", next: "disc_daily_deeper" },
      { label: "Inconsistent", next: "disc_inconsistent" },
      { label: "← Back", next: "discovery" },
    ],
  },
  disc_daily_deeper: {
    phase: "discovery",
    prompt: "They have structure. Explore depth.",
    say: "That's beautiful. Does it feel like it's taking you where you want to go ~ or do you sense there's a deeper layer waiting?",
    tip: "Consistent practitioners often feel the ceiling.",
    followups: [{ label: "← Back", next: "discovery" }],
  },
  disc_inconsistent: {
    phase: "discovery",
    prompt: "Practice is inconsistent.",
    say: "That's really honest. When you DO practise, what does it feel like? And what gets in the way?",
    tip: "Don't prescribe. Listen for the real block.",
    followups: [{ label: "← Back", next: "discovery" }],
  },
  disc_pain: {
    phase: "discovery",
    prompt: "Explore what's not working.",
    say: "What have you tried before that didn't quite land the way you hoped?",
    tip: "Listen for: surface seeking, credentials without confidence, isolation.",
    followups: [
      { label: "Stuck / plateaued", next: "disc_pain_stuck" },
      { label: "Scattered", next: "disc_pain_scattered" },
      { label: "← Back", next: "discovery" },
    ],
  },
  disc_pain_stuck: {
    phase: "discovery",
    prompt: "They feel stuck. Go deeper.",
    say: "When you say 'stuck' ~ can you describe what that feels like day-to-day?",
    tip: "Their specific language is what you mirror back later.",
    followups: [{ label: "← Back", next: "discovery" }],
  },
  disc_pain_scattered: {
    phase: "discovery",
    prompt: "Scattered across modalities.",
    say: "Is there something you keep circling back to ~ a feeling or question that won't resolve?",
    tip: "This often leads to 'I'm tired of seeking.'",
    followups: [{ label: "← Back", next: "discovery" }],
  },
  disc_desire: {
    phase: "discovery",
    prompt: "Explore what they want.",
    say: "If this training gave you exactly what you needed, what would your life look like in a year?",
    tip: "Let them paint the picture. Use their words when presenting.",
    followups: [
      { label: "Want to teach", next: "disc_desire_teach" },
      { label: "Want personal depth", next: "disc_desire_depth" },
      { label: "← Back", next: "discovery" },
    ],
  },
  disc_desire_teach: {
    phase: "discovery",
    prompt: "They want to teach.",
    say: "What does teaching mean to you? Career, or something deeper ~ like having something real to offer?",
    tip: "Most who want to 'teach' actually want to transmit.",
    followups: [{ label: "← Back", next: "discovery" }],
  },
  disc_desire_depth: {
    phase: "discovery",
    prompt: "Personal transformation, not teaching.",
    say: "That's really what this training is at its core ~ personal transformation. The certification is a byproduct.",
    tip: "Free them from the training = career assumption.",
    followups: [{ label: "← Back", next: "discovery" }],
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
      { label: "No concerns", next: "discovery" },
    ],
  },
  present: {
    phase: "present",
    prompt: "Bridge from discovery. Use THEIR words.",
    say: "From what you've shared, it sounds like you've done a tremendous amount of inner work ~ and what you're really looking for now is not more information, but a practice and a teacher that can take you deeper.\n\nIs that right?",
    tip: "Wait for confirmation. This is the moment of recognition.",
    followups: [
      { label: "Yes ~ they confirm", next: "present_program" },
      { label: "Not quite ~ clarify", next: "present_clarify" },
    ],
  },
  present_clarify: {
    phase: "present",
    prompt: "Didn't fully resonate. Adjust.",
    say: "Help me understand better ~ what would the ideal next step look like for you?",
    tip: "Let them correct you. This builds trust.",
    followups: [{ label: "Try again", next: "present_program" }],
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
      { label: "→ Check in", next: "present_check", accent: true },
    ],
  },
  present_guru: {
    phase: "present",
    prompt: "Nobody else has Guru Singh.",
    say: "The thing that sets this apart is Guru Singh himself. 81 years old, over fifty years of practice.\n\nWhen you sit with him, even on Zoom, you feel the transmission. The window to learn from him directly is open right now.",
    tip: "This is fact, not urgency as tactic.",
    followups: [{ label: "→ Check in", next: "present_check", accent: true }],
  },
  present_community: {
    phase: "present",
    prompt: "They mentioned isolation.",
    say: "You're not watching lectures ~ you're in practice pods, sharing circles, a private community where people show up for each other.\n\nFor many, it's the first time their spiritual life has felt held by a real group.",
    tip: "Use if they mentioned isolation or fading community.",
    followups: [{ label: "→ Check in", next: "present_check", accent: true }],
  },
  present_flexibility: {
    phase: "present",
    prompt: "Worried about fitting it in.",
    say: "One live call per week ~ Wednesday evening or Saturday morning. Everything recorded with lifetime replay. Students include single parents, freelancers, all time zones.",
    tip: "Normalise. Don't minimise.",
    followups: [{ label: "→ Check in", next: "present_check", accent: true }],
  },
  present_check: {
    phase: "present",
    prompt: "Check in before the invitation.",
    say: "How does that land for you? Does this feel like what you've been looking for?",
    tip: "Not a trial close. A genuine question.",
    followups: [
      { label: "Yes ~ resonating", next: "close", accent: true },
      { label: "Concerns", next: "obj_menu" },
      { label: "Unsure", next: "present_unsure" },
    ],
  },
  present_unsure: {
    phase: "present",
    prompt: "On the fence. Don't push.",
    say: "I can feel you thinking about it, and that's a good sign. What specifically is on your mind?",
    tip: "Silence. Let them name it.",
    followups: [
      { label: "They name a concern", next: "obj_menu" },
      { label: "Need time", next: "close_needs_time" },
    ],
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
      { label: "Quiet — Nothing Changes?", next: "obj_quiet" },
    ],
  },
  obj_lineage: {
    phase: "objections",
    prompt: "Yogi Bhajan or community safety.",
    say: "Thank you for raising that. We welcome it.\n\nKU is built around Guru Singh's living lineage, not any single historical figure. No affiliation to 3HO. His teaching stands on its own ~ rooted in integrity, compassion, and transparency.",
    tip: "Zero defensiveness. Head-on with warmth.",
    followups: [
      { label: "Reassured", next: "present_check" },
      { label: "Want a graduate", next: "close_needs_time" },
      { label: "← Back", next: "obj_menu" },
    ],
  },
  obj_online: {
    phase: "objections",
    prompt: "Can online deliver depth?",
    say: "You're not watching recordings. You're live with Guru Singh, twice a week, for six months. You can ask questions, be seen, practise in real time.\n\nGraduates say it was more connected than in-person trainings — because of the consistency.",
    tip: "Sell the sustained relationship, not the platform.",
    followups: [
      { label: "Resonates", next: "present_check" },
      { label: "Want a clip", next: "close_needs_time" },
      { label: "← Back", next: "obj_menu" },
    ],
  },
  obj_credentials: {
    phase: "objections",
    prompt: "Already have 200hr.",
    say: "You're not starting over. Where your 200hr gave you the foundation, this gives you the depth ~ emotional intelligence, subtle anatomy, Krya science, your own voice.\n\nGraduates say this is where they stopped teaching from someone else's playbook.",
    tip: "Mirror their words back.",
    followups: [
      { label: "Reframed", next: "present_check" },
      { label: "← Back", next: "obj_menu" },
    ],
  },
  obj_vocabulary: {
    phase: "objections",
    prompt: "Overwhelmed by language.",
    say: "Guru Singh is probably the least esoteric Kundalini teacher you'll encounter. Warm, grounded, practical, often funny.\n\nYou won't be expected to arrive knowing any of it ~ that's what the training is for.",
    tip: "Normalise. Don't make them feel ignorant.",
    followups: [
      { label: "Eased", next: "present_check" },
      { label: "← Back", next: "obj_menu" },
    ],
  },
  obj_continuity: {
    phase: "objections",
    prompt: "What happens long-term.",
    say: "Your Yoga Alliance certification stands on its own for life.\n\nGuru Singh is actively building a community to carry the teachings forward. His vitality at 81 is a rare window, not a risk.",
    tip: "This shows deep investment. Honour it.",
    followups: [
      { label: "Reframed", next: "present_check" },
      { label: "← Back", next: "obj_menu" },
    ],
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
      { label: "← Back", next: "obj_menu" },
    ],
  },
  obj_investment_firm: {
    phase: "objections",
    prompt: "Genuinely a barrier.",
    say: "I completely understand. The training runs every year, and you'll always be welcome.",
    tip: "No additional discounts. Warmth.",
    followups: [{ label: "→ Close warmly", next: "close_needs_time", accent: true }],
  },
  obj_time: {
    phase: "objections",
    prompt: "Fitting it into life.",
    say: "One live call per week. Wednesday evening or Saturday morning. Everything recorded with lifetime replay.\n\nWhat our busiest students say: the practice becomes the thing that makes everything else work.",
    tip: "Acknowledge THEIR specific constraints.",
    followups: [
      { label: "Eased", next: "present_check" },
      { label: "← Back", next: "obj_menu" },
    ],
  },
  obj_quiet: {
    phase: "objections",
    prompt: "Deeper hesitation: 'What if nothing changes?'",
    say: "Almost every student carries a version of this question. The people who carry it transform the most ~ because they're not looking for a quick fix.\n\nThe training asks you to remember the sovereignty you were born with ~ and build a practice sturdy enough to sustain it.",
    tip: "The most sacred objection. Reverence, not salesmanship.",
    followups: [
      { label: "Resonates deeply", next: "present_check" },
      { label: "Need time", next: "close_needs_time" },
      { label: "← Back", next: "obj_menu" },
    ],
  },
  close: {
    phase: "closing",
    prompt: "They're ready.",
    say: "It sounds like this is really speaking to you. Would you like me to walk you through the investment?",
    tip: "Calm confidence.",
    followups: [
      { label: "Yes ~ pricing", next: "close_pricing", accent: true },
      { label: "Hesitate", next: "obj_menu" },
    ],
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
      { label: "Price objection", next: "obj_investment" },
    ],
  },
  close_enrolled: {
    phase: "closing",
    prompt: "They're in.",
    say: "Wonderful. I'm genuinely excited for you. You'll get instant access to the pre-course today, and live calls begin October 7.",
    tip: "Send link. Confirm email. Connect Circle.",
    followups: [{ label: "✅ Call complete", next: "close_end", accent: true }],
  },
  close_needs_time: {
    phase: "closing",
    prompt: "They need time.",
    say: "[Name], it was really lovely talking with you. I respect how thoughtful you are.\n\nI'll send the info package and a direct link. No rush. Trust your timing.",
    tip: "Follow up within 24 hours.",
    followups: [{ label: "✅ Call complete", next: "close_end", accent: true }],
  },
  close_not_fit: {
    phase: "closing",
    prompt: "Not the right fit.",
    say: "I'm glad we connected. If anything changes, you know where to find us.",
    tip: "Never burn a bridge.",
    followups: [{ label: "✅ Call complete", next: "close_end", accent: true }],
  },
  close_end: {
    phase: "closing",
    prompt: "Call complete. Log your notes.",
    say: null,
    tip: "Send personal follow-up within 24 hours referencing something specific.",
    followups: [],
    isEnd: true,
  },
};
