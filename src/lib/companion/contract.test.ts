import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { bannedIn } from "./lint";
import { LINES } from "./lines";
import { SLOTS, SLOT_IDS, type SlotId } from "./select";

const ROOT = resolve(__dirname, "../../..");
const CONTRACT = resolve(ROOT, "docs/plan/companion/integration-contract.md");

interface Row {
  slot: string;
  component: string;
  props: string;
  reads: string;
  silent: string;
  test: string;
}

/** Parses the one table under "## Slot table". The contract is a document and a fixture at once. */
function slotTable(): Row[] {
  const md = readFileSync(CONTRACT, "utf8");
  const section = md.split("## Slot table")[1];
  expect(section, "the contract has a Slot table section").toBeTruthy();
  const rows: Row[] = [];
  for (const line of section.split("\n")) {
    if (!line.startsWith("|")) {
      if (rows.length) break; // the table has ended
      continue;
    }
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;
    if (cells[0] === "Slot" || cells[0].startsWith("---")) continue;
    const bare = (s: string) => s.replace(/^`|`$/g, "");
    rows.push({ slot: bare(cells[0]), component: bare(cells[1]), props: bare(cells[2]), reads: cells[3], silent: cells[4], test: cells[5] });
  }
  return rows;
}

const rows = slotTable();

describe("the contract's slot table matches the code", () => {
  it("lists every slot the code declares, in the same order, and no others", () => {
    expect(rows.map((r) => r.slot)).toEqual(SLOT_IDS);
  });

  it("names the component each slot renders", () => {
    for (const r of rows) expect(SLOTS[r.slot as SlotId].component, r.slot).toBe(r.component);
  });

  it("quotes the props verbatim", () => {
    for (const r of rows) expect(SLOTS[r.slot as SlotId].props, r.slot).toBe(r.props);
  });

  it("says, for every slot, what it reads, when it is silent and which test proves it", () => {
    for (const r of rows) {
      expect(r.reads.length, `${r.slot} reads`).toBeGreaterThan(10);
      expect(r.silent.length, `${r.slot} silent when`).toBeGreaterThan(10);
      expect(r.test, `${r.slot} acceptance test`).toMatch(/\.test\.ts/);
    }
  });

  it("points every acceptance test at a file that exists", () => {
    for (const r of rows) {
      const file = r.test.match(/([\w.-]+\.test\.ts)/)![1];
      expect(() => readFileSync(resolve(__dirname, file), "utf8"), `${r.slot} → ${file}`).not.toThrow();
    }
  });
});

describe("every component the contract names is exported", () => {
  it("exports it by name from the file the slot table implies", () => {
    for (const slot of SLOT_IDS) {
      const spec = SLOTS[slot];
      const source = readFileSync(resolve(ROOT, spec.file), "utf8");
      expect(source, spec.file).toContain(`export function ${spec.component}(`);
      expect(source, `${spec.file} has no default export`).not.toContain("export default");
    }
  });

  it("gives every component a props interface of the same name", () => {
    for (const slot of SLOT_IDS) {
      const spec = SLOTS[slot];
      const source = readFileSync(resolve(ROOT, spec.file), "utf8");
      expect(source, spec.file).toContain(`export interface ${spec.component}Props`);
    }
  });

  it("accepts every prop the contract promises", () => {
    for (const slot of SLOT_IDS) {
      const spec = SLOTS[slot];
      const source = readFileSync(resolve(ROOT, spec.file), "utf8");
      for (const prop of spec.props.replace(/[{}]/g, "").split(",").map((p) => p.trim().replace("?", "")).filter(Boolean)) {
        expect(source, `${spec.file} accepts ${prop}`).toMatch(new RegExp(`\\b${prop}\\b`));
      }
    }
  });
});

/** Every component the companion ships; each one's own copy is held to the constitution. */
const COMPONENT_FILES = [
  "CompanionLine.tsx",
  "CompanionLetter.tsx",
  "CompanionMemory.tsx",
  "CompanionFigure.tsx",
  "CompanionScene.tsx",
  "CompanionVoiceSettings.tsx",
  "RowanMark.tsx",
  "RowanFigure.tsx",
  "RowanScene.tsx",
  "CairnArt.tsx",
];

