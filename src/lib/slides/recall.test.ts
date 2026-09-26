import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { RetrievalPrompt } from "@/lib/content/schema";
import { RECALL_MAX, RECALL_WORDS, answerWords, chooseRecall, expectedAnswer, recallFit } from "./recall";

const ROOT = path.resolve(__dirname, "../../..");
const TRIAL = path.join(ROOT, "packs", "further-maths", "content", "fm1", "algebraic-fractions-simplify");
const readJson = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));

/** The prompts a note places in its lesson, in the note's order, resolved from its bundle. */
function placed(dir: string): RetrievalPrompt[] {
  const blocks = readJson(path.join(dir, "note.blocks.json")) as Array<{ type: string; promptId?: string }>;
  const prompts = (readJson(path.join(dir, "bundle.json")) as { prompts?: RetrievalPrompt[] }).prompts ?? [];
  const byId = new Map<string, RetrievalPrompt>(prompts.map((p) => [p.id, p]));
  return blocks.filter((b) => b.type === "prompt").flatMap((b) => (byId.has(b.promptId!) ? [byId.get(b.promptId!)!] : []));
}

const prompt = (over: Partial<RetrievalPrompt>): RetrievalPrompt =>
  ({ id: "rp.x.01", topic: "x", specRefs: [], kind: "qa", prompt: "What is it?", answer: "It.", keyWords: [], examUnit: "FM1", difficultyPrior: 3, ...over }) as RetrievalPrompt;

describe("the trial topic's recall cards (the owner: 'it doesn't have to be always four … like writing an essay')", () => {
  /** A prompt of the trial bundle by its number, placed in the note or not. */
  const bundlePrompt = (n: string): RetrievalPrompt =>
    (readJson(path.join(TRIAL, "bundle.json")) as { prompts: RetrievalPrompt[] }).prompts.find((p) => p.id.endsWith(`.${n}`))!;

  it("keeps the two the note now places, both light: the last thing to check, and what to do first with a cubic", () => {
    // The content pass of 25 Sep 2026 wired two prompts into the note, the two light ones; the rest stay in the bundle.
    const two = placed(TRIAL);
    expect(two.map((p) => p.id.split(".").pop())).toEqual(["02", "08"]);
    expect(chooseRecall(two).map((p) => p.id.split(".").pop())).toEqual(["02", "08"]);
    for (const p of two) expect(recallFit(p).ok).toBe(true);
  });

  it("still drops the three moves (a list) and the factor-and-term question (an explanation, asked two ways)", () => {
    const moves = bundlePrompt("01");
    const factorTerm = bundlePrompt("03");
    expect(recallFit(moves)).toMatchObject({ ok: false, reasons: ["asks for a list"] });
    expect(recallFit(factorTerm).ok).toBe(false);
    expect(recallFit(factorTerm).reasons).toEqual(expect.arrayContaining(["asks for an explanation", "asks two things at once"]));
    expect(chooseRecall([moves, factorTerm, ...placed(TRIAL)]).map((p) => p.id.split(".").pop())).toEqual(["02", "08"]);
  });
});

describe("the expected answer: what she is asked to say, without the model answer's explanation", () => {
  it.each([
    ["The numbers. A numerical factor left on both lines, such as a 2 over a 4, means…", "The numbers"],
    ["Take the common factor $x$ out, which leaves $x(x^{2}-9)$, and then factorise. Summer 2018 examiners reported…", "Take the common factor $x$ out"],
    ["$(a+b)(a-b)$, the difference of two squares.", "$(a+b)(a-b)$"],
    ["$\\frac{5}{x-4}$ — the top is $5(x+4)$ and the bottom is $(x+4)(x-4)$.", "$\\frac{5}{x-4}$"],
    ["Zero, because a constant does not change.", "Zero"],
    ["It is $(x+3)(x-3)$; it is not $(x-3)^{2}$.", "It is $(x+3)(x-3)$"],
    ["Divide by 0.7", "Divide by 0.7"],
    // Asides go, and the definition she must say stays whole.
    [
      "Atoms of one element that share an atomic number (the same number of protons) but differ in mass number (different numbers of neutrons).",
      "Atoms of one element that share an atomic number but differ in mass number",
    ],
    ["The value of a factor — temperature or pH — at which the reaction happens at its fastest rate.", "The value of a factor at which the reaction happens at its fastest rate"],
    ["A protein molecule that acts as a biological catalyst: it speeds up the rate of a reaction without being used up.", "A protein molecule that acts as a biological catalyst"],
    ["In a closed system, the rates of the forward and reverse reactions are equal.", "In a closed system, the rates of the forward and reverse reactions are equal"],
  ])("%s → %s", (answer, expected) => {
    expect(expectedAnswer(answer)).toBe(expected);
  });

  it("counts a piece of maths as one word", () => {
    expect(answerWords("Take the common factor $x^{2} + 3x$ out")).toBe(6);
  });
});

