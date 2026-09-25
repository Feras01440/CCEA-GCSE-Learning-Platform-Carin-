import { describe, expect, it } from "vitest";
import { describeFailure, explains, isSeeHeading, shows, teachShowCheck, workedSteps } from "../../../scripts/qa/teach-show-check.mjs";

/**
 * The owner's ruling of 24 Sep 2026 ("Teach before you check", STANDARDS.md; the Depth standard in
 * pipeline/prompts/author-topic.md): a gate comes only after the idea is explained AND shown worked in
 * front of her, within its own section; a section is explain, then show, then check. The lint lives in
 * scripts/qa/teach-show-check.mjs and runs inside scripts/qa/lesson-v2.mjs.
 */

type Block = Record<string, unknown>;
const hero: Block = { type: "hero", lede: "A lede.", can: ["Do a", "Do b", "Do c"], minutes: 8 };
const h = (text: string, role?: string): Block => (role ? { type: "h", text, role } : { type: "h", text });
const p = (md: string): Block => ({ type: "p", md });
const gate = (id: string): Block => ({ type: "gate", id, kind: "choice", prompt: "Which?", options: ["A", "B"], answer: "A", explain: "Because." });
const figure: Block = { type: "figure", alt: "A bar model", svg: "<svg viewBox='0 0 10 10'><rect width='5' height='5'/></svg>", caption: "Two equal parts." };
const EXPLAIN = p("A fraction is one number divided by another, so cancelling divides the top and the bottom by the same thing and leaves the value unchanged.");
const WORKED = p("$\\frac{6x}{3x} = \\frac{2 \\times 3x}{3x}$\n$= 2$");
const recap = [h("You can now", "recap"), p("Cancel.\nFactorise.\nCheck.")];
const pointer = [h("In the exam", "pointer"), p("One paragraph."), { type: "prompt", promptId: "rp.x.001" }];

const note = (...body: Block[]) => [hero, ...body, ...recap, ...pointer];

