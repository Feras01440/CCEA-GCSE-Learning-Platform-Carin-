/**
 * maths.m4.frustums-and-compound-solids — H bundle.
 * Every volume, area and unknown radius below is computed here from the stem numbers,
 * so stem, answer, scheme, hint and verification log all quote the same value.
 */
import fs from "node:fs";
import path from "node:path";
import { PAPER, timeFor, svgFigure, writeBundle, collectLogs, UPDATED, ROOT, round, sf } from "./lib.mjs";

const SLUG = "frustums-and-compound-solids";
const TID = `maths.m4.${SLUG}`;
const qid = (n) => `q.${TID}.${String(n).padStart(4, "0")}`;
const PI = Math.PI;

// ---------------------------------------------------------------------------
// Mensuration, computed once
// ---------------------------------------------------------------------------
const coneV = (r, h) => (PI * r * r * h) / 3;
const coneCSA = (r, l) => PI * r * l;
const cylV = (r, h) => PI * r * r * h;
const cylCSA = (r, h) => 2 * PI * r * h;
const circle = (r) => PI * r * r;
const hemiV = (r) => (2 / 3) * PI * r ** 3;
const hemiCSA = (r) => 2 * PI * r * r;
/** Frustum = large cone minus the small cone cut off the top. */
const frustumV = (R, H, r, h) => coneV(R, H) - coneV(r, h);
/** Guard: the two cones must really be similar, or it is not a frustum. */
function checkFrustum(R, H, r, h) {
  if (Math.abs(R / H - r / h) > 1e-12) throw new Error(`not a frustum: ${R}/${H} vs ${r}/${h}`);
  return true;
}

const V = {};
V.we1 = (checkFrustum(12, 24, 5, 10), frustumV(12, 24, 5, 10)); // 3206pi/3
V.we2 = circle(5) + cylCSA(5, 14) + hemiCSA(5); // 215pi
V.we3r = Math.sqrt(420 / 105); // 105 pi r^2 = 420 pi
V.q1 = coneV(6, 15);
V.q2 = hemiV(9);
V.q3 = coneCSA(7, 25);
V.q4 = coneCSA(5, 13) + circle(5);
V.q5 = (checkFrustum(9, 24, 3, 8), frustumV(9, 24, 3, 8));
V.q6 = (checkFrustum(10, 30, 4, 12), frustumV(10, 30, 4, 12));
V.q7 = cylV(4, 11) + hemiV(4);
V.q8 = coneV(6, 14) + cylV(6, 20);
V.q9 = circle(3) + cylCSA(3, 10) + hemiCSA(3);
V.q10 = circle(8) + cylCSA(8, 9) + (circle(8) - circle(3)) + cylCSA(3, 5) + circle(3);
V.q11 = 14 * 14 * 5 + hemiV(6);
V.q12r = Math.sqrt((3 * 1500) / (18 * PI));
V.q13 = (checkFrustum(12, 20, 6, 10), frustumV(12, 20, 6, 10));
V.q13n = Math.floor(V.q13 / 250);
V.q14 = (checkFrustum(15, 25, 9, 15), frustumV(15, 25, 9, 15));
V.q14fill = 0.8 * V.q14;
V.e1 = circle(10) + cylCSA(10, 6) + (circle(10) - circle(4)) + cylCSA(4, 9) + circle(4);
V.e2sa = coneCSA(5, 13) + hemiCSA(5); // 115pi
V.e2v = coneV(5, 12) + hemiV(5);
// E3: cone radius 3r height 21, cone radius r height 7 removed, volume 1400 cm^3
checkFrustum(3, 21, 1, 7);
V.e3k = (PI * (9 * 21 - 1 * 7)) / 3; // coefficient of r^2
V.e3r = Math.sqrt(1400 / V.e3k);
V.e3d = 6 * V.e3r;
V.e4hemi = hemiV(4);
V.e4h = (800 - V.e4hemi) / (PI * 16);

const f1 = (x) => x.toFixed(1);
const f2 = (x) => x.toFixed(2);
const s3 = (x) => String(sf(x, 3));

// ---------------------------------------------------------------------------
// Figures — attributes only: no <style>, no script, currentColor throughout
// ---------------------------------------------------------------------------

const FRUSTUM_FIG = `<svg viewBox="0 0 340 300" xmlns="http://www.w3.org/2000/svg" width="340" height="300" role="img" aria-labelledby="frustumfig"><title id="frustumfig">A frustum drawn as a large cone with its top cut off, with the removed small cone shown by dashed lines</title><g fill="none" stroke="currentColor" stroke-width="1.7"><ellipse cx="160" cy="248" rx="95" ry="19"/><ellipse cx="160" cy="120" rx="40" ry="8"/><path d="M65 248 L120 120"/><path d="M255 248 L200 120"/></g><g fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray="5 4"><path d="M120 120 L160 27 L200 120"/><path d="M160 27 V248"/></g><g fill="none" stroke="currentColor" stroke-width="1.1"><path d="M160 248 H255"/><path d="M160 120 H200"/><path d="M300 27 V248"/><path d="M295 27 H305"/><path d="M295 248 H305"/><path d="M276 27 V120"/><path d="M271 27 H281"/><path d="M271 120 H281"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="13"><text x="205" y="268">12 cm</text><text x="168" y="110">5 cm</text><text x="310" y="142">24 cm</text><text x="222" y="62">10 cm</text></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="11"><text x="8" y="24">diagram not drawn</text><text x="8" y="38">accurately</text></g></svg>`;

const TWO_CYL_FIG = `<svg viewBox="0 0 340 300" xmlns="http://www.w3.org/2000/svg" width="340" height="300" role="img" aria-labelledby="twocylfig"><title id="twocylfig">A solid made from a wide short cylinder with a narrow taller cylinder standing on top of it</title><g fill="currentColor" fill-opacity="0.12" stroke="none"><ellipse cx="165" cy="160" rx="88" ry="18"/></g><g fill="none" stroke="currentColor" stroke-width="1.7"><ellipse cx="165" cy="160" rx="88" ry="18"/><path d="M77 160 V238"/><path d="M253 160 V238"/><path d="M77 238 A88 18 0 0 0 253 238"/><ellipse cx="165" cy="72" rx="35" ry="9"/><path d="M130 72 V160"/><path d="M200 72 V160"/><path d="M130 160 A35 9 0 0 0 200 160"/></g><g fill="none" stroke="currentColor" stroke-width="1.1"><path d="M165 238 H253"/><path d="M165 72 H200"/><path d="M290 160 V238"/><path d="M285 160 H295"/><path d="M285 238 H295"/><path d="M290 72 V160"/><path d="M285 72 H295"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="13"><text x="196" y="256">10 cm</text><text x="172" y="64">4 cm</text><text x="300" y="204">6 cm</text><text x="300" y="122">9 cm</text><text x="12" y="150">ring</text></g><g fill="none" stroke="currentColor" stroke-width="1"><path d="M40 146 L118 154"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="11"><text x="8" y="24">diagram not drawn</text><text x="8" y="38">accurately</text></g></svg>`;

const CONE_HEMI_FIG = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" width="300" height="300" role="img" aria-labelledby="conehemifig"><title id="conehemifig">A cone standing point downwards with a hemisphere sitting on its circular top</title><g fill="none" stroke="currentColor" stroke-width="1.7"><path d="M80 150 L150 268 L220 150"/><ellipse cx="150" cy="150" rx="70" ry="14"/><path d="M80 150 A70 70 0 0 1 220 150"/></g><g fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray="5 4"><path d="M150 150 V268"/><path d="M150 150 H220"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="13"><text x="182" y="146">5 cm</text><text x="156" y="216">12 cm</text><text x="200" y="216">13 cm</text></g><g fill="none" stroke="currentColor" stroke-width="1"><path d="M196 208 L180 196"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="11"><text x="8" y="24">diagram not drawn</text><text x="8" y="38">accurately</text></g></svg>`;

const FRUSTUM_R_FIG = `<svg viewBox="0 0 340 300" xmlns="http://www.w3.org/2000/svg" width="340" height="300" role="img" aria-labelledby="frustrfig"><title id="frustrfig">A bin shaped like a frustum, with top radius three r, the removed cone of radius r shown dashed above it</title><g fill="none" stroke="currentColor" stroke-width="1.7"><ellipse cx="160" cy="98" rx="95" ry="19"/><ellipse cx="160" cy="246" rx="32" ry="7"/><path d="M65 98 L128 246"/><path d="M255 98 L192 246"/></g><g fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray="5 4"><path d="M128 246 L160 275 L192 246"/><path d="M160 275 V98"/></g><g fill="none" stroke="currentColor" stroke-width="1.1"><path d="M160 98 H255"/><path d="M160 246 H192"/><path d="M300 98 V275"/><path d="M295 98 H305"/><path d="M295 275 H305"/><path d="M276 246 V275"/><path d="M271 246 H281"/><path d="M271 275 H281"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="13"><text x="198" y="90">3r cm</text><text x="196" y="242">r cm</text><text x="310" y="190">21 cm</text><text x="222" y="268">7 cm</text></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="11"><text x="8" y="24">diagram not drawn</text><text x="8" y="38">accurately</text></g></svg>`;

const CYL_HEMI_FIG = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" width="300" height="300" role="img" aria-labelledby="cylhemifig"><title id="cylhemifig">A cylinder with a hemisphere of the same radius sitting on its top face</title><g fill="none" stroke="currentColor" stroke-width="1.7"><ellipse cx="150" cy="150" rx="60" ry="13"/><path d="M90 150 V250"/><path d="M210 150 V250"/><path d="M90 250 A60 13 0 0 0 210 250"/><path d="M90 150 A60 60 0 0 1 210 150"/></g><g fill="none" stroke="currentColor" stroke-width="1.1"><path d="M150 250 H210"/><path d="M255 150 V250"/><path d="M250 150 H260"/><path d="M250 250 H260"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="13"><text x="166" y="268">5 cm</text><text x="264" y="206">14 cm</text></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="11"><text x="8" y="24">diagram not drawn</text><text x="8" y="38">accurately</text></g></svg>`;

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