describe("what makes a card light", () => {
  it.each([
    ["Why must a subtracted numerator be written inside brackets?", "asks for an explanation"],
    ["Explain what the gradient tells you.", "asks for an explanation"],
    ["What is the difference between a factor and a term?", "asks for an explanation"],
    ["Give the four steps of an area question in order.", "asks for a list"],
    ["Write the three laws of logarithms.", "asks for a list"],
    ["You have collected the numerator. What are the last two things you do?", "asks for a list"],
    ["What is the lowest common denominator, and what is it not?", "asks two things at once"],
    ["Where does it turn, and is that a maximum or a minimum?", "asks two things at once"],
    ["Which side does the inverse go on, and why does it matter?", "asks two things at once"],
    ["A box rests on a slope. Which two forces are most often left off the diagram?", "asks for a list"],
    ["The five columns of a grouped mean and standard deviation table.", "asks for a list"],
    ["What are carbohydrates, fats and proteins each made from?", "asks for a list"],
    ["More ADH — what happens to water reabsorption, urine volume and urine concentration?", "asks for a list"],
    ["A human body cell holds ___ chromosomes; a gamete holds ___.", "asks for a list"],
    ["Iodine solution: substance, starting colour, positive colour.", "asks for a list"],
    ["Name the control variables in the resistance and length practical.", "asks for a list"],
    ["Name the type of enzyme that cuts the gene out, and name the ends it leaves.", "asks two things at once"],
    ["Give the test and the full result for carbon dioxide.", "asks two things at once"],
    ["Give the danger of overexposure to microwaves, and the danger of overexposure to infrared.", "asks two things at once"],
    ["What happens to the numerator and the denominator on the second pick?", "asks two things at once"],
    ["What is the test for oxygen and its result?", "asks two things at once"],
    ["How do voluntary and reflex actions differ?", "asks for an explanation"],
  ])("not light: %s (%s)", (text, reason) => {
    expect(recallFit(prompt({ prompt: text, answer: "Short." })).reasons).toContain(reason);
  });

  it.each([
    ["A stem says the gradient function of a curve is $\\frac{dy}{dx} = \\ldots$. What does that tell you to do?", "Integrate."],
    ["How do you reverse a fall of 30%?", "Divide by 0.7"],
    ["What is $x^{2}-9$ as a product of two brackets?", "$(x+3)(x-3)$"],
    ["You have cancelled every bracket. What is still to check?", "The numbers."],
    // A list that only sets the scene asks for one thing.
    ["Write the integral for the area between a curve, the $x$-axis and the ordinates $x = a$ and $x = b$.", "Area $= \\int_{a}^{b} y \\, dx$, with the curve's own equation in place of $y$."],
    ["Write the link between an index statement and a logarithm.", "$a^{x} = n$ is the same statement as $x = \\log_{a} n$."],
    ["Two unequal resistors are in parallel. Which one carries the larger current?", "The smaller resistance."],
  ])("light: %s", (text, answer) => {
    expect(recallFit(prompt({ prompt: text, answer }))).toMatchObject({ ok: true, reasons: [] });
  });

  it("drops an answer longer than about twelve words, an answer that is itself a list, and anything that needs a picture", () => {
    const long = prompt({ answer: "The coordinates of every axis crossing and of every turning point, labelled on the curve." });
    expect(recallFit(long).reasons).toEqual([`the answer runs to 15 words`]);
    expect(recallFit(prompt({ answer: "sin θ = opposite ÷ hypotenuse; cos θ = adjacent ÷ hypotenuse; tan θ = opposite ÷ adjacent." })).reasons).toContain("asks for a list");
    expect(recallFit(prompt({ answer: "stimulus → receptor → sensory neurone → association neurone → motor neurone → effector." })).reasons).toContain("asks for a list");
    expect(recallFit(prompt({ kind: "label-diagram", answer: "A." })).ok).toBe(false);
    expect(recallFit(prompt({ image: { kind: "svg", svg: "<svg/>", alt: "a" } as unknown as RetrievalPrompt["image"], answer: "A." })).ok).toBe(false);
  });
});

describe("every published lesson", () => {
  const dirs = (() => {
    const out: string[] = [];
    const packs = path.join(ROOT, "packs");
    for (const subject of fs.readdirSync(packs)) {
      const content = path.join(packs, subject, "content");
      if (!fs.existsSync(content)) continue;
      for (const unit of fs.readdirSync(content)) {
        const u = path.join(content, unit);
        if (!fs.statSync(u).isDirectory()) continue;
        for (const topic of fs.readdirSync(u)) if (fs.existsSync(path.join(u, topic, "note.blocks.json"))) out.push(path.join(u, topic));
      }
    }
    return out;
  })();

  it("has at most two recall cards, each one of its own placed prompts, light by the rule, in the note's order", () => {
    const sizes: Record<number, number> = {};
    for (const dir of dirs) {
      const all = placed(dir);
      const chosen = chooseRecall(all);
      sizes[chosen.length] = (sizes[chosen.length] ?? 0) + 1;
      expect(chosen.length, dir).toBeLessThanOrEqual(RECALL_MAX);
      const order = chosen.map((p) => all.indexOf(p));
      expect(order.every((i) => i >= 0), dir).toBe(true);
      expect([...order].sort((a, b) => a - b), dir).toEqual(order);
      for (const p of chosen) {
        const fit = recallFit(p);
        expect(fit.ok, `${p.id}: ${fit.reasons.join(", ")}`).toBe(true);
        expect(fit.words).toBeLessThanOrEqual(RECALL_WORDS);
      }
    }
    // Reported, not pinned: how many lessons end with none, one or two.
    console.log(`[recall] ${dirs.length} lessons: ${JSON.stringify(sizes)} recall cards`);
    expect(dirs.length).toBeGreaterThanOrEqual(184);
  });

  it("never asks for more than two, and never invents one", () => {
    expect(chooseRecall([])).toEqual([]);
    const light = [1, 2, 3, 4].map((n) => prompt({ id: `rp.x.0${n}`, answer: "x".repeat(n) }));
    expect(chooseRecall(light)).toHaveLength(2);
    expect(chooseRecall(light, 0)).toEqual([]);
  });
});
