/**
 * The words of an `apparatus` figure (schema.ts FigureSpec, kind "apparatus"): each entry of `parts` is one piece of
 * apparatus, named as CCEA names it, and may say what the piece holds.
 *
 *   "gas syringe"                                          a piece, labelled "gas syringe"
 *   "conical flask: dilute hydrochloric acid and zinc"     a piece and what it holds, labelled apart: "conical flask",
 *                                                          and "dilute hydrochloric acid and zinc" on the liquid
 *   "trough of water"                                      a vessel and what it holds, labelled as one: "trough of water"
 *                                                          ("of", "containing" or "holding", after a vessel's name only)
 *
 * The piece's name is matched without regard to case against the vocabulary below, which is the specification's own
 * apparatus list (U7.2.1) and the pieces its prescribed practicals are set up with. The label drawn is always the
 * author's own words. A name the vocabulary does not know is reported, never drawn as the nearest thing: "syringe" is
 * not a gas syringe and "tube" is not a delivery tube, because on the paper the full name is the mark.
 */

export type PieceKind =
  | "conical-flask"
  | "boiling-tube"
  | "test-tube"
  | "beaker"
  | "water-bath"
  | "polystyrene-cup"
  | "measuring-cylinder"
  | "trough"
  | "gas-jar"
  | "beehive-shelf"
  | "bung"
  | "delivery-tube"
  | "thistle-funnel"
  | "gas-syringe"
  | "thermometer"
  | "stone"
  | "stop-clock"
  | "balance"
  | "scales"
  | "metre-rule"
  | "ruler"
  | "pivot"
  | "weight"
  | "leafy-shoot"
  | "capillary-tube"
  | "air-bubble"
  | "reservoir"
  | "tap"
  | "bunsen"
  | "flame"
  | "wire-loop"
  | "holder"
  | "tripod"
  | "gauze"
  | "mat"
  | "clamp-stand"
  | "clamp"
  | "burning-food"
  | "leaf";

/** What a vessel holds, as the author wrote it, and what that is to draw. */
export interface Contents {
  text: string;
  liquid: boolean;
  solid: boolean;
  gas: boolean;
  /** A label of its own on the contents ("flask: acid"), or part of the vessel's label ("trough of water"). */
  labelled: boolean;
}

export interface Piece {
  kind: PieceKind;
  /** The author's words for the piece, drawn as its label. */
  label: string;
  contents?: Contents;
  /** Its place in the parts list, so a drawing can say which entry each label names. */
  index: number;
}

const VOCABULARY: ReadonlyArray<{ kind: PieceKind; names: readonly string[] }> = [
  { kind: "conical-flask", names: ["conical flask", "flask"] },
  { kind: "boiling-tube", names: ["boiling tube"] },
  { kind: "test-tube", names: ["test tube"] },
  { kind: "beaker", names: ["beaker"] },
  { kind: "water-bath", names: ["water bath"] },
  { kind: "polystyrene-cup", names: ["polystyrene cup", "expanded polystyrene cup", "insulated cup"] },
  { kind: "measuring-cylinder", names: ["measuring cylinder", "upturned measuring cylinder", "inverted measuring cylinder"] },
  { kind: "trough", names: ["trough", "basin", "water trough"] },
  { kind: "gas-jar", names: ["gas jar"] },
  { kind: "beehive-shelf", names: ["beehive shelf"] },
  { kind: "bung", names: ["bung", "rubber bung", "stopper"] },
  { kind: "delivery-tube", names: ["delivery tube"] },
  { kind: "thistle-funnel", names: ["thistle funnel"] },
  { kind: "gas-syringe", names: ["gas syringe"] },
  { kind: "thermometer", names: ["thermometer"] },
  { kind: "stone", names: ["stone on a thread", "stone"] },
  { kind: "stop-clock", names: ["stop clock", "stopclock", "stopwatch", "stop watch"] },
  { kind: "balance", names: ["balance", "electronic balance", "top-pan balance", "top pan balance"] },
  { kind: "scales", names: ["bathroom scales", "scales"] },
  { kind: "metre-rule", names: ["metre rule"] },
  { kind: "ruler", names: ["ruler", "scale"] },
  { kind: "pivot", names: ["pivot", "knife edge", "knife-edge", "fulcrum"] },
  { kind: "weight", names: ["weight", "weights", "mass", "masses", "slotted mass", "slotted masses"] },
  { kind: "leafy-shoot", names: ["leafy shoot", "shoot", "plant cutting", "leafy stem", "cut shoot"] },
  { kind: "capillary-tube", names: ["capillary tube"] },
  { kind: "air-bubble", names: ["air bubble", "bubble"] },
  { kind: "reservoir", names: ["reservoir", "water reservoir", "syringe"] },
  { kind: "tap", names: ["tap", "clip", "screw clip"] },
  { kind: "bunsen", names: ["bunsen burner", "bunsen"] },
  { kind: "flame", names: ["flame", "blue flame", "roaring flame", "blue roaring flame", "yellow flame", "luminous flame"] },
  { kind: "wire-loop", names: ["nichrome wire loop", "nichrome loop", "wire loop", "platinum wire loop", "flame test loop"] },
  { kind: "holder", names: ["holder", "handle"] },
  { kind: "tripod", names: ["tripod"] },
  { kind: "gauze", names: ["gauze", "wire gauze"] },
  { kind: "mat", names: ["heatproof mat", "heat-proof mat", "heat resistant mat", "heat-resistant mat", "heatproof tile"] },
  { kind: "clamp-stand", names: ["clamp stand", "retort stand", "stand"] },
  { kind: "clamp", names: ["clamp", "clamp and boss", "boss and clamp"] },
  {
    kind: "burning-food",
    names: ["burning food on a mounted needle", "food on a mounted needle", "food sample on a mounted needle", "burning food", "mounted needle"],
  },
  { kind: "leaf", names: ["leaf", "variegated leaf"] },
];

