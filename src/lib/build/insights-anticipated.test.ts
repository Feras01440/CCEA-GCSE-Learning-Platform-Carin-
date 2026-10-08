import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { Misconception } from "@/lib/content/schema";
import { buildSubject } from "../../../pipeline/mine/build-insights.mjs";
import fm, { MA as maFm } from "../../../pipeline/mine/insights-source/further-maths.mjs";
import { MA as maMaths } from "../../../pipeline/mine/insights-source/maths.misconceptions.mjs";
import { MA as maScience } from "../../../pipeline/mine/insights-source/science.misconceptions.mjs";
import { joinsRegistry } from "../../../pipeline/mine/insights-source/science.mjs";

/**
 * Anticipated registry entries (the lead's ruling, 7 Oct 2026): an honest registry says what the reports say and no more.
 * An error the items anticipate but no Chief Examiner report names carries `anticipated: true` and a one-line `note`
 * (what the reports do say); it needs no source, and no firstSeen or lastSeen. Every other entry still needs a source,
 * with firstSeen and lastSeen. pipeline/mine/build-insights.mjs builds both; scripts/validate-insights.mjs checks both.
 */

const evidenced = {
  id: "fm.simeq.arithmetic-slip",
  label: "Sets up the elimination right and makes an arithmetic slip on the way",
  subject: "further-maths",
  statements: ["FM1-SIM-01"],
  sources: ["ccea-cer:further-maths:2019-summer:FM1:Q7"],
  firstSeen: "2019-summer",
  lastSeen: "2019-summer",
  ledgerTag: "accuracy",
};
const anticipated = {
  id: "fm.simeq.elimination-sign-slip",
  label: "Changes the sign of every letter but not of the number on the right",
  subject: "further-maths",
  statements: ["FM1-SIM-01"],
  sources: [],
  ledgerTag: "accuracy",
  anticipated: true,
  note: "No report names this slip; the reports name arithmetic slips in general.",
};

describe("the Misconception schema: anticipated entries", () => {
  it("accepts an anticipated entry with no source and no first or last series, given its note", () => {
    expect(Misconception.safeParse(anticipated).success).toBe(true);
  });

  it("refuses an anticipated entry with no note, and an evidenced entry with no source or no series", () => {
    const { note: _note, ...noNote } = anticipated;
    expect(Misconception.safeParse(noNote).success).toBe(false);
    expect(Misconception.safeParse({ ...evidenced, sources: [] }).success).toBe(false);
    const { firstSeen: _first, ...noFirst } = evidenced;
    expect(Misconception.safeParse(noFirst).success).toBe(false);
    expect(Misconception.safeParse(evidenced).success).toBe(true);
  });
});

