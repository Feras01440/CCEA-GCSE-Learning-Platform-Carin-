import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { FigureSpec } from "@/lib/content/schema";
import { APPARATUS_WIDTH, ApparatusFigure, LABEL_UNITS, parseApparatusParts, planApparatus, type ApparatusPlan } from "./ApparatusFigure";

type ApparatusSpec = Extract<FigureSpec, { kind: "apparatus" }>;
const specOf = (parts: string[]): ApparatusSpec => ({ kind: "apparatus", parts, style: "ccea-2d" });
const markupOf = (parts: string[], caption?: string) => renderToStaticMarkup(createElement(ApparatusFigure, { spec: specOf(parts), caption }));

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");

/** Every <text> the markup draws: its font size in viewBox units and its words, lines joined. */
function textsOf(markup: string): Array<{ size: number; words: string }> {
  return [...markup.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)].map((m) => ({
    size: Number(/font-size="([0-9.]+)"/.exec(m[1])?.[1] ?? Number.NaN),
    words: decode(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(),
  }));
}

/**
 * The labels a list of parts must carry, as the grammar promises: "vessel: contents" is two labels (the vessel, and what
 * it holds); anything else, "trough of water" included, is one label in the author's words.
 */
function expectedLabels(parts: string[]): string[] {
  return parts.flatMap((p) => {
    const colon = p.indexOf(":");
    return colon > 0 ? [p.slice(0, colon).trim(), p.slice(colon + 1).trim()] : [p.trim()];
  });
}
const unique = (xs: string[]) => [...new Set(xs)].sort();

/**
 * The narrowest place a figure is drawn at 390 px: inside a See it card (StepRevealNote: p-5 and a border within the
 * 358 px column), 316 px; a Slides or Read v2 stage is 342 px (art direction v2 §11.2).
 */
const STAGE_PX = 316;
const drawnPx = (units: number, plan: ApparatusPlan) => (units * STAGE_PX) / plan.width;

const overlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

// Every apparatus drawing in the published u7-planning lesson (packs/science/content/u7/u7-planning), written as the
// parts list an author would give an `apparatus` figure. The lesson itself draws these as inline SVG (the author brief
// said to, as the kind had no renderer); these are the same set-ups, so the renderer is proved on what the lesson needs.
const U7_PLANNING_APPARATUS: Array<{ where: string; parts: string[]; layout: ApparatusPlan["layout"] }> = [
  {
    where: "note[56] and the See it at note[58]: the gas-syringe set-up (C4 as a guest)",
    parts: ["conical flask: dilute hydrochloric acid and marble chips", "bung", "delivery tube", "gas syringe"],
    layout: "gas-train",
  },
  {
    where: "questions[19], its first figure: a gas collected over water in an upturned measuring cylinder",
    parts: ["conical flask", "bung", "delivery tube", "trough of water", "measuring cylinder"],
    layout: "gas-train",
  },
  {
    where: "questions[10]: the bubble potometer (B6)",
    parts: ["leafy shoot", "capillary tube", "air bubble", "reservoir", "tap", "ruler"],
    layout: "potometer",
  },
  {
    where: "note[9]: the water bath (B3)",
    parts: ["water bath", "test tube: protease solution", "test tube: milk", "thermometer"],
    layout: "vessel",
  },
  {
    where: "note[30]: the polystyrene cup in a beaker (C1)",
    parts: ["polystyrene cup: acid", "beaker", "thermometer"],
    layout: "vessel",
  },
  {
    where: "note[46]: a volume by displacement",
    parts: ["measuring cylinder: water", "stone on a thread"],
    layout: "vessel",
  },
  {
    where: "note[15], note[21], note[69] and workedExamples[1]: the balanced metre rule (P3)",
    parts: ["metre rule", "pivot", "weight", "weight"],
    layout: "beam",
  },
  {
    where: "note[2]: the instruments for personal power (P4)",
    parts: ["bathroom scales", "metre rule", "stopwatch"],
    layout: "instruments",
  },
];

