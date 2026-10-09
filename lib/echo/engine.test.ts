import test from "node:test";
import assert from "node:assert/strict";
import { interpret } from "./interpret.ts";
import { rewrite } from "./rewrite.ts";
import { CATEGORIES, DEMOS } from "./examples.ts";

const labels = (m: string) => interpret(m).intentions.map((i) => i.label);

test("different messages produce different suggestion sets", () => {
  const sets = ["Fine, whatever you want.", "Nobody listens when I try to explain myself.", "Leave me alone for a while.", "I'm exhausted from always being the one who tries."].map((m) => labels(m).join("|"));
  assert.equal(new Set(sets).size, sets.length);
  assert.equal(interpret("Fine, whatever you want.").scenario, "avoid-conflict");
  assert.equal(interpret("I need you to respect my time.").scenario, "boundaries");
});
test("greetings and facts are not forced into emotions", () => {
  assert.equal(interpret("Hi.").scenario, "greeting");
  assert.equal(interpret("The meeting starts at 3 PM.").scenario, "informational");
  assert.equal(interpret("I don't care about the meeting time").scenario, "informational");
});
test("negation blocks false positives", () => {
  assert.notEqual(interpret("I'm not angry").scenario, "anger");
  assert.notEqual(interpret("I don't need space").scenario, "space");
  assert.notEqual(interpret("I'm happy with this").scenario, "disappointment");
});
test("ambiguous messages are weak and cautious", () => {
  const r = interpret("Okay then.");
  assert.equal(r.strength, "weak");
  assert.ok(r.intentions.length >= 3);
});
test("every result offers 3 to 5 suggestions, deterministically", () => {
  for (const c of CATEGORIES) for (const e of c.examples) {
    const r = interpret(e);
    assert.ok(r.intentions.length >= 3 && r.intentions.length <= 5, e);
    assert.deepEqual(r, interpret(e));
  }
});
test("tone changes wording; another version differs", () => {
  const i = interpret("Nobody listens when I try to explain myself.").intentions[0];
  const outs = (["gentle", "direct", "warm", "brief"] as const).map((t) => rewrite("Nobody listens.", i, t)[0]);
  assert.equal(new Set(outs).size, 4);
  for (const t of ["gentle", "direct", "warm", "brief"] as const) {
    const v = rewrite("Nobody listens.", i, t);
    assert.ok(v.length >= 2 && v[0] !== v[1]);
  }
});
test("custom intention is preserved in the rewrite", () => {
  const out = rewrite("Whatever.", { label: "I want a say in the plan", action: "talk about it", scenario: "avoid-conflict" }, "direct");
  assert.ok(out.every((s) => s.includes("I want a say in the plan")));
});
test("demos resolve to the expected scenarios and rewrite", () => {
  const exp = { unheard: "misunderstood", effort: "unappreciated", space: "space" } as const;
  for (const d of DEMOS) {
    const r = interpret(d.text);
    assert.equal(r.scenario, exp[d.id as keyof typeof exp]);
    assert.ok(rewrite(d.text, r.intentions[0], "warm")[0].length > 20);
  }
});
