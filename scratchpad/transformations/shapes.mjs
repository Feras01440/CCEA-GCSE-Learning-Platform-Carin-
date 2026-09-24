/**
 * Every shape and image used by the M7 combined-transformations bundle.
 * Each image is COMPUTED by the transformation functions and asserted against the
 * coordinates that are written into the content, so nothing is taken on trust.
 */
import {
  apply,
  check,
  centreOfEnlargement,
  centreOfRotation,
  enlarge,
  reflectHorizontal,
  reflectVertical,
  reflectYaxis,
  reflectXaxis,
  reflectYeqNegX,
  reflectYeqX,
  rotate,
  scaleFactor,
  translate,
} from "./lib.mjs";
import assert from "node:assert/strict";

const eq = (a, b, msg) => assert.deepEqual(a.map((v) => Number(v.toFixed(9))), b, msg);

// --- note figure 1: one point, two mirrors -------------------------------
export const P1 = [3, 5];
export const P1x = check("F1 reflect (3,5) in y = x", [reflectYeqX(P1)], [[5, 3]])[0];
export const P1nx = check("F1 reflect (3,5) in y = -x", [reflectYeqNegX(P1)], [[-5, -3]])[0];

// --- note figure 2: a triangle in y = x ----------------------------------
export const A2 = [[4, 1], [7, 1], [7, 3]];
export const A2i = check("F2 reflect A in y = x", apply(A2, reflectYeqX), [[1, 4], [1, 7], [3, 7]]);

// --- note figure 3: a triangle in y = -x ---------------------------------
export const B3 = [[2, 3], [6, 3], [6, 5]];
export const B3i = check("F3 reflect B in y = -x", apply(B3, reflectYeqNegX), [[-3, -2], [-3, -6], [-5, -6]]);

// --- note figure 4: reflect in y = x, then enlarge sf 1/2 centre (-4,-3) --
export const C4 = [[1, 2], [7, 2], [1, 6]];
export const C4i = check("F4 reflect C in y = x", apply(C4, reflectYeqX), [[2, 1], [2, 7], [6, 1]]);
export const C4f = check("F4 enlarge sf 1/2 centre (-4,-3)", apply(C4i, enlarge(1 / 2, [-4, -3])), [[-1, -1], [-1, 2], [1, -1]]);

// --- note figure 5: two perpendicular mirrors = rotation 180 -------------
export const D5 = [[2, 5], [2, 7], [5, 5]];
export const D5i = check("F5 reflect D in y = x", apply(D5, reflectYeqX), [[5, 2], [7, 2], [5, 5]]);
export const D5f = check("F5 reflect D' in y = -x", apply(D5i, reflectYeqNegX), [[-2, -5], [-2, -7], [-5, -5]]);
check("F5 the pair equals a half turn about the origin", apply(D5, rotate(180)), D5f);

// --- note figure 6: two parallel mirrors = translation -------------------
export const E6 = [[-6, 2], [-3, 2], [-6, 6]];
export const E6i = check("F6 reflect E in x = -1", apply(E6, reflectVertical(-1)), [[4, 2], [1, 2], [4, 6]]);
export const E6f = check("F6 reflect E' in x = 3", apply(E6i, reflectVertical(3)), [[2, 2], [5, 2], [2, 6]]);
check("F6 the pair equals a translation of 8 right", apply(E6, translate([8, 0])), E6f);

// --- note figure 7: centre of rotation by perpendicular bisectors --------
export const F7 = [[1, 1], [4, 1], [1, 3]];
export const F7i = check("F7 rotate F 90 acw about (-1,2)", apply(F7, rotate(90, [-1, 2])), [[0, 4], [0, 7], [-2, 4]]);
export const F7c = [-1, 2];
eq(centreOfRotation(F7, F7i), F7c, "F7 perpendicular bisectors meet at (-1, 2)");

