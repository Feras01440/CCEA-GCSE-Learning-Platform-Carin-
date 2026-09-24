/** Questions for maths.m7.changing-the-subject-harder-formulae. */
import { TOPIC, SPEC, M7P1, M7P2, M8P1, M8P2 } from "./data-a.mjs";

const uri = (svg) => `data:image/svg+xml;utf8,${svg.replace(/#/g, "%23").replace(/\s{2,}/g, " ").trim()}`;

const NOTE_NOT_ACCURATE =
  "<g fill='currentColor' fill-opacity='0.8' font-family='system-ui,sans-serif' font-size='10.5'><text x='X' y='16' text-anchor='end'>diagram not drawn</text><text x='X' y='28' text-anchor='end'>accurately</text></g>";

const FIG_TRIANGLE = {
  kind: "svg",
  src: uri(
    "<svg viewBox='0 0 280 210' xmlns='http://www.w3.org/2000/svg' width='280' height='210'>" +
      "<g fill='none' stroke='currentColor' stroke-width='1.8' stroke-linejoin='round'><path d='M40 170 L40 45 L230 170 Z'/></g>" +
      "<g fill='none' stroke='currentColor' stroke-width='1.3'><path d='M40 152 H58 V170'/></g>" +
      "<g fill='currentColor' font-family='system-ui,sans-serif' font-size='15' font-style='italic'><text x='30' y='112' text-anchor='end'>a</text><text x='135' y='192' text-anchor='middle'>b</text><text x='152' y='100' text-anchor='start'>c</text></g>" +
      NOTE_NOT_ACCURATE.replace(/X/g, "272") +
      "</svg>",
  ),
  alt: "A right-angled triangle. The right angle is at the bottom left. The vertical side is labelled a, the horizontal base is labelled b and the sloping side opposite the right angle is labelled c. The diagram is not drawn accurately.",
};

const FIG_CYLINDER = {
  kind: "svg",
  src: uri(
    "<svg viewBox='0 0 262 250' xmlns='http://www.w3.org/2000/svg' width='262' height='250'>" +
      "<g fill='none' stroke='currentColor' stroke-width='1.7'><ellipse cx='110' cy='54' rx='70' ry='22'/><path d='M40 54 V182'/><path d='M180 54 V182'/><path d='M40 182 A70 22 0 0 0 180 182'/></g>" +
      "<g fill='none' stroke='currentColor' stroke-width='1.1' stroke-dasharray='5 4'><path d='M40 182 A70 22 0 0 1 180 182'/><path d='M110 54 H180'/></g>" +
      "<g fill='currentColor'><circle cx='110' cy='54' r='2.6'/></g>" +
      "<g fill='none' stroke='currentColor' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'><path d='M212 54 V182'/><path d='M206 62 L212 54 L218 62'/><path d='M206 174 L212 182 L218 174'/></g>" +
      "<g fill='currentColor' font-family='system-ui,sans-serif' font-size='15' font-style='italic'><text x='146' y='48' text-anchor='middle'>r</text><text x='226' y='122' text-anchor='start'>h</text></g>" +
      NOTE_NOT_ACCURATE.replace(/X/g, "254") +
      "</svg>",
  ),
  alt: "A solid cylinder standing on its circular base. A dashed line from the centre of the top circle to its edge is labelled r, and a double-headed arrow beside the cylinder marks its height h. The diagram is not drawn accurately.",
};

const FIG_PENDULUM = {
  kind: "svg",
  src: uri(
    "<svg viewBox='0 0 262 232' xmlns='http://www.w3.org/2000/svg' width='262' height='232'>" +
      "<g fill='none' stroke='currentColor' stroke-width='1.8'><path d='M50 34 H212'/></g>" +
      "<g fill='none' stroke='currentColor' stroke-width='1' stroke-opacity='0.7'><path d='M58 34 L48 24'/><path d='M78 34 L68 24'/><path d='M98 34 L88 24'/><path d='M118 34 L108 24'/><path d='M138 34 L128 24'/><path d='M158 34 L148 24'/><path d='M178 34 L168 24'/><path d='M198 34 L188 24'/></g>" +
      "<g fill='none' stroke='currentColor' stroke-width='1.5'><path d='M130 34 L181 162'/></g>" +
      "<g fill='currentColor'><circle cx='184' cy='170' r='11'/><circle cx='130' cy='34' r='3'/></g>" +
      "<g fill='none' stroke='currentColor' stroke-width='1.1' stroke-dasharray='5 4'><path d='M130 34 V180'/><path d='M79 162 Q130 206 181 162'/></g>" +
      "<g fill='currentColor' font-family='system-ui,sans-serif' font-size='15' font-style='italic'><text x='152' y='106' text-anchor='end'>L</text></g>" +
      "<g fill='currentColor' fill-opacity='0.85' font-family='system-ui,sans-serif' font-size='11'><text x='131' y='224' text-anchor='middle'>one full swing takes T seconds</text></g>" +
      "</svg>",
  ),
  alt: "A pendulum hanging from a fixed point on a hatched ceiling. The string, labelled L, is drawn swung out to the right with a round bob at its end, and a dashed arc shows the path of the swing. One full swing takes T seconds.",
};

const alg = (latex, variables) => ({ kind: "algebraic", latex, equivalence: "equivalent", variables });
const num = (value, tolerance, unit) => ({
  kind: "numeric",
  value,
  tolerance,
  ...(unit ? { unit, unitRequired: false } : { unitRequired: false }),
  acceptForms: ["decimal", "fraction"],
});
const err = (misconception, pattern, feedback, marksTypicallyEarned, source) => ({
  misconception,
  pattern,
  feedback,
  marksTypicallyEarned,
  ...(source ? { source } : {}),
});
const ea = (latex) => ({ kind: "algebraic", latex });
const et = (regex) => ({ kind: "text", regex });
const mp = (id, code, marks, forText, extra = {}) => ({ id, code, marks, for: forText, ...extra });

let seq = 0;
const build = (o) => {
  seq += 1;
  const id = `q.${TOPIC}.${String(seq).padStart(4, "0")}`;
  const totalMarks = o.parts.reduce((n, p) => n + p.marks, 0);
  return {
    id,
    topic: TOPIC,
    specRefs: SPEC,
    paper: o.paper,
    tier: "H",
    style: o.style,
    difficulty: o.difficulty,
    ao: o.ao ?? ["AO1"],
    commandWords: o.commandWords,
    emphasis: o.emphasis,
    context: { setting: o.setting, original: true },
    figures: o.figures ?? [],
    parts: o.parts,
    totalMarks,
    timeAllowanceSec: totalMarks * 90,
    skeleton: o.skeleton,
    examinerSources: o.examinerSources,
    ...(o.solutionProgram ? { solutionProgram: o.solutionProgram } : {}),
    verification: `ver.${id}`,
    version: 1,
  };
};

