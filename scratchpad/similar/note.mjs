/**
 * Note frontmatter (the Sheet) and the step-reveal lesson blocks for
 * maths.m7.similar-shapes-length-area-and-volume-scale-factors.
 * Every number printed in the prose comes through fmt() from a computed value.
 */
import { figScaleTrio, figCorrespondingSides, figCylinderChain } from "./figs.mjs";
import { fmt, N } from "./numbers.mjs";

const TOPIC = "maths.m7.similar-shapes-length-area-and-volume-scale-factors";

export function buildNote() {
  return {
    id: `note.${TOPIC}`,
    topic: TOPIC,
    title: "Similar shapes: k, k² and k³",
    subject: "maths",
    unit: "M7",
    tier: "H",
    specRefs: ["M7-GM-04", "M7-GM-05"],
    calculator: "P1-no/P2-yes",
    formulaSheet: {
      given: [
        "Nothing for this topic. The Higher sheet carries the prism, the trapezium, the sphere, the cone, the quadratic formula, the sine and cosine rules and ½ab sin C — no scale-factor rule appears on it.",
      ],
      mustKnow: [
        `Length scale factor k → area scale factor k² → volume scale factor k³`,
        `Backwards: k = √(area factor) and k = ∛(volume factor)`,
        "Perimeter is a length, so it scales by k, not by k²",
        "Similar means equal angles and every pair of corresponding sides in the same ratio",
        "A ratio a : b of lengths gives a² : b² for areas and a³ : b³ for volumes",
      ],
    },
    notOnThisSpec: [
      "Similar 3-D solids in their own right — surface-area and volume ratios of similar solids, including the frustum of a cone, are statement M8-GM-05 and have their own topic (similar-3d-shapes-length-area-and-volume-ratios)",
      "Formal similarity proofs written as a two-column geometric proof; CCEA asks you to show that corresponding angles are equal or that sides are in a fixed ratio, not to quote SSS/SAS similarity criteria",
      "Congruence criteria (SSS, SAS, ASA, RHS) as a named list — congruence is M6 and is treated as the k = 1 case here",
      "Scale factors applied to angles: angles never change under enlargement, so there is no angle scale factor to find",
    ],
    hardness: "H",
    examinerFlagged: true,
    externalRefs: [
      {
        kind: "ccea-doc",
        docType: "cer",
        url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
        asOf: "2026-09-13",
      },
      { kind: "corbettmaths", videos: [292] },
    ],
    sheet: {
      mustBeAbleTo: [
        "Say what makes two shapes similar: equal angles, and every pair of corresponding sides in the same ratio",
        "Find the length scale factor k by pairing corresponding sides and dividing the right way round",
        "Multiply a length, a height or a perimeter by k",
        `Multiply an area by k² and a volume by k³, and say which of the three you are being asked for`,
        "Go backwards from an area ratio to a length ratio by taking the square root of both parts",
        "Go backwards from a volume ratio to a length ratio by taking the cube root of both parts",
        "Run the whole chain in one question: an area ratio to the lengths, then the lengths to the volumes",
        "Pick out a pair of similar triangles inside one diagram when a line is drawn parallel to a side, and match the whole of a side with the whole of a side",
        "Turn a percentage increase in area into a percentage increase in length, and the reverse",
        "Set up and solve an equation when the two heights are given as x and x + something",
        "Do all of it without a calculator on Paper 1: simplify the ratio first, then take the root of two small numbers",
      ],
      howExamined:
        "M7 Paper 1 and Paper 2 (each non-calculator/calculator, 75 minutes, 50 marks) and again in M8, which re-examines M7 content. Expect one question, very often the last on the paper, 1 to 4 marks. The shapes seen: two single-mark parts asking how many times bigger the perimeter and the area become after an enlargement (Summer 2025 M7 Paper 1 Q14, repeated as M8 Paper 1 Q5); a 1 + 1 pair taking a ratio of surface areas to a ratio of heights and then to a ratio of volumes (Summer 2025 M8 Paper 1 Q9); a 2-mark similar-triangles side (November 2024 M7 Paper 1 Q13, scheme MA1 A1); a 2-mark volume after the height is doubled (Summer 2023 M8 Paper 1 Q9, scheme M1 A1); a 3-mark area-ratio-to-length (Summer 2024 M7 Paper 1 Q16, scheme MA1 MA1 A1); and a 4-mark version where the two heights are x and x + k and the working must be shown (November 2025 M7 Paper 2 Q16 and M8 Paper 2 Q8). Marks run MA1 for the simplified ratio, MA1 for the root, A1 for the value.",
      traps: [
        "Using the area scale factor as if it were the length scale factor — the single biggest loss on this topic; the factor 4 was found from a 24 : 96 area ratio and then divided into the length, giving 15 ÷ 4 instead of 15 ÷ 2 (Summer 2024 M7 Paper 1 Q16)",
        "Multiplying a volume by k instead of k³: most candidates doubled the volume when the height was doubled, where only the stronger ones multiplied by 8 (Summer 2023 M8 Paper 1 Q9)",
        "Stopping at the area ratio: one mark for 1 : 16 was common, but the step down to heights 1 : 4 was rarely made, so x = 3 was reached by very few (November 2025 M7 Paper 2 Q16)",
        "Giving the same answer for perimeter and for area after an enlargement — 5 was written twice, and 10 was a common area answer for a scale factor of 5 (Summer 2025 M7 Paper 1 Q14)",
        "Subtracting instead of scaling in similar triangles: 10 − 4 = 6, so 15 − 6 (November 2024 M7 Paper 1 Q13)",
        "Writing the right answer with no working where the question says to show it, which scores nothing (November 2025 M8 Paper 2 Q8)",
        "Pairing a part of a side with the whole of a side when the two triangles overlap: AD : DB instead of AD : AB",
        "Dividing the wrong way round, so a shape that should grow shrinks; check the answer is on the correct side of the one you started from",
      ],
    },
    verification: `ver.note.${TOPIC}`,
    version: 1,
    updated: "2026-09-13",
  };
}