// --- note figure 8: centre of enlargement by joining vertices ------------
export const G8 = [[-4, 2], [-4, 8], [2, 2]];
export const G8i = check("F8 enlarge G sf 1/3 centre (2,-1)", apply(G8, enlarge(1 / 3, [2, -1])), [[0, 0], [0, 2], [2, 0]]);
export const G8c = [2, -1];
eq(centreOfEnlargement(G8, G8i), G8c, "F8 the joins meet at (2, -1)");
assert.equal(Number(scaleFactor(G8, G8i).toFixed(9)), Number((1 / 3).toFixed(9)), "F8 scale factor is 1/3");

// --- note figure 9: order matters ----------------------------------------
export const H9 = [[1, 2], [4, 2], [1, 4]];
export const H9a1 = check("F9 route 1 step 1", apply(H9, reflectYeqX), [[2, 1], [2, 4], [4, 1]]);
export const H9a2 = check("F9 route 1 step 2", apply(H9a1, rotate(90)), [[-1, 2], [-4, 2], [-1, 4]]);
export const H9b1 = check("F9 route 2 step 1", apply(H9, rotate(90)), [[-2, 1], [-2, 4], [-4, 1]]);
export const H9b2 = check("F9 route 2 step 2", apply(H9b1, reflectYeqX), [[1, -2], [4, -2], [1, -4]]);
assert.notDeepEqual(H9a2, H9b2, "F9 the two orders must give different images");

// --- note figure 10: a translation, fully described ----------------------
export const J10 = [[-7, 3], [-5, 3], [-7, 6]];
export const J10i = check("F10 translate J by (5,-7)", apply(J10, translate([5, -7])), [[-2, -4], [0, -4], [-2, -1]]);

// --- note figure 11: fractional enlargement with rays --------------------
export const K11 = [[-2, -2], [4, -2], [-2, 4]];
export const K11i = check("F11 enlarge K sf 1/3 centre (-5,-5)", apply(K11, enlarge(1 / 3, [-5, -5])), [[-4, -4], [-2, -4], [-4, -2]]);
export const K11c = [-5, -5];

// --- worked example 1 -----------------------------------------------------
export const W1 = [[2, 1], [2, 7], [6, 1]];
export const W1i = check("WE1 reflect T in y = x", apply(W1, reflectYeqX), [[1, 2], [7, 2], [1, 6]]);
export const W1f = check("WE1 enlarge sf 1/2 centre (-5,-2)", apply(W1i, enlarge(1 / 2, [-5, -2])), [[-2, 0], [1, 0], [-2, 2]]);
export const W1c = [-5, -2];
export const W1tw = [[1, 3], [5, 3], [1, 5]];
export const W1twi = check("WE1 twin reflect in y = x", apply(W1tw, reflectYeqX), [[3, 1], [3, 5], [5, 1]]);
export const W1twf = check("WE1 twin enlarge sf 1/2 centre (-3,-1)", apply(W1twi, enlarge(1 / 2, [-3, -1])), [[0, 0], [0, 2], [1, 0]]);

// --- worked example 2 -----------------------------------------------------
export const W2 = D5;
export const W2i = D5i;
export const W2f = D5f;
export const W2tw = [[4, 2], [7, 2], [4, 4]];
export const W2twi = check("WE2 twin reflect in x = 2", apply(W2tw, reflectVertical(2)), [[0, 2], [-3, 2], [0, 4]]);
export const W2twf = check("WE2 twin reflect in y = -1", apply(W2twi, reflectHorizontal(-1)), [[0, -4], [-3, -4], [0, -6]]);
check("WE2 twin equals a half turn about (2,-1)", apply(W2tw, rotate(180, [2, -1])), W2twf);

// --- worked example 3: describe an enlargement ---------------------------
export const W3 = [[-7, -3], [-7, 1], [1, -3]];
export const W3i = check("WE3 enlarge sf 1/2 centre (-1,5)", apply(W3, enlarge(1 / 2, [-1, 5])), [[-4, 1], [-4, 3], [0, 1]]);
export const W3c = [-1, 5];
eq(centreOfEnlargement(W3, W3i), W3c, "WE3 the joins meet at (-1, 5)");
assert.equal(Number(scaleFactor(W3, W3i).toFixed(9)), 0.5, "WE3 scale factor is 1/2");

