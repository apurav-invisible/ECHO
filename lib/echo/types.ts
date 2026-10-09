export type Step = "notice" | "clarify" | "connect";
export type Tone = "gentle" | "direct" | "warm" | "brief";
export type Strength = "strong" | "moderate" | "weak";

export type ScenarioId =
  | "disappointment" | "excluded" | "frustration" | "misunderstood" | "space" | "avoid-conflict"
  | "conceal-hurt" | "difficulty-expressing" | "apology" | "boundaries" | "uncertainty" | "stress"
  | "reassurance" | "unappreciated" | "anger" | "greeting" | "informational" | "unknown";

/** A possibility offered to the user. `action` is what they might ask for; empty means "plain" rewrite. */
export interface Intention {
  id: string;
  label: string;
  action: string;
  scenario: ScenarioId;
}

export interface Interpretation {
  scenario: ScenarioId;
  scenarioLabel: string;
  strength: Strength;
  /** Phrases from the message that triggered the match. */
  signals: string[];
  intentions: Intention[];
}
