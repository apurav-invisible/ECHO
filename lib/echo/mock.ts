import type { Intention } from "./types";

export const CUSTOM_ID = "custom";

export const EXAMPLES = ["I don't care.", "Fine, whatever you want.", "It's okay, don't worry about it.", "I'm just busy."];

export const INTENTIONS: Intention[] = [
  {
    id: "left-out",
    label: "I feel left out, but I find it difficult to explain why.",
    variants: [
      "Honestly, I felt a little left out, and I'm struggling to explain exactly why.",
      "I felt a bit on the outside of things, and I'm not sure how to say why. I just wanted you to know.",
    ],
  },
  {
    id: "misunderstood",
    label: "I feel misunderstood.",
    variants: [
      "I think something I said got misread, and I'd like a chance to explain what I actually meant.",
      "I don't feel like I'm coming across the way I mean to. Can I try saying it differently?",
    ],
  },
  {
    id: "disappointed",
    label: "I'm disappointed but don't know how to explain it.",
    variants: [
      "I'm a little disappointed, and I'm still working out how to put it into words.",
      "Something let me down, and I haven't figured out how to explain it yet. I wanted to be honest about that.",
    ],
  },
  {
    id: "space",
    label: "I need some space.",
    variants: [
      "I need a bit of space right now. It isn't about you, and I'll come back to this when I'm ready.",
      "Can we pause for a little while? I need some time to myself, and I'll get back to you.",
    ],
  },
];

const sentence = (t: string) => { const s = t.trim(); return /[.!?]$/.test(s) ? s : `${s}.`; };

/** Same inputs always produce the same output. */
export function getVariants(intentionId: string, custom: string): string[] {
  if (intentionId === CUSTOM_ID) {
    const c = sentence(custom);
    return [`What I actually mean is this: ${c}`, `I wasn't sure how to say it at first, so I'll say it plainly. ${c}`];
  }
  return INTENTIONS.find((i) => i.id === intentionId)?.variants ?? [];
}

export function getIntentionLabel(intentionId: string, custom: string): string {
  return intentionId === CUSTOM_ID ? sentence(custom) : INTENTIONS.find((i) => i.id === intentionId)?.label ?? "";
}
