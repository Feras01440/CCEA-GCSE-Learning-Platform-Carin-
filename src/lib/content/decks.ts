import manifest from "../../generated/decks-manifest.json";
import type { ShippedDeck } from "./deck-schema";

export const DECKS_MANIFEST = manifest;
export type DeckManifestUnit = (typeof manifest)["units"][number];

export function deckUnitsFor(subject: string): DeckManifestUnit[] {
  return manifest.units.filter((u) => u.subject === subject);
}

export function deckFor(subject: string, unit: string): DeckManifestUnit | undefined {
  return manifest.units.find((u) => u.subject === subject && u.unit === unit);
}

const cache = new Map<string, Promise<ShippedDeck>>();

export function loadDeck(subject: string, unit: string): Promise<ShippedDeck> {
  const key = `${subject}/${unit}`;
  let p = cache.get(key);
  if (!p) {
    p = fetch(`/decks/${subject}/${unit}.json`).then((r) => {
      if (!r.ok) throw new Error(`No deck for ${key}`);
      return r.json() as Promise<ShippedDeck>;
    });
    cache.set(key, p);
  }
  return p;
}