export function buildBlocks() {
  return [
    { type: "h", text: "Similar shapes: k, k² and k³" },
    {
      type: "callout",
      kind: "spec",
      title: "The two statements",
      md:
        "**M7-GM-04** — understand and use the effect of enlargement on the volume of solids.\n" +
        "**M7-GM-05** — use the relationship between the ratios of lengths and areas of similar 2D shapes.",
      source: "CCEA GCSE Mathematics specification, statements M7-GM-04 and M7-GM-05",
    },
    {
      type: "p",
      md:
        "CCEA likes this topic in the last question on the paper, in M7 and again in M8, usually for 1 to 4 marks. It is worth the ten minutes it takes to own, because the marks are handed out for two lines of ratio work. In November 2025 one mark for the area ratio was common and almost nobody took the next step to the heights; in Summer 2023 most candidates doubled a volume when the height was doubled. Both questions turn on one idea, and by the end of this page it will be the first thing you reach for.",
    },
    {
      type: "gate",
      id: "g1",
      kind: "number",
      prompt: `A shape is enlarged by scale factor ${fmt(N.g1.k)}. How many times longer is each side?`,
      answer: fmt(N.g1.k),
      explain:
        `The scale factor is the number every length is multiplied by, so each side is ${fmt(N.g1.k)} times longer. That is the definition, and everything else on this page is built on it.`,
    },

    { type: "h", text: "What similar means, and why the powers appear" },
    {
      type: "p",
      md:
        "Two shapes are **similar** when one is an enlargement of the other: the angles are identical and every pair of corresponding sides is in the same ratio. That shared ratio is the **length scale factor** $k$. Nothing else about the shape changes — a similar shape is the same shape, photographed from further away.",
    },
    {
      type: "callout",
      kind: "why",
      title: "Why area gets squared and volume cubed",
      md:
        "An area is a length multiplied by a length. Enlarge the shape and **both** of those lengths are multiplied by $k$, so the area is multiplied by $k \\times k = k^2$. A volume is a length times a length times a length, so three factors of $k$ arrive and the volume is multiplied by $k^3$. A perimeter is only ever a sum of lengths, so it takes $k$ alone. Never guess the power: count the dimensions.",
    },
    {
      type: "figure",
      alt:
        "Two pictures side by side. On the left a single small square labelled 1 by 1 is enlarged by scale factor 3 into a large square ruled into a 3 by 3 grid, so nine of the small squares fit inside it, captioned area times 3 squared equals 9. On the right a single small cube is enlarged by scale factor 2 into a large cube cut into two layers of two by two, so eight of the small cubes fit inside it, captioned volume times 2 cubed equals 8. Underneath, three boxes read length times k, area times k squared, volume times k cubed, and a final line says that going back the other way k is the square root of the area factor and the cube root of the volume factor.",
      svg: figScaleTrio({ ...N.figTrio, f: fmt }),
      caption: "Count the dimensions: one for length, two for area, three for volume.",
    },
    {
      type: "gate",
      id: "g2",
      kind: "choice",
      prompt: `A rectangle is enlarged by scale factor ${fmt(N.g2.k)}. Its area is multiplied by`,
      options: [fmt(N.g2.k * N.g2.k), fmt(N.g2.k), fmt(2 * N.g2.k)],
      answer: fmt(N.g2.k * N.g2.k),
      explain:
        `Area takes two factors of $k$, so it is multiplied by $${fmt(N.g2.k)}^2 = ${fmt(N.g2.k * N.g2.k)}$. Multiplying by ${fmt(N.g2.k)} would be the perimeter, and ${fmt(2 * N.g2.k)} is $${fmt(N.g2.k)}$ doubled, which is not a power at all.`,
    },
    {
      type: "p",
      md:
        "**Three lines, every time.**\n" +
        "1 Find $k$ by pairing two corresponding sides and dividing: new length ÷ old length. Pair them first, divide second.\n" +
        "2 Decide which of the three you have been asked for — a length, an area or a volume — and raise $k$ to 1, 2 or 3.\n" +
        "3 Multiply, and write the unit that goes with the dimension: cm for a length, cm² for an area, cm³ for a volume.",
    },
    {
      type: "callout",
      kind: "examiner",
      title: "Summer 2023 M8 Paper 1 Q9",
      md:
        "The height of a solid was doubled and the new volume asked for, worth two marks. The report is blunt: the majority doubled the volume, and only the better candidates multiplied by 8. Doubling every length multiplies the volume by $2^3$, and the scheme wanted that cube written down before the answer.",
      source: "ccea-cer:maths:2023-summer:M81:Q9",
    },
    {
      type: "gate",
      id: "g3",
      kind: "number",
      prompt: `A solid is enlarged by scale factor ${fmt(N.g3.k)}. Its volume is multiplied by`,
      answer: fmt(N.g3.k ** 3),
      explain:
        `$${fmt(N.g3.k)}^3 = ${fmt(N.g3.k)} \\times ${fmt(N.g3.k)} \\times ${fmt(N.g3.k)} = ${fmt(N.g3.k ** 3)}$. Three dimensions, three factors of $k$. Multiplying by ${fmt(N.g3.k)} is the mistake most of the 2023 cohort made.`,
    },

    { type: "h", text: "Backwards: the root is the whole question" },
    {
      type: "p",
      md:
        "The Teacher Guidance for M7-GM-05 says problems may be reversed, with the areas given and a length to find, and that is how CCEA sets them. You are handed a ratio of **areas** and asked for a **length**, and the only move that opens the question is a square root. Simplify the ratio first, then root both parts.\n\n" +
        `Areas in the ratio $${N.back.a} : ${N.back.b}$ means lengths in the ratio $\\sqrt{${N.back.a}} : \\sqrt{${N.back.b}} = ${fmt(Math.sqrt(N.back.a))} : ${fmt(Math.sqrt(N.back.b))}$. If instead you are given **volumes** in a ratio, take the cube root of both parts: $${N.backV.a} : ${N.backV.b}$ becomes $${fmt(Math.cbrt(N.backV.a))} : ${fmt(Math.cbrt(N.backV.b))}$.`,
    },
    {
      type: "gate",
      id: "g4",
      kind: "number",
      prompt: `Two similar shapes have areas in the ratio $1 : ${fmt(N.g4.areaRatio)}$. Their lengths are in the ratio $1 : n$. What is $n$?`,
      answer: fmt(Math.sqrt(N.g4.areaRatio)),
      explain:
        `$n = \\sqrt{${fmt(N.g4.areaRatio)}} = ${fmt(Math.sqrt(N.g4.areaRatio))}$. Leaving $n$ as ${fmt(N.g4.areaRatio)} is the commonest error on this topic, and it costs every mark after the first.`,
    },
    {
      type: "callout",
      kind: "examiner",
      title: "Summer 2024 M7 Paper 1 Q16",
      md:
        "Candidates were given two areas, 24 cm² and 96 cm², and one height, and asked for the other height. Dividing 96 by 24 gives 4, and the report says that 4 was found — and then used straight on the length, so 15 was divided by 4 instead of by 2. Some divided 96 by 15 instead. The factor 4 belongs to the **areas**. Root it before it touches a length.",
      source: "ccea-cer:maths:2024-summer:M71:Q16",
    },
    {
      type: "gate",
      id: "g5",
      kind: "number",
      prompt:
        `Two similar shapes have areas ${fmt(N.g5.areaSmall)} cm² and ${fmt(N.g5.areaLarge)} cm². The large shape is ${fmt(N.g5.heightLarge)} cm tall. How tall is the small one, in cm?`,
      answer: fmt(N.g5.heightSmall),
      explain:
        `Areas ${fmt(N.g5.areaSmall)} : ${fmt(N.g5.areaLarge)} simplify to $1 : ${fmt(N.g5.areaRatio)}$, so the lengths are $1 : ${fmt(N.g5.k)}$ and the height is ${fmt(N.g5.heightLarge)} ÷ ${fmt(N.g5.k)} = ${fmt(N.g5.heightSmall)} cm. Dividing by ${fmt(N.g5.areaRatio)} instead would give ${fmt(N.g5.heightLarge / N.g5.areaRatio)} cm, which is the error the 2024 report describes.`,
    },

    { type: "h", text: "See it" },
    {
      type: "video",
      videoId: "L6DLoBMknoY",
      title: "Similar Shapes - Missing Sides",
      channel: "corbettmaths",
      corbettmathsNumber: 292,
      why:
        "Five minutes on the one move everything else is built from: pairing corresponding sides and getting the scale factor the right way round. Watch how the pairing is written down before any dividing happens.",
    },
    {
      type: "gate",
      id: "g6",
      kind: "choice",
      prompt: "Before you divide to find $k$, what has to happen first?",
      options: [
        "Decide which side of one shape matches which side of the other",
        "Work out the area of both shapes",
        "Check that the diagram is drawn accurately",
      ],
      answer: "Decide which side of one shape matches which side of the other",
      explain:
        "Pairing comes first. A scale factor found from two sides that do not correspond is not a scale factor at all. CCEA diagrams carry the words 'diagram not drawn accurately' precisely so that you pair by the labelling and not by eye.",
    },

    { type: "h", text: "Similar triangles hiding inside one diagram" },
    {
      type: "p",
      md:
        "The harder M7 version does not show you two separate shapes. It shows one triangle with a line drawn **parallel** to one side, which cuts off a smaller triangle at the top. Parallel lines make equal corresponding angles, the apex angle is shared, so the two triangles are similar — the small one is a scaled copy of the whole one.\n\n" +
        "The trap is what you pair. The small triangle's side from the apex is $AD$; the matching side of the **whole** triangle is $AB$, the full length, not the leftover piece $DB$.",
    },
    {
      type: "figure",
      alt:
        "Two triangles drawn side by side. The small triangle has vertices P, Q and R, with side PQ marked 6 cm and side PR marked 8 cm. The larger triangle has vertices X, Y and Z, with side XY marked 15 cm and side XZ marked 20 cm. A single arc marks the angle at P and at X, and a double arc marks the angle at Q and at Y, showing which vertices correspond. A caption explains that one arc pairs with one arc, so PQ goes with XY and PR with XZ, that the scale factor is 15 divided by 6 which is 2.5, and that 8 times 2.5 gives 20.",
      svg: figCorrespondingSides({ ...N.figCorr, f: fmt }),
      caption: "Equal angles tell you which sides to pair. Pair first, divide second.",
    },
    {
      type: "gate",
      id: "g7",
      kind: "choice",
      prompt:
        "In triangle $ABC$, $D$ lies on $AB$ and $E$ lies on $AC$, with $DE$ parallel to $BC$. Which side of triangle $ABC$ corresponds to $AD$?",
      options: ["$AB$", "$DB$", "$BC$"],
      answer: "$AB$",
      explain:
        "Both triangles start at the apex $A$. The small one runs $A$ to $D$; the large one runs $A$ all the way to $B$. $DB$ is only the part left over, and using it is the mismatch that turns a correct method into a lost mark.",
    },
    {
      type: "p",
      md:
        `With $AD = ${fmt(N.nested.ad)}$ cm and $DB = ${fmt(N.nested.db)}$ cm, the whole side is $AB = ${fmt(N.nested.ad)} + ${fmt(N.nested.db)} = ${fmt(N.nested.ab)}$ cm. So $k = ${fmt(N.nested.ab)} \\div ${fmt(N.nested.ad)} = ${fmt(N.nested.k)}$, and every length of the big triangle is ${fmt(N.nested.k)} times its partner in the small one. Pairing $AD$ with $DB$ instead would have given $${fmt(N.nested.db)} \\div ${fmt(N.nested.ad)} = ${fmt(N.nested.db / N.nested.ad)}$, and every answer after it would be out.`,
    },
    {
      type: "gate",
      id: "g8",
      kind: "number",
      prompt: `Same triangle, $k = ${fmt(N.nested.k)}$. If $DE = ${fmt(N.nested.de)}$ cm, how long is $BC$, in cm?`,
      answer: fmt(N.nested.bc),
      explain:
        `$BC = ${fmt(N.nested.de)} \\times ${fmt(N.nested.k)} = ${fmt(N.nested.bc)}$ cm. $DE$ and $BC$ are corresponding sides — the parallel one at the top and the parallel one at the bottom — so the plain length scale factor is all you need.`,
    },

    { type: "h", text: "Areas to volumes: the full chain" },
    {
      type: "figure",
      alt:
        "Two similar cylinders, a small one labelled C with height h and a larger one labelled D with height H. Beside them three stacked boxes, joined by downward arrows, show the chain: the ratio of curved surface areas is 4 to 25, given; the ratio of heights is 2 to 5, found by taking the square root of each part; the ratio of volumes is 8 to 125, found by cubing each part of the height ratio. A caption warns against jumping from areas straight to volumes without landing on the lengths first.",
      svg: figCylinderChain({ ...N.figChain, f: fmt }),
      caption: "Areas to lengths by a square root, lengths to volumes by a cube.",
    },
    {
      type: "p",
      md:
        "The A-grade question gives you a ratio of **areas** and wants a ratio of **volumes**. There is no shortcut between them: you must land on the lengths in between. Square-root the area ratio to get the lengths, then cube the length ratio to get the volumes. Write both lines down — each one is a mark.",
    },
    {
      type: "gate",
      id: "g9",
      kind: "number",
      prompt:
        `Two similar solids have surface areas in the ratio $${fmt(N.chain.a2)} : ${fmt(N.chain.b2)}$. Their volumes are in the ratio $${fmt(N.chain.a3)} : m$. What is $m$?`,
      answer: fmt(N.chain.b3),
      explain:
        `Roots first: $\\sqrt{${fmt(N.chain.a2)}} : \\sqrt{${fmt(N.chain.b2)}} = ${fmt(N.chain.a)} : ${fmt(N.chain.b)}$. Then cube: $${fmt(N.chain.a)}^3 : ${fmt(N.chain.b)}^3 = ${fmt(N.chain.a3)} : ${fmt(N.chain.b3)}$. Two short lines, two marks.`,
    },
    {
      type: "callout",
      kind: "examiner",
      title: "Summer 2025 M8 Paper 1 Q9",
      md:
        "A ratio of areas was given and the two parts asked for the ratio of the heights and then the ratio of the volumes, one mark each. Only the stronger candidates carried on past the first part. Both marks were one operation apiece: a square root, then a cube.",
      source: "ccea-cer:maths:2025-summer:M81:Q9",
    },
    {
      type: "callout",
      kind: "examiner",
      title: "November 2025 M8 Paper 2 Q8",
      md:
        "Two areas and two heights written as $x$ and $x$ plus a number; just over a quarter reached a value for $x$. The report adds a warning worth more than the question: a few wrote the correct answer with no working at all and were given nothing, because the part said to show the working clearly.",
      source: "ccea-cer:maths:2025-november:M82:Q8",
    },
    {
      type: "gate",
      id: "g10",
      kind: "choice",
      prompt:
        "A 4-mark part says 'show your working out clearly'. You can see the answer in your head. What goes on the page?",
      options: [
        "The ratio of areas, the ratio of lengths, the equation, then the answer",
        "The answer on its own, since it is correct",
        "The answer, then a check that it works",
      ],
      answer: "The ratio of areas, the ratio of lengths, the equation, then the answer",
      explain:
        "The marks are attached to the chain, not to the number at the end. Four marks means roughly four lines; a bare answer scores nothing here, however right it is.",
    },
    {
      type: "callout",
      kind: "mustknow",
      title: "Sheet or memory?",
      md:
        "**On the Higher sheet:** nothing for this topic. The sheet stops at the prism, the trapezium, the sphere, the cone, the quadratic formula, the sine and cosine rules and $\\tfrac{1}{2}ab\\sin C$.\n" +
        "**Must be known:** length $\\times k$, area $\\times k^2$, volume $\\times k^3$; and backwards, $k = \\sqrt{\\text{area factor}}$ and $k = \\sqrt[3]{\\text{volume factor}}$. Perimeter is a length. Angles do not change.",
    },

    { type: "h", text: "In the exam" },
    {
      type: "p",
      md:
        "The wording barely changes from series to series: *A and B are similar shapes*, then two areas or a ratio of areas, and one length. **The first mark is nearly always the simplified ratio**, so write it down even if the rest stalls. **The last mark is the value on the answer line**, with the unit if none is printed. Where a part says *show that*, the printed result is not your answer — the chain above it is.",
    },
    {
      type: "gate",
      id: "g11",
      kind: "choice",
      prompt: "A question gives areas in cm² and asks for a volume. Which chain is right?",
      options: [
        "area ratio → square root → length ratio → cube → volume ratio",
        "area ratio → cube → volume ratio",
        "area ratio → square → volume ratio",
      ],
      answer: "area ratio → square root → length ratio → cube → volume ratio",
      explain:
        "You can only move between area and volume through the lengths. Root down to $k$, then cube up. Missing the middle step is exactly what separated the stronger candidates in Summer 2025.",
    },
    {
      type: "p",
      md:
        "If you stall, write the ratio of the two areas and simplify it. That is a mark on its own in every scheme for this topic, and the November 2025 report says it was the mark most candidates did get. Then take one more line and square-root it.",
    },
    {
      type: "callout",
      kind: "notonspec",
      title: "Not on this spec",
      md:
        "Similar **3-D** solids in their own right — surface areas and volumes of similar solids including the frustum of a cone — are a separate statement, M8-GM-05, with their own topic. Here the solids only appear through M7-GM-04: what an enlargement does to a volume. You will not be asked to write a formal similarity proof with SSS or SAS criteria, and there is no such thing as a scale factor for an angle.",
    },
    { type: "prompt", promptId: `rp.${TOPIC}.01` },
    { type: "prompt", promptId: `rp.${TOPIC}.03` },
    { type: "prompt", promptId: `rp.${TOPIC}.05` },
    { type: "prompt", promptId: `rp.${TOPIC}.09` },
  ];
}