// --- worked example 4: describe a rotation -------------------------------
export const W4 = [[3, 1], [7, 1], [3, 3]];
export const W4i = check("WE4 rotate 90 cw about (2,-2)", apply(W4, rotate(-90, [2, -2])), [[5, -3], [5, -7], [7, -3]]);
export const W4c = [2, -2];
eq(centreOfRotation(W4, W4i), W4c, "WE4 perpendicular bisectors meet at (2, -2)");
check("WE4 90 clockwise is 270 anticlockwise", apply(W4, rotate(270, [2, -2])), W4i);

// --- questions ------------------------------------------------------------
export const Q1 = [6, -2];
export const Q1a = check("q0001", [reflectYeqX(Q1)], [[-2, 6]])[0];
export const Q2a = check("q0002", [reflectYeqNegX(Q1)], [[2, -6]])[0];

export const Q3 = [[3, 1], [8, 1], [3, 4]];
export const Q3i = check("q0003 reflect in y = x", apply(Q3, reflectYeqX), [[1, 3], [1, 8], [4, 3]]);
export const Q3wrong = check("q0003 the y-axis slip", apply(Q3, reflectYaxis), [[-3, 1], [-8, 1], [-3, 4]]);

export const Q4 = [[1, 3], [5, 3], [5, 6]];
export const Q4i = check("q0004 reflect in y = -x", apply(Q4, reflectYeqNegX), [[-3, -1], [-3, -5], [-6, -5]]);
export const Q4swap = check("q0004 the swap-only slip", apply(Q4, reflectYeqX), [[3, 1], [3, 5], [6, 5]]);

export const Q5 = [[-6, 2], [-2, 2], [-6, 5]];
export const Q5i = check("q0005 reflect in y = x", apply(Q5, reflectYeqX), [[2, -6], [2, -2], [5, -6]]);

export const Q6 = [[2, 4], [2, 7], [6, 4]];
export const Q6i = check("q0006 reflect in y = -x", apply(Q6, reflectYeqNegX), [[-4, -2], [-7, -2], [-4, -6]]);

export const Q7 = [-3, 5];
export const Q7a = check("q0007 step 1", [reflectYeqX(Q7)], [[5, -3]])[0];
export const Q7b = check("q0007 step 2", [reflectYeqNegX(Q7a)], [[3, -5]])[0];
check("q0007 the pair is a half turn", [rotate(180)(Q7)], [Q7b]);

export const Q8 = [[1, 2], [1, 6], [4, 2]];
export const Q8i = check("q0008 reflect in y = x", apply(Q8, reflectYeqX), [[2, 1], [6, 1], [2, 4]]);
export const Q8f = check("q0008 translate (-6,-4)", apply(Q8i, translate([-6, -4])), [[-4, -3], [0, -3], [-4, 0]]);

export const Q9 = [[3, 1], [6, 1], [6, 3]];
export const Q9i = check("q0009 reflect in y = x", apply(Q9, reflectYeqX), [[1, 3], [1, 6], [3, 6]]);
export const Q9f = check("q0009 reflect in y = -x", apply(Q9i, reflectYeqNegX), [[-3, -1], [-6, -1], [-6, -3]]);
check("q0009 equals a half turn about the origin", apply(Q9, rotate(180)), Q9f);

export const Q10 = [[-5, 1], [-5, 4], [-3, 1]];
export const Q10i = check("q0010 rotate 90 cw about (-1,-1)", apply(Q10, rotate(-90, [-1, -1])), [[1, 3], [4, 3], [1, 1]]);
export const Q10c = [-1, -1];
eq(centreOfRotation(Q10, Q10i), Q10c, "q0010 centre is (-1, -1)");