describe("build-insights: anticipated entries", () => {
  const S = (series: string, unit: string, q: number) => `ccea-cer:further-maths:${series}:${unit}:Q${q}`;
  const mod = (misconceptions: unknown[]) => ({ subject: "further-maths", misconceptions, insights: [] });

  it("builds an anticipated entry with no source, marked, with its note and no series", () => {
    const r = buildSubject(mod([{ id: "fm.x.anticipated", label: "L", statements: ["FM1-SIM-01"], ledgerTag: "accuracy", extraSources: [], anticipated: true, note: "No report names it." }]));
    expect(r.problems).toEqual([]);
    expect(r.registry).toEqual([{ id: "fm.x.anticipated", label: "L", subject: "further-maths", statements: ["FM1-SIM-01"], sources: [], ledgerTag: "accuracy", anticipated: true, note: "No report names it." }]);
  });

  it("still refuses an evidenced entry with no source, and an anticipated one with no note", () => {
    expect(buildSubject(mod([{ id: "fm.x.bare", label: "L", statements: [], ledgerTag: "accuracy", extraSources: [] }])).problems).toEqual(["fm.x.bare: no finding cites this misconception"]);
    expect(buildSubject(mod([{ id: "fm.x.quiet", label: "L", statements: [], ledgerTag: "accuracy", extraSources: [], anticipated: true }])).problems).toEqual(["fm.x.quiet: an anticipated entry needs a note saying what the reports do say"]);
  });

  it("refuses an entry marked anticipated that a report is cited for, by a finding or by extraSources", () => {
    const src = S("2019-summer", "FM1", 7);
    const cited = { id: "fm.x.cited", label: "L", statements: [], ledgerTag: "accuracy", extraSources: [], anticipated: true, note: "N" };
    const finding = { id: "fm.u1.x", topic: "fm.u1.x", specRefs: [], ruleToRemember: "R", findings: [{ source: src, asked: "A", wentWrong: "W", rule: "R", misconceptions: ["fm.x.cited"] }] };
    const msg = "fm.x.cited: marked anticipated, yet a report is cited for it; drop the mark or the source";
    expect(buildSubject({ subject: "further-maths", misconceptions: [cited], insights: [finding] }).problems).toEqual([msg]);
    expect(buildSubject(mod([{ ...cited, extraSources: [src] }])).problems).toEqual([msg]);
  });

  it("marks the seven fm.simeq slips anticipated and gives the general arithmetic slip its five reports", () => {
    const { registry, problems } = buildSubject(fm);
    expect(problems).toEqual([]);
    const byId = new Map<string, unknown>(registry.map((m: { id: string }) => [m.id, m] as const));
    for (const id of ["elimination-sign-slip", "multiplier-not-applied-to-constant", "added-instead-of-subtracted", "different-letter-eliminated", "stopped-at-the-pair", "values-in-wrong-slots", "no-check-in-third-equation"]) {
      const m = byId.get(`fm.simeq.${id}`) as { anticipated?: boolean; sources: string[]; note?: string; firstSeen?: string };
      expect(m?.anticipated, id).toBe(true);
      expect(m?.sources, id).toEqual([]);
      expect(m?.firstSeen, id).toBeUndefined();
      expect(m?.note, id).toMatch(/\S/);
    }
    const general = byId.get("fm.simeq.arithmetic-slip") as { sources: string[]; firstSeen: string; lastSeen: string; anticipated?: boolean };
    expect(general.sources).toEqual([S("2018-summer", "FM1", 10), S("2019-summer", "FM1", 7), S("2022-summer", "FM1", 11), S("2024-summer", "FM1", 11), S("2025-summer", "FM1", 12)]);
    expect([general.firstSeen, general.lastSeen, general.anticipated]).toEqual(["2018-summer", "2025-summer", undefined]);
  });
});

describe("MA() in every source module, science's registry filter and the author prompts", () => {
  const note = "No report names it; the reports name arithmetic slips in general.";
  const args = ["x.y.z", "L", ["S-1"], "accuracy", note] as const;

  it("gives the same anticipated entry in maths, further maths and science", () => {
    const want = { id: "x.y.z", label: "L", statements: ["S-1"], ledgerTag: "accuracy", extraSources: [], anticipated: true, note };
    expect(maMaths(...args)).toEqual(want);
    expect(maScience(...args)).toEqual(want);
    expect(maFm(...args)).toEqual(want);
  });

  it("builds an MA entry as anticipated in maths and in science", () => {
    for (const [subject, ma] of [["maths", maMaths], ["science", maScience]] as const) {
      const { registry, problems } = buildSubject({ subject, misconceptions: [ma(...args)], insights: [] });
      expect(problems, subject).toEqual([]);
      expect(registry, subject).toEqual([{ id: "x.y.z", label: "L", subject, statements: ["S-1"], sources: [], ledgerTag: "accuracy", anticipated: true, note }]);
    }
  });

  it("keeps an anticipated science entry that no card cites, and still drops a plain uncited one", () => {
    const cited = new Set(["sci.cited"]);
    expect(joinsRegistry({ id: "sci.cited" }, cited)).toBe(true);
    expect(joinsRegistry({ id: "sci.extra", extraSources: ["ccea-cer:science:2024-summer:P1H:Q5"] }, cited)).toBe(true);
    expect(joinsRegistry(maScience("sci.anticipated", "L", [], "concept", note), cited)).toBe(true);
    expect(joinsRegistry({ id: "sci.plain" }, cited)).toBe(false);
    expect(joinsRegistry({ id: "sci.plain", extraSources: [] }, cited)).toBe(false);
  });

  it("tells authors in all three prompts to register an error no report names with MA() and no report citation", () => {
    for (const f of ["author-deck", "author-topic", "author-unit-batch"]) {
      const text = fs.readFileSync(path.join(process.cwd(), "pipeline/prompts", `${f}.md`), "utf8");
      expect(text, f).toMatch(/If no Chief Examiner report names the error, register it with the MA\(\) helper and a one-line note on what the reports do say; never give it a report citation/);
      expect(text, f).toContain("(Further Maths: `pipeline/mine/insights-source/further-maths.mjs`)");
    }
  });
});
