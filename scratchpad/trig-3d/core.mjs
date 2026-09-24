/**
 * Every length and angle used by the maths.m8.pythagoras-and-trigonometry-in-3d bundle,
 * recomputed here and asserted before any of it reaches the JSON. Nothing in the bundle
 * carries a number that is not produced (or checked) by this module.
 */
import { cuboid, pyramid, wedge, cone, rightTri, compose, dataUri } from "./figs.mjs";

// ---------------------------------------------------------------------------
// Arithmetic helpers
// ---------------------------------------------------------------------------

export const deg = (rad) => (rad * 180) / Math.PI;
export const atanDeg = (o, a) => deg(Math.atan(o / a));
export const asinDeg = (o, h) => deg(Math.asin(o / h));
export const acosDeg = (a, h) => deg(Math.acos(a / h));
export const hyp2 = (a, b) => Math.sqrt(a * a + b * b);
export const hyp3 = (a, b, c) => Math.sqrt(a * a + b * b + c * c);

/** 3 significant figures as a display string (no trailing-zero surprises). */
export function sf(x, n = 3) {
  if (x === 0) return "0";
  const d = Math.ceil(Math.log10(Math.abs(x)));
  const p = n - d;
  const r = Math.round(x * 10 ** p) / 10 ** p;
  return p > 0 ? r.toFixed(p) : String(r);
}
export const dp = (x, n = 1) => x.toFixed(n);

/** Full calculator display, truncated the way a mark scheme prints it. */
export const long = (x, n = 6) => {
  const s = x.toFixed(n);
  return s.replace(/0+$/, "").replace(/\.$/, "");
};

export function assert(cond, msg) {
  if (!cond) throw new Error(`CHECK FAILED: ${msg}`);
}

/** A right-angled triangle must have two legs and a hypotenuse that agree. */
export function checkRight(a, b, c, label) {
  assert(Math.abs(a * a + b * b - c * c) < 1e-9, `${label}: ${a}² + ${b}² ≠ ${c}²`);
  assert(a > 0 && b > 0 && c > 0, `${label}: a side is not positive`);
  assert(c > a && c > b, `${label}: the hypotenuse is not the longest side`);
}

const autoScale = (dims, target = 170) => {
  const m = Math.max(...dims);
  return Math.min(34, Math.max(9, target / m));
};

// ---------------------------------------------------------------------------
// The solids. Every entry recomputes its own lengths and angles.
// ---------------------------------------------------------------------------

/** Cuboid ABCDEFGH: AB = w, BC = d, CG = h; base diagonal AC, space diagonal AG. */
export function cuboidFacts(w, d, h, label) {
  const ac = hyp2(w, d);
  const ag = hyp3(w, d, h);
  const angle = atanDeg(h, ac);
  checkRight(w, d, ac, `${label} base ABC`);
  checkRight(ac, h, ag, `${label} vertical ACG`);
  assert(Math.abs(asinDeg(h, ag) - angle) < 1e-9, `${label}: sin and tan routes disagree`);
  assert(Math.abs(acosDeg(ac, ag) - angle) < 1e-9, `${label}: cos and tan routes disagree`);
  assert(angle > 0 && angle < 90, `${label}: angle out of range`);
  return { w, d, h, ac, ag, angle };
}

/** Square-based pyramid VABCD: base edge b, vertical height ht. */
export function pyramidFacts(b, ht, label) {
  const diag = b * Math.SQRT2; // AC
  const half = diag / 2; // AM
  const slantEdge = hyp2(half, ht); // VA
  const edgeAngle = atanDeg(ht, half); // angle VAM, slant edge with the base
  const halfBase = b / 2; // MN
  const slantHeight = hyp2(halfBase, ht); // VN, the height of a sloping face
  const faceAngle = atanDeg(ht, halfBase); // angle VNM, sloping face with the base
  checkRight(half, ht, slantEdge, `${label} AMV`);
  checkRight(halfBase, ht, slantHeight, `${label} NMV`);
  assert(faceAngle > edgeAngle, `${label}: the face angle must be the steeper of the two`);
  return { b, ht, diag, half, slantEdge, edgeAngle, halfBase, slantHeight, faceAngle };
}

/** Wedge ABCDGH: base ABCD (AB = w, BC = d), vertical back face of height h; slope diagonal AG. */
export function wedgeFacts(w, d, h, label) {
  const ac = hyp2(w, d);
  const ag = hyp3(w, d, h);
  const angle = atanDeg(h, ac);
  checkRight(w, d, ac, `${label} base`);
  checkRight(ac, h, ag, `${label} vertical`);
  return { w, d, h, ac, ag, angle };
}

