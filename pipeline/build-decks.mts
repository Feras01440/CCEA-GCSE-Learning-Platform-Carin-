/**
 * Flashcard deck build.
 *
 * Sources, merged per subject/unit/section/topic:
 *   1. authored decks      data/decks/<subject>/<unit>.json (DeckFile, validated)
 *   2. bundle prompts      public/content/<subject>/<topicId>.json → prompts[] (already verified content)
 *   3. generated recall    data/spec/double-award-science-topics.json (chemistryRecall, biologyRecall, physicsEquations)
 *                          — only for topics with no authored cards, so authored decks always win
 * Writes public/decks/<subject>/<unit>.json and src/generated/decks-manifest.json.
 * Run: npx tsx pipeline/build-decks.mts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DeckFile, type Flashcard, type ShippedDeck } from "../src/lib/content/deck-schema.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "decks");
const MANIFEST = path.join(ROOT, "src", "generated", "decks-manifest.json");

type Subject = "maths" | "further-maths" | "science";
const read = (p: string) => JSON.parse(fs.readFileSync(p, "utf8"));

const maths = read(path.join(ROOT, "data/spec/mathematics.json"));
const fm = read(path.join(ROOT, "data/spec/further-mathematics.json"));
const sci = read(path.join(ROOT, "data/spec/double-award-science-topics.json"));

/* ---- taxonomy: unit → sections → topics (section = strand / area / spec section) ---- */
type TaxTopic = { slug: string; title: string; section: string; sectionTitle: string; unit: string };
function taxonomy(subject: Subject): Map<string, TaxTopic[]> {
  const byUnit = new Map<string, TaxTopic[]>();
  const push = (t: TaxTopic) => byUnit.set(t.unit, [...(byUnit.get(t.unit) ?? []), t]);
  if (subject === "maths") {
    const strands = new Map<string, string>(maths.strands.map((s: { id: string; title: string }) => [s.id, s.title]));
    const order: string[] = maths.routes.higher.topicOrder;
    for (const t of [...maths.topics].sort((a: { slug: string }, b: { slug: string }) => order.indexOf(a.slug) - order.indexOf(b.slug)))
      push({ slug: t.slug, title: t.title, section: t.strand, sectionTitle: strands.get(t.strand) ?? t.strand, unit: t.introducedIn });
  } else if (subject === "further-maths") {
    for (const u of Object.keys(fm.topicOrder))
      for (const slug of fm.topicOrder[u]) {
        const t = fm.topics.find((x: { slug: string }) => x.slug === slug);
        if (t) push({ slug: t.slug, title: t.title, section: t.area, sectionTitle: t.area, unit: t.unit });
      }
  } else {
    for (const u of Object.keys(sci.unitOrder))
      for (const slug of sci.unitOrder[u]) {
        const t = sci.topics.find((x: { slug: string }) => x.slug === slug);
        if (t) push({ slug: t.slug, title: t.title, section: t.section, sectionTitle: `${t.section} ${t.sectionTitle}`, unit: t.unit });
      }
    for (const g of sci.unit7) push({ slug: g.slug, title: g.title, section: "U7", sectionTitle: "Practical skills", unit: "U7" });
  }
  return byUnit;
}

/* ---- generated recall cards (science) ---- */
function generatedFor(subject: Subject, slug: string): Flashcard[] {
  if (subject !== "science") return [];
  const out: Flashcard[] = [];
  let n = 0;
  const id = () => `fc.science.${slug}.auto-${String(++n).padStart(2, "0")}`;
  for (const r of [...sci.chemistryRecall, ...sci.biologyRecall]) {
    if (r.topicSlug !== slug) continue;
    const kind = r.category === "test" ? "test" : r.category === "colour" ? "colour" : r.category === "equation" ? "equation" : "fact";
    const front = r.category === "test" ? `Test for ${r.item}` : r.category === "equation" ? `Equation: ${r.item}` : r.category === "colour" ? `Colour: ${r.item}` : r.item;
    out.push({ id: id(), front, back: r.detail, kind, tier: r.tier === "H" ? "H" : "F", source: "taxonomy" });
  }
  for (const e of sci.physicsEquations) {
    if (e.topicSlug !== slug) continue;
    const units = e.units ? Object.entries(e.units).map(([k, v]) => `${k}: ${v}`).join(", ") : "";
    out.push({ id: id(), front: `Equation for ${e.name} (not on any formula sheet)`, back: `${e.formula}${units ? `\n\nUnits: ${units}` : ""}`, kind: "equation", tier: e.tier === "H" ? "H" : "F", source: "spec" });
  }
  return out;
}

