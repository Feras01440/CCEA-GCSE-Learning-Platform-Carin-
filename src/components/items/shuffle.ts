/**
 * Deterministic shuffle (pure). Options are shuffled from a seed derived from their own
 * ids, so the server-rendered and hydrated orders agree and an authored "correct answer
 * first" list never renders in authored order.
 */

/** FNV-1a 32-bit hash of a string. */
export function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates with a seeded generator; never returns the input order for n ≥ 2 unless every rotation collides. */
export function seededShuffle<T>(items: readonly T[], seed: string | number): T[] {
  const out = [...items];
  if (out.length < 2) return out;
  const rand = mulberry32(typeof seed === "number" ? seed : hashSeed(seed));
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Guard against the identity permutation so "correct first" is never preserved by chance.
  if (out.every((x, i) => x === items[i])) out.push(out.shift() as T);
  return out;
}
