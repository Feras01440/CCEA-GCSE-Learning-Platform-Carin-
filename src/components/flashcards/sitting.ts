/**
 * A flashcard sitting: a fixed small number of cards, the due ones first (the platform audit found a 198-card
 * "session" with no size; decision 10 asks for a sitting of a fixed small size with an honest close). Pure, so the
 * order is tested without a deck or a database.
 */
export const SESSION_SIZE = 15;

export function shuffle<T>(arr: readonly T[], seed: number): T[] {
  let s = seed || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** The due cards first, then the ones not yet studied in this visit, `size` at most; a card never twice in one sitting. */
export function sittingFrom<C extends { id: string }>(pool: readonly C[], due: ReadonlySet<string>, studied: ReadonlySet<string>, seed: number, size = SESSION_SIZE): C[] {
  const seen = new Set<string>();
  const fresh = pool.filter((c) => !studied.has(c.id) && !seen.has(c.id) && seen.add(c.id));
  const dueFirst = shuffle(fresh.filter((c) => due.has(c.id)), seed);
  const rest = shuffle(fresh.filter((c) => !due.has(c.id)), seed + 1);
  return [...dueFirst, ...rest].slice(0, size);
}