/* ---- bundle prompts ---- */
function bundlePrompts(subject: Subject, slug: string): Flashcard[] {
  const dir = path.join(ROOT, "public", "content", subject);
  if (!fs.existsSync(dir)) return [];
  const file = fs.readdirSync(dir).find((f) => f.endsWith(`.${slug}.json`));
  if (!file) return [];
  const b = read(path.join(dir, file));
  return (b.prompts ?? []).map((p: { id: string; prompt: string; answer: string; kind: string; keyWords?: string[] }) => ({
    id: p.id,
    front: p.prompt,
    back: p.answer,
    kind: p.kind === "formula" ? "formula" : p.kind === "definition" ? "definition" : p.kind === "procedure" ? "method" : p.kind === "trap" ? "trap" : p.kind === "cloze" ? "cloze" : "fact",
    keyWords: p.keyWords,
    source: "bundle",
  }));
}

/* ---- authored decks ---- */
function authored(subject: Subject, unit: string): DeckFile | null {
  const p = path.join(ROOT, "data", "decks", subject, `${unit}.json`);
  if (!fs.existsSync(p)) return null;
  const parsed = DeckFile.safeParse(read(p));
  if (!parsed.success) {
    console.error(`INVALID deck ${subject}/${unit}: ${parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    process.exitCode = 1;
    return null;
  }
  return parsed.data;
}

fs.rmSync(OUT, { recursive: true, force: true });
const manifest: { generatedAt: string; units: Array<{ subject: Subject; unit: string; cards: number; topics: number; authored: number; topicCards: Record<string, number> }> } = {
  generatedAt: new Date().toISOString(),
  units: [],
};

for (const subject of ["maths", "further-maths", "science"] as Subject[]) {
  const tax = taxonomy(subject);
  for (const [unit, topics] of tax) {
    const deck = authored(subject, unit);
    const authoredByTopic = new Map<string, Flashcard[]>();
    const authoredSectionTitles = new Map<string, string>();
    for (const s of deck?.sections ?? [])
      for (const t of s.topics) {
        authoredByTopic.set(t.slug, [...(authoredByTopic.get(t.slug) ?? []), ...t.cards]);
        authoredSectionTitles.set(t.slug, s.title);
      }

    const sections = new Map<string, { id: string; title: string; topics: Array<{ slug: string; title: string; cards: Flashcard[] }> }>();
    const counts = { cards: 0, topics: 0, authored: 0, generated: 0, fromBundles: 0 };
    const topicCards: Record<string, number> = {};
    for (const t of topics) {
      const a = authoredByTopic.get(t.slug) ?? [];
      const fromBundle = bundlePrompts(subject, t.slug);
      const gen = a.length ? [] : generatedFor(subject, t.slug);
      const seen = new Set<string>();
      const cards = [...a, ...fromBundle, ...gen].filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
      if (!cards.length) continue;
      counts.cards += cards.length;
      counts.topics += 1;
      counts.authored += a.length;
      counts.generated += gen.length;
      counts.fromBundles += fromBundle.length;
      topicCards[t.slug] = cards.length;
      const sec = sections.get(t.section) ?? { id: t.section, title: t.sectionTitle, topics: [] };
      sec.topics.push({ slug: t.slug, title: t.title, cards });
      sections.set(t.section, sec);
    }
    if (!counts.cards) continue;
    const shipped: ShippedDeck = { subject, unit, sections: [...sections.values()], counts };
    const dir = path.join(OUT, subject);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${unit}.json`), JSON.stringify(shipped));
    manifest.units.push({ subject, unit, cards: counts.cards, topics: counts.topics, authored: counts.authored, topicCards });
    console.log(`deck ${subject}/${unit}: ${counts.cards} cards · ${counts.topics} topics (authored ${counts.authored}, bundles ${counts.fromBundles}, generated ${counts.generated})`);
  }
}

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\n${manifest.units.length} deck(s) → public/decks; manifest → src/generated/decks-manifest.json`);