const single = (o) =>
  build({
    ...o,
    parts: [
      {
        id: "main",
        stem: o.stem,
        marks: o.marks,
        answer: o.answer,
        scheme: o.scheme,
        hints: o.hints,
        workedSolution: o.workedSolution,
        commonErrors: o.commonErrors,
        requiresWorking: o.requiresWorking ?? true,
      },
    ],
    skeleton: `(main)${o.verb}${o.marks}`,
  });

export const questions = [
  // ---------------- ladder A: undo the chain in reverse order ----------------
  single({
    paper: M7P1,
    style: "practice",
    difficulty: 1,
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "Pure algebra, no context",
    verb: "make-the-subject",
    marks: 2,
    stem: "$y = 5x - 8$\n\nMake $x$ the subject of the formula.",
    answer: alg("x=\\frac{y+8}{5}", ["x", "y"]),
    scheme: [
      mp("MA1", "MA", 1, "$y + 8 = 5x$, or $5x = y + 8$"),
      mp("A1", "A", 1, "$x = \\dfrac{y+8}{5}$", { accept: ["(y+8)/5", "0.2y + 1.6"], dependsOn: ["MA1"] }),
    ],
    hints: [
      "What is the last thing done to $x$ when you work $y$ out? Undo that first.",
      "Add 8 to both sides before you divide by anything.",
      "The whole of $y + 8$ goes over the 5, so keep it together.",
    ],
    workedSolution:
      "The chain on $x$ is: multiply by 5, then subtract 8. Undo it backwards. Add 8 to both sides: $y + 8 = 5x$. Divide both sides by 5: $x = \\dfrac{y+8}{5}$. Check with $x = 4$: $y = 12$, and $\\dfrac{12+8}{5} = 4$.",
    commonErrors: [
      err(
        "maths.subject.sign-lost-moving-term",
        ea("x=\\frac{y-8}{5}"),
        "The 8 kept its sign as it crossed the equals sign. It is being subtracted on the right, so it is added on the left: $y + 8 = 5x$. Substituting $x = 4$ into both versions would have shown this in ten seconds.",
        0,
        "ccea-cer:maths:2023-summer:M72:Q10",
      ),
      err(
        "maths.subject.inverse-out-of-order",
        ea("x=\\frac{y}{5}+8"),
        "The division by 5 happened before the 8 was moved, so only part of the left-hand side got divided. Undo the $-8$ first, then divide the whole of $y + 8$ by 5.",
        0,
        "ccea-cer:maths:2024-november:M81:Q9",
      ),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M81:Q9"],
    solutionProgram: "y = 5x - 8 => y + 8 = 5x => x = (y+8)/5; check x=4: y=12, (12+8)/5 = 4",
  }),
  single({
    paper: M7P1,
    style: "practice",
    difficulty: 1,
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "Pure algebra, no context",
    verb: "make-the-subject",
    marks: 2,
    stem: "$y = \\dfrac{x}{3} + 4$\n\nMake $x$ the subject of the formula.",
    answer: alg("x=3(y-4)", ["x", "y"]),
    scheme: [
      mp("MA1", "MA", 1, "$y - 4 = \\dfrac{x}{3}$"),
      mp("A1", "A", 1, "$x = 3(y-4)$ or $x = 3y - 12$", { accept: ["3y-12"], dependsOn: ["MA1"] }),
    ],
    hints: [
      "The $+4$ is outside the fraction, so it comes off first.",
      "Then multiply both sides by 3 — all of the left-hand side, not just part of it.",
      "$3(y-4)$ and $3y - 12$ are the same answer.",
    ],
    workedSolution:
      "Subtract 4 from both sides: $y - 4 = \\dfrac{x}{3}$. Multiply both sides by 3: $3(y-4) = x$, so $x = 3y - 12$. Check with $x = 9$: $y = 7$, and $3(7-4) = 9$.",
    commonErrors: [
      err(
        "maths.subject.denominator-not-cleared",
        ea("x=3y-4"),
        "Multiplying by 3 has to reach every term on that side. $3(y-4)$ is $3y - 12$, not $3y - 4$. Writing the bracket first is the safest habit.",
        1,
      ),
      err(
        "maths.subject.inverse-out-of-order",
        ea("x=\\frac{y-4}{3}"),
        "$x$ is being divided by 3 in the formula, so it is undone by multiplying, not by dividing again. Reading the chain forwards first — divide by 3, then add 4 — makes the reverse obvious.",
        1,
      ),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M81:Q9"],
    solutionProgram: "y = x/3 + 4 => y - 4 = x/3 => x = 3(y-4) = 3y - 12; check x=9: y=7, 3(7-4)=9",
  }),
  single({
    paper: M7P1,
    style: "practice",
    difficulty: 2,
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "Pure algebra, no context",
    verb: "make-the-subject",
    marks: 2,
    stem: "$y = \\dfrac{x - 6}{7}$\n\nMake $x$ the subject of the formula.",
    answer: alg("x=7y+6", ["x", "y"]),
    scheme: [
      mp("MA1", "MA", 1, "$7y = x - 6$"),
      mp("A1", "A", 1, "$x = 7y + 6$", { dependsOn: ["MA1"] }),
    ],
    hints: [
      "The whole of $x - 6$ is being divided by 7, so multiply both sides by 7 first.",
      "That gives $7y = x - 6$.",
      "Now add 6 to both sides.",
    ],
    workedSolution:
      "Multiply both sides by 7: $7y = x - 6$. Add 6 to both sides: $x = 7y + 6$. Check with $x = 20$: $y = 2$, and $7(2) + 6 = 20$.",
    commonErrors: [
      err(
        "maths.subject.inverse-out-of-order",
        ea("x=7(y+6)"),
        "The 6 was added before the fraction had been cleared, so it got multiplied by 7 as well. Clear the denominator first: $7y = x - 6$, then add 6.",
        1,
      ),
      err(
        "maths.subject.sign-lost-moving-term",
        ea("x=7y-6"),
        "The 6 is subtracted on the right, so it is added when it crosses over. Try $x = 20$ in each version and only one gives $y = 2$.",
        1,
        "ccea-cer:maths:2023-summer:M72:Q10",
      ),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M72:Q10"],
    solutionProgram: "y = (x-6)/7 => 7y = x - 6 => x = 7y + 6; check x=20: y=2, 7(2)+6=20",
  }),

  // ---------------- ladder B: powers and roots ----------------
  single({
    paper: M7P1,
    style: "practice",
    difficulty: 2,
    commandWords: ["Make the subject"],
    emphasis: ["positive", "the subject"],
    setting: "Pure algebra, no context",
    verb: "make-the-subject",
    marks: 2,
    stem: "$y = x^2 - 11$, where $x$ is positive.\n\nMake $x$ the subject of the formula.",
    answer: alg("x=\\sqrt{y+11}", ["x", "y"]),
    scheme: [
      mp("MA1", "MA", 1, "$x^2 = y + 11$"),
      mp("A1", "A", 1, "$x = \\sqrt{y+11}$ (negative root correctly rejected)", { dependsOn: ["MA1"] }),
    ],
    hints: [
      "Get $x^2$ on its own before you touch the square.",
      "$x^2 = y + 11$.",
      "Root the whole of $y + 11$, and the stem has already told you which sign to keep.",
    ],
    workedSolution:
      "Add 11 to both sides: $x^2 = y + 11$. Now the square is alone, so root the whole side: $x = \\sqrt{y + 11}$. The stem says $x$ is positive, so the negative root is rejected. Check with $x = 5$: $y = 14$, and $\\sqrt{14 + 11} = 5$.",
    commonErrors: [
      err(
        "maths.subject.root-before-isolating",
        ea("x=\\sqrt{y}+11"),
        "The root went on before the 11 had been moved, so it covers only part of the side. Isolate $x^2$ first, then root everything that is left. This is the slip the November 2024 M7 report describes.",
        0,
        "ccea-cer:maths:2024-november:M71:Q17",
      ),
      err(
        "maths.subject.power-undone-by-dividing",
        ea("x=\\frac{y+11}{2}"),
        "A square is undone by a square root, not by halving. Halving 25 gives 12.5, but $\\sqrt{25}$ is 5.",
        1,
      ),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M71:Q17"],
    solutionProgram: "y = x^2 - 11 => x^2 = y + 11 => x = sqrt(y+11); check x=5: y=14, sqrt(25)=5",
  }),
  single({
    paper: M7P2,
    style: "practice",
    difficulty: 2,
    ao: ["AO1", "AO2"],
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "The area of a circle, the formula named in the M7-NA-07 Teacher Guidance",
    verb: "make-the-subject",
    marks: 2,
    stem: "The area of a circle is $A = \\pi r^2$.\n\nMake $r$ the subject of the formula.",
    answer: alg("r=\\sqrt{\\frac{A}{\\pi}}", ["r", "A"]),
    scheme: [
      mp("MA1", "MA", 1, "$r^2 = \\dfrac{A}{\\pi}$"),
      mp("A1", "A", 1, "$r = \\sqrt{\\dfrac{A}{\\pi}}$ (negative root rejected as $r$ is a radius)", { dependsOn: ["MA1"] }),
    ],
    hints: [
      "Divide both sides by $\\pi$ before rooting anything.",
      "That leaves $r^2$ on its own.",
      "The root goes over the whole fraction, and a radius cannot be negative.",
    ],
    workedSolution:
      "Divide both sides by $\\pi$: $\\dfrac{A}{\\pi} = r^2$. Root the whole of that side: $r = \\sqrt{\\dfrac{A}{\\pi}}$, positive because $r$ is a radius. Check with $r = 3$: $A = 9\\pi$, and $\\sqrt{\\dfrac{9\\pi}{\\pi}} = 3$.",
    commonErrors: [
      err(
        "maths.subject.root-before-isolating",
        ea("r=\\frac{\\sqrt{A}}{\\pi}"),
        "The root was taken before the division by $\\pi$, so $\\pi$ escaped it. Divide first, then root the whole fraction: $\\sqrt{\\dfrac{A}{\\pi}}$.",
        0,
        "ccea-cer:maths:2024-november:M71:Q17",
      ),
      err(
        "maths.subject.power-undone-by-dividing",
        ea("r=\\frac{A}{2\\pi}"),
        "That is the formula for a circumference rearranged, not an area. The square on $r$ has to be undone by a square root.",
        0,
      ),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M71:Q17"],
    solutionProgram: "A = pi r^2 => r^2 = A/pi => r = sqrt(A/pi); check r=3: A=9pi, sqrt(9pi/pi)=3",
  }),
  single({
    paper: M7P1,
    style: "practice",
    difficulty: 3,
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "Pure algebra, no context",
    verb: "make-the-subject",
    marks: 3,
    stem: "$y = \\sqrt{2x - 1}$\n\nMake $x$ the subject of the formula.",
    answer: alg("x=\\frac{y^2+1}{2}", ["x", "y"]),
    scheme: [
      mp("MA1", "MA", 1, "$y^2 = 2x - 1$"),
      mp("MA2", "MA", 1, "$y^2 + 1 = 2x$"),
      mp("MA3", "MA", 1, "$x = \\dfrac{y^2+1}{2}$", { accept: ["0.5y^2 + 0.5"] }),
    ],
    hints: [
      "The root is the outermost operation, so square both sides first.",
      "Squaring both sides gives $y^2 = 2x - 1$.",
      "Add 1, then divide the whole of $y^2 + 1$ by 2.",
    ],
    workedSolution:
      "Square both sides: $y^2 = 2x - 1$. Add 1: $y^2 + 1 = 2x$. Divide by 2: $x = \\dfrac{y^2+1}{2}$. Check with $x = 13$: $y = \\sqrt{25} = 5$, and $\\dfrac{25+1}{2} = 13$.",
    commonErrors: [
      err(
        "maths.subject.sign-lost-moving-term",
        ea("x=\\frac{y^2-1}{2}"),
        "The 1 is subtracted inside the root, so it is added once the root has gone. Substituting $x = 13$ gives $y = 5$, and this version returns 12 rather than 13.",
        2,
        "ccea-cer:maths:2023-summer:M72:Q10",
      ),
      err(
        "maths.subject.root-before-isolating",
        ea("x=\\sqrt{\\frac{y+1}{2}}"),
        "The root has been moved to the other side instead of removed. Squaring both sides is what clears it: $y^2 = 2x - 1$.",
        0,
        "ccea-cer:maths:2024-november:M71:Q17",
      ),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M71:Q17", "ccea-cer:maths:2023-summer:M72:Q10"],
    solutionProgram: "y = sqrt(2x-1) => y^2 = 2x-1 => 2x = y^2+1 => x = (y^2+1)/2; check x=13: y=5, (25+1)/2 = 13",
  }),
  single({
    paper: M7P2,
    style: "practice",
    difficulty: 3,
    ao: ["AO1", "AO2"],
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "Pythagoras' theorem in a right-angled triangle",
    figures: [FIG_TRIANGLE],
    verb: "make-the-subject",
    marks: 2,
    stem: "The diagram shows a right-angled triangle, so $c^2 = a^2 + b^2$, and $b$ is a length.\n\nMake $b$ the subject of the formula.",
    answer: alg("b=\\sqrt{c^2-a^2}", ["b", "a", "c"]),
    scheme: [
      mp("MA1", "MA", 1, "$b^2 = c^2 - a^2$"),
      mp("A1", "A", 1, "$b = \\sqrt{c^2 - a^2}$ (negative root rejected as $b$ is a length)", { dependsOn: ["MA1"] }),
    ],
    hints: [
      "Get $b^2$ by itself first by subtracting $a^2$ from both sides.",
      "$b^2 = c^2 - a^2$.",
      "Root the whole of $c^2 - a^2$ in one go — it does not break into two roots.",
    ],
    workedSolution:
      "Subtract $a^2$ from both sides: $b^2 = c^2 - a^2$. Root the whole of that side: $b = \\sqrt{c^2 - a^2}$, positive because $b$ is a length. Check with $a = 8$ and $c = 17$: $b = \\sqrt{289 - 64} = \\sqrt{225} = 15$, and $8^2 + 15^2 = 289 = 17^2$.",
    commonErrors: [
      err(
        "maths.subject.root-applied-termwise",
        ea("b=c-a"),
        "The root has been shared out over the two terms. With $a = 8$ and $c = 17$ that gives 9, but the third side is 15. $\\sqrt{c^2 - a^2}$ cannot be simplified to $c - a$.",
        0,
      ),
      err(
        "maths.subject.sign-lost-moving-term",
        ea("b=\\sqrt{c^2+a^2}"),
        "$a^2$ is added on the right, so it is subtracted when it crosses. As written this makes $b$ the longest side, which the diagram rules out.",
        0,
      ),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M71:Q17"],
    solutionProgram: "c^2 = a^2 + b^2 => b^2 = c^2 - a^2 => b = sqrt(c^2 - a^2); check a=8,c=17: b=15, 64+225=289",
  }),

  // ---------------- ladder C: the subject appears twice ----------------
  single({
    paper: M8P1,
    style: "practice",
    difficulty: 2,
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "Pure algebra, no context",
    verb: "make-the-subject",
    marks: 2,
    stem: "$6x = 2x + w$\n\nMake $x$ the subject of the formula.",
    answer: alg("x=\\frac{w}{4}", ["x", "w"]),
    scheme: [
      mp("MA1", "MA", 1, "$6x - 2x = w$, or $4x = w$"),
      mp("A1", "A", 1, "$x = \\dfrac{w}{4}$", { accept: ["0.25w", "w/4"], dependsOn: ["MA1"] }),
    ],
    hints: [
      "$x$ is on both sides, so gather the two $x$ terms first.",
      "$6x - 2x = 4x$.",
      "Now divide both sides by 4.",
    ],
    workedSolution:
      "Subtract $2x$ from both sides: $4x = w$. Divide by 4: $x = \\dfrac{w}{4}$. Here the collecting leaves a plain number in front of $x$, so no bracket is needed. Check with $x = 5$: $w = 30 - 10 = 20$, and $\\dfrac{20}{4} = 5$.",
    commonErrors: [
      err(
        "maths.subject.subject-appears-twice-not-collected",
        ea("x=\\frac{w}{6}"),
        "Dividing by 6 before collecting ignores the $2x$ on the right. Take it across first: $6x - 2x = 4x$, so the division at the end is by 4, not by 6.",
        0,
        "ccea-cer:maths:2025-summer:M82:Q6",
      ),
      err(
        "maths.subject.sign-lost-moving-term",
        ea("x=\\frac{w}{8}"),
        "The $2x$ was added instead of subtracted. It is positive on the right, so it becomes negative when it crosses: $6x - 2x = 4x$.",
        1,
      ),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M82:Q6"],
    solutionProgram: "6x = 2x + w => 4x = w => x = w/4; check x=5: 30 = 10 + 20",
  }),
  build({
    paper: M7P2,
    style: "practice",
    difficulty: 3,
    commandWords: ["Write down", "Make the subject"],
    emphasis: ["factorised", "the subject"],
    setting: "Pure algebra, no context; the factorised line is asked for separately so the middle mark is visible",
    skeleton: "(a)write-down1|(b)make-the-subject2",
    examinerSources: ["ccea-cer:maths:2025-summer:M72:Q13", "ccea-cer:maths:2025-summer:M82:Q6"],
    solutionProgram: "9x - c = cx + 4 => 9x - cx = 4 + c => x(9-c) = 4+c => x = (4+c)/(9-c); check c=1: x=5/8, 9(5/8)-1 = 4.625 and 1(5/8)+4 = 4.625",
    parts: [
      {
        id: "a",
        stem: "$9x - c = cx + 4$\n\nWrite down the line of working in which the $x$ terms have been collected and $x$ has been factorised out.",
        marks: 1,
        answer: {
          kind: "text",
          accepted: ["x(9 - c) = 4 + c", "x(9-c) = 4+c", "(9 - c)x = 4 + c", "x(9 - c) = c + 4"],
          keyWords: [
            { any: ["x 9 - c", "x 9-c", "x9 - c", "x9-c", "9 - c x", "9-c x"], marks: 1 },
            { any: ["4 + c", "c + 4", "4+c", "c+4"], marks: 1 },
          ],
          listingRule: false,
        },
        scheme: [mp("MA1", "MA", 1, "$x(9-c) = 4+c$ or $(9-c)x = c+4$")],
        hints: [
          "First move every term containing $x$ to the left and everything else to the right.",
          "That gives $9x - cx = 4 + c$.",
          "Now take $x$ outside a bracket.",
        ],
        workedSolution:
          "Collecting gives $9x - cx = 4 + c$. Each term on the left contains $x$, so it comes out of both: $x(9-c) = 4+c$. Expanding the bracket in your head returns $9x - cx$, so nothing has changed in value.",
        commonErrors: [
          err(
            "maths.subject.not-factorised-after-collecting",
            et("9\\s*x\\s*-\\s*c\\s*x"),
            "The terms are collected, which is the first mark, but the $x$ has not been taken outside a bracket yet. That factorised line is the second mark, and it is the one the summer 2025 report says most scripts never reached.",
            0,
            "ccea-cer:maths:2025-summer:M72:Q13",
          ),
          err(
            "maths.subject.sign-lost-moving-term",
            et("9\\s*\\+\\s*c"),
            "The $cx$ is positive on the right, so it becomes negative when it moves: the bracket is $(9 - c)$, not $(9 + c)$.",
            0,
          ),
        ],
        requiresWorking: false,
      },
      {
        id: "b",
        stem: "Make $x$ the subject of the formula.",
        marks: 2,
        answer: alg("x=\\frac{4+c}{9-c}", ["x", "c"]),
        scheme: [
          mp("MA1", "MA", 1, "divides both sides by the whole bracket $(9-c)$"),
          mp("A1", "A", 1, "$x = \\dfrac{4+c}{9-c}$", { accept: ["(c+4)/(9-c)", "(-4-c)/(c-9)"], dependsOn: ["MA1"] }),
        ],
        hints: [
          "Start from your factorised line.",
          "The bracket is a single factor, so it moves underneath in one piece.",
          "$x = \\dfrac{4+c}{9-c}$.",
        ],
        workedSolution:
          "From $x(9-c) = 4+c$, divide both sides by $(9-c)$: $x = \\dfrac{4+c}{9-c}$. Check with $c = 1$: $x = \\dfrac{5}{8}$, and $9\\left(\\dfrac{5}{8}\\right) - 1 = 4.625$ while $1\\left(\\dfrac{5}{8}\\right) + 4 = 4.625$.",
        commonErrors: [
          err(
            "maths.subject.divide-by-only-one-term",
            ea("x=\\frac{4+c}{9}"),
            "Only the 9 was divided out, so the $-cx$ was left behind. The bracket $(9-c)$ is one factor and the whole of it goes underneath.",
            0,
            "ccea-cer:maths:2025-summer:M82:Q6",
          ),
          err(
            "maths.subject.sign-lost-moving-term",
            ea("x=\\frac{4-c}{9-c}"),
            "The $c$ on the left is subtracted, so it becomes $+c$ on the right. Only the numerator is affected; the bracket underneath is right.",
            1,
          ),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  single({
    paper: M8P1,
    style: "practice",
    difficulty: 4,
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "Pure algebra, no context",
    verb: "make-the-subject",
    marks: 3,
    stem: "$ax + 3 = 5x - b$\n\nMake $x$ the subject of the formula.",
    answer: alg("x=\\frac{b+3}{5-a}", ["x", "a", "b"]),
    scheme: [
      mp("MA1", "MA", 1, "$b + 3 = 5x - ax$ or $ax - 5x = -b - 3$"),
      mp("MA2", "MA", 1, "$b + 3 = x(5-a)$ or $x(a-5) = -b-3$"),
      mp("MA3", "MA", 1, "$x = \\dfrac{b+3}{5-a}$", { accept: ["(-b-3)/(a-5)", "(3+b)/(5-a)"] }),
    ],
    hints: [
      "Both $x$ terms move to one side; choosing the side with $5x$ keeps the bracket positive.",
      "$b + 3 = 5x - ax$.",
      "Factorise $x$ out, then divide by the whole bracket.",
    ],
    workedSolution:
      "Move $ax$ right and $-b$ left: $b + 3 = 5x - ax$. Factorise: $b + 3 = x(5-a)$. Divide by $(5-a)$: $x = \\dfrac{b+3}{5-a}$. Check with $a = 2$ and $b = 7$: $x = \\dfrac{10}{3}$, and $2\\left(\\dfrac{10}{3}\\right) + 3 = \\dfrac{29}{3}$ while $5\\left(\\dfrac{10}{3}\\right) - 7 = \\dfrac{29}{3}$.",
    commonErrors: [
      err(
        "maths.subject.sign-lost-moving-term",
        ea("x=\\frac{b+3}{a-5}"),
        "The bracket is upside down in sign. Collecting on the right gives $5x - ax = x(5-a)$; collecting on the left gives $x(a-5) = -b-3$, and that minus sign has to be carried into the numerator too.",
        2,
      ),
      err(
        "maths.subject.divide-by-only-one-term",
        ea("x=\\frac{b+3}{5}"),
        "Dividing by the 5 alone leaves the $ax$ unaccounted for. The whole bracket $(5-a)$ goes underneath.",
        1,
        "ccea-cer:maths:2025-summer:M82:Q6",
      ),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M72:Q13"],
    solutionProgram: "ax + 3 = 5x - b => b + 3 = 5x - ax = x(5-a) => x = (b+3)/(5-a); check a=2,b=7: x=10/3, both sides 29/3",
  }),

  // ---------------- ladder D: fractions ----------------
  single({
    paper: M7P2,
    style: "practice",
    difficulty: 3,
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "Pure algebra, no context",
    verb: "make-the-subject",
    marks: 3,
    stem: "$y = \\dfrac{4}{x + 2}$\n\nMake $x$ the subject of the formula.",
    answer: alg("x=\\frac{4-2y}{y}", ["x", "y"]),
    scheme: [
      mp("MA1", "MA", 1, "$y(x+2) = 4$, or $x + 2 = \\dfrac{4}{y}$"),
      mp("MA2", "MA", 1, "$yx + 2y = 4$ or $x = \\dfrac{4}{y} - 2$"),
      mp("MA3", "MA", 1, "$x = \\dfrac{4-2y}{y}$ or equivalent", { accept: ["4/y - 2"] }),
    ],
    hints: [
      "The subject is underneath, so clear the denominator first.",
      "Multiplying both sides by $(x+2)$ gives $y(x+2) = 4$.",
      "Either expand and collect, or divide both sides by $y$ and then subtract 2.",
    ],
    workedSolution:
      "Multiply both sides by $(x+2)$: $y(x+2) = 4$. Divide by $y$: $x + 2 = \\dfrac{4}{y}$. Subtract 2: $x = \\dfrac{4}{y} - 2 = \\dfrac{4-2y}{y}$. Check with $y = 0.5$: $x = \\dfrac{4-1}{0.5} = 6$, and $\\dfrac{4}{6+2} = 0.5$.",
    commonErrors: [
      err(
        "maths.subject.sign-lost-moving-term",
        ea("x=\\frac{4}{y}+2"),
        "The 2 is added to $x$ inside the denominator, so it is subtracted when it comes out. Testing $y = 0.5$ gives 10 here, but the formula needs 6.",
        2,
      ),
      err(
        "maths.subject.denominator-not-cleared",
        ea("x=4y-2"),
        "The 4 has been multiplied by $y$ rather than divided. Multiplying both sides by $(x+2)$ leaves $y(x+2) = 4$, so $y$ ends up underneath the 4, not beside it.",
        0,
      ),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M72:Q13"],
    solutionProgram: "y = 4/(x+2) => y(x+2) = 4 => x + 2 = 4/y => x = 4/y - 2 = (4-2y)/y; check y=0.5: x=6, 4/8 = 0.5",
  }),
  single({
    paper: M8P1,
    style: "practice",
    difficulty: 5,
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "Pure algebra, no context; the subject sits above and below the line",
    verb: "make-the-subject",
    marks: 4,
    stem: "$g = \\dfrac{h + 3}{h - 1}$\n\nMake $h$ the subject of the formula.",
    answer: alg("h=\\frac{g+3}{g-1}", ["h", "g"]),
    scheme: [
      mp("MA1", "MA", 1, "$g(h-1) = h+3$"),
      mp("MA2", "MA", 1, "$gh - g = h + 3$ and $gh - h = 3 + g$"),
      mp("MA3", "MA", 1, "$h(g-1) = g+3$"),
      mp("MA4", "MA", 1, "$h = \\dfrac{g+3}{g-1}$", { accept: ["(3+g)/(g-1)"] }),
    ],
    hints: [
      "Clear the denominator first: multiply both sides by $(h-1)$.",
      "Expand, then gather every term containing $h$ on one side.",
      "Factorise $h$ out and divide by the whole bracket.",
    ],
    workedSolution:
      "Multiply both sides by $(h-1)$: $g(h-1) = h+3$, so $gh - g = h + 3$. Collect: $gh - h = 3 + g$. Factorise: $h(g-1) = g+3$. Divide: $h = \\dfrac{g+3}{g-1}$. The rearranged formula has the same shape as the original, which is a good sign. Check with $g = 5$: $h = \\dfrac{8}{4} = 2$, and $\\dfrac{2+3}{2-1} = 5$.",
    commonErrors: [
      err(
        "maths.subject.not-factorised-after-collecting",
        et("g\\s*h\\s*-\\s*h"),
        "The collecting is done and it earns its mark, but $h$ is still in two terms. Take it outside a bracket: $h(g-1) = g+3$.",
        2,
        "ccea-cer:maths:2025-summer:M72:Q13",
      ),
      err(
        "maths.subject.sign-lost-moving-term",
        ea("h=\\frac{g+3}{g+1}"),
        "Expanding $g(h-1)$ gives $gh - g$, so the $-g$ moves right and becomes $+g$ in the numerator while the bracket underneath stays $(g-1)$. Only one sign changed; this answer changed the other one.",
        3,
      ),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M72:Q13", "ccea-cer:maths:2025-summer:M82:Q6"],
    solutionProgram: "g = (h+3)/(h-1) => gh - g = h + 3 => gh - h = 3 + g => h(g-1) = g+3 => h = (g+3)/(g-1); check g=5: h=2, (2+3)/(2-1)=5",
  }),
  single({
    paper: M7P2,
    style: "practice",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "Percentage profit on a sale, the formula named in the M7-NA-07 Teacher Guidance",
    verb: "make-the-subject",
    marks: 3,
    stem: "A shop works out its percentage profit with $P = \\dfrac{100(s - c)}{c}$, where $c$ is the cost price and $s$ is the selling price.\n\nMake $s$ the subject of the formula.",
    answer: alg("s=\\frac{c(P+100)}{100}", ["s", "P", "c"]),
    scheme: [
      mp("MA1", "MA", 1, "$Pc = 100(s-c)$ or $Pc = 100s - 100c$"),
      mp("MA2", "MA", 1, "$Pc + 100c = 100s$"),
      mp("MA3", "MA", 1, "$s = \\dfrac{c(P+100)}{100}$ or $s = \\dfrac{Pc+100c}{100}$", { accept: ["c + Pc/100", "(Pc+100c)/100"] }),
    ],
    hints: [
      "Multiply both sides by $c$ to clear the fraction.",
      "Expand the bracket so the $s$ term is free: $Pc = 100s - 100c$.",
      "Move the $100c$ across, then divide the whole side by 100.",
    ],
    workedSolution:
      "Multiply both sides by $c$: $Pc = 100(s-c) = 100s - 100c$. Add $100c$: $Pc + 100c = 100s$. Divide by 100: $s = \\dfrac{Pc+100c}{100} = \\dfrac{c(P+100)}{100}$. Check with $P = 25$ and $c = 40$: $s = \\dfrac{40 \\times 125}{100} = 50$, and $\\dfrac{100(50-40)}{40} = 25$.",
    commonErrors: [
      err(
        "maths.subject.denominator-not-cleared",
        ea("s=\\frac{P+100c}{100}"),
        "Only part of the side was multiplied by $c$. Every term has to be multiplied: $Pc = 100s - 100c$, so the numerator carries $Pc$, not $P$.",
        0,
      ),
      err(
        "maths.subject.divide-by-only-one-term",
        ea("s=\\frac{Pc}{100}"),
        "The $100c$ went missing when the 100 was divided out. Adding $100c$ to both sides before dividing keeps it in the numerator, which is where the $c(P+100)$ comes from.",
        1,
      ),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M72:Q10"],
    solutionProgram: "P = 100(s-c)/c => Pc = 100s - 100c => 100s = Pc + 100c => s = c(P+100)/100; check P=25,c=40: s=50, 100(10)/40 = 25",
  }),

  // ---------------- exam-style ----------------
  single({
    paper: M8P2,
    style: "exam-style",
    difficulty: 4,
    commandWords: ["Make the subject"],
    emphasis: ["the subject"],
    setting: "Pure algebra, no context, in the CCEA single-line format with the answer line reading a =",
    verb: "make-the-subject",
    marks: 3,
    stem: "$4a + 9b = ab$\n\nMake $a$ the subject of the formula.",
    answer: alg("a=\\frac{9b}{b-4}", ["a", "b"]),
    scheme: [
      mp("MA1", "MA", 1, "$ab - 4a = 9b$, or $4a - ab = -9b$"),
      mp("MA2", "MA", 1, "$a(b-4) = 9b$, or $a(4-b) = -9b$"),
      mp("MA3", "MA", 1, "$a = \\dfrac{9b}{b-4}$", { accept: ["-9b/(4-b)", "9b/(-4+b)"] }),
    ],
    hints: [
      "$a$ appears in two terms, so collect those two terms on one side first.",
      "Putting them on the right keeps the bracket positive: $ab - 4a = 9b$.",
      "Factorise $a$ out, then divide by the whole bracket.",
    ],
    workedSolution:
      "Move $4a$ to the right and $9b$ to the left: $ab - 4a = 9b$. Both terms on the left contain $a$, so factorise: $a(b-4) = 9b$. Divide by $(b-4)$: $a = \\dfrac{9b}{b-4}$. Check with $b = 6$: $a = \\dfrac{54}{2} = 27$, and $4(27) + 9(6) = 162$ while $27 \\times 6 = 162$.",
    commonErrors: [
      err(
        "maths.subject.subject-appears-twice-not-collected",
        ea("a=\\frac{9b}{b}"),
        "Dividing by $b$ before collecting leaves an $a$ on each side, so nothing has been isolated. The first mark is for getting both $a$ terms onto the same side; over a third of the summer 2025 entry never did that.",
        0,
        "ccea-cer:maths:2025-summer:M82:Q6",
      ),
      err(
        "maths.subject.divide-by-only-one-term",
        ea("a=\\frac{9b}{b}-4"),
        "The bracket has been broken up. $(b-4)$ is one factor, so the whole of it goes underneath the $9b$ in a single fraction.",
        1,
        "ccea-cer:maths:2025-summer:M72:Q13",
      ),
      err(
        "maths.subject.sign-lost-moving-term",
        ea("a=\\frac{9b}{4-b}"),
        "The bracket is the right size but the wrong way round. Collecting on the right gives $ab - 4a$, which factorises to $a(b-4)$. Substituting $b = 6$ gives $-27$ here, and the formula needs $27$.",
        2,
      ),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M72:Q13", "ccea-cer:maths:2025-summer:M82:Q6"],
    solutionProgram: "4a + 9b = ab => ab - 4a = 9b => a(b-4) = 9b => a = 9b/(b-4); check b=6: a=27, 108+54=162 = 27*6",
  }),
  build({
    paper: M7P2,
    style: "exam-style",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Make the subject", "Work out"],
    emphasis: ["total surface area", "the subject", "1 decimal place"],
    setting: "A solid cylinder, with the surface-area formula given in the stem",
    figures: [FIG_CYLINDER],
    skeleton: "(a)make-the-subject3|(b)work-out2",
    examinerSources: ["ccea-cer:maths:2024-november:M81:Q9", "ccea-cer:maths:2025-summer:M72:Q13"],
    solutionProgram:
      "S = 2*pi*r^2 + 2*pi*r*h => S - 2*pi*r^2 = 2*pi*r*h => h = (S - 2*pi*r^2)/(2*pi*r); S=340, r=4: (340 - 32*pi)/(8*pi) = 9.528170162811104 => 9.5 to 1 dp",
    parts: [
      {
        id: "a",
        stem: "The total surface area of the solid cylinder in the diagram is $S = 2\\pi r^2 + 2\\pi rh$.\n\nMake $h$ the subject of the formula.",
        marks: 3,
        answer: alg("h=\\frac{S-2\\pi r^2}{2\\pi r}", ["h", "S", "r"]),
        scheme: [
          mp("MA1", "MA", 1, "$S - 2\\pi r^2 = 2\\pi rh$"),
          mp("MA2", "MA", 1, "divides both sides by $2\\pi r$"),
          mp("A1", "A", 1, "$h = \\dfrac{S - 2\\pi r^2}{2\\pi r}$", {
            accept: ["S/(2 pi r) - r"],
            dependsOn: ["MA1", "MA2"],
          }),
        ],
        hints: [
          "Only one term contains $h$, so move the other one out of the way first.",
          "$S - 2\\pi r^2 = 2\\pi rh$.",
          "Divide the whole of the left-hand side by $2\\pi r$, keeping it as one fraction.",
        ],
        workedSolution:
          "Subtract $2\\pi r^2$ from both sides: $S - 2\\pi r^2 = 2\\pi rh$. Divide both sides by $2\\pi r$: $h = \\dfrac{S - 2\\pi r^2}{2\\pi r}$. Cancelling gives the equivalent form $h = \\dfrac{S}{2\\pi r} - r$, which is also accepted.",
        commonErrors: [
          err(
            "maths.subject.divide-by-only-one-term",
            ea("h=\\frac{S}{2\\pi r}-2\\pi r^2"),
            "The $2\\pi r^2$ was taken off after the division instead of before it, so it never got divided. Subtract it first, then divide the whole numerator.",
            1,
          ),
          err(
            "maths.subject.denominator-not-cleared",
            ea("h=S-2\\pi r^2"),
            "The division by $2\\pi r$ is missing. $h$ is multiplied by $2\\pi r$ in the formula, so that factor has to come off before $h$ is alone.",
            1,
            "ccea-cer:maths:2024-november:M81:Q9",
          ),
        ],
        requiresWorking: true,
      },
      {
        id: "b",
        stem: "A cylinder has total surface area $340$ cm$^2$ and radius $4$ cm.\n\nWork out its height.\nGive your answer correct to 1 decimal place.",
        marks: 2,
        answer: num(9.5, { type: "dp", places: 1 }, "cm"),
        scheme: [
          mp("M1", "M", 1, "substitutes $S = 340$ and $r = 4$ into a rearranged formula"),
          mp("A1", "A", 1, "$9.5$ (accept $9.53$ before rounding)", { accept: ["9.5 cm"], ft: true, dependsOn: ["M1"] }),
        ],
        hints: [
          "Work out $2\\pi r^2$ first: $2\\pi \\times 16$.",
          "$340 - 100.53\\ldots = 239.46\\ldots$",
          "Divide by $2\\pi \\times 4 = 25.13\\ldots$",
        ],
        workedSolution:
          "$2\\pi(4^2) = 100.530\\ldots$, so the numerator is $340 - 100.530\\ldots = 239.469\\ldots$. The denominator is $2\\pi(4) = 25.132\\ldots$. Dividing gives $9.5281\\ldots$, which is $9.5$ cm to 1 decimal place. Keep the long decimals in the calculator and round only on the answer line.",
        commonErrors: [
          err(
            "maths.subject.divide-by-only-one-term",
            { kind: "numeric", value: 13.528, tolerance: { type: "absolute", value: 0.05 } },
            "This comes from dividing 340 by $2\\pi r$ and subtracting nothing, or subtracting after dividing. The $2\\pi r^2$ has to come off the 340 before the division.",
            1,
          ),
          err(
            "maths.subject.accuracy-not-as-demanded",
            { kind: "numeric", value: 9.528170162811104, tolerance: { type: "absolute", value: 0.0005 } },
            "The value is right; the question asked for 1 decimal place, so the answer line needs $9.5$. Full accuracy in the working, stated accuracy on the line.",
            1,
          ),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  build({
    paper: M8P2,
    style: "exam-style",
    difficulty: 5,
    ao: ["AO1", "AO2"],
    commandWords: ["Make the subject", "Work out"],
    emphasis: ["the subject", "2 decimal places"],
    setting: "A swinging pendulum, with the model formula given in the stem",
    figures: [FIG_PENDULUM],
    skeleton: "(a)make-the-subject3|(b)work-out2",
    examinerSources: ["ccea-cer:maths:2024-november:M71:Q17"],
    solutionProgram:
      "T = 2*pi*sqrt(L/g) => T/(2*pi) = sqrt(L/g) => T^2/(4*pi^2) = L/g => L = g*T^2/(4*pi^2); T=3, g=10: 90/(4*pi^2) = 2.2797266319526 => 2.28 to 2 dp",
    parts: [
      {
        id: "a",
        stem: "The time $T$ seconds for one full swing of the pendulum in the diagram is modelled by $T = 2\\pi\\sqrt{\\dfrac{L}{g}}$, where $L$ metres is the length of the string and $g$ is a constant.\n\nMake $L$ the subject of the formula.",
        marks: 3,
        answer: alg("L=\\frac{gT^2}{4\\pi^2}", ["L", "T", "g"]),
        scheme: [
          mp("MA1", "MA", 1, "$\\dfrac{T}{2\\pi} = \\sqrt{\\dfrac{L}{g}}$"),
          mp("MA2", "MA", 1, "$\\dfrac{T^2}{4\\pi^2} = \\dfrac{L}{g}$ (squares both sides correctly)"),
          mp("A1", "A", 1, "$L = \\dfrac{gT^2}{4\\pi^2}$", {
            accept: ["g T^2/(4 pi^2)", "0.25 g T^2/pi^2"],
            dependsOn: ["MA1", "MA2"],
          }),
        ],
        hints: [
          "Divide both sides by $2\\pi$ before you square anything.",
          "Squaring both sides squares the whole of each side: $\\dfrac{T^2}{4\\pi^2} = \\dfrac{L}{g}$.",
          "Now multiply both sides by $g$.",
        ],
        workedSolution:
          "Divide both sides by $2\\pi$: $\\dfrac{T}{2\\pi} = \\sqrt{\\dfrac{L}{g}}$. Square both sides, remembering that $(2\\pi)^2 = 4\\pi^2$: $\\dfrac{T^2}{4\\pi^2} = \\dfrac{L}{g}$. Multiply by $g$: $L = \\dfrac{gT^2}{4\\pi^2}$.",
        commonErrors: [
          err(
            "maths.subject.root-before-isolating",
            ea("L=\\frac{gT^2}{2\\pi}"),
            "The $2\\pi$ was divided out after the squaring, so it was never squared. Squaring $\\dfrac{T}{2\\pi}$ gives $\\dfrac{T^2}{4\\pi^2}$, not $\\dfrac{T^2}{2\\pi}$.",
            1,
            "ccea-cer:maths:2024-november:M71:Q17",
          ),
          err(
            "maths.subject.power-undone-by-dividing",
            ea("L=\\frac{gT}{4\\pi^2}"),
            "The right-hand side was squared but the $T$ was not. Squaring acts on the whole of both sides, so $T$ becomes $T^2$.",
            1,
          ),
        ],
        requiresWorking: true,
      },
      {
        id: "b",
        stem: "Work out the length of a pendulum that takes $3$ seconds for one full swing.\nTake $g = 10$.\nGive your answer in metres correct to 2 decimal places.",
        marks: 2,
        answer: num(2.28, { type: "dp", places: 2 }, "m"),
        scheme: [
          mp("M1", "M", 1, "substitutes $T = 3$ and $g = 10$ into a rearranged formula, e.g. $\\dfrac{10 \\times 9}{4\\pi^2}$"),
          mp("A1", "A", 1, "$2.28$", { accept: ["2.28 m", "2.2797..."], ft: true, dependsOn: ["M1"] }),
        ],
        hints: [
          "$T^2 = 9$.",
          "$\\dfrac{10 \\times 9}{4\\pi^2} = \\dfrac{90}{39.478\\ldots}$",
          "Round only at the end.",
        ],
        workedSolution:
          "$L = \\dfrac{10(3^2)}{4\\pi^2} = \\dfrac{90}{39.4784\\ldots} = 2.2797\\ldots$, which is $2.28$ m to 2 decimal places. A one-metre pendulum swings in about two seconds, so a little over two metres for three seconds is a sensible size.",
        commonErrors: [
          err(
            "maths.subject.power-undone-by-dividing",
            { kind: "numeric", value: 0.7599, tolerance: { type: "absolute", value: 0.005 } },
            "This comes from using $T$ rather than $T^2$. Square the 3 before dividing.",
            1,
          ),
          err(
            "maths.subject.accuracy-not-as-demanded",
            { kind: "numeric", value: 2.2797266319526, tolerance: { type: "absolute", value: 0.00005 } },
            "The value is right; 2 decimal places were asked for, so write $2.28$ on the answer line and keep the long version in your working.",
            1,
          ),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  build({
    paper: M8P2,
    style: "exam-style",
    difficulty: 5,
    commandWords: ["Show that", "Hence", "Work out"],
    emphasis: ["Show that", "Hence", "positive", "3 significant figures"],
    setting: "Pure algebra, no context; the subject appears twice and is squared",
    skeleton: "(a)show-that3|(b)work-out2",
    examinerSources: ["ccea-cer:maths:2025-summer:M82:Q6", "ccea-cer:maths:2024-november:M71:Q17"],
    solutionProgram:
      "y = 5x^2/(x^2-3) => y(x^2-3) = 5x^2 => yx^2 - 3y = 5x^2 => yx^2 - 5x^2 = 3y => x^2(y-5) = 3y => x^2 = 3y/(y-5); y=8: x^2 = 24/3 = 8, x = sqrt(8) = 2.8284271247461903 => 2.83 to 3 sf",
    parts: [
      {
        id: "a",
        stem: "$y = \\dfrac{5x^2}{x^2 - 3}$\n\nShow that $x^2 = \\dfrac{3y}{y - 5}$.",
        marks: 3,
        answer: alg("x^2=\\frac{3y}{y-5}", ["x", "y"]),
        scheme: [
          mp("MA1", "MA", 1, "$y(x^2-3) = 5x^2$, expanded to $yx^2 - 3y = 5x^2$"),
          mp("MA2", "MA", 1, "$yx^2 - 5x^2 = 3y$ (collects the $x^2$ terms)"),
          mp("MA3", "MA", 1, "$x^2(y-5) = 3y$ leading to the printed result", {
            examinerNote: "The printed result alone, with no rearrangement lines, scores nothing on a Show that.",
          }),
        ],
        hints: [
          "Multiply both sides by $(x^2-3)$ and expand.",
          "Treat $x^2$ as the thing you are making the subject, and collect the two $x^2$ terms together.",
          "Factorise $x^2$ out, then divide by the bracket.",
        ],
        workedSolution:
          "Multiply both sides by $(x^2-3)$: $y(x^2-3) = 5x^2$, so $yx^2 - 3y = 5x^2$. Collect the $x^2$ terms: $yx^2 - 5x^2 = 3y$. Factorise: $x^2(y-5) = 3y$. Divide by $(y-5)$: $x^2 = \\dfrac{3y}{y-5}$, which is the printed result. Every line is one of the three marks, so none of them can be skipped.",
        commonErrors: [
          err(
            "maths.subject.subject-appears-twice-not-collected",
            ea("x^2=\\frac{3y}{y}"),
            "Dividing by $x^2$ or by $y$ before collecting leaves an $x^2$ on both sides, so nothing has been isolated. The first mark is for clearing the denominator and the second for gathering the two $x^2$ terms; over a third of the summer 2025 entry never reached that second line.",
            0,
            "ccea-cer:maths:2025-summer:M82:Q6",
          ),
          err(
            "maths.subject.sign-lost-moving-term",
            ea("x^2=\\frac{3y}{5-y}"),
            "The bracket came out the wrong way round. Collecting on the left gives $yx^2 - 5x^2 = 3y$, which factorises to $x^2(y-5)$. Putting $y = 8$ into each version gives 8 and $-8$, and a squared quantity cannot be negative.",
            2,
          ),
          err(
            "maths.subject.not-factorised-after-collecting",
            et("y\\s*x\\^?2\\s*-\\s*5\\s*x"),
            "The collecting is done and it earns its mark. The next line takes $x^2$ outside a bracket: $x^2(y-5) = 3y$.",
            2,
            "ccea-cer:maths:2025-summer:M72:Q13",
          ),
        ],
        requiresWorking: true,
      },
      {
        id: "b",
        stem: "Hence work out the positive value of $x$ when $y = 8$.\nGive your answer correct to 3 significant figures.",
        marks: 2,
        answer: num(2.83, { type: "sf", figures: 3 }),
        scheme: [
          mp("M1", "M", 1, "$x^2 = \\dfrac{24}{3} = 8$"),
          mp("A1", "A", 1, "$2.83$ (accept $2\\sqrt{2}$)", { accept: ["2 root 2", "2.8284..."], dependsOn: ["M1"] }),
        ],
        hints: [
          "Put $y = 8$ into the result from part (a).",
          "$\\dfrac{3 \\times 8}{8-5} = \\dfrac{24}{3}$.",
          "Root it, and keep only the positive value because the question says so.",
        ],
        workedSolution:
          "$x^2 = \\dfrac{3(8)}{8-5} = \\dfrac{24}{3} = 8$, so $x = \\sqrt{8} = 2\\sqrt{2} = 2.8284\\ldots$, which is $2.83$ to 3 significant figures. Check: $\\dfrac{5 \\times 8}{8-3} = 8$, which is the $y$ you were given.",
        commonErrors: [
          err(
            "maths.subject.power-undone-by-dividing",
            { kind: "numeric", value: 4, tolerance: { type: "absolute", value: 0.001 } },
            "The 8 was halved rather than rooted. $x^2 = 8$ gives $x = \\sqrt{8}$, which is about 2.83.",
            1,
          ),
          err(
            "maths.subject.plus-minus-omitted",
            { kind: "numeric", value: -2.8284271247461903, tolerance: { type: "absolute", value: 0.005 } },
            "That is the other square root. The question asked for the positive value, so the answer line takes $2.83$.",
            1,
          ),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
];
