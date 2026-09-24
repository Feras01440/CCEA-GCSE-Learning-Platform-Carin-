import { z } from "zod";

/** One flashcard. `front`/`back` may contain $…$ maths and **bold**. */
export const Flashcard = z.object({
  id: z.string().regex(/^(fc|rp)\.[a-z0-9.-]+$/, "ids look like fc.maths.m4.circle-theorems.03 or rp.<…>"),
  front: z.string().min(1),
  back: z.string().min(1),
  kind: z.enum(["definition", "formula", "fact", "method", "equation", "test", "colour", "trap", "cloze", "unit", "keyword", "example"]),
  tier: z.enum(["F", "H"]).optional(),
  hint: z.string().optional(),
  keyWords: z.array(z.string().min(1)).optional(),
  source: z.string().optional(),
  image: z.object({ svg: z.string().min(1), alt: z.string().min(1) }).optional(),
});
export type Flashcard = z.infer<typeof Flashcard>;

export const DeckTopic = z.object({
  slug: z.string().min(1),
  title: z.string().min(1).optional(),
  cards: z.array(Flashcard).min(1),
});
export type DeckTopic = z.infer<typeof DeckTopic>;

export const DeckSection = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  topics: z.array(DeckTopic).min(1),
});
export type DeckSection = z.infer<typeof DeckSection>;

/** data/decks/<subject>/<unit>.json */
export const DeckFile = z
  .object({
    subject: z.enum(["maths", "further-maths", "science"]),
    unit: z.string().min(1),
    version: z.number().int().positive(),
    sections: z.array(DeckSection).min(1),
  })
  .superRefine((d, ctx) => {
    const seen = new Set<string>();
    for (const s of d.sections)
      for (const t of s.topics)
        for (const c of t.cards) {
          if (seen.has(c.id)) ctx.addIssue({ code: "custom", message: `duplicate card id ${c.id}`, path: ["sections"] });
          seen.add(c.id);
        }
  });
export type DeckFile = z.infer<typeof DeckFile>;

/** What the app loads: the merged deck for one unit (authored + generated + bundle prompts). */
export interface ShippedDeck {
  subject: "maths" | "further-maths" | "science";
  unit: string;
  sections: Array<{ id: string; title: string; topics: Array<{ slug: string; title: string; cards: Flashcard[] }> }>;
  counts: { cards: number; topics: number; authored: number; generated: number; fromBundles: number };
}
