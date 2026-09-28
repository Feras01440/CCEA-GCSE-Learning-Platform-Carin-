import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BOTTOM, EMPTY_TAP, PILLS, RESULT, SHARED, TOP, checkTap, pillReading, productForm, rightLine, substituteFor, tapGroupLabel, tapPair, type PillId, type TapState } from "./afs-model";

const pair = (state: TapState, a: PillId, b: PillId) => tapPair(state, a, b);
const ALL = PILLS.map((p) => p.id);

/** Every state she can reach by pairing taps from nothing, in any order, right pairs and wrong. */
function reachable(): TapState[] {
  const seen = new Map<string, TapState>([[JSON.stringify(EMPTY_TAP.struck), EMPTY_TAP]]);
  const queue: TapState[] = [EMPTY_TAP];
  while (queue.length > 0) {
    const s = queue.shift()!;
    for (const a of ALL)
      for (const b of ALL) {
        if (a === b || s.struck.includes(a) || s.struck.includes(b)) continue;
        const next = tapPair(s, a, b).state;
        const key = JSON.stringify([...next.struck].sort());
        if (!seen.has(key)) {
          seen.set(key, next);
          queue.push(next);
        }
      }
  }
  return [...seen.values()];
}

/** What the drawing leaves unstruck on each line, read pill by pill. */
function leftOver(s: TapState): { top: string[]; bottom: string[] } {
  const read = (line: typeof TOP) =>
    line.flatMap((p) => {
      const r = pillReading(p.id, s);
      return r.kind === "split" ? [r.left!] : r.kind === "whole" ? [p.text] : [];
    });
  return { top: read(TOP), bottom: read(BOTTOM) };
}

describe("the figure she acts on: 3x(x + 7) over 6(x + 7)(x − 7), the note's hero example once both lines are factorised", () => {
  it("draws the factors as the paper leaves them, and names what the two lines share: (x + 7), and a 3 inside 3x and 6", () => {
    expect(TOP.map((p) => p.text)).toEqual(["3x", "(x + 7)"]);
    expect(BOTTOM.map((p) => p.text)).toEqual(["6", "(x + 7)", "(x − 7)"]);
    expect(SHARED).toEqual(["t-n", "t-b", "b-n", "b-b"]);
    expect(SHARED).not.toContain("b-m");
    expect(tapGroupLabel()).toBe("The fraction 3x(x + 7) over 6(x + 7)(x − 7), each factor a button");
    // Pairing 3x with 6 turns them into the note's own figure: 3 × x over 3 × 2.
    expect(productForm(TOP)).toBe("3 × x × (x + 7)");
    expect(productForm(BOTTOM)).toBe("3 × 2 × (x + 7) × (x − 7)");
  });

  it("strikes the bracket on both lines whole", () => {
    const r = pair(EMPTY_TAP, "t-b", "b-b");
    expect(r.state.struck).toEqual(["t-b", "b-b"]);
    expect(pillReading("t-b", r.state)).toEqual({ kind: "struck" });
    expect(r.note).toBe("(x + 7) is on both lines, so it divides out. One more: what divides both 3x and 6?");
  });

  it("pairs 3x with 6 by striking the 3 out of each, leaving x and 2, never the whole pills (audit MK-05)", () => {
    const r = pair(EMPTY_TAP, "t-n", "b-n");
    expect(pillReading("t-n", r.state)).toEqual({ kind: "split", factor: "3", left: "x" });
    expect(pillReading("b-n", r.state)).toEqual({ kind: "split", factor: "3", left: "2" });
    expect(r.note).toBe("3x is 3 × x and 6 is 3 × 2: the 3 divides out of both, leaving x and 2. Now the bracket both lines share.");
    // Either order says the top first.
    const back = pair(EMPTY_TAP, "b-n", "t-n");
    expect([...back.state.struck].sort()).toEqual(["b-n", "t-n"]);
    expect(back.note).toBe(r.note);
  });

  it("leaves unstruck exactly the answer: x on top, 2 and (x − 7) underneath", () => {
    let s = pair(EMPTY_TAP, "t-b", "b-b").state;
    const then = pair(s, "t-n", "b-n");
    expect(then.note).toBe("3x is 3 × x and 6 is 3 × 2: the 3 divides out of both, leaving x and 2. Nothing is shared any more. Press Check.");
    s = then.state;
    expect(leftOver(s)).toEqual({ top: ["x"], bottom: ["2", "(x − 7)"] });
    expect(RESULT).toEqual({ top: "x", bottom: "2(x − 7)" });
    expect(`${leftOver(s).top.join("")} / ${leftOver(s).bottom.join("")}`).toBe(`${RESULT.top} / ${RESULT.bottom}`);
    expect(checkTap(s)).toEqual({ correct: true, lit: [], diagnosis: null });
    expect(rightLine()).toBe("Both lines shared (x + 7) and a factor of 3. With both gone, x and 2(x − 7) share nothing: that is the answer.");
  });

  it("strikes exactly (x + 7) on each line and the shared 3 out of 3x and 6, and never touches (x − 7), whatever she taps", () => {
    const states = reachable();
    expect(states.length).toBeGreaterThan(1);
    for (const s of states) {
      expect(s.struck, JSON.stringify(s.struck)).not.toContain("b-m");
      for (const id of s.struck) expect(SHARED, id).toContain(id);
    }
    // The finished state: the struck pieces are the bracket whole on each line and a 3 from each number, nothing else.
    const done = states.find((s) => SHARED.every((k) => s.struck.includes(k)))!;
    const struckPieces = PILLS.map((p) => [p.id, pillReading(p.id, done)] as const).flatMap(([id, r]) => (r.kind === "struck" ? [`${id}:${pillOfText(id)}`] : r.kind === "split" ? [`${id}:${r.factor}`] : []));
    expect(struckPieces.sort()).toEqual(["b-b:(x + 7)", "b-n:3", "t-b:(x + 7)", "t-n:3"]);
    expect(pillReading("b-m", done)).toEqual({ kind: "whole" });
  });

  it("names a mismatch and strikes nothing: a term, or a different bracket, does not divide out", () => {
    const r = pair(EMPTY_TAP, "t-n", "b-m");
    expect(r.state).toEqual(EMPTY_TAP);
    expect(r.note).toBe("3x and (x − 7) are not the same factor, so nothing divides out.");
    expect(pair(EMPTY_TAP, "t-b", "b-m").state.struck).toEqual([]);
    expect(pair(EMPTY_TAP, "t-b", "b-n").state.struck).toEqual([]);
    expect(pair(EMPTY_TAP, "t-b", "b-n").note).toBe("(x + 7) and 6 are not the same factor, so nothing divides out.");
  });

  it("moves the pending pill when the second tap is on the same line", () => {
    expect(pair(EMPTY_TAP, "t-n", "t-b")).toMatchObject({ pending: "t-b", note: "Now its match on the other line." });
  });

  it("on a Check with something still shared, says what, and lights it so she can finish it now", () => {
    const s = pair(EMPTY_TAP, "t-b", "b-b").state;
    expect(checkTap(s)).toEqual({ correct: false, lit: ["t-n", "b-n"], diagnosis: "A factor of 3 still divides both 3x and 6." });
    expect(checkTap(pair(EMPTY_TAP, "t-n", "b-n").state)).toEqual({ correct: false, lit: ["t-b", "b-b"], diagnosis: "(x + 7) still divides both lines." });
    expect(checkTap(EMPTY_TAP)).toEqual({ correct: false, lit: [...SHARED], diagnosis: "(x + 7) and a factor of 3 still divide both lines." });
    // Finishing the lit pair after the miss clears it from the lit set.
    const lit: TapState = { struck: s.struck, lit: ["t-n", "b-n"] };
    expect(pair(lit, "t-n", "b-n").state).toEqual({ struck: ["t-b", "b-b", "t-n", "b-n"], lit: [] });
  });
});

