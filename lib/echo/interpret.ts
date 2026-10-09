import type { Intention, Interpretation, ScenarioId, Strength } from "./types";

type Pattern = [source: string, weight: number, negatable?: boolean];
interface Scenario { id: ScenarioId; label: string; min: number; patterns: Pattern[]; intents: [label: string, action: string][] }

const S = (id: ScenarioId, label: string, min: number, patterns: Pattern[], intents: [string, string][]): Scenario => ({ id, label, min, patterns, intents });

/** Order matters: it is the tie-break when two scenarios score equally. */
const SCENARIOS: Scenario[] = [
  S("misunderstood", "feeling unheard or misunderstood", 2, [
    ["\\bnobody (listens|hears|gets)\\b", 3], ["\\bno ?one (listens|hears|understands)\\b", 3], ["\\b(you|they) never listen\\b", 3],
    ["\\b(don'?t|doesn'?t) (listen|understand|get me)\\b", 2.5], ["\\bmisunderstood\\b", 3, true], ["\\bnot listening\\b", 2.5], ["\\bexplain myself\\b", 1],
  ], [["I feel unheard when I try to explain my perspective.", "talk about it"], ["I want my point of view to be taken seriously.", "take each other's views seriously"],
      ["I'm frustrated because I don't feel understood.", "try again to understand each other"], ["I think something I said got misread.", "clear up what I meant"]]),
  S("unappreciated", "unequal effort or feeling unappreciated", 2, [
    ["\\bunappreciated\\b|\\bunnoticed\\b", 3], ["\\bgo(es)? unnoticed\\b", 3], ["\\btake (me|it) for granted\\b", 3], ["\\balways (the one )?(who )?tr(y|ies|ying)\\b", 3],
    ["\\balways (being )?the one\\b", 3], ["\\bthe one who tr(y|ies)\\b", 2], ["\\b(tired|exhausted|sick) (of|from) always\\b", 3],
    ["\\b(no ?one|nobody) (notices|appreciates)\\b", 3], ["\\bnever (thank|appreciate)", 3], ["\\bmy (efforts?|work|hard work)\\b", 1.5],
  ], [["I'm tired of feeling like I'm putting in more effort than the other person.", "talk about how we share the effort"], ["I want the effort between us to feel more mutual.", "make the effort more mutual"],
      ["I need to talk about how this dynamic has been affecting me.", "talk about how this has been affecting me"], ["I want my efforts to be noticed.", "acknowledge the effort I put in"]]),
  S("space", "needing space", 2, [
    ["\\bleave me alone\\b", 3], ["\\b(need|want) (some |a little |a bit of )?(space|time alone|time to myself)\\b", 3, true], ["\\bgive me (some |a little )?(time|space)\\b", 3],
    ["\\bdon'?t want to (talk|discuss)\\b", 3], ["\\bnot right now\\b", 2], ["\\bfor a while\\b", 1], ["\\bneed (some |a little )?time\\b", 2.5, true],
  ], [["I need some time to myself before continuing this conversation.", "pause and come back to this later"], ["I'm feeling overwhelmed and would like a little space.", "give each other some room right now"],
      ["I want to revisit this when I'm ready.", "pick this up again when I'm ready"], ["I'm not ready to talk about this yet.", "wait until I've had time to think"]]),
  S("avoid-conflict", "avoiding conflict", 2, [
    ["\\bwhatever you want\\b", 3], ["\\bfine,? whatever\\b", 3], ["\\bwhatever\\b", 1], ["\\bdo what you want\\b", 2.5], ["\\bit doesn'?t matter\\b", 2], ["\\bnever ?mind\\b", 2],
    ["\\bforget it\\b", 2.5], ["\\bi don'?t care\\b(?! about)", 2], ["\\bi don'?t want to argue\\b", 3],
  ], [["I'm disappointed, but I don't want to argue.", "say what I actually feel without a fight"], ["I have a different preference, but I'm finding it difficult to explain.", "share what I'd actually prefer"],
      ["I feel like my opinion isn't being considered.", "make sure my opinion counts too"]]),
  S("conceal-hurt", "playing down hurt", 2, [
    ["\\bit'?s (okay|ok|fine|nothing)\\b", 2.5], ["\\bdon'?t worry about it\\b", 2.5], ["\\bi'?m fine\\b", 2.5, true], ["\\bno big deal\\b", 2.5], ["\\bdoesn'?t bother me\\b", 2.5],
    ["\\bit'?s all good\\b", 2], ["\\bdon'?t care (anymore|any more)\\b", 1.5],
  ], [["It did bother me, and I played it down.", "talk about what actually bothered me"], ["I'm saying it's fine, but I'm not completely okay yet.", "give me a moment to say more"],
      ["I don't want to make a fuss, but something is still on my mind.", "talk about what's on my mind"]]),
  S("disappointment", "disappointment", 2, [
    ["\\bdisappoint(ed|ing|ment)?\\b", 3, true], ["\\blet (me|us) down\\b", 3], ["\\bexpected (more|better)\\b", 2.5], ["\\bdon'?t care (anymore|any more)\\b", 3], ["\\bgave up on\\b", 2], ["\\bwas hoping\\b", 2],
  ], [["I'm disappointed, and I'm still finding the words for it.", "talk about what I was hoping for"], ["I expected something different, and it stung a little.", "talk about what happened"],
      ["I'm disappointed, but I still want to work this out.", "find a way forward together"]]),
  S("excluded", "feeling left out", 2, [
    ["\\bleft out\\b", 3], ["\\bexclud(ed|e)\\b", 3, true], ["\\b(not|wasn'?t|weren'?t) invited\\b", 3], ["\\bwithout me\\b", 2.5], ["\\beveryone else\\b", 1.5],
    ["\\bforgot (about )?me\\b", 3], ["\\bdidn'?t (invite|include|ask) me\\b", 3],
  ], [["I feel left out, and it's hard to explain why.", "talk about it"], ["It hurt a little not to be included.", "talk about how plans get made"], ["I'd like to be included next time.", "include me next time"]]),
  S("frustration", "frustration", 2, [
    ["\\bfrustrat(ed|ing|ion)\\b", 3, true], ["\\bfed up\\b", 3], ["\\bkeeps? happening\\b", 2.5], ["\\b(again and again|over and over)\\b", 2.5], ["\\bcan'?t believe\\b", 2], ["\\bso tired of\\b", 2],
  ], [["I'm frustrated, and I want to explain what's behind it.", "talk about what's frustrating me"], ["This keeps happening, and I want it to change.", "figure out how to stop this repeating"],
      ["I'm frustrated, but I don't want to take it out on you.", "talk calmly about it"]]),
  S("anger", "anger or irritation", 2, [
    ["\\bangry\\b", 3, true], ["\\bfurious\\b", 3, true], ["\\b(so )?mad\\b", 2, true], ["\\birritat(ed|ing)\\b", 2.5, true], ["\\bannoy(ed|ing)\\b", 2, true],
    ["\\bsick of\\b", 2.5], ["\\bhate (it when|that|how)\\b", 3], ["\\bhow dare\\b", 3],
  ], [["I'm angry, and I want to say so without making things worse.", "talk once we've both cooled down"], ["Something crossed a line for me, and I want to explain.", "talk about what crossed the line"],
      ["I'm irritated, and I'd rather say it than let it build.", "clear the air"]]),
  S("difficulty-expressing", "difficulty finding the words", 2, [
    ["\\bdon'?t know how to (say|explain|put|tell|express)\\b", 3], ["\\bhard to (explain|say|put|express)\\b", 3], ["\\bcan'?t find the words\\b", 3],
    ["\\bdon'?t know what to say\\b", 3], ["\\bi don'?t know how to\\b", 1.5],
  ], [["There's something on my mind, and I'm struggling to find the words.", "give me a moment to work it out"], ["I want to explain, but I'm not sure where to start.", "start with the part that's easiest to say"],
      ["I feel something, but I can't name it yet.", "work out what I'm trying to say"]]),
  S("apology", "apologizing", 2, [
    ["\\bsorry\\b", 2.5], ["\\bapologi[sz]e\\b", 3], ["\\bshouldn'?t have (said|done)\\b", 3], ["\\bmy bad\\b", 2], ["\\bforgive me\\b", 2.5], ["\\bmy fault\\b", 2.5],
  ], [["I'm sorry, and I want to take responsibility for what I said.", "move forward from this"], ["I regret how that came across and want to make it right.", "clear the air"],
      ["I'm sorry, but I also want to explain where I was coming from.", "talk about where I was coming from"]]),
  S("boundaries", "setting a boundary", 2, [
    ["\\brespect my (time|space|privacy|boundar\\w*|decision)\\b", 3], ["\\bstop (asking|calling|texting|pushing|bringing)\\b", 3], ["\\bi won'?t (do|be|accept|tolerate)\\b", 2.5],
    ["\\bnot okay with\\b", 3], ["\\bi need you to\\b", 2], ["\\bdon'?t (call|text|message) me\\b", 2.5], ["\\bboundar(y|ies)\\b", 2, true],
  ], [["I need my time and limits to be respected.", "agree on what's okay for both of us"], ["I'm not comfortable with this, and I want to say so clearly.", "talk about what I'm comfortable with"],
      ["I want to set a limit without it turning into a fight.", "settle this calmly"]]),
  S("uncertainty", "uncertainty", 2, [
    ["\\bnot sure\\b", 2.5], ["\\bdon'?t know what i want\\b", 3], ["\\bcan'?t decide\\b", 3], ["\\bi'?m torn\\b", 3], ["\\bmaybe\\b", 1.5], ["\\bi guess\\b", 1.5],
    ["\\bi don'?t know\\b(?! how| what to)", 2], ["\\bwhat i want\\b", 1.5],
  ], [["I'm not sure what I want yet, and I'd like to think it through.", "take some time to figure it out"], ["I'm leaning one way, but I'm not fully certain.", "talk through the options"],
      ["I need help deciding.", "think it through together"]]),
  S("stress", "stress or overwhelm", 2, [
    ["\\boverwhelm(ed|ing)\\b", 3, true], ["\\bcan'?t (deal|cope|handle)\\b", 3], ["\\btoo much\\b", 2.5], ["\\bstress(ed|ful)?\\b", 2.5, true], ["\\bburn(ed|t) out\\b", 3],
    ["\\bexhausted\\b", 1.5, true], ["\\bso tired\\b", 1.5], ["\\beverything (right now|at once)\\b", 2],
  ], [["I'm overwhelmed and can't take much more on right now.", "go easy on me for a little while"], ["I want to help, but I'm stretched too thin.", "work out what can wait"],
      ["I need to slow down and catch my breath.", "pause for a little while"]]),
  S("reassurance", "needing reassurance", 2, [
    ["\\bdo you (even )?care\\b", 3], ["\\bdo you still (like|love|want|care)\\b", 3], ["\\bare we (ok|okay|good|fine)\\b", 3], ["\\bare you (mad|upset|angry) (at|with) me\\b", 3],
    ["\\bdon'?t care about me\\b", 3], ["\\bdo i matter\\b", 3],
  ], [["I need to know that you still care.", "talk about where we stand"], ["I'm worried about where we stand and want some reassurance.", "check in with each other"],
      ["I want to feel important to you.", "talk about how we show up for each other"]]),
  S("greeting", "a greeting", 3, [
    ["^(hi|hello|hey|hiya|yo|hey there|hi there|good (morning|afternoon|evening))\\W*$", 4],
  ], [["I just want to say hello warmly.", ""], ["I want to start a conversation about something specific.", "start with what's on my mind"], ["I want to check in on how they're doing.", "check in with each other"]]),
  S("informational", "an everyday or factual message", 2, [
    ["\\b(what|when|where|which) (time|is|are|does|do)\\b", 2], ["\\bstarts? at\\b", 2], ["\\b\\d{1,2}(:\\d\\d)?\\s?(am|pm)\\b", 2],
    ["\\b(meeting|schedule|deadline|agenda|tomorrow)\\b", 1.5], ["\\btime\\b", 1],
  ], [["I just want to share this information clearly.", ""], ["There's more behind this message than the facts.", "talk about what's behind this"], ["I want to make sure they've seen this.", "confirm we're on the same page"]]),
  S("unknown", "an unclear message", 99, [], [["I'm not sure how to say what I mean yet.", "work it out together"], ["There's something I want to share, but I don't know how to start.", "start with the simplest part"],
      ["I want to ask for something.", "talk about what I need"], ["I just want to say this plainly.", "talk plainly about this"]]),
];

