/**
 * Guides the transformation grid draws from a part's stem: the mirror line of a reflection ("the line y = x",
 * "the line x = 2") and the centre of a rotation or enlargement ("about the origin", "centre (2, 2)"). Pure.
 */
export type Guide =
  | { kind: "line"; a: number; b: number; c: number; label: string }
  | { kind: "point"; x: number; y: number; label: string };

const num = "(-?\\d+(?:\\.\\d+)?)";

export function guidesFromStem(stem: string | undefined): Guide[] {
  if (!stem) return [];
  // Strip TeX delimiters and unify minus signs so "$y = -x$" reads like plain text.
  const text = stem.replace(/\\\(|\\\)|\$/g, "").replace(/[−–]/g, "-");
  const out: Guide[] = [];
  const add = (g: Guide) => {
    if (!out.some((h) => JSON.stringify(h) === JSON.stringify(g))) out.push(g);
  };
  for (const m of text.matchAll(/\bline\s+y\s*=\s*(-?)\s*x\b/gi)) {
    if (m[1]) add({ kind: "line", a: 1, b: 1, c: 0, label: "y = −x" });
    else add({ kind: "line", a: 1, b: -1, c: 0, label: "y = x" });
  }
  for (const m of text.matchAll(new RegExp(`\\bline\\s+x\\s*=\\s*${num}`, "gi"))) add({ kind: "line", a: 1, b: 0, c: Number(m[1]), label: `x = ${m[1]}` });
  for (const m of text.matchAll(new RegExp(`\\bline\\s+y\\s*=\\s*${num}`, "gi"))) add({ kind: "line", a: 0, b: 1, c: Number(m[1]), label: `y = ${m[1]}` });
  for (const m of text.matchAll(new RegExp(`\\b(?:centre|center|about)\\s+(?:the\\s+origin|\\(\\s*${num}\\s*,\\s*${num}\\s*\\))`, "gi"))) {
    if (m[1] === undefined) add({ kind: "point", x: 0, y: 0, label: "centre" });
    else add({ kind: "point", x: Number(m[1]), y: Number(m[2]), label: "centre" });
  }
  return out;
}