// Every apparatus drawing in the published u7-carrying-out lesson (packs/science/content/u7/u7-carrying-out), the same
// way. Its two reading figures (note[2] and questions[0], a measuring cylinder's numbered scale read at eye level) are
// not set-ups: a parts list cannot carry a scale's numbers or an eye, so they stay drawn by hand.
const U7_CARRYING_OUT_APPARATUS: Array<{ where: string; parts: string[]; layout: ApparatusPlan["layout"] }> = [
  {
    where: "note[26]: preparing a gas and collecting it over water (C6)",
    parts: ["conical flask: zinc and dilute acid", "thistle funnel", "bung", "delivery tube", "trough of water", "beehive shelf", "gas jar"],
    layout: "gas-train",
  },
  {
    where: "questions[10]: a two-tube bung and an upturned gas jar with no shelf",
    parts: ["conical flask: black powder and a liquid", "thistle funnel", "bung", "delivery tube", "trough of water", "gas jar"],
    layout: "gas-train",
  },
  {
    where: "note[9] and questions[11]: burning food under a clamped boiling tube (B2)",
    parts: ["thermometer", "clamp", "boiling tube: 20 cm³ of water", "burning food on a mounted needle"],
    layout: "clamped",
  },
  {
    where: "note[15]: a leaf in ethanol, warmed in a beaker of hot water (B1)",
    parts: ["boiling tube of ethanol", "leaf", "beaker: hot water", "heatproof mat"],
    layout: "vessel",
  },
  {
    where: "note[20]: a flame test (C2)",
    parts: ["Bunsen burner", "blue flame", "nichrome wire loop", "holder"],
    layout: "bunsen",
  },
];

const GAS_PREPARATION = U7_CARRYING_OUT_APPARATUS[0].parts;
const LIMEWATER = ["boiling tube: marble chips and dilute acid", "bung", "delivery tube", "test tube: limewater"];

describe("the apparatus vocabulary", () => {
  it("knows the specification's apparatus by their CCEA names, whatever the case, and keeps the author's words as the label", () => {
    const { pieces, unknown } = parseApparatusParts(["Conical Flask", "gas syringe", "Delivery tube", "rubber bung", "beehive shelf", "thistle funnel", "gas jar", "stopclock"]);
    expect(unknown).toEqual([]);
    expect(pieces.map((p) => p.kind)).toEqual(["conical-flask", "gas-syringe", "delivery-tube", "bung", "beehive-shelf", "thistle-funnel", "gas-jar", "stop-clock"]);
    expect(pieces.map((p) => p.label)).toEqual(["Conical Flask", "gas syringe", "Delivery tube", "rubber bung", "beehive shelf", "thistle funnel", "gas jar", "stopclock"]);
  });

  it("reads what a vessel holds: after a colon as a label of its own, after 'of' inside the vessel's own label", () => {
    const { pieces } = parseApparatusParts(["conical flask: dilute hydrochloric acid and marble chips", "test tube of limewater", "trough: water", "beaker", "zinc sulfate solution in a beaker"]);
    expect(pieces[0]).toMatchObject({
      kind: "conical-flask",
      label: "conical flask",
      contents: { text: "dilute hydrochloric acid and marble chips", liquid: true, solid: true, labelled: true },
    });
    expect(pieces[1]).toMatchObject({ kind: "test-tube", label: "test tube of limewater", contents: { text: "limewater", liquid: true, solid: false, labelled: false } });
    expect(pieces[2]).toMatchObject({ kind: "trough", label: "trough", contents: { text: "water", liquid: true, labelled: true } });
    expect(pieces[3].contents).toBeUndefined();
    // Not in the grammar, so not guessed at.
    expect(pieces).toHaveLength(4);
    // A metal named in a salt is not a lump of metal.
    expect(parseApparatusParts(["beaker: zinc sulfate solution"]).pieces[0].contents).toMatchObject({ liquid: true, solid: false });
  });

  it("never guesses: a name it does not know is reported, not drawn as something near it", () => {
    // "syringe" is not a gas syringe (the examiners' finding: the full name is the mark), "tube" is not a delivery tube.
    const { pieces, unknown } = parseApparatusParts(["conical flsk", "tube", "gas syringe", "ray box"]);
    expect(unknown).toEqual(["conical flsk", "tube", "ray box"]);
    expect(pieces.map((p) => p.kind)).toEqual(["gas-syringe"]);
  });
});