export const Q11 = [[-6, -6], [-6, 0], [-3, -6]];
export const Q11i = check("q0011 enlarge sf 1/3 centre (3,3)", apply(Q11, enlarge(1 / 3, [3, 3])), [[0, 0], [0, 2], [1, 0]]);
export const Q11c = [3, 3];
eq(centreOfEnlargement(Q11, Q11i), Q11c, "q0011 centre is (3, 3)");
assert.equal(Number(scaleFactor(Q11, Q11i).toFixed(9)), Number((1 / 3).toFixed(9)), "q0011 scale factor is 1/3");

export const Q12 = [[-7, 2], [-4, 2], [-7, 5]];
export const Q12i = check("q0012 reflect in x = -3", apply(Q12, reflectVertical(-3)), [[1, 2], [-2, 2], [1, 5]]);
export const Q12f = check("q0012 reflect in x = 1", apply(Q12i, reflectVertical(1)), [[1, 2], [4, 2], [1, 5]]);
check("q0012 equals a translation of 8 right", apply(Q12, translate([8, 0])), Q12f);

export const Q13 = [2, 5];
export const Q13a = check("q0013 step 1", [reflectYeqX(Q13)], [[5, 2]])[0];
export const Q13b = check("q0013 step 2", [rotate(-90)(Q13a)], [[2, -5]])[0];

export const Q14 = [[2, 2], [6, 2], [2, 6]];
export const Q14i = check("q0014 reflect in y = -x", apply(Q14, reflectYeqNegX), [[-2, -2], [-2, -6], [-6, -2]]);
export const Q14f = check("q0014 enlarge sf 1/2 centre (2,2)", apply(Q14i, enlarge(1 / 2, [2, 2])), [[0, 0], [0, -2], [-2, 0]]);
export const Q14c = [2, 2];

export const Q15 = [[1, 2], [7, 2], [1, 6]];
export const Q15i = check("q0015 reflect in y = x", apply(Q15, reflectYeqX), [[2, 1], [2, 7], [6, 1]]);
export const Q15f = check("q0015 enlarge sf 1/2 centre (-6,-1)", apply(Q15i, enlarge(1 / 2, [-6, -1])), [[-2, 0], [-2, 3], [0, 0]]);
export const Q15c = [-6, -1];

export const Q16 = [[-8, -1], [-8, 5], [-2, -1]];
export const Q16i = check("q0016 enlarge sf 1/3 centre (4,-4)", apply(Q16, enlarge(1 / 3, [4, -4])), [[0, -3], [0, -1], [2, -3]]);
export const Q16c = [4, -4];
eq(centreOfEnlargement(Q16, Q16i), Q16c, "q0016 centre is (4, -4)");
assert.equal(Number(scaleFactor(Q16, Q16i).toFixed(9)), Number((1 / 3).toFixed(9)), "q0016 scale factor is 1/3");

export const Q17 = [[1, 3], [1, 6], [3, 3]];
export const Q17a = check("q0017a reflect in y = x", apply(Q17, reflectYeqX), [[3, 1], [6, 1], [3, 3]]);
export const Q17b = check("q0017b reflect in the x-axis", apply(Q17a, reflectXaxis), [[3, -1], [6, -1], [3, -3]]);
check("q0017c equals a quarter turn clockwise about the origin", apply(Q17, rotate(-90)), Q17b);

// The vertices are chosen so that no OTHER single transformation carries T onto U:
// with (5, 4) in place of (6, 3) the image coincides with a translation of T, which would
// make "describe the single transformation" in part (b) have two correct answers.
export const Q18 = [[2, 1], [6, 1], [6, 3]];
export const Q18i = check("q0018 reflect in y = -x", apply(Q18, reflectYeqNegX), [[-1, -2], [-1, -6], [-3, -6]]);
check("q0018 a reflection undoes itself", apply(Q18i, reflectYeqNegX), Q18);
for (const o of Q18) {
  const t = [Q18i[0][0] - o[0], Q18i[0][1] - o[1]];
  const moved = apply(Q18, translate(t));
  assert.notEqual(
    JSON.stringify([...moved].sort()),
    JSON.stringify([...Q18i].sort()),
    `q0018: the image is also a translation by ${JSON.stringify(t)}, so part (b) would have two answers`,
  );
}

