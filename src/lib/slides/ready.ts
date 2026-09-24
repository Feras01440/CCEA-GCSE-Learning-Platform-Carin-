/**
 * Which topics have Slides. The renderer and the generator are general; the roll-out is a list (TRIAL-BRIEF.md: nothing
 * rolls out beyond the trial topic until the owner has used it and said yes). The static route is built for these
 * topics only, and the topic hero offers "Start the slides" only for them.
 */
export const SLIDES_READY_TOPICS: ReadonlySet<string> = new Set(["further-maths:algebraic-fractions-simplify"]);

export function slidesReadyFor(subject: string, slug: string): boolean {
  return SLIDES_READY_TOPICS.has(`${subject}:${slug}`);
}

/** The static route beside the topic page. */
export function slidesHref(subject: string, unit: string, slug: string): string {
  return `/learn/${subject}/${unit}/${slug}/slides/`;
}