describe("every apparatus drawing in u7-planning and u7-carrying-out, drawn from its parts list", () => {
  for (const { where, parts, layout } of [
    ...U7_PLANNING_APPARATUS.map((f) => ({ ...f, where: `u7-planning ${f.where}` })),
    ...U7_CARRYING_OUT_APPARATUS.map((f) => ({ ...f, where: `u7-carrying-out ${f.where}` })),
  ]) {
    it(where, () => {
      const plan = planApparatus(parts);
      expect(plan, "drawable").not.toBeNull();
      expect(plan!.layout).toBe(layout);
      const markup = markupOf(parts);
      const texts = textsOf(markup);

      // Every label is text on the figure, in the author's words: nothing drawn as a picture, nothing missing, nothing
      // extra. Two identical pieces may share one label with a leader to each.
      expect(unique(texts.map((t) => t.words))).toEqual(unique(expectedLabels(parts)));
      expect(texts.length).toBeLessThanOrEqual(expectedLabels(parts).length);
      for (const [i] of parts.entries()) expect(plan!.labels.some((l) => l.names.includes(i)), `part ${i} (${parts[i]}) is labelled`).toBe(true);
      expect(markup).not.toMatch(/<image\b|<foreignObject\b|data:image/);

      // The viewBox the illustration system asks for, and every label at 13 px or more on a phone's narrowest stage.
      expect(markup).toContain(`viewBox="0 0 ${APPARATUS_WIDTH} ${plan!.height}"`);
      expect(plan!.width).toBe(APPARATUS_WIDTH);
      // Cropped to what it draws: a metre rule is short and wide, a clamped tube tall; nothing degenerate, nothing tall.
      expect(plan!.height).toBeGreaterThanOrEqual(100);
      expect(plan!.height).toBeLessThanOrEqual(430);
      for (const t of texts) {
        expect(t.size, t.words).toBe(LABEL_UNITS);
        expect(drawnPx(t.size, plan!), t.words).toBeGreaterThanOrEqual(13);
      }

      // Labels sit inside the figure and never on each other; each leader ends inside the figure, off every label.
      for (const [i, l] of plan!.labels.entries()) {
        expect(l.box.x, l.lines.join(" ")).toBeGreaterThanOrEqual(0);
        expect(l.box.y, l.lines.join(" ")).toBeGreaterThanOrEqual(0);
        expect(l.box.x + l.box.w, l.lines.join(" ")).toBeLessThanOrEqual(plan!.width);
        expect(l.box.y + l.box.h, l.lines.join(" ")).toBeLessThanOrEqual(plan!.height);
        for (const other of plan!.labels.slice(i + 1)) expect(overlap(l.box, other.box), `${l.lines.join(" ")} / ${other.lines.join(" ")}`).toBe(false);
        if (l.leader) {
          const end = { x: l.leader.x2, y: l.leader.y2, w: 0.01, h: 0.01 };
          expect(end.x).toBeGreaterThan(0);
          expect(end.x).toBeLessThan(plan!.width);
          for (const other of plan!.labels) expect(overlap(end, other.box), `${l.lines.join(" ")}'s leader ends on ${other.lines.join(" ")}`).toBe(false);
        }
      }

      // Named for a reader who cannot see it: the arrangement in a sentence that names every piece.
      expect(plan!.description).toMatch(/^Apparatus/);
      for (const label of expectedLabels(parts)) expect(plan!.description.toLowerCase(), label).toContain(label.toLowerCase());
    });
  }
});