/** Cone: radius r, vertical height h, slant height l. */
export function coneFacts(r, h, label) {
  const l = hyp2(r, h);
  const base = atanDeg(h, r); // angle between the slant height and the base
  const apex = atanDeg(r, h); // half the angle at the apex
  checkRight(r, h, l, `${label} cone`);
  assert(Math.abs(base + apex - 90) < 1e-9, `${label}: the two angles must be complementary`);
  return { r, h, l, base, apex };
}

/** Cube from its space diagonal: 3x² = D². */
export function cubeFromDiagonal(D, label) {
  const xSq = (D * D) / 3;
  const x = Math.sqrt(xSq);
  assert(Math.abs(hyp3(x, x, x) - D) < 1e-9, `${label}: the side does not rebuild the diagonal`);
  return { D, xSq, x };
}

/** Simplify √n to a√b with b square-free. */
export function surd(nUnder) {
  let a = 1;
  let b = nUnder;
  for (let k = Math.floor(Math.sqrt(b)); k >= 2; k--) {
    if (b % (k * k) === 0) {
      a *= k;
      b /= k * k;
      k = Math.floor(Math.sqrt(b)) + 1;
    }
  }
  assert(Math.abs(a * Math.sqrt(b) - Math.sqrt(nUnder)) < 1e-9, `surd ${nUnder} simplified wrongly`);
  return { a, b, latex: b === 1 ? `${a}` : a === 1 ? `\\sqrt{${b}}` : `${a}\\sqrt{${b}}` };
}

// ---------------------------------------------------------------------------
// Figure factories (solid + the extracted 2-D triangle, side by side)
// ---------------------------------------------------------------------------

/** Cuboid with the base diagonal, the space diagonal and the angle, plus triangle ACG. */
export function cuboidPair(f, o = {}) {
  const s = autoScale([f.w, f.d, f.h], o.target ?? 165);
  const solid = cuboid({
    w: f.w,
    d: f.d,
    h: f.h,
    scale: s,
    edges: o.edges ?? { AB: `${f.w} cm`, BC: `${f.d} cm`, CG: `${f.h} cm` },
    baseDiag: o.baseDiag !== false,
    baseDiagLabel: o.baseDiagLabel,
    spaceDiag: o.spaceDiag !== false,
    spaceDiagLabel: o.spaceDiagLabel,
    angle: o.angle,
  });
  const tri = rightTri({
    base: f.ac,
    height: f.h,
    names: ["A", "C", "G"],
    baseLabel: o.triBase ?? `AC = ${sf(f.ac)} cm`,
    heightLabel: o.triHeight ?? `${f.h} cm`,
    hypLabel: o.triHyp ?? "AG",
    angle: o.angle,
    maxW: 168,
    maxH: 150,
  });
  return compose([
    { ...solid, caption: o.captionA ?? "the solid" },
    { ...tri, caption: o.captionB ?? "triangle ACG, drawn on its own" },
  ]);
}

/** Cuboid on its own (no extracted triangle). */
export function cuboidOnly(f, o = {}) {
  const s = autoScale([f.w, f.d, f.h], o.target ?? 175);
  return compose([
    {
      ...cuboid({
        w: f.w,
        d: f.d,
        h: f.h,
        scale: s,
        edges: o.edges ?? { AB: `${f.w} cm`, BC: `${f.d} cm`, CG: `${f.h} cm` },
        baseDiag: !!o.baseDiag,
        baseDiagLabel: o.baseDiagLabel,
        spaceDiag: !!o.spaceDiag,
        spaceDiagLabel: o.spaceDiagLabel,
        angle: o.angle,
        markAngle: o.markAngle,
        markAngleLabel: o.markAngleLabel,
        showNames: o.showNames,
      }),
    },
  ]);
}