const workedExamples = [
  {
    id: `we.${TID}.01`,
    topic: TID,
    specRefs: ["M4-GM-01"],
    paper: PAPER,
    stem: `A plant pot is a frustum. It is made from a cone of base radius 12 cm and perpendicular height 24 cm by removing the cone of radius 5 cm and perpendicular height 10 cm from the top.\n\nCalculate the volume of the plant pot. Give your answer correct to the nearest cubic centimetre.`,
    figure: svgFigure(
      FRUSTUM_FIG,
      "A frustum drawn as a large cone with its top cut off. The removed small cone is shown by dashed lines above it. The base radius is 12 cm, the top radius is 5 cm, the full height is 24 cm and the removed cone's height is 10 cm.",
    ),
    steps: [
      {
        n: 1,
        working: "Volume of frustum = volume of large cone − volume of small cone",
        decision:
          "A frustum is a cone with its point cut off. Nothing else is needed: the Teacher Guidance says frustum questions will not require similar shapes, so both radii and both heights are always given.",
        earns: ["M1"],
        whyMenu: {
          options: [
            "Because the piece removed from the top is itself a cone",
            "Because a frustum is half a cone",
            "Because the volume of a frustum is on the formula sheet",
          ],
          correct: 0,
          explain:
            "Cutting parallel to the base leaves a small cone on top. Subtract it. There is no frustum formula on the CCEA sheet: you build it from the cone formula, which is given.",
        },
      },
      {
        n: 2,
        working: `large cone $= \\tfrac{1}{3}\\pi (12)^2 (24) = ${f1(coneV(12, 24))}$ cm³`,
        decision:
          "The cone formula is on the Higher formula sheet. Write the substitution before the number so a marker can see the method, and keep the full calculator value.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: `small cone $= \\tfrac{1}{3}\\pi (5)^2 (10) = ${f1(coneV(5, 10))}$ cm³`,
        decision: "Same formula, the removed cone's own radius and height. The 10 cm is the small cone's height, not the height of the pot.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: `${f1(coneV(12, 24))} - ${f1(coneV(5, 10))} = ${f1(V.we1)}$ cm³, so the volume is $${Math.round(V.we1)}$ cm³`,
        decision:
          "Subtract, then round once at the very end. Rounding each cone first would shift the answer; the general marking advice credits the most accurate figure seen.",
        earns: ["A1"],
        whyMenu: {
          options: [
            "Because rounding twice moves the final answer",
            "Because the calculator only stores three figures",
            "Because volumes must always be whole numbers",
          ],
          correct: 0,
          explain: "Each rounding introduces an error that the subtraction keeps. Round once, on the answer line.",
        },
      },
    ],
    finalAnswer: `$${Math.round(V.we1)}$ cm³`,
    twin: {
      stem: "A lampshade is a frustum made from a cone of base radius 18 cm and height 30 cm by removing the cone of radius 6 cm and height 10 cm. Calculate its volume, correct to the nearest cubic centimetre.",
      answer: {
        kind: "numeric",
        value: Math.round(frustumV(18, 30, 6, 10)),
        tolerance: { type: "absolute", value: 1 },
        unit: "cm³",
        unitRequired: false,
        acceptForms: ["decimal"],
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    verification: `ver.we.${TID}.01`,
    version: 1,
  },
  {
    id: `we.${TID}.02`,
    topic: TID,
    specRefs: ["M4-GM-01"],
    paper: PAPER,
    stem: `A solid is made from a cylinder of radius 5 cm and height 14 cm with a hemisphere of radius 5 cm fixed on top.\n\nCalculate the total surface area of the solid, correct to 1 decimal place.`,
    figure: svgFigure(
      CYL_HEMI_FIG,
      "A cylinder of radius 5 cm and height 14 cm with a hemisphere of the same radius sitting on its top face.",
    ),
    steps: [
      {
        n: 1,
        working: "Faces that touch the air: bottom circle, curved side of the cylinder, curved surface of the hemisphere",
        decision:
          "List them before calculating anything. The cylinder's top circle is covered by the hemisphere's flat face, so neither of those two surfaces is on the outside. This list is where the examiners say the marks are won or lost.",
        earns: ["M1"],
        whyMenu: {
          options: [
            "Because surface area only counts surfaces you could paint",
            "Because a hemisphere has no flat face",
            "Because the top circle is smaller than the bottom circle",
          ],
          correct: 0,
          explain:
            "The two faces meet and seal each other in. Counting them adds two circles that no paint could ever reach.",
        },
      },
      {
        n: 2,
        working: `bottom circle $= \\pi (5)^2 = ${f1(circle(5))}$ cm²`,
        decision: "Label every calculation as you go. In November 2024 the examiners asked specifically for working laid out with each area named.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: `curved side of cylinder $= 2\\pi (5)(14) = ${f1(cylCSA(5, 14))}$ cm²`,
        decision:
          "The cylinder is not on the formula sheet: $2\\pi r h$ has to be known. It is the rectangle you get by unrolling the tube, with width equal to the circumference.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: `hemisphere $= \\tfrac{1}{2} \\times 4\\pi (5)^2 = 2\\pi (5)^2 = ${f1(hemiCSA(5))}$ cm²`,
        decision:
          "The sheet gives the sphere's surface area $4\\pi r^2$; a hemisphere is half of it. Forgetting to halve is the error the Summer 2024 report named.",
        earns: ["MA1"],
      },
      {
        n: 5,
        working: `total $= ${f1(circle(5))} + ${f1(cylCSA(5, 14))} + ${f1(hemiCSA(5))} = ${f1(V.we2)}$ cm²`,
        decision: `Add the three labelled areas and round once. In exact form this is $215\\pi$ cm², which is a quick check: $215 \\times \\pi = ${f1(215 * PI)}$.`,
        earns: ["A1"],
      },
    ],
    finalAnswer: `$${f1(V.we2)}$ cm² (exactly $215\\pi$ cm²)`,
    twin: {
      stem: "A solid is made from a cylinder of radius 3 cm and height 10 cm with a hemisphere of radius 3 cm on top. Calculate its total surface area, correct to 1 decimal place.",
      answer: {
        kind: "numeric",
        value: Number(f1(V.q9)),
        tolerance: { type: "dp", places: 1 },
        unit: "cm²",
        unitRequired: false,
        acceptForms: ["decimal"],
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4, 5] },
      { showSteps: 1, studentSupplies: [2, 3, 4, 5] },
    ],
    verification: `ver.we.${TID}.02`,
    version: 1,
  },
  {
    id: `we.${TID}.03`,
    topic: TID,
    specRefs: ["M4-GM-01"],
    paper: PAPER,
    stem: `A container is a frustum made from a cone of base radius $4r$ cm and height 20 cm by removing the cone of radius $r$ cm and height 5 cm from the top. The volume of the container is $420\\pi$ cm³.\n\nFind the value of $r$.`,
    steps: [
      {
        n: 1,
        working: "$\\tfrac{1}{3}\\pi (4r)^2 (20) - \\tfrac{1}{3}\\pi (r)^2 (5) = 420\\pi$",
        decision:
          "Set up the subtraction as an equation before simplifying anything. Each cone keeps its own radius and height, and $4r$ goes inside a bracket.",
        earns: ["M1"],
      },
      {
        n: 2,
        working: "$(4r)^2 = 16r^2$, not $4r^2$",
        decision:
          "The bracket squares the 4 as well as the $r$. This one line is what the November 2024 examiners said almost every candidate lost: $3r$ was squared without brackets.",
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because squaring $4r$ squares both the 4 and the $r$",
            "Because $4r$ means $4 + r$",
            "Because the bracket can be ignored when the power is 2",
          ],
          correct: 0,
          explain: "$(4r)^2 = 4r \\times 4r = 16r^2$. Writing $4r^2$ squares only the letter and makes the answer four times too small.",
        },
      },
      {
        n: 3,
        working: "$\\tfrac{1}{3}\\pi(320r^2) - \\tfrac{1}{3}\\pi(5r^2) = 105\\pi r^2$",
        decision:
          "Simplify each term separately: $16r^2 \\times 20 = 320r^2$ and $r^2 \\times 5 = 5r^2$, then $(320 - 5) \\div 3 = 105$.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: `$105\\pi r^2 = 420\\pi \\Rightarrow r^2 = 4 \\Rightarrow r = ${V.we3r}$`,
        decision:
          "The $\\pi$ cancels because the volume was given in terms of $\\pi$. Take the positive square root only: a radius cannot be negative.",
        earns: ["A1"],
      },
    ],
    finalAnswer: `$r = ${V.we3r}$`,
    twin: {
      stem: "A funnel is a frustum made from a cone of base radius $3r$ cm and height 18 cm by removing the cone of radius $r$ cm and height 6 cm. Its volume is $416\\pi$ cm³. Find the value of $r$.",
      answer: {
        kind: "numeric",
        value: Math.sqrt(416 / ((9 * 18 - 6) / 3)),
        tolerance: { type: "absolute", value: 0.01 },
        unitRequired: false,
        acceptForms: ["decimal"],
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    verification: `ver.we.${TID}.03`,
    version: 1,
  },
];

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

const opt = (id, text, correct, feedback, misconception) =>
  misconception ? { id, text, correct, misconception, feedback } : { id, text, correct, feedback };

const diagnostics = [
  {
    id: `dx.${TID}`,
    topic: TID,
    specRefs: ["M4-GM-01"],
    when: "pre",
    items: [
      {
        id: "01",
        stem: "How do you find the volume of a frustum?",
        skill: "Know that a frustum is a difference of two cones",
        options: [
          opt("a", "Large cone − small cone", true, "Cutting the top off parallel to the base leaves a smaller cone, so subtract its volume."),
          opt("b", "Large cone + small cone", false, "Adding puts the removed piece back. The frustum is what is left after the small cone is taken away.", "maths.mensuration.volume-for-surface-area"),
          opt("c", "Cone with the two radii subtracted first", false, "Radii cannot be subtracted and then used in one cone formula: volume is not proportional to radius. Work out each cone and subtract the volumes.", "maths.similar.volume-scaled-linearly"),
          opt("d", "Half the large cone", false, "The piece removed is only half the height in special cases, and even then the volumes are not halved: volume depends on the cube of the scale factor.", "maths.similar.volume-scaled-linearly"),
        ],
        secondsExpected: 20,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "02",
        stem: "A solid cylinder of radius 4 cm and height 9 cm stands on a wider cylinder. Which surfaces of the small cylinder are on the outside?",
        skill: "Decide which faces of a compound solid touch the air",
        options: [
          opt("a", "Its curved surface and its top circle", true, "Its bottom circle is pressed against the wide cylinder, so it cannot be painted."),
          opt("b", "Its curved surface and both circles", false, "The bottom circle is hidden where the two cylinders meet; counting it adds a face that no paint could reach.", "maths.mensuration.hidden-faces-counted"),
          opt("c", "Only its curved surface", false, "The top circle is exposed. Curved surface only is what a question asks for when it says 'curved surface area'.", "maths.mensuration.ends-included-in-curved-sa"),
          opt("d", "Its curved surface, its top circle and its bottom circle minus the wide circle", false, "The ring belongs to the wide cylinder's top face, not to the small one. Assign each surface to one solid and count it once.", "maths.mensuration.hidden-faces-counted"),
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "03",
        stem: "Two cylinders of radii 10 cm and 4 cm are stacked. What is the area of the flat ring where the wide one is not covered?",
        skill: "See the contact ring as a difference of two circles",
        options: [
          opt("a", "$\\pi(10)^2 - \\pi(4)^2$", true, "The visible part of the wide top face is the large circle with the small circle taken out."),
          opt("b", "$\\pi(10 - 4)^2$", false, "The radii were subtracted before squaring. $\\pi(6)^2$ is a circle of radius 6, which is not the ring.", "maths.algebra.bracket-before-squaring"),
          opt("c", "$2\\pi(10) - 2\\pi(4)$", false, "Those are circumferences, which are lengths. An area needs $\\pi r^2$.", "maths.mensuration.overlap-added-as-length"),
          opt("d", "$\\pi(10)^2$", false, "That is the whole top face. The middle is covered by the narrow cylinder and must be subtracted.", "maths.mensuration.hidden-faces-counted"),
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "04",
        stem: "What is the curved surface area of a hemisphere of radius 6 cm?",
        skill: "Halve the sphere's surface area",
        options: [
          opt("a", "$2\\pi(6)^2 = 226.2$ cm²", true, "Half of $4\\pi r^2$. The flat circle is separate and is only counted if it is on the outside."),
          opt("b", "$4\\pi(6)^2 = 452.4$ cm²", false, "That is the whole sphere. A hemisphere is half of it.", "maths.mensuration.hemisphere-not-halved"),
          opt("c", "$\\tfrac{2}{3}\\pi(6)^3 = 452.4$ cm³", false, "That is the volume formula, and the units give it away: cm³, not cm².", "maths.mensuration.volume-for-surface-area"),
          opt("d", "$2\\pi(6)^2 + \\pi(6)^2 = 339.3$ cm²", false, "The flat circle has been included. It counts only when the flat face is exposed, which it is not when the hemisphere sits on something.", "maths.mensuration.hidden-faces-counted"),
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "05",
        stem: "A cone has base diameter 14 cm and height 24 cm. Which substitution gives its volume?",
        skill: "Use the radius, not the diameter, in a formula",
        options: [
          opt("a", "$\\tfrac{1}{3}\\pi(7)^2(24)$", true, "Halve the diameter first: $r = 7$."),
          opt("b", "$\\tfrac{1}{3}\\pi(14)^2(24)$", false, "The diameter was used as the radius, which makes the volume four times too big.", "maths.mensuration.diameter-used-as-radius"),
          opt("c", "$\\tfrac{1}{3}\\pi(7)^2(12)$", false, "The height was halved as well. Only the diameter needs halving; 24 cm is already the perpendicular height.", "maths.mensuration.diameter-used-as-radius"),
          opt("d", "$\\pi(7)^2(24)$", false, "That is a cylinder. A cone of the same base and height is one third of it.", "maths.formula.misapplied-power-or-coefficient"),
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "06",
        stem: "In a frustum problem the volume gives $\\tfrac{1}{3}\\pi(3r)^2(15)$. What is this in terms of $r^2$?",
        skill: "Bracket a scaled radius before squaring",
        options: [
          opt("a", "$45\\pi r^2$", true, "$(3r)^2 = 9r^2$, then $9 \\times 15 \\div 3 = 45$."),
          opt("b", "$15\\pi r^2$", false, "$3r$ was squared as $3r^2$, so only the letter was squared. $(3r)^2 = 9r^2$.", "maths.algebra.bracket-before-squaring"),
          opt("c", "$135\\pi r^2$", false, "The one third has been left out: $9 \\times 15 = 135$, and that still has to be divided by 3.", "maths.formula.misapplied-power-or-coefficient"),
          opt("d", "$9\\pi r^2$", false, "The height has been dropped. Multiply by 15 as well, then divide by 3.", "maths.formula.misapplied-power-or-coefficient"),
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "07",
        stem: "A jug holds 2400 cm³ and is filled to 85% of its capacity. How much liquid is in it?",
        skill: "Apply a percentage-fill condition",
        options: [
          opt("a", "2040 cm³", true, "0.85 × 2400 = 2040."),
          opt("b", "2400 cm³", false, "The 85% condition has been ignored. The capacity is not the amount poured in.", "maths.mensuration.percentage-fill-omitted"),
          opt("c", "360 cm³", false, "That is the empty space, 15% of the jug. The question asks for the liquid.", "maths.mensuration.percentage-fill-omitted"),
          opt("d", "2823.5 cm³", false, "The volume has been divided by 0.85 instead of multiplied. Filling it partly gives less than the capacity, not more.", "maths.percent.reverse-wrong-direction-100-minus"),
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

const part = (o) => ({
  id: o.id ?? "main",
  stem: o.stem,
  marks: o.marks,
  answer: o.answer,
  scheme: o.scheme,
  hints: o.hints,
  workedSolution: o.workedSolution,
  commonErrors: o.commonErrors ?? [],
  requiresWorking: o.requiresWorking ?? true,
  ...(o.followThrough ? { followThrough: o.followThrough } : {}),
});

const question = (o) => ({
  id: o.id,
  topic: TID,
  specRefs: ["M4-GM-01"],
  paper: PAPER,
  tier: "H",
  style: o.style,
  difficulty: o.difficulty,
  ao: o.ao,
  commandWords: o.commandWords,
  emphasis: o.emphasis,
  context: { setting: o.setting, original: true },
  figures: o.figures ?? [],
  parts: o.parts,
  totalMarks: o.parts.reduce((n, p) => n + p.marks, 0),
  timeAllowanceSec: timeFor(o.parts.reduce((n, p) => n + p.marks, 0)),
  skeleton: o.parts.map((p) => `(${p.id})${o.verbs[p.id]}${p.marks}`).join("|"),
  ...(o.methodLock ? { methodLock: o.methodLock } : {}),
  examinerSources: o.examinerSources,
  solutionProgram: o.solutionProgram,
  verification: `ver.${o.id}`,
  version: 1,
});

const num3sf = (x, unit) => ({
  kind: "numeric",
  value: sf(x, 3),
  tolerance: { type: "sf", figures: 3 },
  unit,
  unitRequired: false,
  acceptForms: ["decimal"],
});
const numDp = (x, dp, unit) => ({
  kind: "numeric",
  value: Number(x.toFixed(dp)),
  tolerance: { type: "dp", places: dp },
  unit,
  unitRequired: false,
  acceptForms: ["decimal"],
});
const numExact = (x, unit) => ({
  kind: "numeric",
  value: x,
  tolerance: { type: "exact" },
  unit,
  unitRequired: false,
  acceptForms: ["decimal"],
});

const CE = {
  diameter: (value, marks) => ({
    misconception: "maths.mensuration.diameter-used-as-radius",
    pattern: { kind: "numeric", value },
    feedback: "The diameter was substituted where the formula wants the radius. Halve it first, and write r = ... on its own line so it cannot slip.",
    marksTypicallyEarned: marks,
    source: "ccea-cer:maths:2024-summer:M4:Q9",
  }),
  hidden: (value, marks) => ({
    misconception: "maths.mensuration.hidden-faces-counted",
    pattern: { kind: "numeric", value },
    feedback:
      "Two surfaces that meet each other have been counted. List the faces that touch the air first, name each one as you calculate it, and the hidden circles never get in.",
    marksTypicallyEarned: marks,
    source: "ccea-cer:maths:2024-november:M4:Q12",
  }),
  volumeForSA: (value, marks) => ({
    misconception: "maths.mensuration.volume-for-surface-area",
    pattern: { kind: "numeric", value },
    feedback:
      "A volume formula has been used for a surface-area question. The units on the answer line are the quickest check: cm² for surface area, cm³ for volume.",
    marksTypicallyEarned: marks,
    source: "ccea-cer:maths:2024-november:M3:Q26",
  }),
  hemisphere: (value, marks) => ({
    misconception: "maths.mensuration.hemisphere-not-halved",
    pattern: { kind: "numeric", value },
    feedback: "The whole sphere was used. A hemisphere is half of it, so halve the sphere formula before you substitute.",
    marksTypicallyEarned: marks,
    source: "ccea-cer:maths:2024-summer:M4:Q9",
  }),
};

const questions = [
  question({
    id: qid(1),
    style: "practice",
    difficulty: 1,
    ao: ["AO1"],
    commandWords: ["Calculate"],
    emphasis: ["volume", "cone"],
    setting: "A plain solid cone, no context",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "Calculate the volume of a cone of base radius 6 cm and perpendicular height 15 cm. Give your answer correct to 3 significant figures.",
        marks: 2,
        answer: num3sf(V.q1, "cm³"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "(1/3)π(6)²(15) seen" },
          { id: "A1", code: "A", marks: 1, for: `${s3(V.q1)} cm³ (accept 180π)`, dependsOn: ["MA1"] },
        ],
        hints: ["The cone formula is on the Higher formula sheet.", "Square the radius before multiplying by the height."],
        workedSolution: `$V = \\tfrac{1}{3}\\pi (6)^2 (15) = ${f1(V.q1)}$ cm³, which is $${s3(V.q1)}$ cm³ to 3 significant figures (exactly $180\\pi$).`,
        commonErrors: [
          {
            misconception: "maths.formula.misapplied-power-or-coefficient",
            pattern: { kind: "numeric", value: sf(PI * 36 * 15, 3) },
            feedback: "The one third has been left out, so that is a cylinder. A cone of the same base and height is a third of the cylinder.",
            marksTypicallyEarned: 0,
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q22"],
    solutionProgram: `coneV(6,15) = pi*36*15/3 = 180pi = ${V.q1}; 3sf = ${s3(V.q1)}`,
  }),
  question({
    id: qid(2),
    style: "practice",
    difficulty: 1,
    ao: ["AO1"],
    commandWords: ["Calculate"],
    emphasis: ["volume", "hemisphere"],
    setting: "A plain solid hemisphere, no context",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "Calculate the volume of a hemisphere of radius 9 cm. Give your answer correct to 3 significant figures.",
        marks: 2,
        answer: num3sf(V.q2, "cm³"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "(1/2) × (4/3)π(9)³ or (2/3)π(9)³ seen" },
          { id: "A1", code: "A", marks: 1, for: `${s3(V.q2)} cm³ (accept 486π)`, dependsOn: ["MA1"] },
        ],
        hints: ["The sphere volume is on the formula sheet.", "Halve it for a hemisphere.", "9³ = 729."],
        workedSolution: `$V = \\tfrac{1}{2} \\times \\tfrac{4}{3}\\pi (9)^3 = \\tfrac{2}{3}\\pi (729) = ${f1(V.q2)}$ cm³, so $${s3(V.q2)}$ cm³ to 3 significant figures.`,
        commonErrors: [CE.hemisphere(sf((4 / 3) * PI * 729, 3), 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q9"],
    solutionProgram: `hemiV(9) = (2/3)pi*729 = 486pi = ${V.q2}; 3sf = ${s3(V.q2)}`,
  }),
  question({
    id: qid(3),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Calculate"],
    emphasis: ["curved surface area", "cone"],
    setting: "A plain cone, no context",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "A cone has base radius 7 cm and slant height 25 cm. Calculate its curved surface area, correct to 3 significant figures.",
        marks: 2,
        answer: num3sf(V.q3, "cm²"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "π(7)(25) seen" },
          { id: "A1", code: "A", marks: 1, for: `${s3(V.q3)} cm² (accept 175π)`, dependsOn: ["MA1"] },
        ],
        hints: ["Curved surface area of a cone is on the formula sheet as πrl.", "l is the slant height, not the perpendicular height."],
        workedSolution: `$\\pi r l = \\pi (7)(25) = ${f1(V.q3)}$ cm², so $${s3(V.q3)}$ cm² to 3 significant figures.`,
        commonErrors: [
          {
            misconception: "maths.mensuration.ends-included-in-curved-sa",
            pattern: { kind: "numeric", value: sf(V.q3 + circle(7), 3) },
            feedback:
              "The base circle has been added. 'Curved surface area' means the sloping surface only; the base is included only when the question says total surface area.",
            marksTypicallyEarned: 1,
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q13"],
    solutionProgram: `coneCSA(7,25) = pi*7*25 = 175pi = ${V.q3}; 3sf = ${s3(V.q3)}`,
  }),
  question({
    id: qid(4),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Calculate"],
    emphasis: ["total surface area", "cone"],
    setting: "A plain solid cone, no context",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "A solid cone has base radius 5 cm and slant height 13 cm. Calculate its total surface area, correct to 3 significant figures.",
        marks: 2,
        answer: num3sf(V.q4, "cm²"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "π(5)(13) + π(5)² seen" },
          { id: "A1", code: "A", marks: 1, for: `${s3(V.q4)} cm² (accept 90π)`, dependsOn: ["MA1"] },
        ],
        hints: ["Total means curved surface plus base.", "πrl is on the sheet; πr² is not, and must be known."],
        workedSolution: `Total $= \\pi (5)(13) + \\pi (5)^2 = ${f1(coneCSA(5, 13))} + ${f1(circle(5))} = ${f1(V.q4)}$ cm², so $${s3(V.q4)}$ cm² (exactly $90\\pi$).`,
        commonErrors: [
          {
            misconception: "maths.mensuration.ends-included-in-curved-sa",
            pattern: { kind: "numeric", value: sf(coneCSA(5, 13), 3) },
            feedback: "That is the curved surface only. A solid cone also has its base circle on the outside, so add πr².",
            marksTypicallyEarned: 1,
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q13"],
    solutionProgram: `coneCSA(5,13) + circle(5) = 65pi + 25pi = 90pi = ${V.q4}; 3sf = ${s3(V.q4)}`,
  }),
  question({
    id: qid(5),
    style: "practice",
    difficulty: 3,
    ao: ["AO1", "AO2"],
    commandWords: ["Calculate"],
    emphasis: ["frustum", "volume"],
    setting: "A frustum given as a large cone with a small cone removed",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "A frustum is made from a cone of base radius 9 cm and height 24 cm by removing the cone of radius 3 cm and height 8 cm from the top. Calculate the volume of the frustum, correct to 3 significant figures.",
        marks: 3,
        answer: num3sf(V.q5, "cm³"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `large cone (1/3)π(9)²(24) = ${f1(coneV(9, 24))}` },
          { id: "MA2", code: "MA", marks: 1, for: `small cone (1/3)π(3)²(8) = ${f1(coneV(3, 8))}` },
          { id: "A1", code: "A", marks: 1, for: `subtraction giving ${s3(V.q5)} cm³ (accept 624π)`, dependsOn: ["MA1", "MA2"] },
        ],
        hints: ["Work out the two cones separately.", "The small cone has its own height, 8 cm.", "Subtract, then round once."],
        workedSolution: `Large cone $= \\tfrac{1}{3}\\pi(9)^2(24) = ${f1(coneV(9, 24))}$ cm³. Small cone $= \\tfrac{1}{3}\\pi(3)^2(8) = ${f1(coneV(3, 8))}$ cm³. Frustum $= ${f1(V.q5)}$ cm³, so $${s3(V.q5)}$ cm³.`,
        commonErrors: [
          {
            misconception: "maths.similar.volume-scaled-linearly",
            pattern: { kind: "numeric", value: sf(coneV(6, 16), 3) },
            feedback:
              "The radii and heights were subtracted first and one cone formula used. Volume does not scale like that; work out both cones and subtract the volumes.",
            marksTypicallyEarned: 0,
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q22"],
    solutionProgram: `frustumV(9,24,3,8) = pi(81*24 - 9*8)/3 = 624pi = ${V.q5}; 3sf = ${s3(V.q5)}`,
  }),
  question({
    id: qid(6),
    style: "practice",
    difficulty: 3,
    ao: ["AO1", "AO2"],
    commandWords: ["Calculate"],
    emphasis: ["frustum", "volume"],
    setting: "A frustum given as a large cone with a small cone removed",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "A frustum is made from a cone of base radius 10 cm and height 30 cm by removing the cone of radius 4 cm and height 12 cm. Calculate the volume of the frustum, correct to the nearest cubic centimetre.",
        marks: 3,
        answer: numExact(Math.round(V.q6), "cm³"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `large cone (1/3)π(10)²(30) = ${f1(coneV(10, 30))}` },
          { id: "MA2", code: "MA", marks: 1, for: `small cone (1/3)π(4)²(12) = ${f1(coneV(4, 12))}` },
          { id: "A1", code: "A", marks: 1, for: `${Math.round(V.q6)} cm³ (accept 936π or ${f1(V.q6)})`, dependsOn: ["MA1", "MA2"] },
        ],
        hints: ["Two cone calculations, then one subtraction.", "Keep the full accuracy until the last line."],
        workedSolution: `$\\tfrac{1}{3}\\pi(10)^2(30) - \\tfrac{1}{3}\\pi(4)^2(12) = ${f1(coneV(10, 30))} - ${f1(coneV(4, 12))} = ${f1(V.q6)}$ cm³, so $${Math.round(V.q6)}$ cm³.`,
        commonErrors: [
          {
            misconception: "maths.mensuration.calculate-volume-then-stop",
            pattern: { kind: "numeric", value: Math.round(coneV(10, 30)) },
            feedback: "That is the large cone on its own, which is the first mark. The frustum is what is left after the small cone is subtracted.",
            marksTypicallyEarned: 1,
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q22"],
    solutionProgram: `frustumV(10,30,4,12) = pi(3000 - 192)/3 = 936pi = ${V.q6}; nearest cm3 = ${Math.round(V.q6)}`,
  }),
  question({
    id: qid(7),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Calculate"],
    emphasis: ["compound solid", "volume"],
    setting: "A cylinder with a hemisphere on top",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "A solid is made from a cylinder of radius 4 cm and height 11 cm with a hemisphere of radius 4 cm on top. Calculate its volume, correct to 3 significant figures.",
        marks: 3,
        answer: num3sf(V.q7, "cm³"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `cylinder π(4)²(11) = ${f1(cylV(4, 11))}` },
          { id: "MA2", code: "MA", marks: 1, for: `hemisphere (2/3)π(4)³ = ${f1(hemiV(4))}` },
          { id: "A1", code: "A", marks: 1, for: `${s3(V.q7)} cm³`, dependsOn: ["MA1", "MA2"] },
        ],
        hints: ["Volumes of a compound solid add.", "The cylinder volume is not on the sheet: πr²h.", "Halve the sphere volume."],
        workedSolution: `Cylinder $= \\pi(4)^2(11) = ${f1(cylV(4, 11))}$ cm³; hemisphere $= \\tfrac{2}{3}\\pi(4)^3 = ${f1(hemiV(4))}$ cm³. Total $= ${f1(V.q7)}$ cm³, so $${s3(V.q7)}$ cm³.`,
        commonErrors: [CE.hemisphere(sf(cylV(4, 11) + (4 / 3) * PI * 64, 3), 1)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q9"],
    solutionProgram: `cylV(4,11) + hemiV(4) = 176pi + 128pi/3 = ${V.q7}; 3sf = ${s3(V.q7)}`,
  }),
  question({
    id: qid(8),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Calculate"],
    emphasis: ["compound solid", "volume"],
    setting: "A cone standing on a cylinder",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "A solid is made from a cylinder of radius 6 cm and height 20 cm with a cone of radius 6 cm and height 14 cm on top. Calculate its volume, correct to 3 significant figures.",
        marks: 3,
        answer: num3sf(V.q8, "cm³"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `cone (1/3)π(6)²(14) = ${f1(coneV(6, 14))}` },
          { id: "MA2", code: "MA", marks: 1, for: `cylinder π(6)²(20) = ${f1(cylV(6, 20))}` },
          { id: "A1", code: "A", marks: 1, for: `${s3(V.q8)} cm³ (accept 888π)`, dependsOn: ["MA1", "MA2"] },
        ],
        hints: ["Two volumes, added.", "The cone keeps its own height, 14 cm."],
        workedSolution: `Cone $= \\tfrac{1}{3}\\pi(6)^2(14) = ${f1(coneV(6, 14))}$ cm³; cylinder $= \\pi(6)^2(20) = ${f1(cylV(6, 20))}$ cm³. Total $= ${f1(V.q8)}$ cm³, so $${s3(V.q8)}$ cm³.`,
        commonErrors: [
          {
            misconception: "maths.formula.misapplied-power-or-coefficient",
            pattern: { kind: "numeric", value: sf(cylV(6, 14) + cylV(6, 20), 3) },
            feedback: "The cone was treated as a cylinder. Multiply the cone's πr²h by one third.",
            marksTypicallyEarned: 1,
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q12"],
    solutionProgram: `coneV(6,14) + cylV(6,20) = 168pi + 720pi = 888pi = ${V.q8}; 3sf = ${s3(V.q8)}`,
  }),
  question({
    id: qid(9),
    style: "practice",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Calculate"],
    emphasis: ["surface area", "compound solid"],
    setting: "A cylinder with a hemisphere on top",
    verbs: { main: "calculate" },
    figures: [svgFigure(CYL_HEMI_FIG, "A cylinder with a hemisphere of the same radius sitting on its top face, the radius marked on the base and the height marked at the side.")],
    parts: [
      part({
        stem: "A solid is made from a cylinder of radius 3 cm and height 10 cm with a hemisphere of radius 3 cm on top. Calculate the total surface area of the solid, correct to 1 decimal place. Show your working out clearly.",
        marks: 4,
        answer: numDp(V.q9, 1, "cm²"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `base circle π(3)² = ${f1(circle(3))}` },
          { id: "MA2", code: "MA", marks: 1, for: `curved surface of cylinder 2π(3)(10) = ${f1(cylCSA(3, 10))}` },
          { id: "MA3", code: "MA", marks: 1, for: `hemisphere 2π(3)² = ${f1(hemiCSA(3))}` },
          { id: "A1", code: "A", marks: 1, for: `${f1(V.q9)} cm² (accept 87π)`, dependsOn: ["MA1", "MA2", "MA3"] },
        ],
        hints: [
          "List the surfaces that touch the air before you calculate.",
          "The cylinder's top circle is covered by the hemisphere.",
          "The hemisphere's curved area is half of 4πr².",
        ],
        workedSolution: `External faces: base circle $\\pi(3)^2 = ${f1(circle(3))}$, curved cylinder $2\\pi(3)(10) = ${f1(cylCSA(3, 10))}$, hemisphere $2\\pi(3)^2 = ${f1(hemiCSA(3))}$. Total $= ${f1(V.q9)}$ cm² (exactly $87\\pi$).`,
        commonErrors: [
          CE.hidden(Number((V.q9 + circle(3)).toFixed(1)), 3),
          CE.volumeForSA(sf(cylV(3, 10) + hemiV(3), 3), 0),
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q12", "ccea-cer:maths:2024-summer:M4:Q9"],
    solutionProgram: `circle(3) + cylCSA(3,10) + hemiCSA(3) = 9pi + 60pi + 18pi = 87pi = ${V.q9}; 1dp = ${f1(V.q9)}`,
  }),
  question({
    id: qid(10),
    style: "practice",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Calculate"],
    emphasis: ["surface area", "compound solid", "ring"],
    setting: "Two stacked cylinders",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "A solid is made from a cylinder of radius 8 cm and height 9 cm with a cylinder of radius 3 cm and height 5 cm standing centrally on top of it. Calculate the total surface area of the solid, correct to 3 significant figures. Show your working out clearly.",
        marks: 5,
        answer: num3sf(V.q10, "cm²"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `bottom circle π(8)² = ${f1(circle(8))}` },
          { id: "MA2", code: "MA", marks: 1, for: `curved surface of the wide cylinder 2π(8)(9) = ${f1(cylCSA(8, 9))}` },
          { id: "MA3", code: "MA", marks: 1, for: `ring π(8)² − π(3)² = ${f1(circle(8) - circle(3))}` },
          { id: "MA4", code: "MA", marks: 1, for: `curved surface of the narrow cylinder 2π(3)(5) = ${f1(cylCSA(3, 5))} and its top circle π(3)² = ${f1(circle(3))}` },
          { id: "A1", code: "A", marks: 1, for: `${s3(V.q10)} cm² (accept 302π)`, dependsOn: ["MA1", "MA2", "MA3", "MA4"] },
        ],
        hints: [
          "Five surfaces are on the outside; name them before you start.",
          "The flat ring is the wide top circle with the narrow circle taken out.",
          "The narrow cylinder's bottom circle is not on the outside.",
        ],
        workedSolution: `Bottom circle $${f1(circle(8))}$, wide curved surface $${f1(cylCSA(8, 9))}$, ring $\\pi(8)^2 - \\pi(3)^2 = ${f1(circle(8) - circle(3))}$, narrow curved surface $${f1(cylCSA(3, 5))}$, top circle $${f1(circle(3))}$. Total $= ${f1(V.q10)}$ cm², so $${s3(V.q10)}$ cm² (exactly $302\\pi$).`,
        commonErrors: [
          CE.hidden(sf(2 * circle(8) + cylCSA(8, 9) + 2 * circle(3) + cylCSA(3, 5), 3), 2),
          {
            misconception: "maths.presentation.unlabelled-calculations",
            pattern: { kind: "text", regex: "^\\s*\\d+(\\.\\d+)?\\s*$" },
            feedback:
              "The answer alone is not enough when the question says show your working out clearly. Each of the five areas should be named beside its calculation; that is how the four method marks are awarded.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-november:M4:Q12",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q12", "ccea-cer:maths:2024-november:M3:Q26"],
    solutionProgram: `circle(8) + cylCSA(8,9) + (circle(8)-circle(3)) + cylCSA(3,5) + circle(3) = 64pi + 144pi + 55pi + 30pi + 9pi = 302pi = ${V.q10}; 3sf = ${s3(V.q10)}`,
  }),
  question({
    id: qid(11),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Calculate"],
    emphasis: ["compound solid", "volume"],
    setting: "A hemisphere sitting on a cuboid base",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "A paperweight is made from a cuboid measuring 14 cm by 14 cm by 5 cm with a solid hemisphere of radius 6 cm on top. Calculate the volume of the paperweight, correct to 1 decimal place.",
        marks: 3,
        answer: numDp(V.q11, 1, "cm³"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "cuboid 14 × 14 × 5 = 980" },
          { id: "MA2", code: "MA", marks: 1, for: `hemisphere (2/3)π(6)³ = ${f1(hemiV(6))}` },
          { id: "A1", code: "A", marks: 1, for: `${f1(V.q11)} cm³`, dependsOn: ["MA1", "MA2"] },
        ],
        hints: ["Two volumes, added.", "6³ = 216.", "Keep the decimals until the end."],
        workedSolution: `Cuboid $= 14 \\times 14 \\times 5 = 980$ cm³; hemisphere $= \\tfrac{2}{3}\\pi(6)^3 = ${f1(hemiV(6))}$ cm³. Total $= ${f1(V.q11)}$ cm³.`,
        commonErrors: [CE.hemisphere(Number((980 + (4 / 3) * PI * 216).toFixed(1)), 1)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q9"],
    solutionProgram: `980 + hemiV(6) = 980 + 144pi = ${V.q11}; 1dp = ${f1(V.q11)}`,
  }),
  question({
    id: qid(12),
    style: "practice",
    difficulty: 4,
    ao: ["AO2"],
    commandWords: ["Calculate"],
    emphasis: ["reverse", "cone", "radius"],
    setting: "A cone of known volume and height",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "A cone has volume 1500 cm³ and perpendicular height 18 cm. Calculate its base radius, correct to 3 significant figures.",
        marks: 3,
        answer: num3sf(V.q12r, "cm"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "(1/3)πr²(18) = 1500, or 6πr² = 1500" },
          { id: "MA2", code: "MA", marks: 1, for: `r² = 1500 ÷ (6π) = ${f2(V.q12r ** 2)}` },
          { id: "A1", code: "A", marks: 1, for: `r = ${s3(V.q12r)} cm`, dependsOn: ["MA2"] },
        ],
        hints: ["Substitute what you know into the cone formula and keep r as the unknown.", "(1/3)(18) = 6.", "Square-root at the very end."],
        workedSolution: `$\\tfrac{1}{3}\\pi r^2 (18) = 1500$, so $6\\pi r^2 = 1500$ and $r^2 = \\dfrac{1500}{6\\pi} = ${f2(V.q12r ** 2)}$. Then $r = ${f2(V.q12r)}$, which is $${s3(V.q12r)}$ cm to 3 significant figures.`,
        commonErrors: [
          {
            misconception: "maths.mensuration.calculate-volume-then-stop",
            pattern: { kind: "numeric", value: sf(V.q12r ** 2, 3) },
            feedback: "That is r squared. Two marks are earned; the last one is for taking the square root.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2024-november:M4:Q22",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q22"],
    solutionProgram: `(1/3)pi r^2 * 18 = 1500 -> r^2 = 1500/(6pi) = ${V.q12r ** 2} -> r = ${V.q12r}; 3sf = ${s3(V.q12r)}`,
  }),
  question({
    id: qid(13),
    style: "practice",
    difficulty: 4,
    ao: ["AO2", "AO3"],
    commandWords: ["Work out"],
    emphasis: ["frustum", "how many"],
    setting: "A frustum-shaped jug emptied into 250 cm-cubed containers",
    verbs: { main: "work-out" },
    parts: [
      part({
        stem: "A jug is a frustum made from a cone of base radius 12 cm and height 20 cm by removing the cone of radius 6 cm and height 10 cm. The jug is full of juice, which is poured into containers holding 250 cm³ each. Work out how many containers can be filled completely.",
        marks: 4,
        answer: numExact(V.q13n, "containers"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `large cone (1/3)π(12)²(20) = ${f1(coneV(12, 20))}` },
          { id: "MA2", code: "MA", marks: 1, for: `small cone (1/3)π(6)²(10) = ${f1(coneV(6, 10))}` },
          { id: "MA3", code: "MA", marks: 1, for: `volume of jug = ${f1(V.q13)} cm³, then divided by 250 = ${f2(V.q13 / 250)}` },
          { id: "A1", code: "A", marks: 1, for: `${V.q13n} containers, rounded down`, dependsOn: ["MA3"], examinerNote: `${Math.ceil(V.q13 / 250)} scores 3 of 4: the last container is not filled completely.` },
        ],
        hints: ["Find the volume of the frustum first.", "Divide by 250.", "Read the question: completely filled containers, so round down."],
        workedSolution: `Frustum $= \\tfrac{1}{3}\\pi(12)^2(20) - \\tfrac{1}{3}\\pi(6)^2(10) = ${f1(V.q13)}$ cm³. Dividing, $${f1(V.q13)} \\div 250 = ${f2(V.q13 / 250)}$, so $${V.q13n}$ containers can be filled completely.`,
        commonErrors: [
          {
            misconception: "maths.bounds.round-up-instead-of-down-count",
            pattern: { kind: "numeric", value: Math.ceil(V.q13 / 250) },
            feedback:
              `Three marks are earned for the volume and the division. ${f2(V.q13 / 250)} containers means ${V.q13n} full ones and part of another, and the question asks for completely filled containers, so round down.`,
            marksTypicallyEarned: 3,
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q9", "ccea-cer:maths:2024-november:M4:Q22"],
    solutionProgram: `frustumV(12,20,6,10) = pi(2880-360)/3 = 840pi = ${V.q13}; /250 = ${V.q13 / 250}; floor = ${V.q13n}`,
  }),
  question({
    id: qid(14),
    style: "practice",
    difficulty: 4,
    ao: ["AO2", "AO3"],
    commandWords: ["Calculate"],
    emphasis: ["frustum", "percentage fill", "litres"],
    setting: "A frustum-shaped bucket filled to 80% of its capacity",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "A bucket is a frustum made from a cone of base radius 15 cm and height 25 cm by removing the cone of radius 9 cm and height 15 cm. The bucket is filled to 80% of its capacity. Calculate the volume of water in the bucket in litres, correct to 2 decimal places. (1 litre = 1000 cm³)",
        marks: 4,
        answer: numDp(V.q14fill / 1000, 2, "litres"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `two cone volumes seen: ${f1(coneV(15, 25))} and ${f1(coneV(9, 15))}` },
          { id: "MA2", code: "MA", marks: 1, for: `capacity = ${f1(V.q14)} cm³ (accept 1470π)`, dependsOn: ["MA1"] },
          { id: "MA3", code: "MA", marks: 1, for: `0.8 × ${f1(V.q14)} = ${f1(V.q14fill)} cm³` },
          { id: "A1", code: "A", marks: 1, for: `${(V.q14fill / 1000).toFixed(2)} litres`, dependsOn: ["MA3"] },
        ],
        hints: ["Capacity first, as a difference of two cones.", "80% means multiply by 0.8.", "Divide by 1000 to change cm³ to litres."],
        workedSolution: `Capacity $= \\tfrac{1}{3}\\pi(15)^2(25) - \\tfrac{1}{3}\\pi(9)^2(15) = ${f1(V.q14)}$ cm³. Water $= 0.8 \\times ${f1(V.q14)} = ${f1(V.q14fill)}$ cm³ $= ${(V.q14fill / 1000).toFixed(2)}$ litres.`,
        commonErrors: [
          {
            misconception: "maths.mensuration.percentage-fill-omitted",
            pattern: { kind: "numeric", value: Number((V.q14 / 1000).toFixed(2)) },
            feedback:
              "That is the full capacity in litres, worth two marks. The bucket is only 80% full, so multiply by 0.8 before converting.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2024-summer:M4:Q9",
          },
          {
            misconception: "maths.stdform.units-not-matched",
            pattern: { kind: "numeric", value: Number(V.q14fill.toFixed(2)) },
            feedback: "The answer is in cubic centimetres. The question asks for litres, so divide by 1000.",
            marksTypicallyEarned: 3,
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q9"],
    solutionProgram: `frustumV(15,25,9,15) = pi(5625-1215)/3 = 1470pi = ${V.q14}; 0.8x = ${V.q14fill}; litres = ${V.q14fill / 1000}`,
  }),

  // ---- exam-style ----
  question({
    id: qid(15),
    style: "exam-style",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Calculate"],
    emphasis: ["surface area", "compound solid"],
    setting: "A solid made from a wide cylinder with a narrow cylinder on top",
    verbs: { main: "calculate" },
    figures: [
      svgFigure(
        TWO_CYL_FIG,
        "A solid made from a wide short cylinder of radius 10 cm and height 6 cm with a narrow cylinder of radius 4 cm and height 9 cm standing centrally on top. The flat ring where the wide cylinder is not covered is shaded.",
      ),
    ],
    parts: [
      part({
        stem: "A solid is made from a cylinder of diameter 20 cm and height 6 cm with a cylinder of diameter 8 cm and height 9 cm standing centrally on top.\n\nCalculate the total surface area of the solid, correct to 3 significant figures. Show your working out clearly.",
        marks: 5,
        answer: num3sf(V.e1, "cm²"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `radii 10 and 4 used; bottom circle π(10)² = ${f1(circle(10))}` },
          { id: "MA2", code: "MA", marks: 1, for: `curved surface of the wide cylinder 2π(10)(6) = ${f1(cylCSA(10, 6))}` },
          { id: "MA3", code: "MA", marks: 1, for: `ring π(10)² − π(4)² = ${f1(circle(10) - circle(4))}` },
          { id: "MA4", code: "MA", marks: 1, for: `narrow cylinder: 2π(4)(9) = ${f1(cylCSA(4, 9))} and top circle π(4)² = ${f1(circle(4))}` },
          { id: "A1", code: "A", marks: 1, for: `${s3(V.e1)} cm² (accept 392π or ${f1(V.e1)})`, dependsOn: ["MA1", "MA2", "MA3", "MA4"] },
        ],
        hints: [
          "Diameters are given, so halve them first.",
          "Walk round the solid and name every surface that touches the air.",
          "The ring is the difference of two circles.",
        ],
        workedSolution: `Radii are 10 cm and 4 cm. External faces: bottom circle $${f1(circle(10))}$, wide curved surface $2\\pi(10)(6) = ${f1(cylCSA(10, 6))}$, ring $\\pi(10)^2 - \\pi(4)^2 = ${f1(circle(10) - circle(4))}$, narrow curved surface $2\\pi(4)(9) = ${f1(cylCSA(4, 9))}$, top circle $${f1(circle(4))}$. Total $= ${f1(V.e1)}$ cm², so $${s3(V.e1)}$ cm² (exactly $392\\pi$).`,
        commonErrors: [
          CE.diameter(sf(circle(20) + cylCSA(20, 6) + (circle(20) - circle(8)) + cylCSA(8, 9) + circle(8), 3), 0),
          CE.hidden(sf(2 * circle(10) + cylCSA(10, 6) + 2 * circle(4) + cylCSA(4, 9), 3), 2),
          CE.volumeForSA(sf(cylV(10, 6) + cylV(4, 9), 3), 0),
        ],
      }),
    ],
    methodLock: {
      instruction: "Show your working out clearly",
      requiredMethod: "Each external surface named beside its own calculation; a bare total earns no method marks",
      evidence: "ccea-cer:maths:2024-november:M4:Q12",
    },
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q12", "ccea-cer:maths:2024-november:M3:Q26"],
    solutionProgram: `circle(10) + cylCSA(10,6) + (circle(10)-circle(4)) + cylCSA(4,9) + circle(4) = 100pi + 120pi + 84pi + 72pi + 16pi = 392pi = ${V.e1}; 3sf = ${s3(V.e1)}`,
  }),
  question({
    id: qid(16),
    style: "exam-style",
    difficulty: 5,
    ao: ["AO2", "AO3"],
    commandWords: ["Show that", "Calculate"],
    emphasis: ["Show that", "surface area", "volume"],
    setting: "An ornament made from a cone with a hemisphere on its top face",
    verbs: { a: "show", b: "calculate" },
    figures: [
      svgFigure(
        CONE_HEMI_FIG,
        "A cone standing point downwards with a hemisphere sitting on its circular top. The radius is 5 cm, the perpendicular height of the cone is 12 cm and its slant height is 13 cm.",
      ),
    ],
    parts: [
      part({
        id: "a",
        stem: "An ornament is a cone of radius 5 cm and slant height 13 cm standing point downwards, with a hemisphere of radius 5 cm resting on its circular top.\n\nShow that the total surface area of the ornament is $115\\pi$ cm².",
        marks: 4,
        answer: {
          kind: "steps",
          expectedOrder: [
            "external faces are the curved surface of the cone and the curved surface of the hemisphere",
            "cone: pi r l = pi(5)(13) = 65pi",
            "hemisphere: 2 pi r^2 = 2 pi (5)^2 = 50pi",
            "65pi + 50pi = 115pi",
          ],
          allowSkips: false,
        },
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "states that the cone's base circle and the hemisphere's flat face are not on the outside" },
          { id: "MA1", code: "MA", marks: 1, for: "π(5)(13) = 65π" },
          { id: "MA2", code: "MA", marks: 1, for: "2π(5)² = 50π" },
          {
            id: "A1",
            code: "A",
            marks: 1,
            for: "65π + 50π = 115π with the addition shown",
            dependsOn: ["MA1", "MA2"],
            examinerNote: "The line before the printed result must be seen; writing 115π with no supporting areas earns nothing.",
          },
        ],
        hints: [
          "Which two surfaces could you paint?",
          "πrl is on the formula sheet and uses the slant height.",
          "Keep everything in terms of π so the printed answer appears.",
        ],
        workedSolution: `The cone's circular top is covered by the hemisphere's flat face, so the outside is the cone's curved surface and the hemisphere's curved surface. Cone: $\\pi r l = \\pi(5)(13) = 65\\pi$. Hemisphere: $\\tfrac{1}{2}(4\\pi r^2) = 2\\pi(5)^2 = 50\\pi$. Total $= 65\\pi + 50\\pi = 115\\pi$ cm².`,
        commonErrors: [
          {
            misconception: "maths.mensuration.hidden-faces-counted",
            pattern: { kind: "algebraic", latex: "165\\pi" },
            feedback:
              "The cone's base circle (25π) and the hemisphere's flat face (25π) have both been added, but they are pressed together and sealed in. Only the two curved surfaces are on the outside.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2024-november:M4:Q12",
          },
          {
            misconception: "maths.mensuration.ends-included-in-curved-sa",
            pattern: { kind: "algebraic", latex: "\\pi(5)(12)" },
            feedback:
              "The perpendicular height was used in πrl. That formula needs the slant height, here 13 cm, which is the sloping distance from the rim to the point.",
            marksTypicallyEarned: 1,
          },
        ],
      }),
      part({
        id: "b",
        stem: "The cone has perpendicular height 12 cm. Calculate the total volume of the ornament, correct to 3 significant figures.",
        marks: 3,
        answer: num3sf(V.e2v, "cm³"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `cone (1/3)π(5)²(12) = ${f1(coneV(5, 12))}` },
          { id: "MA2", code: "MA", marks: 1, for: `hemisphere (2/3)π(5)³ = ${f1(hemiV(5))}` },
          { id: "A1", code: "A", marks: 1, for: `${s3(V.e2v)} cm³`, dependsOn: ["MA1", "MA2"] },
        ],
        hints: ["Volume needs the perpendicular height, not the slant height.", "Halve the sphere volume for the hemisphere.", "Add, then round once."],
        workedSolution: `Cone $= \\tfrac{1}{3}\\pi(5)^2(12) = ${f1(coneV(5, 12))}$ cm³; hemisphere $= \\tfrac{2}{3}\\pi(5)^3 = ${f1(hemiV(5))}$ cm³. Total $= ${f1(V.e2v)}$ cm³, so $${s3(V.e2v)}$ cm³.`,
        commonErrors: [
          {
            misconception: "maths.mensuration.volume-for-surface-area",
            pattern: { kind: "numeric", value: sf(coneV(5, 13) + hemiV(5), 3) },
            feedback:
              "The slant height, 13 cm, was used in the volume formula. Volume uses the perpendicular height, 12 cm; the slant height belongs to πrl only.",
            marksTypicallyEarned: 1,
          },
          CE.hemisphere(sf(coneV(5, 12) + (4 / 3) * PI * 125, 3), 1),
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q9", "ccea-cer:maths:2023-summer:M4:Q23"],
    solutionProgram: `SA: coneCSA(5,13) + hemiCSA(5) = 65pi + 50pi = 115pi = ${V.e2sa}; V: coneV(5,12) + hemiV(5) = 100pi + 250pi/3 = ${V.e2v}; 3sf = ${s3(V.e2v)}`,
  }),
  question({
    id: qid(17),
    style: "exam-style",
    difficulty: 5,
    ao: ["AO2", "AO3"],
    commandWords: ["Calculate"],
    emphasis: ["frustum", "unknown radius", "algebra"],
    setting: "A bin shaped as a frustum with radii given in terms of r",
    verbs: { main: "calculate" },
    figures: [
      svgFigure(
        FRUSTUM_R_FIG,
        "A bin shaped like a frustum, wider at the top. The top radius is 3r cm and the base radius is r cm. The dashed lines show the removed cone of height 7 cm below the base, and the whole cone has height 21 cm.",
      ),
    ],
    parts: [
      part({
        stem: "A bin is a frustum. It is made from a cone of radius $3r$ cm and perpendicular height 21 cm by removing the cone of radius $r$ cm and perpendicular height 7 cm.\n\nThe volume of the bin is 1400 cm³. Calculate the diameter of the top of the bin, correct to 2 decimal places.",
        marks: 7,
        answer: numDp(V.e3d, 2, "cm"),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "(1/3)π(3r)²(21) − (1/3)π(r)²(7) = 1400 seen" },
          { id: "MA1", code: "MA", marks: 1, for: "(3r)² = 9r² with the bracket used" },
          { id: "MA2", code: "MA", marks: 1, for: "63πr² − (7/3)πr², or 189r² and 7r² before dividing by 3" },
          { id: "MA3", code: "MA", marks: 1, for: `simplified to ${f2(V.e3k / PI)}πr² = 1400 (that is (182/3)πr²)` },
          { id: "MA4", code: "MA", marks: 1, for: `r² = ${f2(V.e3r ** 2)}` },
          { id: "A1", code: "A", marks: 1, for: `r = ${f2(V.e3r)}`, dependsOn: ["MA4"] },
          { id: "A2", code: "A", marks: 1, for: `diameter = 6r = ${V.e3d.toFixed(2)} cm`, dependsOn: ["A1"], examinerNote: `Giving ${f2(V.e3r)} or ${(2 * V.e3r).toFixed(2)} scores 6 of 7: the top radius is 3r, so the diameter is 6r.` },
        ],
        hints: [
          "Write the subtraction of the two cone volumes as an equation equal to 1400.",
          "Put 3r in a bracket before you square it.",
          "Collect the r-squared terms, then divide.",
          "The top radius is 3r, so the diameter is twice that.",
        ],
        workedSolution: `$\\tfrac{1}{3}\\pi (3r)^2 (21) - \\tfrac{1}{3}\\pi r^2 (7) = 1400$. Since $(3r)^2 = 9r^2$, this is $\\tfrac{1}{3}\\pi(189r^2 - 7r^2) = \\tfrac{182}{3}\\pi r^2 = 1400$. So $r^2 = \\dfrac{1400 \\times 3}{182\\pi} = ${f2(V.e3r ** 2)}$ and $r = ${f2(V.e3r)}$. The top radius is $3r$, so the diameter is $6r = ${V.e3d.toFixed(2)}$ cm.`,
        commonErrors: [
          {
            misconception: "maths.algebra.bracket-before-squaring",
            pattern: { kind: "algebraic", latex: "3r^2(21)" },
            feedback:
              "$(3r)^2$ is $9r^2$, not $3r^2$: squaring a bracket squares the number too. The method mark for the subtraction stands, but every line after this is three times too small. This is the step the November 2024 examiners said stopped almost everyone.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2024-november:M4:Q22",
          },
          {
            misconception: "maths.mensuration.calculate-volume-then-stop",
            pattern: { kind: "numeric", value: Number(V.e3r.toFixed(2)) },
            feedback:
              `Six of the seven marks are earned: $r = ${f2(V.e3r)}$ is correct. The question asks for the diameter of the top, and the top radius is $3r$, so the diameter is $6r = ${V.e3d.toFixed(2)}$ cm.`,
            marksTypicallyEarned: 6,
            source: "ccea-cer:maths:2024-november:M4:Q22",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q22"],
    solutionProgram: `(1/3)pi[(3r)^2(21) - r^2(7)] = 1400 -> (182/3)pi r^2 = 1400 -> r^2 = ${V.e3r ** 2} -> r = ${V.e3r}; d = 6r = ${V.e3d}; 2dp = ${V.e3d.toFixed(2)}`,
  }),
  question({
    id: qid(18),
    style: "exam-style",
    difficulty: 4,
    ao: ["AO2"],
    commandWords: ["Show that", "Calculate"],
    emphasis: ["Show that", "reverse", "compound solid"],
    setting: "A trophy made from a cylinder with a hemisphere on top, of known total volume",
    verbs: { a: "show", b: "calculate" },
    parts: [
      part({
        id: "a",
        stem: "A trophy is a cylinder of radius 4 cm and height $h$ cm with a solid hemisphere of radius 4 cm on top.\n\nShow that the volume of the hemisphere is 134 cm³, correct to 3 significant figures.",
        marks: 2,
        answer: {
          kind: "steps",
          expectedOrder: ["(2/3) pi (4)^3", "= 128pi/3 = 134.0412...", "= 134 cm^3 to 3 significant figures"],
          allowSkips: false,
        },
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "(1/2) × (4/3)π(4)³ or (2/3)π(4)³ seen" },
          { id: "A1", code: "A", marks: 1, for: `${f2(V.e4hemi)} shown before rounding to 134`, dependsOn: ["M1"] },
        ],
        hints: ["A hemisphere is half a sphere.", "4³ = 64.", "Write the unrounded value before the rounded one."],
        workedSolution: `$\\tfrac{1}{2} \\times \\tfrac{4}{3}\\pi(4)^3 = \\tfrac{2}{3}\\pi(64) = ${V.e4hemi.toFixed(4)}$ cm³, which is 134 cm³ to 3 significant figures.`,
        commonErrors: [CE.hemisphere(sf((4 / 3) * PI * 64, 3), 0)],
      }),
      part({
        id: "b",
        stem: "The total volume of the trophy is 800 cm³. Calculate the value of $h$, correct to 1 decimal place.",
        marks: 4,
        answer: numDp(V.e4h, 1, "cm"),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `π(4)²h + ${f2(V.e4hemi)} = 800, or 16πh = 800 − ${f2(V.e4hemi)}` },
          { id: "MA1", code: "MA", marks: 1, for: `16πh = ${f2(800 - V.e4hemi)}` },
          { id: "MA2", code: "MA", marks: 1, for: `h = ${f2(800 - V.e4hemi)} ÷ ${f2(16 * PI)}` },
          { id: "A1", code: "A", marks: 1, for: `h = ${V.e4h.toFixed(1)} cm`, dependsOn: ["MA2"] },
        ],
        hints: [
          "The two volumes add to 800, so the cylinder holds the rest.",
          "Subtract the unrounded hemisphere volume, not 134.",
          "Divide by πr² = 16π.",
        ],
        workedSolution: `$\\pi(4)^2 h + ${V.e4hemi.toFixed(4)} = 800$, so $16\\pi h = ${(800 - V.e4hemi).toFixed(4)}$ and $h = \\dfrac{${(800 - V.e4hemi).toFixed(4)}}{16\\pi} = ${f2(V.e4h)}$, which is $${V.e4h.toFixed(1)}$ cm to 1 decimal place.`,
        commonErrors: [
          {
            misconception: "maths.mensuration.volume-for-surface-area",
            pattern: { kind: "numeric", value: Number((800 / (16 * PI)).toFixed(1)) },
            feedback:
              "The hemisphere was never subtracted, so the whole 800 cm³ was given to the cylinder. The hemisphere takes up about 134 cm³ of the trophy.",
            marksTypicallyEarned: 0,
          },
        ],
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q9", "ccea-cer:maths:2024-november:M4:Q22"],
    solutionProgram: `hemiV(4) = 128pi/3 = ${V.e4hemi}; 16pi h = 800 - ${V.e4hemi} = ${800 - V.e4hemi}; h = ${V.e4h}; 1dp = ${V.e4h.toFixed(1)}`,
  }),
];

// ---------------------------------------------------------------------------
// Find the mistake
// ---------------------------------------------------------------------------

const findTheMistake = [
  {
    id: `ftm.${TID}.01`,
    topic: TID,
    specRefs: ["M4-GM-01"],
    stem: "Eabha was asked for the total surface area of a solid made from a cylinder of radius 9 cm and height 7 cm with a cylinder of radius 4 cm and height 6 cm on top. Her working:",
    studentWorking: [
      "Big cylinder: 2π(9)(7) + 2π(9)² = 395.84 + 508.94 = 904.78",
      "Small cylinder: 2π(4)(6) + 2π(4)² = 150.80 + 100.53 = 251.33",
      "Total = 904.78 + 251.33 = 1156.1 cm²",
    ],
    mistakeLine: 1,
    misconception: "maths.mensuration.hidden-faces-counted",
    whatWentWrong:
      "Both cylinders were given their complete surface areas, so the two circles where they meet were counted even though they are sealed inside the solid. The wide cylinder contributes its bottom circle and the ring that is left uncovered, not two whole circles.",
    correction: [
      "Bottom circle π(9)² = 254.47",
      "Wide curved surface 2π(9)(7) = 395.84",
      "Ring π(9)² − π(4)² = 254.47 − 50.27 = 204.20",
      "Narrow curved surface 2π(4)(6) = 150.80",
      "Top circle π(4)² = 50.27",
      "Total = 1055.58 cm²",
    ],
    marksEarnedAsWritten: ["MA1", "MA1"],
    feedback:
      "Two method marks stand: both curved surfaces are right. The habit that fixes this is to list the faces that touch the air before any button is pressed, and to write the name beside each calculation. November 2024 M4 Q12: only the strongest candidates finished, and the examiners asked for exactly that layout.",
    source: "ccea-cer:maths:2024-november:M4:Q12",
  },
  {
    id: `ftm.${TID}.02`,
    topic: TID,
    specRefs: ["M4-GM-01"],
    stem: "Rory was asked to find $r$ for a frustum made from a cone of radius $4r$ and height 18 cm by removing the cone of radius $r$ and height 4.5 cm, with volume $282\\pi$ cm³. His working:",
    studentWorking: [
      "(1/3)π(4r²)(18) − (1/3)π(r²)(4.5) = 282π",
      "24r² − 1.5r² = 282",
      "22.5r² = 282",
      "r² = 12.533, r = 3.54",
    ],
    mistakeLine: 1,
    misconception: "maths.algebra.bracket-before-squaring",
    whatWentWrong:
      "$(4r)^2$ was written as $4r^2$, so only the letter was squared. Squaring the bracket squares the 4 as well: $(4r)^2 = 16r^2$, which makes the first term four times larger.",
    correction: [
      "(1/3)π(4r)²(18) − (1/3)π(r)²(4.5) = 282π",
      "(1/3)(16r²)(18) − (1/3)(r²)(4.5) = 282",
      "96r² − 1.5r² = 282",
      "94.5r² = 282, so r² = 2.9841 and r = 1.73",
    ],
    marksEarnedAsWritten: ["M1"],
    feedback:
      "The method mark for subtracting the two cone volumes is earned, and the algebra afterwards is handled cleanly. The single line that costs the rest is the missing bracket. Write $(4r)^2$ with the bracket, say “four squared is sixteen”, then substitute. November 2024 M4 Q22: almost nobody finished, and this was the reason the examiners gave.",
    source: "ccea-cer:maths:2024-november:M4:Q22",
  },
  {
    id: `ftm.${TID}.03`,
    topic: TID,
    specRefs: ["M4-GM-01"],
    stem: "Daniel was asked how many cups of radius 4 cm, shaped as hemispheres and filled to 90% of capacity, could be poured from a cylindrical flask of radius 5 cm and height 22 cm. His working:",
    studentWorking: [
      "Flask = π(5)²(22) = 1727.88 cm³",
      "Cup = (4/3)π(4)³ = 268.08 cm³",
      "1727.88 ÷ 268.08 = 6.45",
      "6 cups",
    ],
    mistakeLine: 2,
    misconception: "maths.mensuration.hemisphere-not-halved",
    whatWentWrong:
      "The whole sphere formula was used for a cup that is a hemisphere, and the 90% fill was never applied. Each cup holds half a sphere, and then only nine tenths of that.",
    correction: [
      "Cup = (2/3)π(4)³ = 134.04 cm³",
      "90% of 134.04 = 120.64 cm³",
      "1727.88 ÷ 120.64 = 14.32",
      "14 cups",
    ],
    marksEarnedAsWritten: ["MA1"],
    feedback:
      "The flask volume is right and earns its mark. Two conditions in the stem were then passed over: hemisphere, and 90% full. Underline the words that change a number before you start, and check the size of the answer against them — smaller cups must give more cups, not fewer. Summer 2024 M4 Q9 lost marks for the same two reasons.",
    source: "ccea-cer:maths:2024-summer:M4:Q9",
  },
];

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const rp = (n, kind, prompt, answer, keyWords, difficultyPrior) => ({
  id: `rp.${TID}.${String(n).padStart(2, "0")}`,
  topic: TID,
  specRefs: ["M4-GM-01"],
  kind,
  prompt,
  answer,
  keyWords,
  examUnit: "M4",
  difficultyPrior,
});

const prompts = [
  rp(1, "definition", "What is a frustum, and how do you find its volume?", "A cone with its top cut off parallel to the base. Volume = volume of the large cone − volume of the small cone that was removed.", ["large cone", "minus", "small cone"], 4),
  rp(2, "formula", "Which mensuration formulae are printed on the CCEA Higher sheet, and which must you know?", "**Given:** volume of a prism, area of a trapezium, volume and surface area of a sphere, volume of a cone, curved surface area of a cone. **Must know:** circumference and area of a circle, volume and surface area of a cylinder, arc length and sector area, area of a triangle.", ["sphere", "cone", "cylinder not given"], 6),
  rp(3, "formula", "Volume and curved surface area of a cylinder?", "$V = \\pi r^2 h$ and $S = 2\\pi r h$. Neither is on the sheet.", ["πr²h", "2πrh", "not on the sheet"], 4),
  rp(4, "formula", "Volume and curved surface area of a hemisphere of radius $r$?", "$V = \\tfrac{2}{3}\\pi r^3$ and curved surface $= 2\\pi r^2$ — both are half the sphere versions. The flat circle is extra, and is counted only when it is on the outside.", ["half the sphere", "2πr²", "flat circle"], 6),
  rp(5, "procedure", "How do you work out the surface area of a compound solid?", "List the faces that touch the air, calculate each one and name it beside its calculation, then add. A face where two solids meet is not on the outside.", ["touch the air", "name each", "not counted"], 6),
  rp(6, "trap", "Two cylinders of radii $R$ and $r$ are stacked. What is the exposed flat area on the wider one?", "The ring $\\pi R^2 - \\pi r^2$. Subtract the areas, never the radii: $\\pi(R - r)^2$ is a different circle altogether.", ["ring", "difference of circles"], 7),
  rp(7, "trap", "In a frustum problem the radius is $3r$. What is $(3r)^2$?", "$9r^2$. The bracket squares the 3 as well as the $r$; $3r^2$ is three times too small and was the commonest error on this question type.", ["9r²", "bracket"], 7),
  rp(8, "trap", "Which height goes in $\\pi r l$, and which goes in $\\tfrac{1}{3}\\pi r^2 h$?", "$\\pi r l$ uses the **slant** height $l$; the volume uses the **perpendicular** height $h$. If only one is given, Pythagoras links them: $l^2 = r^2 + h^2$.", ["slant", "perpendicular", "Pythagoras"], 6),
  rp(9, "procedure", "A question gives a volume and asks for a radius. What is the shape of the working?", "Substitute everything you know into the volume formula, leaving $r$ as the unknown; simplify to $kr^2 = V$ or $kr^3 = V$; divide; then take the root last.", ["substitute", "divide", "root last"], 6),
  rp(10, "trap", "Why should you keep the calculator value all the way through a compound-solid calculation?", "Because each rounded part carries its error into the total, and the marking advice credits the most accurate figure seen. Round once, on the answer line, to the accuracy the question asks for.", ["round once", "answer line"], 5),
  rp(11, "qa", "A container is filled to 85% of its capacity. What do you multiply by, and when?", "Multiply the capacity by 0.85, after the full volume has been found. The percentage never changes the volume formula itself.", ["0.85", "after the volume"], 4),
  rp(12, "novel-example", "A frustum is made from a cone of radius 10 cm and height 30 cm by removing the cone of radius 4 cm and height 12 cm. Write the calculation in terms of $\\pi$.", "$\\tfrac{1}{3}\\pi(10)^2(30) - \\tfrac{1}{3}\\pi(4)^2(12) = 1000\\pi - 64\\pi = 936\\pi$ cm³.", ["936π", "difference of cones"], 5),
];

const insight = JSON.parse(fs.readFileSync(path.join(ROOT, "packs", "maths", "insights", `m4.${SLUG}.json`), "utf8"));

// ---------------------------------------------------------------------------
// Bundle
// ---------------------------------------------------------------------------

const HOW_EXAMINED =
  "M4 (calculator, 2 hours, 100 marks). Two places in the paper. A 5-mark compound-solid item in the first half (November 2024 Q12 total surface area of two stacked cylinders, Summer 2023 Q13 a cylinder with an overlap, Summer 2024 Q9 a cylinder emptied into hemispherical cups), marked MA1 per named area or volume with a final A1; and a 6- to 7-mark item in the last five questions where a frustum or difference of cones is set up as an equation in an unknown radius (November 2024 Q22, Summer 2023 Q23, Summer 2026 Q23 as a proof). The second kind is where the A grades are decided.";

const bundle = {
  $schema: "../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: TID,
    slug: SLUG,
    title: "Frustums and compound solids: harder mensuration",
    subject: "maths",
    unit: "M4",
    tier: "H",
    strand: "GM",
    statementIds: ["M4-GM-01"],
    prerequisites: [
      "maths.m3.cylinder-cone-and-sphere-surface-area-and-volume",
      "maths.m3.circle-parts-arc-length-and-sector-area",
    ],
    order: 133,
    hardness: "H",
    difficulty: 4,
    examinerFlagged: true,
    examinerSources: [
      "ccea-cer:maths:2024-november:M4:Q12",
      "ccea-cer:maths:2024-november:M4:Q22",
      "ccea-cer:maths:2024-november:M3:Q26",
      "ccea-cer:maths:2024-summer:M4:Q9",
      "ccea-cer:maths:2023-summer:M4:Q13",
      "ccea-cer:maths:2023-summer:M4:Q23",
    ],
    examWeightHint:
      "A 5-mark compound-solid question in most series (November 2024 Q12, Summer 2023 Q13, Summer 2024 Q9) and a 6–7 mark cone-difference or proof question among the last three (November 2024 Q22, Summer 2023 Q23, Summer 2026 Q23). Together they are worth about 11 marks of the 100.",
    mustMemorise: [
      "Frustum volume = large cone − small cone; both radii and both heights are given, because similar shapes are excluded here",
      "Compound solids: add or subtract volumes; for surface area count only the faces that touch the air",
      "The flat ring where two cylinders meet is πR² − πr², a difference of areas, never π(R − r)²",
      "Cylinder: V = πr²h and curved surface = 2πrh — neither is on the formula sheet",
      "Hemisphere: V = (2/3)πr³ and curved surface = 2πr², both half the sphere versions",
      "πrl uses the slant height; (1/3)πr²h uses the perpendicular height; l² = r² + h² links them",
      "Bracket a scaled radius before squaring: (3r)² = 9r²",
      "Keep full accuracy through the working and round once on the answer line",
    ],
    onFormulaSheet: [
      "Volume of cone = (1/3)πr²h",
      "Curved surface area of cone = πrl",
      "Volume of sphere = (4/3)πr³",
      "Surface area of sphere = 4πr²",
      "Volume of prism = area of cross-section × length",
      "Area of trapezium = (1/2)(a + b)h",
    ],
    notOnThisSpec: [
      "Using similar shapes to find the missing height or radius of a frustum — the Teacher Guidance on M4-GM-01 says frustum questions will not require knowledge of similar shapes, so both cones are always given",
      "A single formula for the volume of a frustum (it is built from the cone formula, and is not on the sheet)",
      "Surface area of a frustum requiring the slant height to be derived from similar triangles",
      "Volumes of revolution or calculus methods (A level, not GCSE)",
    ],
    externalRefs: [
      { kind: "corbettmaths", videos: [360] },
      {
        kind: "ccea-doc",
        docType: "cer",
        url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
        asOf: UPDATED,
      },
    ],
    keywords: ["frustum", "compound solids", "mensuration", "cone", "hemisphere", "cylinder", "surface area", "volume", "contact ring"],
  },
  note: {
    id: `note.${TID}`,
    topic: TID,
    title: "Frustums and compound solids",
    subject: "maths",
    unit: "M4",
    tier: "H",
    specRefs: ["M4-GM-01"],
    calculator: true,
    formulaSheet: {
      given: [
        "Volume of cone = (1/3)πr²h",
        "Curved surface area of cone = πrl",
        "Volume of sphere = (4/3)πr³",
        "Surface area of sphere = 4πr²",
        "Volume of prism = area of cross-section × length",
      ],
      mustKnow: [
        "Area of a circle πr² and circumference 2πr",
        "Volume of a cylinder πr²h and curved surface area 2πrh",
        "Hemisphere: half the sphere formulae, so (2/3)πr³ and 2πr²",
        "Frustum = large cone − small cone",
        "Pythagoras to link slant height and perpendicular height: l² = r² + h²",
      ],
    },
    notOnThisSpec: [
      "Using similar shapes to find a frustum's missing dimensions (excluded by the Teacher Guidance on M4-GM-01)",
      "A ready-made frustum formula",
      "Volumes of revolution (A level, not GCSE)",
    ],
    hardness: "H",
    examinerFlagged: true,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Find the volume of a frustum as the difference of two cone volumes, with both cones given",
        "Find the volume of a compound solid by adding or subtracting the volumes of its parts",
        "List the external faces of a compound solid and calculate the total surface area, naming each area beside its calculation",
        "Treat the contact ring between two stacked cylinders as πR² − πr²",
        "Halve the sphere formulae correctly for a hemisphere, and use a diameter only after halving it",
        "Choose the slant height for πrl and the perpendicular height for the volume, using Pythagoras if only one is given",
        "Set up and solve an equation for an unknown radius, bracketing a scaled radius before squaring",
        "Apply a percentage-fill or a 'how many containers' condition, and round the count the way the context demands",
      ],
      howExamined: HOW_EXAMINED,
      traps: [
        "Counting the faces where two solids meet, or totalling the complete surface areas of both parts (November 2024 M4 Q12, November 2024 M3 Q26)",
        "Calculating volumes when the question asks for surface area — a large number of candidates did (November 2024 M3 Q26)",
        "Treating the contact ring as π(R − r)² instead of πR² − πr²",
        "Squaring a scaled radius without the bracket: (3r)² written as 3r² (November 2024 M4 Q22, where almost nobody finished)",
        "Using the whole sphere formula for a hemisphere, or ignoring a '90% full' condition (Summer 2024 M4 Q9)",
        "Substituting a diameter where the formula wants a radius",
        "Using the slant height in the volume formula, or the perpendicular height in πrl",
        "Rounding each part before adding, instead of once at the end",
        "Leaving calculations unlabelled when the question says show your working out clearly (November 2024 M4 Q12)",
      ],
    },
    verification: `ver.note.${TID}`,
    version: 1,
    updated: UPDATED,
  },
  workedExamples,
  diagnostics,
  questions,
  findTheMistake,
  prompts,
  insight,
  sets: [
    {
      id: `set.${TID}.warm-up`,
      topic: TID,
      kind: "interleaved",
      title: "Cones, hemispheres and cylinders warm-up",
      subject: "maths",
      units: ["M4"],
      itemIds: [`dx.${TID}`, `rp.${TID}.03`, qid(1), qid(2), qid(3), qid(4), `rp.${TID}.04`],
      showTopicLabels: false,
      version: 1,
    },
    {
      id: `set.${TID}.mixed`,
      topic: TID,
      kind: "mixed",
      title: "Frustums, stacked solids and unknown radii, mixed",
      subject: "maths",
      units: ["M4"],
      itemIds: [qid(5), qid(9), `ftm.${TID}.01`, qid(13), qid(15), `ftm.${TID}.02`, qid(16), qid(17), `rp.${TID}.07`],
      showTopicLabels: false,
      version: 1,
    },
  ],
  verification: [],
};

// ---------------------------------------------------------------------------
// Verification details
// ---------------------------------------------------------------------------

const SCOPE =
  "Higher tier (M4). Compound solids built from cubes, cuboids, cones, spheres, hemispheres, cylinders and prisms, and frustums with both cones given — exactly the Teacher Guidance on M4-GM-01, which excludes frustum questions needing similar shapes";
const FORMULA =
  "Cone volume, cone curved surface area, sphere volume and sphere surface area are taken from the Higher sheet (packs/maths/exam-true/formula-sheets.json, fs.cone-volume, fs.cone-curved-surface-area, fs.sphere-volume, fs.sphere-surface-area); the cylinder, the circle and Pythagoras are must-know (mk.cylinder, mk.circle-area, mk.pythagoras) and every item that uses them says so";

const numericDetails = {};
for (const q of questions) numericDetails[q.id] = q.solutionProgram;

const details = {};
details[`note.${TID}`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Sheet quotes the two tariffs seen in the M4 papers read: 5 marks for a compound-solid surface area, 6–7 for a cone-difference equation",
  numeric: `Every number in the note recomputed in scratchpad/m4-batch/gen-frustums-and-compound-solids.mjs: frustum 12/24/5/10 = ${f1(V.we1)} cm3, cylinder+hemisphere surface 215pi = ${f1(V.we2)} cm2, and the 105 pi r^2 = 420 pi equation giving r = ${V.we3r}`,
  examiner:
    "Traps map onto the three findings of packs/maths/insights/m4.frustums-and-compound-solids.json (November 2024 M4 Q12, November 2024 M3 Q26, November 2024 M4 Q22) plus the Summer 2024 M4 Q9 evidence on the taxonomy entry",
};
details[`we.${TID}.01`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Four steps earning M1 MA1 MA1 A1, the 3- to 4-mark shape of a frustum volume item",
  numeric: `checkFrustum(12,24,5,10) passes since 12/24 = 5/10; large cone = ${f1(coneV(12, 24))}, small cone = ${f1(coneV(5, 10))}, difference = ${f1(V.we1)} = 3206pi/3, nearest cm3 ${Math.round(V.we1)}. Twin: checkFrustum(18,30,6,10) passes, ${f1(coneV(18, 30))} - ${f1(coneV(6, 10))} = ${f1(frustumV(18, 30, 6, 10))}, nearest ${Math.round(frustumV(18, 30, 6, 10))}`,
  examiner: "Built on the November 2024 M4 Q22 finding that the subtraction of cone volumes is the part candidates can set up",
};
details[`we.${TID}.02`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Five steps earning M1 MA1 MA1 MA1 A1, matching the 5-mark November 2024 M4 Q12 surface-area scheme",
  numeric: `circle(5) = ${f1(circle(5))}, cylCSA(5,14) = ${f1(cylCSA(5, 14))}, hemiCSA(5) = ${f1(hemiCSA(5))}, total ${f1(V.we2)} = 215pi. Twin: 9pi + 60pi + 18pi = 87pi = ${f1(V.q9)}`,
  examiner: "Exercises the hidden-faces and hemisphere-not-halved findings (November 2024 M4 Q12, Summer 2024 M4 Q9)",
};
details[`we.${TID}.03`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Four steps earning M1 MA1 MA1 A1, the front half of the 7-mark November 2024 M4 Q22 scheme",
  symbolic: "(1/3)[(4r)^2(20) - r^2(5)] = (1/3)(320 - 5)r^2 = 105r^2 checked by expanding at r = 1, 2 and 3: 105, 420 and 945 times pi",
  numeric: `105 pi r^2 = 420 pi gives r^2 = 4 and r = ${V.we3r}; substituting back, (1/3)pi[(8)^2(20) - 4(5)] = 420pi. Twin: (1/3)[(3r)^2(18) - r^2(6)] = 56r^2, and 56r^2 = 416 gives r = ${Math.sqrt(416 / 56)}`,
  examiner: "Directly seeded from the November 2024 M4 Q22 finding that 3r was squared without brackets",
};
details[`dx.${TID}`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Diagnostic items, not tariffed; each is one decision inside the 5- or 7-mark question",
  numeric: `Values checked in the generator: hemiCSA(6) = ${f1(hemiCSA(6))}, sphere SA(6) = ${f1(4 * PI * 36)}, hemiV(6) = ${f1(hemiV(6))}, cone with d = 14 gives r = 7, (3r)^2(15)/3 = 45r^2, 0.85 x 2400 = 2040 and 2400/0.85 = ${f1(2400 / 0.85)}`,
  examiner:
    "Every distractor carries a registry misconception from the insight card and the taxonomy evidence: hidden-faces-counted, volume-for-surface-area, hemisphere-not-halved, diameter-used-as-radius, bracket-before-squaring, ends-included-in-curved-sa, percentage-fill-omitted, overlap-added-as-length, volume-scaled-linearly, misapplied-power-or-coefficient",
};
for (const q of questions) {
  details[q.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: `${q.totalMarks} marks in ${q.parts.length} part(s); mark codes follow the M4 schemes read (November 2024 Q12: MA1 per named area then A1; November 2024 Q22: MA1 chain then A1)`,
    numeric: numericDetails[q.id],
    examiner: `Exercises ${q.examinerSources.join(", ")}`,
  };
}
for (const f of findTheMistake) {
  details[f.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: "Matches the 5-mark compound-solid and 7-mark cone-difference shapes; marksEarnedAsWritten counts only the steps the scheme would still credit",
    numeric:
      f.id.endsWith("01")
        ? `Correct total recomputed: ${f1(circle(9))} + ${f1(cylCSA(9, 7))} + ${f1(circle(9) - circle(4))} + ${f1(cylCSA(4, 6))} + ${f1(circle(4))} = ${f1(circle(9) + cylCSA(9, 7) + (circle(9) - circle(4)) + cylCSA(4, 6) + circle(4))} cm2; the written route double-counts pi(4)^2 and pi(9)^2`
        : f.id.endsWith("02")
          ? `checkFrustum(4,18,1,4.5) passes; correct equation (1/3)[16r^2(18) - r^2(4.5)] = 94.5r^2 = 282 gives r^2 = ${f2(282 / 94.5)} and r = ${f2(Math.sqrt(282 / 94.5))}; the written route gives 22.5r^2 = 282 and r = ${f2(Math.sqrt(282 / 22.5))}`
          : `Correct route recomputed: cylV(5,22) = ${f1(cylV(5, 22))}, hemiV(4) = ${f1(hemiV(4))}, 0.9 x that = ${f1(0.9 * hemiV(4))}, and ${f1(cylV(5, 22))} / ${f1(0.9 * hemiV(4))} = ${f2(cylV(5, 22) / (0.9 * hemiV(4)))} so 14 cups`,
    examiner: `Seeded from ${f.source}`,
  };
}
for (const p of prompts) {
  details[p.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: "Retrieval prompt; no tariff",
    numeric: "Any worked value in the prompt recomputed in the generator (for example 1000pi − 64pi = 936pi)",
    examiner: "Drawn from the rule lines of packs/maths/insights/m4.frustums-and-compound-solids.json",
  };
}

bundle.verification = collectLogs(bundle, details);

// ---------------------------------------------------------------------------
// Note blocks
// ---------------------------------------------------------------------------

const blocks = [
  { type: "h", text: "Frustums and compound solids" },
  {
    type: "callout",
    kind: "spec",
    title: "The statement",
    md: "**M4-GM-01** — solve more complex mensuration problems, for example frustums.\nThe Teacher Guidance names the parts: compound solids built from cubes, cuboids, cones, spheres, hemispheres, cylinders and prisms.",
    source: "CCEA GCSE Mathematics specification, statement M4-GM-01, with its Teacher Guidance",
  },
  {
    type: "callout",
    kind: "notonspec",
    title: "Not on this spec",
    md: "The Teacher Guidance adds one sentence that saves you a lot of work: **questions on frustums of a cone will not require knowledge of similar shapes.** So you will always be given both radii and both heights. There is also no frustum formula to learn — you build it from the cone.",
  },
  {
    type: "p",
    md: "Two questions in every M4 paper come from here, and they sit at opposite ends. A **5-mark compound solid** around Q9–Q13, and a **6- or 7-mark cone-difference problem** in the last three questions. In November 2024 only the strongest finished the first, and almost nobody finished the second. Both are lost for reasons that have nothing to do with the formulae.",
  },
  {
    type: "gate",
    id: "g0",
    kind: "choice",
    prompt: "Which of these is printed on the Higher formula sheet?",
    options: ["Volume of a cone", "Volume of a cylinder", "Curved surface area of a cylinder"],
    answer: "Volume of a cone",
    explain: "The sheet gives the cone and the sphere. The cylinder is recall, in both its forms.",
  },
  { type: "h", text: "A frustum is a subtraction" },
  {
    type: "p",
    md: "Cut a cone parallel to its base and take the point away. What is left is a **frustum**, and its volume is **the large cone minus the small cone**: $\\tfrac{1}{3}\\pi R^2 H - \\tfrac{1}{3}\\pi r^2 h$.\nEach cone keeps its **own** radius and its **own** height. The 10 cm below is the height of the little cone that was removed, not the height of the pot.",
  },
  {
    type: "figure",
    alt: "A frustum drawn as a large cone with its top cut off. The removed small cone is shown by dashed lines above it. The base radius is 12 cm, the top radius is 5 cm, the full height is 24 cm and the removed cone's height is 10 cm.",
    svg: FRUSTUM_FIG,
    caption: `Large cone − small cone: $\\tfrac{1}{3}\\pi(12)^2(24) - \\tfrac{1}{3}\\pi(5)^2(10) = ${Math.round(V.we1)}$ cm³.`,
  },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "How do you find the volume of a frustum?",
    options: ["Large cone − small cone", "Large cone + small cone", "Half the large cone"],
    answer: "Large cone − small cone",
    explain: "The piece cut off the top is itself a cone, so subtract its volume.",
  },
  {
    type: "callout",
    kind: "why",
    title: "Why you cannot subtract the radii instead",
    md: "It is tempting to do one cone calculation with radius $12 - 5 = 7$. Volume depends on $r^2 h$, so halving a radius divides the volume by four, not by two. The two shapes are not related by any single subtraction of lengths — only the **volumes** subtract.",
  },
  { type: "h", text: "Compound solids: volumes add, surfaces are chosen" },
  {
    type: "p",
    md: "For **volume**, add the parts (or subtract, if something is drilled out). That is the easy half.\nFor **surface area**, only the faces that **touch the air** count. Where two solids meet, two faces disappear at once. Walk round the solid and write a list before you press a single button:\n1 bottom circle, 2 curved side of the wide cylinder, 3 the flat **ring**, 4 curved side of the narrow cylinder, 5 top circle.",
  },
  {
    type: "figure",
    alt: "A solid made from a wide short cylinder with a narrow taller cylinder standing centrally on top. The flat ring where the wide cylinder is not covered is shaded.",
    svg: TWO_CYL_FIG,
    caption: "The shaded ring is $\\pi R^2 - \\pi r^2$: a difference of two circles, never $\\pi(R - r)^2$.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "choice",
    prompt: "Two cylinders of radii 10 cm and 4 cm are stacked. What is the area of the visible ring?",
    options: ["π(10)² − π(4)²", "π(10 − 4)²", "2π(10) − 2π(4)"],
    answer: "π(10)² − π(4)²",
    explain: "Take the small circle out of the large one. π(6)² is a different circle, and the third option is a length.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "November 2024 M4 Q12 and M3 Q26",
    md: "The same solid appeared on both papers. **Many candidates totalled the complete surface areas of both cylinders**, so the two circles where they meet were counted; others could not see the middle ring as a difference of circles; and a large number worked out **volumes** instead. The examiners asked for the work laid out with each calculation named — that layout is also how the method marks are awarded.",
    source: "ccea-cer:maths:2024-november:M4:Q12; ccea-cer:maths:2024-november:M3:Q26",
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: "A solid cylinder of radius 3 cm and height 10 cm has a hemisphere of radius 3 cm on top. How many separate areas are on the outside?",
    answer: "3",
    explain: "Bottom circle, curved side, hemisphere. The cylinder's top circle and the hemisphere's flat face are sealed together.",
  },
  { type: "h", text: "What is given, and what you must know" },
  {
    type: "p",
    md: "The Higher sheet gives you the **cone** ($\\tfrac{1}{3}\\pi r^2 h$ and $\\pi r l$) and the **sphere** ($\\tfrac{4}{3}\\pi r^3$ and $4\\pi r^2$). It does **not** give the cylinder: $\\pi r^2 h$ and $2\\pi r h$ are recall, and so is the area of a circle.\nA **hemisphere** is half of each sphere formula: $\\tfrac{2}{3}\\pi r^3$ and $2\\pi r^2$. Its flat circle is a separate area and counts only when it is on the outside.\nWatch which height you are handed: $\\pi r l$ wants the **slant** height, the volume wants the **perpendicular** height, and $l^2 = r^2 + h^2$ converts between them.",
  },
  {
    type: "gate",
    id: "g4",
    kind: "blank",
    prompt: "Curved surface area of a hemisphere of radius $r$?",
    answer: "2πr²",
    explain: "Half of 4πr². The flat circle is extra.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2024 M4 Q9",
    md: "A cylindrical flask poured into hemispherical cups filled to 90%. Three separate losses: the **sphere** formula used for a **hemisphere**, the **90% condition forgotten**, and rounding applied part-way through. Underline every word in the stem that changes a number before you start.",
    source: "ccea-cer:maths:2024-summer:M4:Q9",
  },
  { type: "h", text: "The A-grade version: an equation in an unknown radius" },
  {
    type: "p",
    md: "The hard version gives the radii as $r$ and a multiple of $r$, gives the volume, and asks for $r$ or for the diameter. Set the subtraction up as an **equation**, then simplify each term separately:\n$\\tfrac{1}{3}\\pi(4r)^2(20) - \\tfrac{1}{3}\\pi r^2(5) = 420\\pi$\n$\\tfrac{1}{3}\\pi(320r^2 - 5r^2) = 420\\pi$, so $105\\pi r^2 = 420\\pi$, $r^2 = 4$, $r = 2$.\nThe line that decides the mark is $(4r)^2 = 16r^2$. Squaring the bracket squares the number too.",
  },
  {
    type: "gate",
    id: "g5",
    kind: "blank",
    prompt: "Write $\\tfrac{1}{3}\\pi(3r)^2(15)$ in terms of $r^2$.",
    answer: "45πr²",
    explain: "(3r)² = 9r², then 9 × 15 ÷ 3 = 45.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "November 2024 M4 Q22",
    md: "A cone partly filled, with radii $r$ and $3r$ and the empty volume given. **Almost nobody finished.** Some set the subtraction of volumes up correctly, and then $3r$ was squared without brackets and the simplification failed. One pair of brackets was the difference between two marks and seven.",
    source: "ccea-cer:maths:2024-november:M4:Q22",
  },
  {
    type: "gate",
    id: "g6",
    kind: "number",
    prompt: "$105\\pi r^2 = 945\\pi$. What is $r$?",
    answer: "3",
    explain: "r² = 9, and a radius is positive, so r = 3.",
  },
  {
    type: "callout",
    kind: "mustknow",
    title: "Sheet or memory?",
    md: "**On the Higher sheet:** $\\tfrac{1}{3}\\pi r^2 h$, $\\pi r l$, $\\tfrac{4}{3}\\pi r^3$, $4\\pi r^2$, volume of a prism, area of a trapezium.\n**Must be known:** $\\pi r^2$ and $2\\pi r$; cylinder $\\pi r^2 h$ and $2\\pi r h$; hemisphere $\\tfrac{2}{3}\\pi r^3$ and $2\\pi r^2$; frustum = large cone − small cone; ring $= \\pi R^2 - \\pi r^2$; $l^2 = r^2 + h^2$.",
  },
  {
    type: "gate",
    id: "g7",
    kind: "choice",
    prompt: "A 5-mark question says “Calculate the total surface area. Show your working out clearly.” What earns the first four marks?",
    options: [
      "One mark for each external area, named beside its calculation",
      "One mark for each formula quoted from the sheet",
      "Four marks for the final total",
    ],
    answer: "One mark for each external area, named beside its calculation",
    explain: "That is how the November 2024 scheme was built, and why the examiners asked for labelled working.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "The 5-mark version says **“Calculate the total surface area”** and often adds **“Show your working out clearly”**. The first four marks are one per named area, so a page of labelled lines collects them even if the total is slipped; the last mark is the total to the stated accuracy with **cm²** on the answer line.\nThe 7-mark version says **“Calculate the diameter”** or **“Find the value of $r$”**. The first mark is the subtraction written as an equation — write that line even if you can go no further.\nIf you are stuck: write the formulae you are using, substitute, and label. Half-finished labelled working is worth several marks; a bare number is worth none.",
  },
  { type: "prompt", promptId: `rp.${TID}.01` },
  { type: "prompt", promptId: `rp.${TID}.05` },
  { type: "prompt", promptId: `rp.${TID}.06` },
  { type: "prompt", promptId: `rp.${TID}.07` },
  { type: "prompt", promptId: `rp.${TID}.08` },
];

writeBundle("m4", SLUG, bundle, blocks);