describe("the diagram rule CCEA marks: two-dimensional, assembled and working", () => {
  it("gives the gas an open path: the tube starts above the liquid, runs through the bung's hole and ends inside the collector", () => {
    for (const parts of [U7_PLANNING_APPARATUS[0].parts, U7_PLANNING_APPARATUS[1].parts, GAS_PREPARATION, U7_CARRYING_OUT_APPARATUS[1].parts, LIMEWATER]) {
      const plan = planApparatus(parts)!;
      const a = plan.anatomy;
      expect(a.tube, parts.join(", ")).toBeDefined();
      const [start] = a.tube!.path;
      // Above the reacting mixture, so gas, not liquid, is carried off.
      expect(start.y, "tube starts above the liquid").toBeLessThan(a.generatorLiquidTop!);
      // The bung is drawn round the tube's hole, never across it: no piece of rubber covers the bore.
      const bore = { x: start.x - a.tube!.bore, w: 2 * a.tube!.bore };
      for (const piece of a.bung!) expect(piece.x + piece.w <= bore.x + 0.01 || piece.x >= bore.x + bore.w - 0.01, "bung clear of the bore").toBe(true);
      // Its end is where the gas is collected.
      const end = a.tube!.path[a.tube!.path.length - 1];
      const into = a.collectorMouth!;
      expect(end.x).toBeGreaterThanOrEqual(into.x - 0.01);
      expect(end.x).toBeLessThanOrEqual(into.x + into.w + 0.01);
      expect(end.y).toBeGreaterThanOrEqual(into.y - 0.01);
      expect(end.y).toBeLessThanOrEqual(into.y + into.h + 0.01);
    }
  });

  it("dips the thistle funnel's stem below the acid, so the gas cannot escape up it", () => {
    const a = planApparatus(GAS_PREPARATION)!.anatomy;
    expect(a.funnelStemEnd).toBeDefined();
    expect(a.funnelStemEnd!.y).toBeGreaterThan(a.generatorLiquidTop! + 4);
  });

  it("collects over water: the collector stands in the trough, its mouth below the water's surface", () => {
    for (const parts of [U7_PLANNING_APPARATUS[1].parts, GAS_PREPARATION, U7_CARRYING_OUT_APPARATUS[1].parts]) {
      const a = planApparatus(parts)!.anatomy;
      expect(a.troughWaterTop, parts.join(", ")).toBeDefined();
      expect(a.collectorMouth!.y + a.collectorMouth!.h).toBeGreaterThan(a.troughWaterTop!);
    }
  });

  it("dips the tube into the limewater, so the gas bubbles through it", () => {
    const a = planApparatus(LIMEWATER)!.anatomy;
    const end = a.tube!.path[a.tube!.path.length - 1];
    expect(end.y).toBeGreaterThan(a.collectorLiquidTop! + 4);
  });

  it("puts a thermometer's bulb in the liquid it measures", () => {
    const withThermometer = [...U7_PLANNING_APPARATUS, ...U7_CARRYING_OUT_APPARATUS].filter((f) => f.parts.some((p) => /thermometer/.test(p)));
    expect(withThermometer.length).toBeGreaterThanOrEqual(3);
    for (const { parts } of withThermometer) {
      const a = planApparatus(parts)!.anatomy;
      expect(a.thermometerBulb, parts.join(", ")).toBeDefined();
      expect(a.thermometerBulb!.y, parts.join(", ")).toBeGreaterThan(a.bulbLiquidTop! + 4);
    }
  });

  it("holds the burning food just under the clamped tube, not beside it (B2)", () => {
    const a = planApparatus(U7_CARRYING_OUT_APPARATUS[2].parts)!.anatomy;
    expect(a.flame && a.heated).toBeTruthy();
    expect(a.flame!.tip.y).toBeGreaterThan(a.heated!.y);
    expect(a.flame!.tip.y - a.heated!.y).toBeLessThan(24);
    expect(Math.abs(a.flame!.tip.x - a.heated!.x)).toBeLessThan(10);
  });

  it("holds the wire loop at the edge of the flame (C2)", () => {
    const a = planApparatus(U7_CARRYING_OUT_APPARATUS[4].parts)!.anatomy;
    expect(a.loop && a.flame).toBeTruthy();
    expect(Math.abs(a.loop!.x - a.flame!.edgeX)).toBeLessThan(7);
    expect(a.loop!.y).toBeGreaterThan(a.flame!.tip.y);
    expect(a.loop!.y).toBeLessThan(a.flame!.base.y);
  });

  it("warms the leaf's ethanol in hot water, with no flame drawn anywhere (B1)", () => {
    const plan = planApparatus(U7_CARRYING_OUT_APPARATUS[3].parts)!;
    expect(plan.anatomy.flame).toBeUndefined();
    expect(plan.shapes.some((s) => s.role === "flame")).toBe(false);
  });

  it("draws a tripod with two legs, never four, and the Bunsen burner's flame under the gauze", () => {
    const plan = planApparatus(["Bunsen burner", "heatproof mat", "tripod", "gauze", "beaker: water"]);
    expect(plan).not.toBeNull();
    expect(plan!.layout).toBe("bunsen");
    expect(plan!.shapes.filter((s) => s.tag === "tripod-leg")).toHaveLength(2);
    expect(plan!.anatomy.flame!.tip.y).toBeGreaterThan(plan!.anatomy.heated!.y - 1);
  });
});

