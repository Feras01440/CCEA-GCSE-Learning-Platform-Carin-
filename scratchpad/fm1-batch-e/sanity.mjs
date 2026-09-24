import { polyFrom, polyDeriv, polyInteg, polyEval, polyLatex, polyText, stationaryPoints, quadRoots, fr, frLatex, frText, num, pointLatex, graphSvg, cardSvg, dataUri } from "./lib.mjs";

const show = (label, p) => console.log(label, "=>", polyLatex(p), "| text:", polyText(p));

const q1 = polyFrom({ 2: 1, 1: -6, 0: 5 });
show("y = x^2 - 6x + 5", q1);
show("  dy/dx", polyDeriv(q1));
console.log("  roots:", quadRoots(fr(1), fr(-6), fr(5)).map(frText));
console.log("  SP:", stationaryPoints(q1).map((s) => `${pointLatex(s.x, s.y)} d2=${frText(s.d2)} ${s.nature}`));
console.log("  eval at 0,1,5:", [0, 1, 5].map((x) => frText(polyEval(q1, fr(x)))));

const q2 = polyFrom({ 2: -1, 1: 4, 0: 5 });
show("y = -x^2 + 4x + 5", q2);
console.log("  roots:", quadRoots(fr(-1), fr(4), fr(5)).map(frText));
console.log("  SP:", stationaryPoints(q2).map((s) => `${pointLatex(s.x, s.y)} d2=${frText(s.d2)} ${s.nature}`));

const c1 = polyFrom({ 3: 1, 2: -13, 1: 40 });
show("y = x(x-5)(x-8)", c1);
show("  dy/dx", polyDeriv(c1));
console.log("  SP:", stationaryPoints(c1).map((s) => `${pointLatex(s.x, s.y)} (${num(s.x).toFixed(4)}, ${num(s.y).toFixed(4)}) d2=${frText(s.d2)} ${s.nature}`));

const c2 = polyFrom({ 3: 1, 2: -12, 1: 36, 0: -32 });
show("y = (x-2)^2(x-8)", c2);
show("  dy/dx", polyDeriv(c2));
console.log("  eval 0,2,8:", [0, 2, 8].map((x) => frText(polyEval(c2, fr(x)))));
console.log("  SP:", stationaryPoints(c2).map((s) => `${pointLatex(s.x, s.y)} d2=${frText(s.d2)} ${s.nature}`));

const neg = polyFrom({ 2: 4, 1: 0, 0: 0, [-2]: -6 });
show("4x^2 - 6/x^2", neg);
show("  dy/dx", polyDeriv(neg));
show("  integral", polyInteg(polyFrom({ 3: 4, 1: 5, 0: -9, [-2]: -6 })));

// integration check: d/dx of integral == original, at three sample points
const p = polyFrom({ 3: 4, 1: 5, 0: -9, [-2]: -6 });
const back = polyDeriv(polyInteg(p));
for (const x of [2, 3, -1]) console.log("  round trip at", x, frText(polyEval(p, fr(x))), frText(polyEval(back, fr(x))));

const svg = graphSvg({
  xMin: -2, xMax: 7, yMin: -6, yMax: 7, xStep: 1, yStep: 1,
  curves: [{ f: (x) => x * x - 6 * x + 5 }],
  points: [{ x: 1, y: 0, label: "(1, 0)" }, { x: 5, y: 0, label: "(5, 0)" }, { x: 0, y: 5, label: "(0, 5)", anchor: "end" }, { x: 3, y: -4, label: "(3, -4)" }],
  aria: "test",
});
console.log("graph svg bytes:", svg.length, "| uri bytes:", dataUri(svg).length);
console.log("card svg bytes:", cardSvg({ title: "t", rows: [["a", "b"], ["c", "d"]], footer: "f" }).length);