/** Pyramid with the slant edge VA, the diagonal AC, the height VM and the angle at A. */
export function pyramidEdgePair(f, o = {}) {
  const s = autoScale([f.b, f.ht], o.target ?? 150);
  const solid = pyramid({
    base: f.b,
    h: f.ht,
    scale: s,
    edges: o.edges ?? { AB: `${f.b} cm` },
    diagonal: true,
    height: o.height !== false,
    slantEdge: true,
    markM: true,
    innerLabels: o.innerLabels ?? { VM: `${f.ht} cm` },
    innerSides: { VM: -1, ...(o.innerSides ?? {}) },
    angleAtA: o.angle,
  });
  const tri = rightTri({
    base: f.half,
    height: f.ht,
    names: ["A", "M", "V"],
    baseLabel: o.triBase ?? `AM = ${sf(f.half)} cm`,
    heightLabel: o.triHeight ?? `${f.ht} cm`,
    hypLabel: o.triHyp ?? "VA",
    angle: o.angle,
    maxW: 150,
    maxH: 160,
  });
  return compose([
    { ...solid, caption: o.captionA ?? "the pyramid" },
    { ...tri, caption: o.captionB ?? "triangle AMV, drawn on its own" },
  ]);
}

/** Pyramid with the slant height VN, MN and the angle at N (a sloping face against the base). */
export function pyramidFacePair(f, o = {}) {
  const s = autoScale([f.b, f.ht], o.target ?? 150);
  const solid = pyramid({
    base: f.b,
    h: f.ht,
    scale: s,
    edges: o.edges ?? { AB: `${f.b} cm` },
    height: o.height !== false,
    slantHeight: true,
    markM: true,
    markN: true,
    innerLabels: o.innerLabels ?? { VM: `${f.ht} cm` },
    innerSides: { VM: -1, ...(o.innerSides ?? {}) },
    angleAtN: o.angle,
  });
  const tri = rightTri({
    base: f.halfBase,
    height: f.ht,
    names: ["N", "M", "V"],
    baseLabel: o.triBase ?? `MN = ${sf(f.halfBase)} cm`,
    heightLabel: o.triHeight ?? `${f.ht} cm`,
    hypLabel: o.triHyp ?? "VN",
    angle: o.angle,
    maxW: 150,
    maxH: 160,
  });
  return compose([
    { ...solid, caption: o.captionA ?? "the pyramid" },
    { ...tri, caption: o.captionB ?? "triangle NMV, drawn on its own" },
  ]);
}

/** Wedge (a triangular prism lying on its rectangular face) with AG and triangle ACG. */
export function wedgePair(f, o = {}) {
  const s = autoScale([f.w, f.d, f.h], o.target ?? 165);
  const unit = o.unit ?? "m";
  const solid = wedge({
    w: f.w,
    d: f.d,
    h: f.h,
    scale: s,
    edges: o.edges ?? { AB: `${f.w} ${unit}`, BC: `${f.d} ${unit}`, CG: `${f.h} ${unit}` },
    baseDiag: o.baseDiag !== false,
    slopeDiag: true,
    innerLabels: o.innerLabels,
    angle: o.angle,
  });
  const tri = rightTri({
    base: f.ac,
    height: f.h,
    names: ["A", "C", "G"],
    baseLabel: o.triBase ?? `AC = ${sf(f.ac)} ${unit}`,
    heightLabel: o.triHeight ?? `${f.h} ${unit}`,
    hypLabel: o.triHyp ?? "AG",
    angle: o.angle,
    maxW: 168,
    maxH: 140,
  });
  return compose([
    { ...solid, caption: o.captionA ?? "the wedge" },
    { ...tri, caption: o.captionB ?? "triangle ACG, drawn on its own" },
  ]);
}

/** Cone with r, h and l, plus the extracted triangle POV. */
export function conePair(f, o = {}) {
  const s = autoScale([f.r * 2, f.h], o.target ?? 150);
  const solid = cone({
    r: f.r,
    h: f.h,
    scale: s,
    rLabel: o.rLabel ?? `${f.r} cm`,
    hLabel: o.hLabel ?? `${f.h} cm`,
    lLabel: o.lLabel ?? "l",
    angle: o.angle,
  });
  const tri = rightTri({
    base: f.r,
    height: f.h,
    names: ["P", "O", "V"],
    baseLabel: o.triBase ?? `OP = ${f.r} cm`,
    heightLabel: o.triHeight ?? `${f.h} cm`,
    hypLabel: o.triHyp ?? "l",
    angle: o.angle,
    maxW: 140,
    maxH: 165,
  });
  return compose([
    { ...solid, caption: o.captionA ?? "the cone" },
    { ...tri, caption: o.captionB ?? "triangle POV, drawn on its own" },
  ]);
}

export { cuboid, pyramid, wedge, cone, rightTri, compose, dataUri };

/** figures[] entry for an item. */
export const fig = (svg, alt) => ({ kind: "svg", src: dataUri(svg), alt });
