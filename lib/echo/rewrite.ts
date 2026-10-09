import type { Intention, Tone } from "./types";

export const TONES: { id: Tone; label: string }[] = [
  { id: "gentle", label: "Gentle" }, { id: "direct", label: "Direct" }, { id: "warm", label: "Warm" }, { id: "brief", label: "Brief" },
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const bare = (s: string) => s.trim().replace(/[.!?…]+$/, "");
const lc = (s: string) => (/^I\b/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));
const end = (s: string) => `${bare(s)}.`;

/** Used when the user only wants the message itself polished (greetings, facts). */
const GREETING: Record<Tone, string[]> = {
  gentle: ["Hi there. I hope your day is going well.", "Hi. I was thinking of you and wanted to say hello."],
  direct: ["Hi. Do you have a minute to talk?", "Hello. I wanted to reach out."],
  warm: ["Hi! It's really good to connect with you.", "Hey, how have you been?"],
  brief: ["Hi.", "Hey, got a minute?"],
};
const plain = (o: string): Record<Tone, string[]> => ({
  gentle: [`${end(o)} Let me know if that works for you.`, `Just a quick note: ${lc(end(o))}`],
  direct: [end(o), `Please note: ${lc(end(o))}`],
  warm: [`Quick heads-up, in case it helps: ${lc(end(o))}`, `${end(o)} Happy to answer any questions.`],
  brief: [end(o), `FYI: ${lc(end(o))}`],
});

/** Composes from original + confirmed intention + scenario + tone. Returns distinct variants, first is default. */
export function rewrite(original: string, intention: Pick<Intention, "label" | "action" | "scenario">, tone: Tone): string[] {
  const o = bare(original);
  if (!intention.action) return intention.scenario === "greeting" ? GREETING[tone] : plain(o)[tone];
  const c = bare(intention.label), C = cap(c), a = intention.action;
  const short = o.length > 0 && o.length <= 70;
  const lead = !short ? "" : tone === "gentle" || tone === "warm" ? `When I said “${o}”, it wasn't the whole story. ` : tone === "direct" ? `“${o}” isn't all I mean. ` : "";
  const T: Record<Tone, [string, string]> = {
    gentle: [`I've been trying to work out how to say this. ${C}, and I'd really appreciate it if we could ${a}.`, `${lead}${C}. I'd appreciate it if we could ${a}, whenever you're ready.`],
    direct: [`${C}, and I need us to ${a}.`, `${lead}${C}. I need us to ${a}.`],
    warm: [`I care about this, so I want to be honest: ${c}. Can we ${a}?`, `${lead}${C}. I'd like us to ${a}, because this matters to me.`],
    brief: [`${C}. Can we ${a}?`, `${C}.`],
  };
  return [...new Set(T[tone])];
}