describe("teach → show → check", () => {
  it("passes a section that explains, then shows, then checks", () => {
    const r = teachShowCheck(note(h("What cancelling is", "idea"), EXPLAIN, WORKED, gate("g1")));
    expect(r.failures).toEqual([]);
    expect(r.gates).toBe(1);
    expect(r.sections[0].gates).toEqual([{ id: "g1", explained: true, shown: true }]);
  });

  it("fails a gate that comes before its explanation", () => {
    const r = teachShowCheck(note(h("What cancelling is", "idea"), WORKED, gate("g1"), EXPLAIN));
    expect(r.failures).toEqual([{ gate: "g1", section: "What cancelling is", sectionIndex: 1, role: "idea", missing: ["explained"] }]);
    expect(describeFailure(r.failures[0])).toMatch(/^teach → show → check: gate g1 .* before its section explains the idea/);
  });

  it("fails a gate whose section explains but shows nothing worked", () => {
    const r = teachShowCheck(note(h("What cancelling is", "idea"), EXPLAIN, gate("g1")));
    expect(r.failures.map((f: { gate: string; missing: string[] }) => [f.gate, f.missing])).toEqual([["g1", ["shown"]]]);
  });

  it("does not carry teaching across a heading: each section teaches its own check", () => {
    const r = teachShowCheck(note(h("Idea", "idea"), EXPLAIN, WORKED, gate("g1"), h("Second case", "variant"), gate("g2")));
    expect(r.failures.map((f: { gate: string; missing: string[] }) => [f.gate, f.missing])).toEqual([["g2", ["explained", "shown"]]]);
  });

  it("lets a 'See it done' section show what the section above it explained", () => {
    const video = { type: "video", videoId: "abc", title: "Worked", channel: "C", why: "Watch the method." };
    const labelled = teachShowCheck(note(h("The method", "variant"), EXPLAIN, h("See it done", "see"), video, gate("g1")));
    expect(labelled.failures).toEqual([]);
    const unlabelled = teachShowCheck(note(h("The method"), EXPLAIN, h("See it done"), video, gate("g1")));
    expect(unlabelled.failures).toEqual([]);
    // the physics notes call it "Watch it done" / "Watch the construction done"; a note beside the clip
    // does not make it a new idea
    const notonspec = { type: "callout", kind: "notonspec", title: "Beyond CCEA", md: "The clip also draws diverging lenses, which the Double Award does not ask you to draw." };
    for (const heading of ["6. Watch it done", "8. Watch the construction done", "5. Watch it explained"]) {
      expect(isSeeHeading(heading)).toBe(true);
      const watch = teachShowCheck(note(h("The method"), EXPLAIN, WORKED, gate("g0"), h(heading), video, notonspec, gate("g1")));
      expect(watch.failures).toEqual([]);
    }
    expect(isSeeHeading("5. Watch it happen")).toBe(true);
    expect(isSeeHeading("Watch out for the sign")).toBe(false);
    expect(isSeeHeading("Watch the axis label")).toBe(false);
    expect(isSeeHeading("Watch the terms build up")).toBe(false);
  });

  it("accepts one paragraph that explains in words and carries two worked steps", () => {
    const both = p("Take the common factor out first, because it is what makes the quadratic underneath visible to you: $4x^2 - 8x = 4x(x - 2)$, and then $x^2 - 4 = (x - 2)(x + 2)$.");
    expect(explains(both)).toBe(true);
    expect(shows(both)).toBe(true);
    expect(teachShowCheck(note(h("Common factor first", "variant"), both, gate("g1"))).failures).toEqual([]);
  });

  it("counts a worked paragraph as shown and not, on its own words, as explained", () => {
    expect(workedSteps(WORKED.md)).toBe(2);
    expect(shows(WORKED)).toBe(true);
    expect(explains(WORKED)).toBe(false);
    expect(teachShowCheck(note(h("Worked", "variant"), WORKED, gate("g1"))).failures[0].missing).toEqual(["explained"]);
  });

  it("counts numbered steps as worked only when they carry maths or a number", () => {
    expect(workedSteps("1. Factorise the top.\n2. Factorise the bottom.")).toBe(0);
    expect(workedSteps("**Step 1.** Multiply out: 3 times 4 is 12.\n**Step 2.** Subtract 5 to leave 7.")).toBe(2);
    expect(workedSteps("$\\ce{Mg + 2HCl -> MgCl2 + H2}$ then $\\ce{MgCl2}$ dissolves")).toBe(2);
  });

  it("counts a chain of equalities and maths joined by a word of working as steps", () => {
    expect(workedSteps("$5x^2 - 45 = 5(x^2 - 9) = 5(x + 3)(x - 3)$")).toBe(2);
    expect(workedSteps("Take out the 5 and $5x^2 - 45$ becomes $5(x^2 - 9)$.")).toBe(1);
    expect(workedSteps("$y = mx + c$")).toBe(0); // a formula stated is not a step worked
    // science writes its arithmetic as plain text
    expect(workedSteps("The total is **60**, so the mean is **60 ÷ 10 = 6 daisies per quadrat**, and 6 × 4000 = 24 000.")).toBe(2);
    expect(workedSteps("**Step 1.** 60 ÷ 10 = 6")).toBe(1);
  });

  it("counts one complete calculation, numbers in and a number out, as shown on its own", () => {
    // b1-reflex-arc: the paragraph carries the whole one-step calculation the gate then asks for
    const reflex = p("That is why a reflex takes a fraction of a second: an impulse travelling 1.5 m at about 50 m/s takes 1.5 ÷ 50 = 0.03 s.");
    expect(shows(reflex)).toBe(true);
    expect(shows(p("Take moments about the pivot: $400 \\times 0.9 = 360$ N m on the left."))).toBe(true);
    expect(shows(p("The mean is $\\frac{60}{10} = 6$ daisies per quadrat."))).toBe(true);
    // a formula, or a condition, is not a calculation carried out
    expect(shows(p("The straight line is $y = mx + c$, where $m$ is the gradient."))).toBe(false);
    expect(shows(p("Its area is $A = \\pi r^2$ for a circle of radius $r$."))).toBe(false);
  });

  it("reads a double inequality as one condition, not two worked steps", () => {
    expect(workedSteps("A number is in standard form when it looks like $a \\times 10^{n}$ with $1 \\le a < 10$ and $n$ a whole number.")).toBe(1);
    expect(shows(p("A number is in standard form when it looks like $a \\times 10^{n}$ with $1 \\le a < 10$ and $n$ a whole number."))).toBe(false);
    // solving an inequality is still two steps
    expect(workedSteps("Subtract 3 from both sides: $2x + 3 < 11$ becomes $2x < 8$, so $x < 4$.")).toBe(3);
  });

  it("lets a section of visuals only (a sim, a video) show what the section above explained", () => {
    const sim = { type: "sim", provider: "phet", url: "https://phet.colorado.edu", title: "Circuit kit", attribution: "PhET", licence: "CC BY", task: "Turn a cell round." };
    const r = teachShowCheck(note(h("Cells in series", "idea"), EXPLAIN, gate("g1"), h("Turn a cell round yourself"), sim, gate("g2")));
    expect(r.failures.map((f: { gate: string }) => f.gate)).toEqual(["g1"]);
    expect(r.sections.find((s: { heading: string }) => s.heading === "Cells in series")?.joined).toEqual(["Turn a cell round yourself"]);
  });

  it("reads only titled callouts of a teaching kind as explanation", () => {
    const md = "Cancelling divides the whole top and the whole bottom by one factor, so a term that is added cannot be cancelled on its own.";
    expect(explains({ type: "callout", kind: "why", title: "Why terms do not cancel", md })).toBe(true);
    expect(explains({ type: "callout", kind: "why", md })).toBe(false);
    expect(explains({ type: "callout", kind: "notonspec", title: "Beyond the course", md })).toBe(false);
    expect(explains({ type: "callout", kind: "spec", title: "Specification", md })).toBe(false);
  });

  it("carries a teaching section with no check of its own into the next section: nothing has closed it", () => {
    const r = teachShowCheck(note(h("Idea", "idea"), EXPLAIN, WORKED, gate("g0"), h("The method, worked"), EXPLAIN, WORKED, h("2. Your turn", "variant"), EXPLAIN, gate("g1")));
    expect(r.failures).toEqual([]);
    const row = r.sections.find((s: { heading: string }) => s.heading === "2. Your turn");
    expect(row?.joined).toEqual(["The method, worked"]);
    // …but a section closed by its own gate never lends its teaching to the next one
    const closed = teachShowCheck(note(h("What changes the rate"), EXPLAIN, WORKED, gate("g0"), h("1. One graph", "idea"), EXPLAIN, gate("g1")));
    expect(closed.failures.map((f: { gate: string; missing: string[] }) => [f.gate, f.missing])).toEqual([["g1", ["shown"]]]);
  });

  it("never carries the opening (the hook and the hero figure) into the first section (verifier, b1-fieldwork-sampling g1, g2)", () => {
    // the hook sits before the first heading, or under the note's first heading: either way it is not a section's show
    const bare = teachShowCheck(note(p("Ecologists count a few squares and scale up."), WORKED, h("Six terms", "idea"), EXPLAIN, gate("g1")));
    expect(bare.failures.map((f: { gate: string; missing: string[] }) => [f.gate, f.missing])).toEqual([["g1", ["shown"]]]);
    const headed = teachShowCheck(note(h("Ecological terms and the quadrat"), p("Ecologists count a few squares and scale up."), WORKED, h("Six terms", "idea"), EXPLAIN, gate("g1")));
    expect(headed.failures.map((f: { gate: string; missing: string[] }) => [f.gate, f.missing])).toEqual([["g1", ["shown"]]]);
  });

  it("does not count a figure or a photo alone as shown: a picture explains, it does not work the method (verifier; ruling)", () => {
    const photo = { type: "photo", src: "/img/x.jpg", alt: "A quadrat", credit: "c", licence: "CC BY" };
    expect(shows(figure)).toBe(false);
    expect(shows(photo)).toBe(false);
    expect(teachShowCheck(note(h("Idea", "idea"), EXPLAIN, figure, gate("g1"))).failures[0].missing).toEqual(["shown"]);
    // a video or a sim still carries the method out in front of her
    expect(shows({ type: "video", videoId: "v", title: "t", channel: "c" })).toBe(true);
    expect(shows({ type: "sim", provider: "phet", url: "u", title: "t", attribution: "a", licence: "l", task: "k" })).toBe(true);
  });

  it("does not count a formula list, a must-know callout or a labelled number as worked (verifier, m7/standard-form g14)", () => {
    expect(workedSteps("The circle: $A = \\pi r^2$ and $C = 2\\pi r$.")).toBe(0);
    expect(workedSteps("The laws: $a^m \\times a^n = a^{m+n}$ and $a^m \\div a^n = a^{m-n}$.")).toBe(0);
    expect(workedSteps("**Mean** is 5\n**Range** is 12")).toBe(0);
    const mustknow = { type: "callout", kind: "mustknow", title: "Must be known", md: "$10^{0} = 1$, $10^{-1} = 0.1$, $10^{a} \\times 10^{b} = 10^{a+b}$" };
    expect(shows(mustknow)).toBe(false);
    // a result and a calculation still count
    expect(workedSteps("So $x = 4$ and then $y = 2(4) + 1 = 9$.")).toBe(3);
  });

  it("recognises a worked conversion written as 'X is Y, because …' (verifier, m7/standard-form g8)", () => {
    const conv = p("Convert first. $1.05 \\times 10^{7}$ grams is $1.05 \\times 10^{4}$ kilograms, because dividing by 1000 lowers the power by 3.");
    expect(shows(conv)).toBe(true);
    expect(shows(p("The mean is 5 and the range is 12."))).toBe(false);
    // g10: a calculator display written out on the answer line is the same conversion, shown
    expect(shows(p("Some calculators show **6.82E8**. Copy it onto the answer line in full: $6.82 \\times 10^{8}$."))).toBe(true);
    expect(shows(p("Some calculators show **6.82E8**; never copy the E."))).toBe(false);
  });

  it("resets 'shown' after each check: the next check needs its own demonstration, unless it follows straight on (two turns on one demonstration)", () => {
    // m8/equation-of-a-circle g11: its move is taught only after it
    const later = teachShowCheck(note(h("Tangent", "variant"), EXPLAIN, WORKED, gate("g4"), EXPLAIN, gate("g11"), WORKED, gate("g5")));
    expect(later.failures.map((f: { gate: string; missing: string[] }) => [f.gate, f.missing])).toEqual([["g11", ["shown"]]]);
    // "explained" persists through the section: a second worked example needs no fresh paragraph
    const again = teachShowCheck(note(h("Adding", "variant"), EXPLAIN, WORKED, gate("g12"), WORKED, gate("g6")));
    expect(again.failures).toEqual([]);
    // two turns straight after one demonstration (the design case's "1 of 2, 2 of 2")
    const pair = teachShowCheck(note(h("Two cases", "variant"), EXPLAIN, WORKED, WORKED, gate("g3"), gate("g7")));
    expect(pair.failures).toEqual([]);
  });

  it("treats the four-card figure as a ceiling, not a quota: long teaching before one check passes", () => {
    const r = teachShowCheck(note(h("Idea", "idea"), EXPLAIN, figure, EXPLAIN, WORKED, EXPLAIN, WORKED, gate("g1")));
    expect(r.failures).toEqual([]);
  });

  it("checks the hook's opening section and ignores anything after the recap", () => {
    const r = teachShowCheck([hero, p("Short hook."), gate("g0"), h("Idea", "idea"), EXPLAIN, WORKED, gate("g1"), h("You can now", "recap"), p("a\nb\nc"), gate("g9")]);
    expect(r.failures.map((f: { gate: string; section: string }) => [f.gate, f.section])).toEqual([["g0", "(opening)"]]);
    expect(r.gates).toBe(2);
  });
});
