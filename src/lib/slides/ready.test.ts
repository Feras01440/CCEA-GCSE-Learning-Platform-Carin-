import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/generated/manifest.json";
import { allTopicParams } from "@/lib/content/taxonomy";
import { lessonReadiness, noteStructure } from "./readiness";
import { NO_TOPIC_READY, readinessIndex, readyIn, readyTopicRoutes, slidesHref, slidesReadyFor, type ReadinessRow } from "./ready";
import { SEE_FIXTURE_BLOCKS } from "./see-fixture";

/**
 * The one function every surface asks (27 Sep 2026): slidesReadyFor reads `ready` on the topic's manifest row, which
 * pipeline/build-content.mts writes from lessonReadiness (./readiness.ts). No topic is named as ready here: the content
 * decides, so these tests check the delegation and the agreement, never a list.
 */

const rows = manifest.topics as unknown as ReadinessRow[];
const carriesReadiness = rows.some((r) => "ready" in r);
const route = (r: { subject: string; unit: string; slug: string }) => `${r.subject}/${r.unit}/${r.slug}`;

describe("the readiness index, on fixture rows", () => {
  const fixture: ReadinessRow[] = [
    { subject: "further-maths", unit: "FM1", slug: "a-ready-topic", hasBlocks: true, ready: true },
    { subject: "further-maths", unit: "FM1", slug: "not-reviewed", hasBlocks: true, ready: false },
    { subject: "maths", unit: "M4", slug: "an-old-manifest-row", hasBlocks: true },
    { subject: "science", unit: "B2", slug: "no-note-shipped", hasBlocks: false, ready: true },
    { subject: "science", unit: "C2", slug: "truthy-but-not-true", hasBlocks: true, ready: "yes" },
  ];
  const index = readinessIndex(fixture);

  it("counts a row only when it ships its note blocks and says ready: true", () => {
    expect([...index.keys()]).toEqual(["further-maths:a-ready-topic"]);
    expect(readyIn(index, "further-maths", "a-ready-topic")).toBe(true);
    for (const r of fixture.slice(1)) expect(readyIn(index, r.subject, r.slug), r.slug).toBe(false);
  });

  it("with a unit, only at the topic's own unit", () => {
    expect(readyIn(index, "further-maths", "a-ready-topic", "FM1")).toBe(true);
    expect(readyIn(index, "further-maths", "a-ready-topic", "FM2")).toBe(false);
    expect(readyIn(index, "maths", "a-ready-topic", "FM1")).toBe(false);
  });

  it("builds the static route beside the topic page", () => {
    expect(slidesHref("further-maths", "FM1", "a-ready-topic")).toBe("/learn/further-maths/FM1/a-ready-topic/slides/");
  });
});

describe("the one function, over the manifest this build carries", () => {
  it("answers from the manifest row and nothing else", () => {
    for (const r of rows) {
      const expected = r.hasBlocks === true && r.ready === true;
      expect(slidesReadyFor(r.subject, r.slug), route(r)).toBe(expected);
      expect(slidesReadyFor(r.subject, r.slug, r.unit), route(r)).toBe(expected);
    }
    expect(slidesReadyFor("further-maths", "no-such-topic")).toBe(false);
  });

  it("lists every ready topic's route, each at a taxonomy route, so the Slides route can be built for it", () => {
    const taxonomy = new Set(allTopicParams().map((p) => `${p.subject}/${p.unit}/${p.topic}`));
    const listed = readyTopicRoutes().map((p) => `${p.subject}/${p.unit}/${p.topic}`);
    expect(listed).toEqual(rows.filter((r) => r.hasBlocks === true && r.ready === true).map(route));
    for (const r of listed) expect(taxonomy.has(r), r).toBe(true);
  });

  it("puts every published topic at its own unit in the taxonomy, so readiness by route can hold", () => {
    const taxonomy = new Set(allTopicParams().map((p) => `${p.subject}/${p.unit}/${p.topic}`));
    expect(rows.map(route).filter((r) => !taxonomy.has(r))).toEqual([]);
  });

  it("keeps the export's stand-in for a build with nothing ready off every topic's address", () => {
    const at = `${NO_TOPIC_READY.subject}/${NO_TOPIC_READY.unit}/${NO_TOPIC_READY.topic}`;
    expect(allTopicParams().map((p) => `${p.subject}/${p.unit}/${p.topic}`)).not.toContain(at);
    expect(rows.map(route)).not.toContain(at);
    expect(slidesReadyFor(NO_TOPIC_READY.subject, NO_TOPIC_READY.topic, NO_TOPIC_READY.unit)).toBe(false);
  });

  // Skipped, and shown as skipped, until pipeline/build-content.mts writes the field: a manifest from before it has no
  // `ready` on any row, and then nothing is ready (Read is the only way in everywhere).
  it.skipIf(!carriesReadiness)("was written by the same rule: every row's ready is lessonReadiness of the bundle it published", () => {
    for (const r of manifest.topics) {
      const file = path.resolve(__dirname, "../../../public/content", r.subject, `${r.id}.json`);
      const bundle = JSON.parse(readFileSync(file, "utf8"));
      expect((r as unknown as ReadinessRow).ready, `${route(r)}: ${lessonReadiness(bundle).reasons.join("; ")}`).toBe(lessonReadiness(bundle).ready);
    }
  });
});

describe("the card grammar and this rule read v3 alike", () => {
  // src/lib/slides/see-fixture.ts is the Slides agent's note in the teach-first shape; it must pass the structure the
  // roll-out is gated on, or the two agents disagree about what v3 is.
  it("passes the Slides agent's teach-first fixture note", () => {
    expect(noteStructure(SEE_FIXTURE_BLOCKS)).toEqual({ ok: true, problems: [] });
  });
});