/** The file with its comments taken out, so a rule named in prose is not read as code. */
function codeOf(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

describe("the surfaces obey the rules the contract states", () => {
  it("puts the data-companion attribute on the signed line only, never on the unsigned one", () => {
    const parts = codeOf("src/components/companion/CompanionLine.tsx").split("if (selection.unsigned)")[1].split("return (");
    const [unsigned, signed] = [parts[1], parts[2]];
    expect(unsigned).not.toContain("data-companion");
    expect(signed).toContain("data-companion");
  });

  it("never dims the evening: no opacity in the line component", () => {
    expect(codeOf("src/components/companion/CompanionLine.tsx")).not.toMatch(/opacity/i);
  });

  it("carries no avatar, no bubble and no fixed position", () => {
    expect(codeOf("src/components/companion/CompanionLine.tsx")).not.toMatch(/\bfixed\b|\bsticky\b|<img|avatar/i);
  });

  it("marks Rowan's mark as decorative, in the ink of its line", () => {
    const source = readFileSync(resolve(ROOT, "src/components/companion/RowanMark.tsx"), "utf8");
    expect(source).toContain("aria-hidden");
    expect(source).toContain("currentColor");
  });

  it("the Map place carries no line", () => {
    expect(SLOTS["map-place"].moments).toEqual([]);
    expect(SLOTS["map-place"].component).toBe("RowanMark");
  });

  it("uses none of the banned vocabulary in the components' own copy", () => {
    for (const file of COMPONENT_FILES) {
      // Comments and Tailwind class strings are not copy; everything else on these screens is.
      const copy = codeOf(`src/components/companion/${file}`)
        .replace(/className=\{?(clsx\([\s\S]*?\)|"[^"]*")\}?/g, " ")
        .replace(/style=\{\{[\s\S]*?\}\}/g, " ");
      expect(bannedIn(copy), file).toEqual([]);
    }
  });

  it("uses no exclamation mark in any learner-facing string in the components", () => {
    for (const file of COMPONENT_FILES) {
      // Comments are not learner-facing, and an apostrophe in one would pair with a quote in the code.
      const source = codeOf(`src/components/companion/${file}`);
      const strings = source.match(/(["'])(?:(?!\1)[^\\])*\1/g) ?? [];
      for (const s of strings) expect(s, `${file} ${s}`).not.toContain("!");
      const jsxText = source.match(/>\s*[A-Z][^<>{}]{3,}</g) ?? [];
      for (const s of jsxText) expect(s, `${file} ${s}`).not.toContain("!");
    }
  });
});

describe("the figure slots (decision 8) are the contract's, and the code's", () => {
  /**
   * The table under "## The figure slots", as { slot, phone, desktop }: its Size cell reads "140 px / 200 px",
   * phone first. The dated heading is the section's anchor; the 23 September revision keeps it.
   */
  function figureTable(): Array<{ slot: string; phone: number; desktop: number }> {
    const md = readFileSync(CONTRACT, "utf8");
    const section = md.split("## The figure slots (23 September 2026)")[1];
    expect(section, "the contract has the dated figure-slot section").toBeTruthy();
    const out: Array<{ slot: string; phone: number; desktop: number }> = [];
    for (const line of section.split("\n")) {
      if (!line.startsWith("|")) {
        if (out.length) break;
        continue;
      }
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      const sizes = (cells[2] ?? "").match(/\d+/g)?.map(Number) ?? [];
      if (!cells[0] || cells[0] === "Figure slot" || cells[0].startsWith("---") || sizes.length !== 2) continue;
      out.push({ slot: cells[0].replace(/`/g, ""), phone: sizes[0], desktop: sizes[1] });
    }
    return out;
  }

  it("lists every slot the component draws, at the sizes it draws it, phone and desktop", async () => {
    const { FIGURE_SLOTS } = await import("@/lib/companion/figure");
    const table = figureTable();
    expect(table.map((r) => r.slot).sort()).toEqual(Object.keys(FIGURE_SLOTS).sort());
    for (const r of table) {
      const slot = FIGURE_SLOTS[r.slot as keyof typeof FIGURE_SLOTS];
      expect([slot.phone, slot.desktop], r.slot).toEqual([r.phone, r.desktop]);
    }
  });

  it("keeps RowanMark as the fallback inside the slot, and draws nothing during a question or against her choice", () => {
    const source = codeOf("src/components/companion/CompanionFigure.tsx");
    expect(source).toContain("<RowanMark");
    expect(source).toContain("<RowanFigure");
    expect(source).toContain("data-companion-figure");
    expect(source).toContain("aria-hidden");
    // One guard for both: a question up, or Words only / Quiet in Settings (the context's `figure`).
    expect(source).toMatch(/questionVisible \|\| !context\.figure\) return null/);
    expect(codeOf("src/components/companion/CompanionScene.tsx")).toMatch(/!context\.figure/);
    // The Map's mark is a drawing too: only in Full.
    expect(codeOf("src/components/map/ExamMap.tsx")).toMatch(/presence === "full" && <RowanMark/);
  });

  it("never gives the unsigned line a figure, and gives the signed arrival and topic lines one", () => {
    const parts = codeOf("src/components/companion/CompanionLine.tsx").split("if (selection.unsigned)")[1].split("return (");
    expect(parts[1]).not.toContain("CompanionFigure");
    expect(parts[2]).toContain("CompanionFigure");
    const map = codeOf("src/components/companion/CompanionLine.tsx").split("LINE_FIGURE")[1];
    expect(map).toContain('"today-open": "arrival"');
    expect(map).toContain('"topic-open": "topic"');
    expect(map.split("};")[0]).not.toContain("session-close");
  });

  it("draws the close figure as the scene at the top of the close card, silent when the line is, never during a question", () => {
    const scene = codeOf("src/components/companion/CompanionScene.tsx");
    expect(scene).toContain('data-companion-figure="close"');
    expect(scene).toContain("aria-hidden");
    expect(scene).toContain("selectAt(moment, context)");
    expect(scene).toMatch(/context\.questionVisible/);
    const card = codeOf("src/components/ux/CloseCard.tsx");
    expect(card).toContain("<CompanionScene context={held.current}");
    expect(card.indexOf("<CompanionScene")).toBeLessThan(card.indexOf("{eyebrow}"));
  });

  it("puts the letter slot in the Letter", () => {
    expect(codeOf("src/components/companion/CompanionLetter.tsx")).toContain('<CompanionFigure slot="letter"');
  });
});

describe("the contract documents what the slice ships", () => {
  it("carries the five dry lines", () => {
    const dry = LINES.filter((l) => l.id.startsWith("dry."));
    expect(dry).toHaveLength(5);
    expect(dry.map((l) => l.id).sort()).toEqual(["dry.arrangement", "dry.booklet-b", "dry.not-me", "dry.sly", "dry.specific"]);
  });

  it("states the two Dexie stores, the export exclusion, plain mode and the kill criteria", () => {
    const md = readFileSync(CONTRACT, "utf8");
    for (const heading of [
      "## The Dexie stores",
      "## The export exclusion",
      "## The plain-mode switch",
      "## Kill criteria",
      "## Binding conditions",
      "## Present from the first session (23 September 2026)",
      "## The figure slots (23 September 2026)",
    ]) {
      expect(md, heading).toContain(heading);
    }
    expect(md).toContain("companionNotes: \"++id, at, kind, topicId, source\"");
    expect(md).toContain("companionState: \"id\"");
    expect(md).toContain("this.version(4).stores({");
  });

  it("lists all fourteen binding conditions", () => {
    const md = readFileSync(CONTRACT, "utf8");
    const section = md.split("## Binding conditions")[1].split("##")[0];
    const numbered = section.split("\n").filter((l) => /^\d+\.\s/.test(l));
    expect(numbered).toHaveLength(14);
  });
});
