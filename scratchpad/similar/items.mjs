/**
 * Worked examples, diagnostics, find-the-mistake items and retrieval prompts.
 */
import { fmt, ratio, frac, fracPlain, clean, N } from "./numbers.mjs";
import { figTrianglePair, figQuadPair, figCylinderPair, figNestedTriangle, figConePair, dataUri } from "./figs.mjs";

const T = "maths.m7.similar-shapes-length-area-and-volume-scale-factors";
const P1 = { unit: "M7", paper: 1, calculator: false, resources: ["formula-sheet-H"] };
const P2 = { unit: "M7", paper: 2, calculator: true, resources: ["formula-sheet-H", "scientific-calculator"] };
const M8P1 = { unit: "M8", paper: 1, calculator: false, resources: ["formula-sheet-H"] };
const svgFig = (src, alt) => ({ kind: "svg", src: dataUri(src), alt });

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

export function workedExamples() {
  const { we1, we1twin, we2, we2twin, we3, we3twin, we4, we4twin } = N;

  const we01 = {
    id: `we.${T}.01`,
    topic: T,
    specRefs: ["M7-GM-05"],
    paper: P1,
    stem:
      `$A$ and $B$ are similar triangles.\n\n` +
      `The base of $A$ is ${fmt(we1.baseSmall)} cm and the base of $B$ is ${fmt(we1.baseLarge)} cm.\n` +
      `The area of $A$ is ${fmt(we1.areaSmall)} cm².\n\n` +
      `Work out the area of $B$.`,
    figure: svgFig(
      figTrianglePair({
        leftName: "A",
        rightName: "B",
        leftBase: `base ${fmt(we1.baseSmall)} cm`,
        rightBase: `base ${fmt(we1.baseLarge)} cm`,
        leftArea: `area ${fmt(we1.areaSmall)} cm²`,
        rightArea: "area = ?",
        question: "Similar triangles: the bases correspond",
      }),
      `Two similar triangles side by side. The left triangle is labelled A, with its base marked ${fmt(we1.baseSmall)} cm and its area marked ${fmt(we1.areaSmall)} square centimetres. The right triangle is labelled B, is larger, and has its base marked ${fmt(we1.baseLarge)} cm with its area marked as unknown. The diagram is not drawn accurately.`,
    ),
    steps: [
      {
        n: 1,
        working: `$k = \\dfrac{${fmt(we1.baseLarge)}}{${fmt(we1.baseSmall)}} = ${frac(we1.baseLarge, we1.baseSmall)}$`,
        decision:
          `The two bases are corresponding sides, so dividing one by the other gives the length scale factor. I put $B$ on top because $B$ is the shape I am moving to, which keeps $k$ greater than 1 and means the area must come out larger. I leave it as a fraction: this is Paper 1.`,
        earns: ["MA1"],
      },
      {
        n: 2,
        working: `$k^2 = \\left(${frac(we1.kn, we1.kd)}\\right)^2 = ${frac(we1.k2n, we1.k2d)}$`,
        decision:
          `The question asks for an **area**, so the factor is squared. An area is a length times a length, and both of those lengths have been multiplied by $k$.`,
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because an area is a length times a length, so two factors of k arrive",
            "Because every scale factor is squared before it is used",
            "Because the shapes are triangles and triangles use one half base times height",
          ],
          correct: 0,
          explain:
            "Two dimensions, two factors of $k$. A perimeter would take one, a volume three. Counting dimensions is what tells you which power to use.",
        },
      },
      {
        n: 3,
        working: `Area of $B = ${fmt(we1.areaSmall)} \\times ${frac(we1.k2n, we1.k2d)} = \\dfrac{${fmt(we1.areaSmall * we1.k2n)}}{${fmt(we1.k2d)}}$`,
        decision:
          `Multiplying by the fraction is safer by hand than converting to ${fmt(we1.k2)} first: ${fmt(we1.areaSmall)} × ${fmt(we1.k2n)} is a short multiplication and dividing by ${fmt(we1.k2d)} at the end is two halvings.`,
      },
      {
        n: 4,
        working: `$= ${fmt(we1.areaLarge)}$, so the area of $B$ is ${fmt(we1.areaLarge)} cm².`,
        decision:
          `${fmt(we1.areaSmall * we1.k2n)} ÷ ${fmt(we1.k2d)} = ${fmt(we1.areaLarge)}. The answer line has no unit printed on it, so I write cm² myself — an area answer given in cm loses the accuracy mark.`,
        earns: ["A1"],
      },
    ],
    finalAnswer: `Area of $B = ${fmt(we1.areaLarge)}$ cm²`,
    twin: {
      stem:
        `$P$ and $Q$ are similar triangles. The base of $P$ is ${fmt(we1twin.baseSmall)} cm and the base of $Q$ is ${fmt(we1twin.baseLarge)} cm. ` +
        `The area of $P$ is ${fmt(we1twin.areaSmall)} cm². Work out the area of $Q$.`,
      answer: {
        kind: "numeric",
        value: clean(we1twin.areaLarge),
        tolerance: { type: "exact" },
        unit: "cm²",
        unitRequired: true,
        acceptForms: ["decimal", "fraction"],
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 0, studentSupplies: [1, 2, 3, 4] },
    ],
    version: 1,
    verification: `ver.we.${T}.01`,
  };

  const we02 = {
    id: `we.${T}.02`,
    topic: T,
    specRefs: ["M7-GM-05"],
    paper: P1,
    stem:
      `Two similar tiles $P$ and $Q$ are shown.\n\n` +
      `The area of $P$ is ${fmt(we2.areaSmall)} cm² and the area of $Q$ is ${fmt(we2.areaLarge)} cm².\n` +
      `The longest edge of $Q$ is ${fmt(we2.sideLarge)} cm.\n\n` +
      `Work out the length of the longest edge of $P$.`,
    figure: svgFig(
      figQuadPair({
        leftName: "P",
        rightName: "Q",
        leftLabel: `area ${fmt(we2.areaSmall)} cm²`,
        rightLabel: `area ${fmt(we2.areaLarge)} cm²`,
        leftSide: "longest edge = ?",
        rightSide: `${fmt(we2.sideLarge)} cm`,
        note: "The areas are given; a length is wanted",
      }),
      `Two similar four-sided tiles. The smaller tile is labelled P with area ${fmt(we2.areaSmall)} square centimetres and its longest edge marked as unknown. The larger tile is labelled Q with area ${fmt(we2.areaLarge)} square centimetres and its longest edge marked ${fmt(we2.sideLarge)} cm. The diagram is not drawn accurately.`,
    ),
    steps: [
      {
        n: 1,
        working: `Ratio of areas $= ${fmt(we2.areaSmall)} : ${fmt(we2.areaLarge)} = ${ratio(we2.ra, we2.rb)}$`,
        decision:
          `Simplify before doing anything else. Both numbers divide by ${fmt(we2.areaSmall / we2.ra)}, and ${ratio(we2.ra, we2.rb)} is a pair of square numbers, which is the signal that the root is about to be clean. In every CCEA scheme for this topic, this simplified ratio is the first mark.`,
        earns: ["MA1"],
      },
      {
        n: 2,
        working: `Ratio of lengths $= \\sqrt{${fmt(we2.ra)}} : \\sqrt{${fmt(we2.rb)}} = ${ratio(we2.la, we2.lb)}$`,
        decision:
          `Areas carry $k^2$, so the square root takes me back to $k$. This is the step the examiners report as the one candidates miss — they use the area factor directly on a length.`,
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because the area ratio is the length ratio squared, so rooting both parts undoes it",
            "Because you always halve a ratio before using it",
            "Because the tiles are quadrilaterals, so the ratio has four parts",
          ],
          correct: 0,
          explain:
            `$${ratio(we2.la, we2.lb)}$ squared is $${ratio(we2.ra, we2.rb)}$, so rooting is exactly the way back. Halving would give $${fmt(we2.ra / 2)} : ${fmt(we2.rb / 2)}$, which is the same ratio and no help at all.`,
        },
      },
      {
        n: 3,
        working: `Longest edge of $P = ${fmt(we2.sideLarge)} \\times \\dfrac{${fmt(we2.la)}}{${fmt(we2.lb)}} = ${fmt(we2.sideSmall)}$ cm`,
        decision:
          `$P$ is the smaller tile, so I multiply by $\\tfrac{${fmt(we2.la)}}{${fmt(we2.lb)}}$ and the answer must come out below ${fmt(we2.sideLarge)}. Checking that direction takes a second and catches an upside-down scale factor.`,
        earns: ["A1"],
      },
    ],
    finalAnswer: `Longest edge of $P = ${fmt(we2.sideSmall)}$ cm`,
    twin: {
      stem:
        `Two similar shapes have areas ${fmt(we2twin.areaSmall)} cm² and ${fmt(we2twin.areaLarge)} cm². ` +
        `The height of the larger shape is ${fmt(we2twin.sideLarge)} cm. Work out the height of the smaller shape.`,
      answer: {
        kind: "numeric",
        value: clean(we2twin.sideSmall),
        tolerance: { type: "exact" },
        unit: "cm",
        unitRequired: false,
        acceptForms: ["decimal", "fraction"],
      },
    },
    faded: [
      { showSteps: 1, studentSupplies: [2, 3] },
      { showSteps: 0, studentSupplies: [1, 2, 3] },
    ],
    version: 1,
    verification: `ver.we.${T}.02`,
  };

  const we03 = {
    id: `we.${T}.03`,
    topic: T,
    specRefs: ["M7-GM-04", "M7-GM-05"],
    paper: M8P1,
    stem:
      `Two similar cylinders $C$ and $D$ are shown.\n\n` +
      `The ratio of the curved surface area of $C$ to the curved surface area of $D$ is $${ratio(we3.saA, we3.saB)}$.\n\n` +
      `(a) Write down the ratio of the height of $C$ to the height of $D$.\n` +
      `(b) The volume of $C$ is ${fmt(we3.volSmall)} cm³. Work out the volume of $D$.`,
    figure: svgFig(
      figCylinderPair({
        leftName: "C",
        rightName: "D",
        leftLabel: `volume ${fmt(we3.volSmall)} cm³`,
        rightLabel: "volume = ?",
        note: `Curved surface areas in the ratio ${ratio(we3.saA, we3.saB)}`,
      }),
      `Two similar cylinders standing upright. The smaller one is labelled C and its volume is given as ${fmt(we3.volSmall)} cubic centimetres. The larger one is labelled D and its volume is marked as unknown. A note says the ratio of their curved surface areas is ${ratio(we3.saA, we3.saB)}. The diagram is not drawn accurately.`,
    ),
    steps: [
      {
        n: 1,
        working: `Heights $= \\sqrt{${fmt(we3.saA)}} : \\sqrt{${fmt(we3.saB)}} = ${ratio(we3.la, we3.lb)}$`,
        decision:
          `Surface area is an area, so it carries $k^2$. Square-rooting each part of the ratio brings me back to the lengths. Part (a) is one mark for exactly this line.`,
        earns: ["MA1"],
      },
      {
        n: 2,
        working: `Volumes $= ${fmt(we3.la)}^3 : ${fmt(we3.lb)}^3 = ${ratio(we3.va, we3.vb)}$`,
        decision:
          `Now cube the **length** ratio, not the area ratio. There is no direct route from areas to volumes; the lengths are the bridge, and writing both lines is what earns both marks.`,
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because the length ratio cubed gives the volume ratio",
            "Because the area ratio cubed gives the volume ratio",
            "Because volumes and areas are always in the same ratio",
          ],
          correct: 0,
          explain:
            `Cubing the area ratio would give $${fmt(we3.saA ** 3)} : ${fmt(we3.saB ** 3)}$, which is $k^6$, not $k^3$. Land on the lengths first, every time.`,
        },
      },
      {
        n: 3,
        working: `${fmt(we3.volSmall)} ÷ ${fmt(we3.va)} = ${fmt(we3.volSmall / we3.va)}, so one part is ${fmt(we3.volSmall / we3.va)} cm³`,
        decision:
          `The ratio $${ratio(we3.va, we3.vb)}$ means $C$ is ${fmt(we3.va)} parts. Dividing the known volume by ${fmt(we3.va)} gives the size of one part, which is the standard way to use a ratio when one side is known.`,
        earns: ["M1"],
      },
      {
        n: 4,
        working: `Volume of $D = ${fmt(we3.volSmall / we3.va)} \\times ${fmt(we3.vb)} = ${fmt(we3.volLarge)}$ cm³`,
        decision:
          `Multiply the size of one part by $D$'s ${fmt(we3.vb)} parts. The unit is cm³ because it is a volume — and a volume answer left in cm² is treated as an error of accuracy.`,
        earns: ["A1"],
      },
    ],
    finalAnswer: `(a) $${ratio(we3.la, we3.lb)}$  (b) ${fmt(we3.volLarge)} cm³`,
    twin: {
      stem:
        `The ratio of the surface areas of two similar boxes is $${ratio(we3twin.saA, we3twin.saB)}$. ` +
        `The volume of the smaller box is ${fmt(we3twin.volSmall)} cm³. Work out the volume of the larger box.`,
      answer: {
        kind: "numeric",
        value: clean(we3twin.volLarge),
        tolerance: { type: "exact" },
        unit: "cm³",
        unitRequired: true,
        acceptForms: ["decimal", "fraction"],
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 0, studentSupplies: [1, 2, 3, 4] },
    ],
    version: 1,
    verification: `ver.we.${T}.03`,
  };

  const we04 = {
    id: `we.${T}.04`,
    topic: T,
    specRefs: ["M7-GM-05"],
    paper: P2,
    stem:
      `In triangle $PQR$, $S$ lies on $PQ$ and $T$ lies on $PR$. $ST$ is parallel to $QR$.\n\n` +
      `$PS = ${fmt(we4.ad)}$ cm, $SQ = ${fmt(we4.db)}$ cm, $ST = ${fmt(we4.de)}$ cm and $PT = ${fmt(we4.ae)}$ cm.\n\n` +
      `(a) Work out the length of $QR$.\n` +
      `(b) Work out the length of $TR$.`,
    figure: svgFig(
      figNestedTriangle({
        apex: "P",
        left: "Q",
        right: "R",
        dName: "S",
        eName: "T",
        adLabel: `${fmt(we4.ad)} cm`,
        dbLabel: `${fmt(we4.db)} cm`,
        aeLabel: `${fmt(we4.ae)} cm`,
        deLabel: `${fmt(we4.de)} cm`,
        bcLabel: "QR = ?",
        t: 0.45,
      }),
      `Triangle P Q R with P at the top. S is a point on PQ and T is a point on PR, and the line ST is drawn across the triangle parallel to QR, with chevron marks on ST and QR showing they are parallel. PS is marked ${fmt(we4.ad)} cm, SQ is marked ${fmt(we4.db)} cm, PT is marked ${fmt(we4.ae)} cm, ST is marked ${fmt(we4.de)} cm, and QR is marked as unknown. The diagram is not drawn accurately.`,
    ),
    steps: [
      {
        n: 1,
        working: `$PQ = ${fmt(we4.ad)} + ${fmt(we4.db)} = ${fmt(we4.ab)}$ cm`,
        decision:
          `Both triangles share the apex $P$, so the side of the large triangle that matches $PS$ is the **whole** of $PQ$, not the leftover piece $SQ$. Adding the two parts first is what stops the commonest mismatch on this topic.`,
        earns: ["MA1"],
      },
      {
        n: 2,
        working: `$k = \\dfrac{PQ}{PS} = \\dfrac{${fmt(we4.ab)}}{${fmt(we4.ad)}} = ${frac(we4.ab, we4.ad)}$`,
        decision:
          `$ST$ is parallel to $QR$, so the corresponding angles are equal and the apex angle is shared: the triangles are similar. Dividing the whole by the part gives the factor that takes the small triangle to the large one.`,
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because PS and PQ are corresponding sides, both measured from the shared apex P",
            "Because SQ is the part left over, so SQ divided by PS is the scale factor",
            "Because ST and SQ are corresponding sides",
          ],
          correct: 0,
          explain:
            `Using $\\tfrac{${fmt(we4.db)}}{${fmt(we4.ad)}} = ${fmt(we4.db / we4.ad)}$ would treat the leftover piece as a whole side. Every answer after that is out, even though the method looks right.`,
        },
      },
      {
        n: 3,
        working: `$QR = ${fmt(we4.de)} \\times ${frac(we4.ab, we4.ad)} = ${fmt(we4.bc)}$ cm`,
        decision:
          `$ST$ and $QR$ are the corresponding parallel sides, so a single factor of $k$ takes one to the other. Length, so $k$ to the power 1.`,
        earns: ["A1"],
      },
      {
        n: 4,
        working: `$PR = ${fmt(we4.ae)} \\times ${frac(we4.ab, we4.ad)} = ${fmt(we4.ac)}$ cm, so $TR = ${fmt(we4.ac)} - ${fmt(we4.ae)} = ${fmt(we4.ec)}$ cm`,
        decision:
          `$TR$ is not a side of either triangle, so I scale the whole side $PR$ first and subtract the part I already know. Answering ${fmt(we4.ac)} here would be answering a question that was not asked.`,
        earns: ["A1"],
      },
    ],
    finalAnswer: `(a) $QR = ${fmt(we4.bc)}$ cm  (b) $TR = ${fmt(we4.ec)}$ cm`,
    twin: {
      stem:
        `In triangle $ABC$, $D$ lies on $AB$ and $E$ lies on $AC$, with $DE$ parallel to $BC$. ` +
        `$AD = ${fmt(we4twin.ad)}$ cm, $DB = ${fmt(we4twin.db)}$ cm and $DE = ${fmt(we4twin.de)}$ cm. Work out the length of $BC$.`,
      answer: {
        kind: "numeric",
        value: clean(we4twin.bc),
        tolerance: { type: "exact" },
        unit: "cm",
        unitRequired: false,
        acceptForms: ["decimal", "fraction"],
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    version: 1,
    verification: `ver.we.${T}.04`,
  };

  return [we01, we02, we03, we04];
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

const opt = (id, text, correct, feedback, misconception) => ({
  id,
  text,
  correct,
  feedback,
  ...(misconception ? { misconception } : {}),
});

export function diagnostics() {
  const { dx1, dx2, dx3, dx4, dx5, dx6, dx7, dx8 } = N;
  return [
    {
      id: `dx.${T}`,
      topic: T,
      specRefs: ["M7-GM-04", "M7-GM-05"],
      when: "both",
      items: [
        {
          id: "01",
          skill: "Area scale factor from a length scale factor",
          stem: `A shape is enlarged by scale factor ${fmt(dx1.k)}. How many times bigger is its area?`,
          options: [
            opt("a", fmt(dx1.area), true, `$${fmt(dx1.k)}^2 = ${fmt(dx1.area)}$. Two dimensions, two factors of $k$, and one mark in the exam for one line.`),
            opt("b", fmt(dx1.k), false, `That is what happens to a **length** — a side, a height, the perimeter. An area takes $k$ twice.`, "maths.similar.area-sf-treated-as-length-sf"),
            opt("c", fmt(dx1.doubled), false, `That is $${fmt(dx1.k)}$ doubled. Squaring and doubling agree only at 2, which is why this slip survives so long.`, "maths.similar.sf-doubled-not-squared"),
            opt("d", fmt(dx1.cube), false, `$${fmt(dx1.k)}^3$ is the **volume** factor. An area is flat, so it takes two factors of $k$, not three.`, "maths.similar.wrong-power-applied"),
          ],
          secondsExpected: 15,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "02",
          skill: "Volume scale factor from a length scale factor",
          stem: `A solid is enlarged by scale factor ${fmt(dx2.k)}. How many times bigger is its volume?`,
          options: [
            opt("a", fmt(dx2.volume), true, `$${fmt(dx2.k)}^3 = ${fmt(dx2.volume)}$. Three dimensions, three factors of $k$.`),
            opt("b", fmt(dx2.square), false, `$${fmt(dx2.k)}^2$ is the surface-area factor. The solid has a third dimension as well.`, "maths.similar.wrong-power-applied"),
            opt("c", fmt(dx2.k), false, `Scaling the volume by $k$ alone is the error the Summer 2023 report names: the majority multiplied the volume by the length factor.`, "maths.similar.volume-scaled-linearly"),
            opt("d", fmt(dx2.doubled), false, `That is $${fmt(dx2.k)}$ doubled. A cube is $${fmt(dx2.k)} \\times ${fmt(dx2.k)} \\times ${fmt(dx2.k)}$.`, "maths.similar.sf-doubled-not-squared"),
          ],
          secondsExpected: 20,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "03",
          skill: "Area ratio back to a length ratio",
          stem: `Two similar shapes have areas in the ratio $1 : ${fmt(dx3.areaRatio)}$. What is the ratio of their lengths?`,
          options: [
            opt("a", `$1 : ${fmt(dx3.length)}$`, true, `$\\sqrt{${fmt(dx3.areaRatio)}} = ${fmt(dx3.length)}$. Root both parts and the areas become lengths.`),
            opt("b", `$1 : ${fmt(dx3.areaRatio)}$`, false, `That is the area ratio copied across. It is the single biggest mark-loser on this topic; the root has to happen before the ratio touches a length.`, "maths.similar.area-sf-treated-as-length-sf"),
            opt("c", `$1 : ${fmt(dx3.halved)}$`, false, `Halving is not the inverse of squaring. $${fmt(dx3.halved)}^2 = ${fmt(dx3.halved ** 2)}$, nowhere near ${fmt(dx3.areaRatio)}.`, "maths.similar.sf-doubled-not-squared"),
            opt("d", `$1 : ${fmt(dx3.squared)}$`, false, `That squares again, moving further from the lengths. To undo a square you take a square root.`, "maths.similar.wrong-power-applied"),
          ],
          secondsExpected: 20,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "04",
          skill: "Volume ratio back to a length ratio",
          stem: `Two similar solids have volumes in the ratio $1 : ${fmt(dx4.volRatio)}$. What is the ratio of their heights?`,
          options: [
            opt("a", `$1 : ${fmt(dx4.length)}$`, true, `$\\sqrt[3]{${fmt(dx4.volRatio)}} = ${fmt(dx4.length)}$, because $${fmt(dx4.length)}^3 = ${fmt(dx4.length ** 3)}$. Volumes need the cube root.`),
            opt("b", `$1 : ${fmt(dx4.rooted)}$`, false, `That is the square root. It would be right for a ratio of areas; a ratio of volumes carries $k^3$, so the cube root is the way back.`, "maths.similar.volume-sf-not-cube-rooted"),
            opt("c", `$1 : ${fmt(dx4.volRatio)}$`, false, `The volume ratio used unchanged on a length. Check it: heights $1 : ${fmt(dx4.volRatio)}$ would give volumes $1 : ${fmt(dx4.volRatio ** 3)}$.`, "maths.similar.volume-scaled-linearly"),
            opt("d", `$1 : ${fmt(dx4.halved)}$`, false, `Halving undoes doubling, not cubing. $${fmt(dx4.halved)}^3 = ${fmt(dx4.halved ** 3)}$.`, "maths.similar.sf-doubled-not-squared"),
          ],
          secondsExpected: 25,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "05",
          skill: "A missing side in similar triangles",
          figure: svgFig(
            figTrianglePair({
              leftName: "A",
              rightName: "B",
              leftBase: `${fmt(dx5.small)} cm`,
              rightBase: `${fmt(dx5.large)} cm`,
              leftSide: `${fmt(dx5.other)} cm`,
              rightSide: "x cm",
              question: "The bases correspond, and the two marked sides correspond",
            }),
            `Two similar triangles. Triangle A has its base marked ${fmt(dx5.small)} cm and another side marked ${fmt(dx5.other)} cm. Triangle B is larger, with its base marked ${fmt(dx5.large)} cm and the side matching the ${fmt(dx5.other)} cm side marked x cm. The diagram is not drawn accurately.`,
          ),
          stem: `$A$ and $B$ are similar triangles. Work out the length marked $x$, in cm.`,
          options: [
            opt("a", fmt(dx5.answer), true, `$k = ${fmt(dx5.large)} \\div ${fmt(dx5.small)} = ${fmt(dx5.k)}$, and $${fmt(dx5.other)} \\times ${fmt(dx5.k)} = ${fmt(dx5.answer)}$ cm.`),
            opt("b", fmt(dx5.additive), false, `That adds the difference $${fmt(dx5.large)} - ${fmt(dx5.small)} = ${fmt(dx5.large - dx5.small)}$. Similar shapes scale by multiplying; the November 2024 report saw exactly this subtraction.`, "maths.similar.additive-instead-of-multiplicative"),
            opt("c", fmt(dx5.inverted), false, `The scale factor has been used upside down, so the larger triangle came out smaller. Check the direction before you divide.`, "maths.similar.scale-factor-inverted"),
            opt("d", fmt(dx5.mismatched), false, `The sides have been paired the other way round, matching $${fmt(dx5.other)}$ cm with the base instead of with its own partner. Pair first, divide second.`, "maths.similar.corresponding-sides-mismatched"),
          ],
          secondsExpected: 40,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "06",
          skill: "Volume after an enlargement",
          stem: `A cone has volume ${fmt(dx6.vol)} cm³. A similar cone is made with ${fmt(dx6.k)} times the height. What is its volume, in cm³?`,
          options: [
            opt("a", fmt(dx6.answer), true, `$${fmt(dx6.vol)} \\times ${fmt(dx6.k)}^3 = ${fmt(dx6.vol)} \\times ${fmt(dx6.k ** 3)} = ${fmt(dx6.answer)}$ cm³.`),
            opt("b", fmt(dx6.linear), false, `The volume has been multiplied by the length factor. The width and the depth grew by $${fmt(dx6.k)}$ as well, so the cube is what is needed.`, "maths.similar.volume-scaled-linearly"),
            opt("c", fmt(dx6.squared), false, `$${fmt(dx6.k)}^2$ is the surface-area factor. A volume takes the third power.`, "maths.similar.wrong-power-applied"),
            opt("d", fmt(dx6.additive), false, `Adding ${fmt(dx6.k)} treats the scale factor as a length to add on. It is a multiplier.`, "maths.similar.additive-instead-of-multiplicative"),
          ],
          secondsExpected: 30,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "07",
          skill: "Perimeter under enlargement",
          stem: `A shape has perimeter ${fmt(dx7.perimeter)} cm. It is enlarged by scale factor ${fmt(dx7.k)}. What is the new perimeter, in cm?`,
          options: [
            opt("a", fmt(dx7.answer), true, `A perimeter is a sum of lengths, so it scales by $k$: $${fmt(dx7.perimeter)} \\times ${fmt(dx7.k)} = ${fmt(dx7.answer)}$ cm.`),
            opt("b", fmt(dx7.squared), false, `$k^2$ belongs to the area. Summer 2025 examiners saw the same factor used for both; only the area is squared.`, "maths.similar.wrong-power-applied"),
            opt("c", fmt(dx7.additive), false, `The scale factor has been added rather than multiplied.`, "maths.similar.additive-instead-of-multiplicative"),
            opt("d", fmt(dx7.inverted), false, `Dividing shrinks the shape. An enlargement by a factor above 1 makes the perimeter longer.`, "maths.similar.scale-factor-inverted"),
          ],
          secondsExpected: 20,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "08",
          skill: "Which line earns the first mark",
          stem:
            `Two similar shapes have areas ${fmt(dx8.areaA)} cm² and ${fmt(dx8.areaB)} cm². Their heights are $x$ cm and $(x + ${fmt(dx8.gapConst)})$ cm, and the part is worth 4 marks with the working to be shown. ` +
            `Which first line earns the first mark?`,
          options: [
            opt("a", `Ratio of areas $= ${fmt(dx8.areaA)} : ${fmt(dx8.areaB)} = ${ratio(dx8.ra, dx8.rb)}$`, true, `The simplified area ratio is the mark almost everyone can get, and it is the line every scheme for this topic opens with.`),
            opt("b", `$x + ${fmt(dx8.gapConst)} = ${fmt(dx8.rb)}x$`, false, `The area factor has jumped straight into an equation about heights. The lengths are in the ratio $${ratio(dx8.la, dx8.lb)}$, not $${ratio(dx8.ra, dx8.rb)}$.`, "maths.similar.area-sf-treated-as-length-sf"),
            opt("c", `$x = ${fmt(dx8.x)}$`, false, `The value is right, and with the working demanded it scores nothing on its own. November 2025 examiners reported precisely this.`, "maths.presentation.answer-without-working"),
            opt("d", `$${fmt(dx8.areaB)} - ${fmt(dx8.areaA)} = ${fmt(dx8.difference)}$`, false, `A difference between two areas is not a scale factor. Similar shapes are linked by multiplying.`, "maths.similar.additive-instead-of-multiplicative"),
          ],
          secondsExpected: 45,
          confidence: true,
          hypercorrectionQueue: true,
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Find the mistake
// ---------------------------------------------------------------------------

export function findTheMistake() {
  const { ftm1, ftm2, ftm3 } = N;
  return [
    {
      id: `ftm.${T}.01`,
      topic: T,
      specRefs: ["M7-GM-05"],
      stem:
        `Niamh was asked: two similar shapes have areas ${fmt(ftm1.areaA)} cm² and ${fmt(ftm1.areaB)} cm². ` +
        `The height of the larger shape is ${fmt(ftm1.heightB)} cm. Work out the height of the smaller shape. Her working:`,
      studentWorking: [
        `Areas: ${fmt(ftm1.areaA)} and ${fmt(ftm1.areaB)}`,
        `${fmt(ftm1.areaB)} ÷ ${fmt(ftm1.areaA)} = ${fmt(ftm1.factor)}, so the scale factor is ${fmt(ftm1.factor)}`,
        `Height of the smaller shape = ${fmt(ftm1.heightB)} ÷ ${fmt(ftm1.factor)} = ${fmt(ftm1.studentAnswer)} cm`,
      ],
      mistakeLine: 3,
      misconception: "maths.similar.area-sf-treated-as-length-sf",
      whatWentWrong:
        `Line 2 is correct and earns its mark: ${fmt(ftm1.factor)} really is the factor linking the two areas. Line 3 then uses that area factor on a height. Areas carry $k^2$, so ${fmt(ftm1.factor)} is $k^2$, not $k$, and it has to be square-rooted before it meets a length.`,
      correction: [
        `Areas ${fmt(ftm1.areaA)} : ${fmt(ftm1.areaB)} = 1 : ${fmt(ftm1.factor)}`,
        `Lengths = 1 : √${fmt(ftm1.factor)} = 1 : ${fmt(ftm1.k)}`,
        `Height of the smaller shape = ${fmt(ftm1.heightB)} ÷ ${fmt(ftm1.k)} = ${fmt(ftm1.heightA)} cm`,
      ],
      marksEarnedAsWritten: ["MA1"],
      feedback:
        `One of three marks, and one square root away from all three. This is the Summer 2024 question almost exactly: the report says the area factor was found and then divided into the length, so 15 was divided by 4 instead of by 2. Add one line — "lengths = 1 : ${fmt(ftm1.k)}" — between what you have and what you wrote.`,
      source: "ccea-cer:maths:2024-summer:M71:Q16",
    },
    {
      id: `ftm.${T}.02`,
      topic: T,
      specRefs: ["M7-GM-04"],
      stem:
        `Erin was asked: a container has volume ${fmt(ftm2.vol)} cm³. A similar container is made with every length ${fmt(ftm2.k)} times as long. ` +
        `Work out the volume of the new container. Her working:`,
      studentWorking: [
        `Every length is ${fmt(ftm2.k)} times as long`,
        `So the volume is ${fmt(ftm2.k)} times as big`,
        `${fmt(ftm2.vol)} × ${fmt(ftm2.k)} = ${fmt(ftm2.studentAnswer)} cm³`,
      ],
      mistakeLine: 2,
      misconception: "maths.similar.volume-scaled-linearly",
      whatWentWrong:
        `Line 2 scales the volume by the length factor. The container has grown in three directions at once: it is ${fmt(ftm2.k)} times longer, ${fmt(ftm2.k)} times wider and ${fmt(ftm2.k)} times taller, so the volume is multiplied by $${fmt(ftm2.k)} \\times ${fmt(ftm2.k)} \\times ${fmt(ftm2.k)}$.`,
      correction: [
        `Length factor k = ${fmt(ftm2.k)}`,
        `Volume factor = k³ = ${fmt(ftm2.k)}³ = ${fmt(ftm2.k3)}`,
        `New volume = ${fmt(ftm2.vol)} × ${fmt(ftm2.k3)} = ${fmt(ftm2.correct)} cm³`,
      ],
      marksEarnedAsWritten: [],
      feedback:
        `No marks yet, and the fix is one line. This is the Summer 2023 question: the report records that the majority of candidates simply scaled the volume by the length factor, and only the better ones multiplied by the cube. Write "volume factor = k³" before any multiplying and the method mark is safe even if the arithmetic slips.`,
      source: "ccea-cer:maths:2023-summer:M81:Q9",
    },
    {
      id: `ftm.${T}.03`,
      topic: T,
      specRefs: ["M7-GM-05"],
      stem:
        `Saoirse was asked: two triangles are similar. A side of ${fmt(ftm3.small)} cm on the small triangle corresponds to a side of ${fmt(ftm3.large)} cm on the large one. ` +
        `Another side of the small triangle is ${fmt(ftm3.other)} cm. Work out the matching side of the large triangle. Her working:`,
      studentWorking: [
        `${fmt(ftm3.large)} − ${fmt(ftm3.small)} = ${fmt(ftm3.difference)}`,
        `So every side of the large triangle is ${fmt(ftm3.difference)} cm longer`,
        `${fmt(ftm3.other)} + ${fmt(ftm3.difference)} = ${fmt(ftm3.studentAnswer)} cm`,
      ],
      mistakeLine: 2,
      misconception: "maths.similar.additive-instead-of-multiplicative",
      whatWentWrong:
        `Line 2 turns a difference into a rule. Similar shapes are linked by a multiplier, not by a fixed amount added on: if every side simply gained ${fmt(ftm3.difference)} cm the angles would change and the shapes would no longer be similar. The link is $${fmt(ftm3.large)} \\div ${fmt(ftm3.small)}$.`,
      correction: [
        `k = ${fmt(ftm3.large)} ÷ ${fmt(ftm3.small)} = ${fracPlain(ftm3.large, ftm3.small)}`,
        `Matching side = ${fmt(ftm3.other)} × ${fracPlain(ftm3.large, ftm3.small)} = ${fmt(ftm3.correct)} cm`,
        `Check: ${fmt(ftm3.small)} × ${fracPlain(ftm3.large, ftm3.small)} = ${fmt(ftm3.large)}, so the factor is the one the shapes actually share`,
      ],
      marksEarnedAsWritten: [],
      feedback:
        `Nothing scored yet, because the method mark is for a ratio and no ratio has appeared. The November 2024 report describes the same subtraction being used on this kind of question. One habit fixes it for good: before you touch the unknown side, write $k =$ new ÷ old and check that it is greater than 1 when the shape is growing.`,
      source: "ccea-cer:maths:2024-november:M71:Q13",
    },
  ];
}

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

export function prompts() {
  const { chain, q13, dx4 } = N;
  const p = (n, kind, prompt, answer, keyWords, difficultyPrior, specRefs = ["M7-GM-05"], image) => ({
    id: `rp.${T}.${n}`,
    topic: T,
    specRefs,
    kind,
    prompt,
    answer,
    keyWords,
    ...(image ? { image } : {}),
    examUnit: "M7",
    difficultyPrior,
  });
  return [
    p("01", "formula", "A shape is enlarged by scale factor $k$. What happens to a length, to an area and to a volume?", "Length $\\times k$, area $\\times k^2$, volume $\\times k^3$. One dimension, two dimensions, three dimensions.", ["k", "k²", "k³"], 3, ["M7-GM-04", "M7-GM-05"]),
    p("02", "qa", "A perimeter is made of lengths. What does an enlargement of scale factor $k$ do to it?", "Multiplies it by $k$, not by $k^2$. A perimeter is a sum of lengths, so it takes one factor of $k$.", ["k", "perimeter", "length"], 4),
    p("03", "procedure", "You are given a ratio of areas and asked for a ratio of lengths. What do you do?", "Simplify the ratio, then take the square root of each part. Areas carry $k^2$, so a square root brings you back to $k$.", ["square root", "simplify", "both parts"], 5),
    p("04", "procedure", "You are given a ratio of volumes and asked for a ratio of heights. What do you do?", `Take the cube root of each part. Volumes carry $k^3$. For example $1 : ${fmt(dx4.volRatio)}$ gives heights $1 : ${fmt(dx4.length)}$.`, ["cube root", "k³"], 6, ["M7-GM-04"]),
    p("05", "trap", "What is the commonest way to lose every mark after the first on a similar-shapes question?", "Using the area scale factor as if it were the length scale factor. The number found from two areas is $k^2$: square-root it before it touches a length.", ["area scale factor", "square root", "length"], 6),
    p("06", "trap", "A solid's height is doubled. What happens to its volume, and what do most candidates write?", "It is multiplied by $2^3 = 8$. Most candidates double it. Every length doubles, so three factors of 2 arrive.", ["8", "cubed", "doubled"], 5, ["M7-GM-04"]),
    p("07", "definition", "What exactly makes two shapes similar?", "Every pair of corresponding angles is equal and every pair of corresponding sides is in the same ratio. One shape is an enlargement of the other; nothing but the size changes.", ["equal angles", "same ratio", "corresponding"], 3),
    p("08", "qa", `Two similar solids have surface areas in the ratio $${ratio(chain.a2, chain.b2)}$. What is the ratio of their volumes?`, `$${ratio(chain.a3, chain.b3)}$. Square-root to the lengths $${ratio(chain.a, chain.b)}$, then cube. There is no direct route from areas to volumes.`, [ratio(chain.a3, chain.b3), "cube", "square root"], 7, ["M7-GM-04", "M7-GM-05"]),
    p("09", "procedure", "In a triangle $ABC$ with $DE$ parallel to $BC$, $D$ on $AB$ and $E$ on $AC$: which side of the large triangle corresponds to $AD$?", "$AB$, the whole side. $DB$ is only the part left over. Add $AD$ and $DB$ first, then divide.", ["AB", "whole", "AD + DB"], 6),
    p("10", "trap", `A 4-mark part gives two areas and two heights written as $x$ and $x + ${fmt(q13.gapConst)}$, and says to show the working clearly. You can see the answer. What do you write?`, "The area ratio simplified, the length ratio after the square root, the equation, then the value. A correct answer with no working scores nothing when the working is demanded.", ["ratio", "square root", "equation", "working"], 6),
  ];
}