describe("the figure on the page", () => {
  const parts = U7_PLANNING_APPARATUS[0].parts;

  it("is an image with a name and a title, with the caption on the page under it", () => {
    const markup = markupOf(parts, "The gas has an **open** path into the gas syringe.");
    const plan = planApparatus(parts)!;
    expect(markup).toMatch(/<svg[^>]*role="img"/);
    expect(markup).toContain(`aria-label="${plan.description}"`);
    expect(markup).toContain(`<title>${plan.description}</title>`);
    expect(markup).toMatch(/<figcaption[^>]*>[\s\S]*open[\s\S]*<\/figcaption>/);
    expect(markup).toMatch(/<strong[^>]*>open<\/strong>/);
    expect(markupOf(parts)).not.toContain("<figcaption");
  });

  it("draws in the page's own colours: ink strokes and tokened fills, never a colour of its own", () => {
    const markup = markupOf(GAS_PREPARATION);
    const paints = [...markup.matchAll(/\b(fill|stroke)="([^"]*)"/g)].map((m) => m[2]);
    const styled = [...markup.matchAll(/(?:^|;|")\s*(fill|stroke):\s*([^;"]+)/g)].map((m) => m[2].trim());
    expect(paints.length + styled.length).toBeGreaterThan(20);
    for (const paint of [...paints, ...styled]) expect(paint, paint).toMatch(/^(currentColor|none|var\(--[a-z-]+\))$/);
    expect(markup).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it("is drawn no wider than it was made and shrinks to fit a phone", () => {
    const markup = markupOf(parts);
    expect(markup).toMatch(/<svg[^>]*style="[^"]*max-width:\s*400px/);
    expect(markup).toMatch(/<svg[^>]*class="[^"]*w-full/);
  });

  it("says in words an apparatus it cannot draw as a working set-up, exactly as before", () => {
    // An unknown piece; a tube and a syringe with nothing to make the gas; a pivot with no rule beside a gas jar.
    for (const unknownParts of [["conical flask", "ray box"], ["delivery tube", "gas syringe"], ["pivot", "gas jar"]]) {
      expect(planApparatus(unknownParts), unknownParts.join(", ")).toBeNull();
      const markup = markupOf(unknownParts);
      expect(markup).not.toContain("<svg");
      expect(decode(markup)).toContain(`Apparatus: ${unknownParts.join(", ")}.`);
    }
  });

  it("is the same drawing every time", () => {
    expect(markupOf(GAS_PREPARATION)).toBe(markupOf(GAS_PREPARATION));
    expect(planApparatus(LIMEWATER)).toEqual(planApparatus(LIMEWATER));
  });
});