const compiled = SCENARIOS.map((s) => ({ s, res: s.patterns.map(([src, w, n]) => ({ re: new RegExp(src, "g"), w, neg: !!n })) }));
const NEGATED = /(?:\bnot|\bnever|\bno\b|n't|\bwithout)(?:\s+\w+){0,2}\s*$/;
const NON_EMOTIONAL: ScenarioId[] = ["greeting", "informational", "unknown"];

export const normalize = (t: string) => t.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
const toIntention = (s: Scenario, i: number): Intention => ({ id: `${s.id}-${i}`, label: s.intents[i][0], action: s.intents[i][1], scenario: s.id });

/** Deterministic: weighted phrase matching, negation guard, fixed tie-break by scenario order. */
export function interpret(message: string): Interpretation {
  const text = normalize(message);
  const scored = compiled.map(({ s, res }, order) => {
    let score = 0;
    const signals: string[] = [];
    for (const { re, w, neg } of res) {
      for (const m of text.matchAll(re)) {
        if (neg && NEGATED.test(text.slice(0, m.index))) continue;
        score += w;
        signals.push(m[0]);
      }
    }
    return { s, order, score, signals };
  });
  const hits = scored.filter((r) => r.score >= r.s.min).sort((a, b) => b.score - a.score || a.order - b.order);
  const top = hits[0];
  const primary = top ?? scored[scored.length - 1];
  const strength: Strength = !top ? "weak" : top.score >= top.s.min * 2 ? "strong" : "moderate";
  const intentions = primary.s.intents.map((_, i) => toIntention(primary.s, i));
  if (top && !NON_EMOTIONAL.includes(top.s.id)) {
    for (const r of hits.slice(1)) {
      if (intentions.length >= 5) break;
      if (!NON_EMOTIONAL.includes(r.s.id)) intentions.push(toIntention(r.s, 0));
    }
  }
  return { scenario: primary.s.id, scenarioLabel: primary.s.label, strength, signals: [...new Set(primary.signals)].slice(0, 3), intentions };
}
