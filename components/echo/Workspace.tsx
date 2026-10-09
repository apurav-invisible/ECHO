"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, RefreshCw } from "lucide-react";
import { CATEGORIES, DEMOS } from "@/lib/echo/examples";
import { interpret } from "@/lib/echo/interpret";
import { TONES, rewrite } from "@/lib/echo/rewrite";
import type { Intention, Step, Tone } from "@/lib/echo/types";

const CUSTOM_ID = "custom";

const STEPS: { id: Step; label: string }[] = [
  { id: "notice", label: "Notice" },
  { id: "clarify", label: "Clarify" },
  { id: "connect", label: "Connect" },
];

/** Every stage shares this skeleton: stage marker, heading, context, body, actions, note. */
function Stage({ index, title, headingRef, context, actions, note, children }: {
  index: number; title: ReactNode; headingRef: Ref<HTMLHeadingElement>;
  context?: ReactNode; actions: ReactNode; note: string; children: ReactNode;
}) {
  return (
    <section className="fade-in">
      <p className="meta mb-4"><span className="text-sage-dark">0{index + 1}</span> / 03 &mdash; {STEPS[index].label}</p>
      <h1 ref={headingRef} tabIndex={-1} className="mb-10 max-w-[26ch] text-balance text-3xl leading-[1.15] outline-none md:text-[2.5rem]">{title}</h1>
      {context && <div className="mb-10">{context}</div>}
      <div>{children}</div>
      <div className="mt-10 flex flex-wrap items-center gap-x-2">{actions}</div>
      <p className="mt-14 border-t border-rule pt-5 font-sans text-xs leading-relaxed text-quiet">{note}</p>
    </section>
  );
}

function Original({ text, onEdit }: { text: string; onEdit?: () => void }) {
  return (
    <div className="border-l-2 border-rule pl-5">
      <p className="meta mb-1">You wrote</p>
      <p className="text-lg italic text-quiet">&ldquo;{text}&rdquo;</p>
      {onEdit && <button onClick={onEdit} className="btn btn-quiet -ml-0 h-10"><ArrowLeft size={14} aria-hidden /> Edit message</button>}
    </div>
  );
}