// --- diagnostic values ----------------------------------------------------
export const DX = {
  p: [4, 7],
  pYeqX: check("dx01", [reflectYeqX([4, 7])], [[7, 4]])[0],
  pYeqNegX: check("dx02", [reflectYeqNegX([4, 7])], [[-7, -4]])[0],
  pYaxis: check("dx01 distractor", [reflectYaxis([4, 7])], [[-4, 7]])[0],
  pXaxis: check("dx01 distractor", [reflectXaxis([4, 7])], [[4, -7]])[0],
  pHalfTurn: check("dx02 distractor", [rotate(180)([4, 7])], [[-4, -7]])[0],
  enlargeQ: check("dx07", [enlarge(1 / 2, [2, 2])([8, 6])], [[5, 4]])[0],
  enlargeHalved: check("dx07 distractor", [[8 / 2, 6 / 2]], [[4, 3]])[0],
  enlargeSf2: check("dx07 distractor", [enlarge(2, [2, 2])([8, 6])], [[14, 10]])[0],
  parallelGap: 2 * (5 - 1),
};
assert.equal(DX.parallelGap, 8, "dx06: two mirrors 4 apart translate by 8");

// --- wrong images named by graph common errors ---------------------------
// Every `test` string on a graph commonError lists one of these vertex sets, so the
// marker can fire it only when the learner's placed vertices are exactly that shape.
export const Q3unmoved = check("q0003 the object left unmoved", Q3, [[3, 1], [8, 1], [3, 4]]);
export const Q8yaxis = check("q0008a the y-axis slip", apply(Q8, reflectYaxis), [[-1, 2], [-1, 6], [-4, 2]]);
export const Q8wrongOrder = check("q0008b translating G instead of G'", apply(Q8, translate([-6, -4])), [[-5, -2], [-5, 2], [-2, -2]]);
export const Q8vectorSwapped = check("q0008b vector components swapped", apply(Q8i, translate([-4, -6])), [[-2, -5], [2, -5], [-2, -2]]);
export const Q13wrongMirror = check("q0013 reflected in y = -x", [reflectYeqNegX(Q13)], [[-5, -2]])[0];
export const Q13wrongDir = check("q0013 the quarter turn the other way", [rotate(90)(Q13a)], [[-2, 5]])[0];
check("q0013 rotating first then reflecting lands on the same point", [reflectYeqX(rotate(-90)(Q13))], [Q13wrongDir]);
export const Q14yaxis = check("q0014a the y-axis slip", apply(Q14, reflectYaxis), [[-2, 2], [-6, 2], [-2, 6]]);
export const Q14fromOrigin = check("q0014b halving from the origin", apply(Q14i, enlarge(1 / 2, [0, 0])), [[-1, -1], [-1, -3], [-3, -1]]);
export const Q14wrongOrder = check("q0014b enlarging W instead of W'", apply(Q14, enlarge(1 / 2, Q14c)), [[2, 2], [4, 2], [2, 4]]);
export const Q15yaxis = check("q0015a the y-axis slip", apply(Q15, reflectYaxis), [[-1, 2], [-7, 2], [-1, 6]]);
export const Q15wrongCentre = check("q0015b centre sign misread as (-6, 1)", apply(Q15i, enlarge(1 / 2, [-6, 1])), [[-2, 1], [-2, 4], [0, 1]]);
export const Q17yaxis = check("q0017a the y-axis slip", apply(Q17, reflectYaxis), [[-1, 3], [-1, 6], [-3, 3]]);
export const Q17wrongOrder = check("q0017b reflecting P instead of P'", apply(Q17, reflectXaxis), [[1, -3], [1, -6], [3, -3]]);
export const Q18swap = check("q0018a swapped without the sign change", apply(Q18, reflectYeqX), [[1, 2], [1, 6], [3, 6]]);

export const ALL_OK = true;