/** The pieces that hold something, so "<vessel> of <contents>" can be read. */
const VESSELS: ReadonlySet<PieceKind> = new Set<PieceKind>([
  "conical-flask",
  "boiling-tube",
  "test-tube",
  "beaker",
  "water-bath",
  "polystyrene-cup",
  "measuring-cylinder",
  "trough",
  "gas-jar",
]);

const normalise = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[.;,]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(a|an|the) /, "");

const BY_NAME: ReadonlyMap<string, PieceKind> = new Map(VOCABULARY.flatMap((w) => w.names.map((n) => [n, w.kind] as const)));

/** The kind a name means, or undefined when the vocabulary does not know it. */
export function pieceKindOf(name: string): PieceKind | undefined {
  return BY_NAME.get(normalise(name));
}

const LIQUID = /\b(acid|water|solution|limewater|alkali|ethanol|milk|juice|iodine|peroxide|liquid|oil|hydroxide|brine|sucrose|salt|enzyme|protease|amylase|catalase|indicator)\b/i;
const ALWAYS_SOLID = /\b(chips?|granules?|lumps?|pieces?|powder|ribbon|turnings|crystals?|marble|filings|beads|pellets|solid|sand)\b/i;
// A metal named on its own is a solid; named before a salt ("zinc sulfate") it is part of the salt's name.
const METAL = /\b(zinc|magnesium|iron|copper|calcium|aluminium|tin|lead)\b(?!\s+(sulfate|sulphate|chloride|nitrate|oxide|carbonate|hydroxide|bromide|iodide|ions?)\b)/i;
const GAS = /\b(gas|oxygen|hydrogen|carbon dioxide|air|chlorine|nitrogen)\b/i;

/** What contents are, to draw: a liquid unless its words say a solid or a gas; a mixture can be both. */
export function contentsOf(text: string, labelled: boolean): Contents {
  const solid = ALWAYS_SOLID.test(text) || METAL.test(text);
  const liquid = LIQUID.test(text);
  const gas = !liquid && GAS.test(text);
  return { text, liquid: liquid || (!solid && !gas), solid, gas, labelled };
}

/** One entry of `parts`, read: its piece and what it holds, or null when the name is not in the vocabulary. */
export function readPart(part: string, index: number): Piece | null {
  const colon = part.indexOf(":");
  if (colon > 0) {
    const head = part.slice(0, colon).trim();
    const kind = pieceKindOf(head);
    const text = part.slice(colon + 1).trim();
    if (!kind || !VESSELS.has(kind)) return null;
    return text ? { kind, label: head, contents: contentsOf(text, true), index } : { kind, label: head, index };
  }
  const whole = pieceKindOf(part);
  if (whole) return { kind: whole, label: part.trim(), index };
  const of = /^(.+?)\s+(?:of|containing|holding)\s+(.+)$/i.exec(part.trim());
  if (of) {
    const kind = pieceKindOf(of[1]);
    if (kind && VESSELS.has(kind)) return { kind, label: part.trim(), contents: contentsOf(of[2].trim(), false), index };
  }
  return null;
}

/** Every part read: the pieces in order, and the entries the vocabulary does not know, in the author's words. */
export function parseApparatusParts(parts: readonly string[]): { pieces: Piece[]; unknown: string[] } {
  const pieces: Piece[] = [];
  const unknown: string[] = [];
  parts.forEach((part, i) => {
    const piece = readPart(part, i);
    if (piece) pieces.push(piece);
    else unknown.push(part);
  });
  return { pieces, unknown };
}