function pillOfText(id: PillId): string {
  return PILLS.find((p) => p.id === id)!.text;
}

/**
 * The drawings stand in for the note's own hero figure (the title card, the first idea card, the Read hero), so they
 * must be the note's example: if the content changes the example, this fails before a picture can contradict its words.
 */
describe("the drawing is the note's own example (the owner rejects any contradiction between a picture and its prose)", () => {
  const ROOT = path.resolve(__dirname, "../../../..");
  const note = JSON.parse(fs.readFileSync(path.join(ROOT, "packs/further-maths/content/fm1/algebraic-fractions-simplify/note.blocks.json"), "utf8")) as Array<{
    type: string;
    alt?: string;
    caption?: string;
    svg?: string;
  }>;
  const hero = note.find((b) => b.type === "figure")!;

  it("says what the hero figure's caption and description say: the 3 and (x + 7) divide out, leaving x over 2(x − 7)", () => {
    const words = `${hero.caption} ${hero.alt}`;
    expect(words).toContain(`${RESULT.top} over ${RESULT.bottom}`);
    for (const shared of new Set(PILLS.filter((p) => SHARED.includes(p.id)).map((p) => p.split?.factor ?? p.text))) expect(words, shared).toContain(shared);
  });

  it("writes the lines as the note's figure writes them once the 3 is taken out: 3 × x × (x + 7) over 3 × 2 × (x + 7) × (x − 7)", () => {
    const text = (hero.svg ?? "").replace(/<title>[\s\S]*?<\/title>/, "");
    const printed = [...text.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
    const joined = printed.join(" ");
    expect(joined).toContain(productForm(TOP));
    expect(joined).toContain(productForm(BOTTOM));
  });
});

describe("the g2 consequence: x = 1 in the fraction and in her cancelled version (audit CT-19, CQ-03)", () => {
  it.each([
    ["The $x$, leaving $4$", false, { value: "4", label: "your cancelled version" }],
    ["The $x$ and the $4$", false, { value: "1", label: "your cancelled version" }],
    ["Nothing", true, { value: "4", label: "the cancelled version" }],
    ["Something reworded later", false, { value: "4", label: "the cancelled version" }],
  ] as const)("%s → %o", (hers, correct, shown) => {
    expect(substituteFor(hers, correct)).toEqual(shown);
  });

  it("knows every option g2 carries in the note, so her own value is drawn, never a stand-in", () => {
    const ROOT = path.resolve(__dirname, "../../../..");
    const note = JSON.parse(fs.readFileSync(path.join(ROOT, "packs/further-maths/content/fm1/algebraic-fractions-simplify/note.blocks.json"), "utf8")) as Array<{
      type: string;
      id?: string;
      prompt?: string;
      options?: string[];
      answer?: string;
      explain?: string;
    }>;
    const g2 = note.find((b) => b.type === "gate" && b.id === "g2")!;
    for (const opt of g2.options!) {
      const right = opt === g2.answer;
      expect(substituteFor(opt, right).label, opt).toBe(right ? "the cancelled version" : "your cancelled version");
    }
    // The picture is the explanation's own test: put x = 1 in, and the fraction is 5.
    expect(g2.explain).toMatch(/\$x\s*=\s*1\$/);
    expect(g2.explain).toMatch(/\$5\$/);
    expect(g2.prompt).toMatch(/\\dfrac\{x\+4\}\{x\}/);
  });
});
