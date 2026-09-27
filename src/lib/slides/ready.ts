/**
 * Which topics have Slides and Read v2. The content decides, never a list in code (27 Sep 2026): a topic is ready when
 * its note passes lesson structure v3 and its latest teach-show-check review says pass, or when that review is the one
 * waiver on a note that has no See it block yet. The rule, and the exact record a reviewer writes, are in
 * ./readiness.ts.
 *
 * The rule runs once per topic at content build: pipeline/build-content.mts writes `ready: lessonReadiness(shipped).ready`
 * on the topic's row of src/generated/manifest.json. This module reads that field, and it is the one function every
 * surface asks, on the server and in the browser alike, so no two of them can disagree:
 *  - the topic page's hero ("Start the slides", the deck's numbers) and the way that carries the accent (lesson-way.ts);
 *  - the Slides route, built at export time for these topics only (slides/page.tsx generateStaticParams), which the
 *    service worker then precaches (scripts/build-sw.mjs checks the two agree);
 *  - Read v2, the lesson's one centred column, and the rail folded beside it (lesson-plan.ts isReadV2, isReadV2Path).
 * A row without `ready: true` (a manifest written before the field existed included) is not ready: Read is then the
 * only way in and nothing on the screen promises Slides.
 */
import { CONTENT_MANIFEST } from "@/lib/content/load";

/** A manifest row as readiness reads it (src/generated/manifest.json `topics[]`). */
export interface ReadinessRow {
  subject: string;
  unit: string;
  slug: string;
  hasBlocks?: boolean;
  ready?: unknown;
}

/** The ready topics of some manifest rows, keyed "<subject>:<slug>", with each one's unit: a row counts when it ships its note blocks and says `ready: true`. */
export function readinessIndex(rows: readonly ReadinessRow[]): ReadonlyMap<string, { unit: string }> {
  return new Map(rows.filter((r) => r.hasBlocks === true && r.ready === true).map((r) => [`${r.subject}:${r.slug}`, { unit: r.unit }]));
}

/** Whether a topic is ready in an index; with a unit, only at that unit. */
export function readyIn(index: ReadonlyMap<string, { unit: string }>, subject: string, slug: string, unit?: string): boolean {
  const hit = index.get(`${subject}:${slug}`);
  return hit !== undefined && (unit === undefined || hit.unit === unit);
}

const INDEX = readinessIndex(CONTENT_MANIFEST.topics as readonly ReadinessRow[]);

/**
 * THE function: does this topic have Slides (and Read v2)? Pass the unit when the caller has one (a route, a pathname),
 * so a topic is ready only at its own address.
 */
export function slidesReadyFor(subject: string, slug: string, unit?: string): boolean {
  return readyIn(INDEX, subject, slug, unit);
}

/**
 * The Slides route's stand-in when no topic is ready. Next's static export refuses a dynamic route that prerenders
 * nothing ('Page … is missing "generateStaticParams()"', Next 16), so on such a build the route exports this one
 * address, which is no topic's and renders the not-found page: the export still builds, Read stays the way into every
 * topic, and no topic gains a /slides/ route it has not earned. scripts/build-sw.mjs leaves it out of the precache.
 */
export const NO_TOPIC_READY = { subject: "no-topic-ready", unit: "none", topic: "none" } as const;

/** Every ready topic's route parameters, in the manifest's order. */
export function readyTopicRoutes(): Array<{ subject: string; unit: string; topic: string }> {
  return [...INDEX].map(([key, { unit }]) => {
    const at = key.indexOf(":");
    return { subject: key.slice(0, at), unit, topic: key.slice(at + 1) };
  });
}

/** The static route beside the topic page. */
export function slidesHref(subject: string, unit: string, slug: string): string {
  return `/learn/${subject}/${unit}/${slug}/slides/`;
}