export function Workspace() {
  const [step, setStep] = useState<Step>("notice");
  const [message, setMessage] = useState("");
  const [intentionId, setIntentionId] = useState("");
  const [custom, setCustom] = useState("");
  const [variantIdx, setVariantIdx] = useState(0);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const [announce, setAnnounce] = useState("");
  const [tone, setTone] = useState<Tone>("gentle");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  const hasMessage = message.trim().length > 0;
  const interp = useMemo(() => interpret(message), [message]);
  const chosen: Intention | undefined = intentionId === CUSTOM_ID
    ? (custom.trim() ? { id: CUSTOM_ID, label: custom.trim(), action: "talk about it", scenario: interp.scenario } : undefined)
    : interp.intentions.find((i) => i.id === intentionId);
  const hasIntention = !!chosen;
  const reachable: Record<Step, boolean> = { notice: true, clarify: hasMessage, connect: hasMessage && hasIntention && draft !== "" };
  const current = STEPS.findIndex((s) => s.id === step);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    heading.current?.focus();
    setAnnounce(`Step ${current + 1} of 3: ${STEPS[current].label}`);
  }, [step, current]);

  const variants = chosen ? rewrite(message, chosen, tone) : [];

  function toConnect() {
    setVariantIdx(0); setDraft(variants[0] ?? ""); setCopied("idle"); setStep("connect");
  }
  function another() {
    const next = (variantIdx + 1) % variants.length;
    setVariantIdx(next); setDraft(variants[next]); setCopied("idle");
  }
  function changeTone(t: Tone) {
    if (!chosen) return;
    const v = rewrite(message, chosen, t);
    setTone(t); setVariantIdx(0); setDraft(v[0] ?? ""); setCopied("idle");
    setAnnounce(`${TONES.find((x) => x.id === t)?.label} tone applied`);
  }
  function loadDemo(text: string) { setMessage(text); setIntentionId(""); setStep("clarify"); }
  async function copy() {
    try { await navigator.clipboard.writeText(draft); setCopied("done"); setAnnounce("Message copied to clipboard"); }
    catch { setCopied("failed"); setAnnounce("Copy failed. Select the text and copy it manually."); }
    setTimeout(() => setCopied("idle"), 2500);
  }
  function startOver() {
    setMessage(""); setIntentionId(""); setCustom(""); setDraft(""); setVariantIdx(0); setTone("gentle"); setCategory(CATEGORIES[0].id); setCopied("idle"); setStep("notice");
  }

  const options = [...interp.intentions.map((i) => ({ id: i.id, label: i.label })), { id: CUSTOM_ID, label: "None of these fits. I'll say it myself." }];
  const why = interp.strength === "weak"
    ? "This could mean several different things, so these are only starting points."
    : interp.signals.length
      ? `Wording like ${interp.signals.map((x) => `“${x}”`).join(", ")} sometimes points to ${interp.scenarioLabel}. These might be close to what you mean.`
      : "These might be close to what you mean.";
  const cat = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];
  const clarifyLabel = !intentionId ? "Choose a possibility" : hasIntention ? "This is what I mean" : "Write what you mean";

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b border-rule px-6 pt-6 md:border-b-0 md:border-r md:px-8 md:py-14">
        <div className="md:sticky md:top-14">
          <p className="text-2xl tracking-[0.22em]">ECHO</p>
          <p className="meta mt-1">The Unspoken Translator</p>
          <div className="mt-5 flex gap-1 md:hidden" aria-hidden>
            {STEPS.map((s, i) => <span key={s.id} className={`h-0.5 flex-1 transition-colors ${i <= current ? "bg-sage" : "bg-rule"}`} />)}
          </div>
          <nav aria-label="Progress" className="mt-3 pb-3 md:mt-16 md:pb-0">
            <ol className="flex justify-between md:block md:border-t md:border-rule">
              {STEPS.map((s, i) => (
                <li key={s.id} className="md:border-b md:border-rule">
                  <button
                    onClick={() => setStep(s.id)}
                    disabled={!reachable[s.id]}
                    aria-current={step === s.id ? "step" : undefined}
                    className={`flex items-baseline gap-3 py-2 font-sans text-sm transition-colors disabled:cursor-not-allowed disabled:text-quiet/50 md:w-full md:py-4 ${step === s.id ? "text-ink" : "text-quiet hover:text-ink"}`}
                  >
                    <span className={`meta tabular-nums ${step === s.id ? "!text-sage-dark" : ""}`}>0{i + 1}</span>
                    <span className={step === s.id ? "border-b border-sage" : ""}>{s.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </aside>

      <main className="px-6 py-12 md:px-16 md:py-14 lg:px-24">
        <div className="max-w-[40rem]">
          <p className="sr-only" role="status" aria-live="polite">{announce}</p>

          {step === "notice" && (
            <Stage key="notice" index={0} headingRef={heading}
              title={<>Sometimes the hardest part isn&rsquo;t knowing what you feel. <span className="text-quiet">It&rsquo;s finding the words.</span></>}
              note="This prototype runs in your browser. Nothing you type is sent, stored or shared, and nothing is ever sent for you."
              actions={<>
                <button className="btn btn-primary" disabled={!hasMessage} onClick={() => setStep("clarify")}>Continue <ArrowRight size={16} aria-hidden /></button>
                {!hasMessage && <span className="ml-3 font-sans text-xs text-quiet">Write something to continue.</span>}
              </>}>
              <label htmlFor="msg" className="meta mb-3 block">What were you about to say?</label>
              <textarea id="msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type it as it first came to mind." className="surface min-h-44 resize-y p-5 text-xl leading-relaxed md:p-6" />
              <p className="meta mb-3 mt-8" id="ex-label">Or start from an example</p>
              <div role="group" aria-label="Example categories" className="mb-3 flex flex-wrap gap-x-5">
                {CATEGORIES.map((c) => (
                  <button key={c.id} aria-pressed={c.id === category} onClick={() => setCategory(c.id)} className={`h-10 border-b font-sans text-sm transition-colors ${c.id === category ? "border-sage text-ink" : "border-transparent text-quiet hover:text-ink"}`}>{c.label}</button>
                ))}
              </div>
              <ul aria-labelledby="ex-label" className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
                {cat.examples.map((ex) => (
                  <li key={ex} className="bg-paper">
                    <button onClick={() => setMessage(ex)} className="flex min-h-12 w-full items-center px-4 py-2 text-left text-base transition-colors hover:bg-white">&ldquo;{ex}&rdquo;</button>
                  </li>
                ))}
              </ul>
              <p className="meta mb-3 mt-8" id="demo-label">Explore a guided example</p>
              <div role="group" aria-labelledby="demo-label" className="flex flex-wrap gap-2">
                {DEMOS.map((d) => (
                  <button key={d.id} onClick={() => loadDemo(d.text)} className="btn h-10 border-rule px-4 text-ink hover:border-sage">{d.title} <ArrowRight size={14} aria-hidden /></button>
                ))}
              </div>
            </Stage>
          )}

          {step === "clarify" && (
            <Stage key="clarify" index={1} headingRef={heading} title="What might you mean?"
              context={<Original text={message.trim()} onEdit={() => setStep("notice")} />}
              note="These are possibilities, not conclusions. Only you know what you mean, and nothing moves forward until you say so."
              actions={<>
                <button className="btn btn-primary" disabled={!hasIntention} onClick={toConnect}>{clarifyLabel} {hasIntention && <ArrowRight size={16} aria-hidden />}</button>
                <button className="btn btn-quiet ml-2" onClick={() => setIntentionId("")} disabled={!intentionId}>Clear choice</button>
              </>}>
              <fieldset>
                <legend className="mb-5 block font-sans text-sm leading-relaxed text-quiet">{why}</legend>
                <div className="border-y border-rule">
                  {options.map((o, i) => {
                    const on = intentionId === o.id;
                    return (
                      <div key={o.id} className={i > 0 ? "border-t border-rule" : ""}>
                        <label className={`flex cursor-pointer items-start gap-4 border-l-2 py-5 pl-4 pr-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-ink ${on ? "border-sage bg-white" : "border-transparent hover:bg-white/60"}`}>
                          <input type="radio" name="intention" value={o.id} checked={on} onChange={() => setIntentionId(o.id)} className="peer sr-only" />
                          <span aria-hidden className={`mt-[7px] grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors ${on ? "border-ink" : "border-quiet"}`}>
                            <span className={`size-2 rounded-full bg-ink transition-opacity ${on ? "opacity-100" : "opacity-0"}`} />
                          </span>
                          <span className="text-xl leading-snug">{o.label}</span>
                        </label>
                        {o.id === CUSTOM_ID && on && (
                          <div className="fade-in border-l-2 border-sage bg-white pb-5 pl-[3.25rem] pr-3">
                            <label htmlFor="custom" className="meta mb-2 block">In your own words</label>
                            <textarea id="custom" rows={2} value={custom} onChange={(e) => setCustom(e.target.value)} className="surface p-4 text-lg leading-relaxed" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </Stage>
          )}

          {step === "connect" && (
            <Stage key="connect" index={2} headingRef={heading} title="Say it your way."
              context={
                <div className="space-y-6">
                  <Original text={message.trim()} />
                  <div className="border-l-2 border-sage pl-5">
                    <p className="meta mb-1">You confirmed</p>
                    <p className="text-xl leading-snug">{chosen?.label}</p>
                  </div>
                </div>
              }
              note="Nothing has been sent. Copy the message and use it wherever you choose."
              actions={<>
                <button className="btn btn-primary" onClick={copy} disabled={!draft.trim()}>
                  {copied === "done" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                  {copied === "done" ? "Copied" : copied === "failed" ? "Copy failed" : "Copy message"}
                </button>
                {variants.length > 1 && <button className="btn btn-quiet ml-2" onClick={another}><RefreshCw size={14} aria-hidden /> Another version</button>}
                <span aria-hidden className={`font-sans text-xs ${copied === "failed" ? "text-ink" : "text-sage-dark"}`}>
                  {copied === "done" ? "Copied to clipboard" : copied === "failed" ? "Select the text and copy manually" : ""}
                </span>
                <div className="mt-4 flex w-full flex-wrap border-t border-rule pt-2">
                  <button className="btn btn-quiet" onClick={() => setStep("clarify")}><ArrowLeft size={14} aria-hidden /> Change intention</button>
                  <button className="btn btn-quiet" onClick={() => setStep("notice")}>Edit original</button>
                  <button className="btn btn-quiet" onClick={startOver}>Start over</button>
                </div>
              </>}>
              <div role="group" aria-label="Tone" className="mb-6 flex flex-wrap items-center gap-x-5">
                <span className="meta mr-1">Tone</span>
                {TONES.map((t) => (
                  <button key={t.id} aria-pressed={t.id === tone} onClick={() => changeTone(t.id)} className={`h-10 border-b font-sans text-sm transition-colors ${t.id === tone ? "border-sage text-ink" : "border-transparent text-quiet hover:text-ink"}`}>{t.label}</button>
                ))}
              </div>
              <label htmlFor="draft" className="meta mb-3 block">Your message &mdash; edit it until it sounds like you</label>
              <textarea key={variantIdx} id="draft" value={draft} onChange={(e) => { setDraft(e.target.value); setCopied("idle"); }}
                className="surface fade-in min-h-48 resize-y border-t-2 !border-t-sage p-6 text-2xl leading-snug md:p-8" />
            </Stage>
          )}
        </div>
      </main>
    </div>
  );
}
