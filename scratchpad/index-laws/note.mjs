/**
 * note.blocks.json for maths.m7.index-laws-zero-and-negative-powers.
 * Order fixed by pipeline/prompts/author-topic.md: hook, the idea, see it, do it,
 * where marks are lost, in the exam, prompts. A gate closes every stretch of <= 150 words.
 */
import { ladderSvg, coefficientsSvg } from "./svg.mjs";

const RP = (n) => `rp.maths.m7.index-laws-zero-and-negative-powers.${n}`;

export function noteBlocks() {
  return [
    { type: "h", text: "Index laws with zero and negative powers" },
    {
      type: "p",
      md: "A power is a counting device: $2^{5}$ counts five twos multiplied together. Count zero twos and the machine seems to jam, and count *minus* three of them and it looks like nonsense. It is not. CCEA puts this on M7 Paper 1, the paper with no calculator, almost always as the last question on the paper: four one-mark parts, four seconds of thinking each, four marks that should be free. In Summer 2025 they were not free. Examiners saw $3^{0}$ answered as 3 and as 0, $5^{-1}$ answered as $-5$ and $10^{-3}$ answered as $-1000$. This page is about never losing those marks again.",
    },
    {
      type: "callout",
      kind: "spec",
      title: "The statement",
      md: "**M7-NA-02** — use index notation and index laws for zero, positive and negative powers.\nThe Teacher Guidance adds only one line: know that $10^{-1} = \\dfrac{1}{10}$, and so on.",
      source: "CCEA GCSE Mathematics specification, statement M7-NA-02 and its Teacher Guidance",
    },
    {
      type: "gate",
      id: "g1",
      kind: "number",
      prompt: "Warm-up, to show you how these work. What is $5^{2}$?",
      answer: "25",
      explain: "$5 \\times 5 = 25$. Type a number, press the button, and the page opens up. Nothing here is marked or stored against you.",
    },

    { type: "h", text: "Why the ladder does not stop at a¹" },
    {
      type: "p",
      md: "Write the powers of 3 downwards: 27, 9, 3. Each step down **divides by 3**. Nothing about that pattern says it has to stop. One more step past $3^{1}$ gives $3 \\div 3 = 1$, and that step is exactly $3^{0}$. One more gives $\\dfrac{1}{3}$, which is $3^{-1}$, then $\\dfrac{1}{9}$, which is $3^{-2}$.\nSo $a^{0}$ and $a^{-n}$ are not new rules bolted on. They are the only values that let the dividing pattern carry on, and that is the honest **because**.",
    },
    {
      type: "figure",
      alt: "A ladder of the powers of a from a cubed down to a to the power negative three, with the matching values for a equal to 3: 27, 9, 3, 1, one third, one ninth, one twenty-seventh. An arrow between each pair of rows is labelled divide by 3. The row for a to the power zero is boxed, and a note says the ladder never breaks, so a to the power zero is 1 and a to the power negative n is 1 over a to the n.",
      svg: ladderSvg(),
      caption: "Every step down divides by the base. Carry that one step past a¹ and a⁰ = 1 is forced on you.",
    },
    {
      type: "gate",
      id: "g2",
      kind: "number",
      prompt: "Carry the ladder one more step. $3^{-3} = \\dfrac{1}{\\;?\\;}$",
      answer: "27",
      explain: "$\\dfrac{1}{9} \\div 3 = \\dfrac{1}{27}$, so $3^{-3} = \\dfrac{1}{27}$. The index tells you how many threes are underneath.",
    },
    {
      type: "p",
      md: "Two rules fall straight out of the ladder, and they are the whole of this statement.\n**The zero rule.** $a^{0} = 1$ for every base except 0. Not 0, not $a$ — one.\n**The minus rule.** $a^{-n} = \\dfrac{1}{a^{n}}$. A minus sign in the index means **reciprocal**: take one over it. It does not mean a negative answer. Look down the right-hand column of the ladder — every value there is positive, and they shrink towards zero without ever reaching it.\nThat last sentence is worth reading twice, because $2^{-3} = -8$ was one of the most common answers CCEA saw in Summer 2025.",
    },
    {
      type: "gate",
      id: "g3",
      kind: "choice",
      prompt: "What is $2^{-3}$?",
      options: ["$\\dfrac{1}{8}$", "$-8$", "$-6$"],
      answer: "$\\dfrac{1}{8}$",
      explain: "The minus flips it: $2^{-3} = \\dfrac{1}{2^{3}} = \\dfrac{1}{8}$. $-8$ treats the index as a minus sign on the answer; $-6$ multiplies the base by the index instead of using it as a power.",
    },

    { type: "h", text: "The three laws, and what the number in front does" },
    {
      type: "p",
      md: "The laws do not change when the index turns negative, and they do not change when a letter turns up.\n**Multiplying** the same base: add the indices. **Dividing**: subtract them. **A power of a power**: multiply them.\nThe part that costs marks is the number in front. In $3x^{2} \\times 4x^{5}$ the 3 and the 4 are ordinary numbers doing ordinary arithmetic: $3 \\times 4 = 12$. Only the letters use the index law. Two separate jobs, never mixed — so $12x^{7}$, never $7x^{7}$ and never $12x^{10}$.",
    },
    {
      type: "figure",
      alt: "A four-column layout. Column one holds the expressions 3x squared times 4x to the fifth, 12y to the seventh divided by 3y to the fourth, and 2a cubed all cubed. Column two does the number in front: 3 times 4 is 12, 12 divided by 3 is 4, 2 cubed is 8. Column three does the letter: indices added to give x to the seventh, subtracted to give y cubed, multiplied to give a to the ninth. Column four gives the answers 12x to the seventh, 4y cubed and 8a to the ninth.",
      svg: coefficientsSvg(),
      caption: "The number column and the index column never borrow from each other. In the last line the outside power lands on the 2 as well.",
    },
    {
      type: "gate",
      id: "g4",
      kind: "blank",
      prompt: "Simplify $3x^{2} \\times 4x^{5}$. Write it as one term.",
      answer: "12x^7 | 12x⁷ | 12x7 | 12*x^7 | 12 x^7",
      explain: "$3 \\times 4 = 12$ and $2 + 5 = 7$, so $12x^{7}$. If you wrote a multiplication sign into the answer, the marker sees an unfinished expression rather than a simplified one.",
    },

    { type: "h", text: "See it" },
    {
      type: "video",
      videoId: "_K9XYyv1bU0",
      title: "Negative Indices - Corbettmaths",
      channel: "corbettmaths",
      corbettmathsNumber: 175,
      why: "Five minutes of worked negative-index examples, done by hand at exactly the pace of a Paper 1 question. Watch it once with a pen, then answer the gate underneath without scrolling back.",
    },
    {
      type: "gate",
      id: "g5",
      kind: "number",
      prompt: "Straight after the video: write $4^{-1}$ as a decimal.",
      answer: "0.25 | 1/4",
      explain: "$4^{-1} = \\dfrac{1}{4} = 0.25$. On a non-calculator paper either form scores, as long as it is exact.",
    },

    { type: "h", text: "Fractions, and powers you have to find" },
    {
      type: "p",
      md: "A negative power of a **fraction** turns the fraction upside down first, then applies the power: $\\left(\\dfrac{2}{3}\\right)^{-2} = \\left(\\dfrac{3}{2}\\right)^{2} = \\dfrac{9}{4}$. The reason is the same reciprocal rule — one over $\\dfrac{4}{9}$ is $\\dfrac{9}{4}$.\nSometimes the power is what you are looking for. To solve $2^{x} = \\dfrac{1}{8}$, write **both sides as powers of the same base**: $\\dfrac{1}{8} = \\dfrac{1}{2^{3}} = 2^{-3}$. Equal bases force equal indices, so $x = -3$.",
    },
    {
      type: "gate",
      id: "g6",
      kind: "choice",
      prompt: "What is $\\left(\\dfrac{2}{3}\\right)^{-2}$?",
      options: ["$\\dfrac{9}{4}$", "$\\dfrac{4}{9}$", "$-\\dfrac{4}{9}$"],
      answer: "$\\dfrac{9}{4}$",
      explain: "Flip, then square: $\\left(\\dfrac{3}{2}\\right)^{2} = \\dfrac{9}{4}$. $\\dfrac{4}{9}$ squared the fraction without flipping it, which is the answer to $\\left(\\dfrac{2}{3}\\right)^{2}$.",
    },
    {
      type: "gate",
      id: "g7",
      kind: "blank",
      prompt: "Solve $2^{x} = \\dfrac{1}{8}$.",
      answer: "-3 | x = -3 | x=-3 | −3",
      explain: "$\\dfrac{1}{8} = 2^{-3}$, so $x = -3$. Writing $\\dfrac{1}{8}$ as a power of 2 is the step that earns the method mark.",
    },

    { type: "h", text: "Where the marks are actually lost" },
    {
      type: "callout",
      kind: "examiner",
      title: "Summer 2025, M7 Paper 1, last question",
      md: "Four one-mark parts, and the report is a list of near misses: the zero index given as the base or as 0, a negative index turned into a negative number, $10^{-3}$ given as $-1000$, and a letter still sitting in an answer that was a plain number. Every one of those is a reading fault, not a maths fault.",
      source: "ccea-cer:maths:2025-summer:M71:Q17",
    },
    {
      type: "gate",
      id: "g8",
      kind: "choice",
      prompt: "What is the value of $3m^{0} + m^{0}$?",
      options: ["4", "2", "$3m + 1$"],
      answer: "4",
      explain: "The zero index belongs to the $m$ only, so $m^{0} = 1$ and $3m^{0} = 3 \\times 1 = 3$. Then $3 + 1 = 4$. The answer is a number, so no letter should survive to the answer line.",
    },
    {
      type: "callout",
      kind: "examiner",
      title: "Summer 2025, M8 Paper 1",
      md: "The same three values were set again on M8: index 0, index $-1$, index $-3$. Most candidates managed the zero, many managed the $-1$, and only the better ones managed the $-3$. The pattern is clear — the further the index goes below zero, the more people stop trusting the rule. Trust it: $a^{-3}$ is $\\dfrac{1}{a^{3}}$, every time.",
      source: "ccea-cer:maths:2025-summer:M81:Q8",
    },
    {
      type: "gate",
      id: "g9",
      kind: "blank",
      prompt: "Write $10^{-3}$ as a fraction.",
      answer: "1/1000 | 1 / 1000 | one thousandth | 0.001",
      explain: "$10^{3} = 1000$, so $10^{-3} = \\dfrac{1}{1000}$, which is $0.001$. Three zeros in the denominator, matching the 3 in the index.",
    },
    {
      type: "callout",
      kind: "examiner",
      title: "Summer 2025, M7 Paper 2 and M8 Paper 2",
      md: "A fill-in-the-blanks question on the index laws. The first two parts went well; the last one, where a high power was divided by a lower one, was the hardest on the paper: $d^{30} \\div d^{10}$ came back as $d^{3}$. The indices had been divided instead of subtracted. Say the law out loud before you write: **dividing means subtract**.",
      source: "ccea-cer:maths:2025-summer:M72:Q9",
    },
    {
      type: "gate",
      id: "g10",
      kind: "blank",
      prompt: "Fill in the blank: $d^{30} \\div d^{10} = d^{\\;?}$",
      answer: "20 | d^20 | d20 | d²⁰",
      explain: "$30 - 10 = 20$, so $d^{20}$. Dividing $30$ by $10$ gives the tempting $d^{3}$, and it is the single most common wrong answer CCEA reports on this topic.",
    },
    {
      type: "callout",
      kind: "examiner",
      title: "November 2025, M7 Paper 2",
      md: "Two short simplifications. Beyond the wrong powers, examiners noted answers written as a product rather than as a power — a letter with two digits beside it instead of a letter raised to a power. The value was right and the notation was not, so the mark went. Write the index as an index.",
      source: "ccea-cer:maths:2025-november:M72:Q10",
    },
    {
      type: "gate",
      id: "g11",
      kind: "choice",
      prompt: "You have worked out that $(m^{3})^{4}$ has index $3 \\times 4$. Which answer earns the mark?",
      options: ["$m^{12}$", "m12", "$m \\times 12$"],
      answer: "$m^{12}$",
      explain: "Only the first is a power. The other two read as $m$ multiplied by 12, which is a different expression entirely.",
    },
    {
      type: "callout",
      kind: "mustknow",
      title: "Sheet or memory?",
      md: "**On the formula sheet (page 2 of every M7 paper):** nothing for this topic. The sheet carries the prism and trapezium, the sphere and cone, the quadratic formula and the trigonometric rules.\n**Must be known:** $a^{0} = 1$; $a^{-n} = \\dfrac{1}{a^{n}}$; $a^{m} \\times a^{n} = a^{m+n}$; $a^{m} \\div a^{n} = a^{m-n}$; $(a^{m})^{n} = a^{mn}$; $\\left(\\dfrac{a}{b}\\right)^{-n} = \\left(\\dfrac{b}{a}\\right)^{n}$; and the first few powers of 2, 3, 5 and 10 by heart, because Paper 1 has no calculator.",
    },
    {
      type: "gate",
      id: "g12",
      kind: "choice",
      prompt: "Which of these is printed on page 2 of the M7 paper?",
      options: ["The volume of a prism", "$a^{-n} = \\dfrac{1}{a^{n}}$", "The three index laws"],
      answer: "The volume of a prism",
      explain: "Mensuration, the quadratic formula and the trigonometric rules are given. Nothing about indices is, so all of it has to be carried in.",
    },

    { type: "h", text: "In the exam" },
    {
      type: "p",
      md: "Expect **Write down the value of** with three or four one-mark parts, late on Paper 1, or **Fill in the blanks** with three one-mark parts on Paper 2. A two-mark **Simplify** is marked as a single A2: one mark if part of it is right, so always write something. The harder version gives you two index equations and asks for the two unknown powers — match the bases, write the two equations, solve them.\nWhen you are stuck, write the base as a power of a small number ($8 = 2^{3}$, $\\dfrac{1}{100} = 10^{-2}$). That one line is usually the method mark and usually shows you the rest.",
    },
    {
      type: "gate",
      id: "g13",
      kind: "blank",
      prompt: "You are asked to solve $5^{x} = \\dfrac{1}{25}$ and your mind goes blank. What do you write first?",
      answer: "1/25 = 5^-2 | 25 = 5^2 | 5^-2 | write 1/25 as a power of 5 | as a power of 5",
      explain: "Rewrite the right-hand side as a power of the same base: $\\dfrac{1}{25} = \\dfrac{1}{5^{2}} = 5^{-2}$. Then the indices can be compared and $x = -2$.",
    },
    {
      type: "p",
      md: "**What comes next.** The same three laws, used on algebraic terms with integer powers, are the partner topic in M7. In M8 the index stops being a whole number: $x^{\\frac{1}{2}}$ means a square root and $8^{\\frac{2}{3}}$ means root first, then power. That topic has its own page — and it leans on everything above, so it is worth being fast at this before you go there.",
    },

    { type: "prompt", promptId: RP("01") },
    { type: "prompt", promptId: RP("02") },
    { type: "prompt", promptId: RP("05") },
    { type: "prompt", promptId: RP("07") },
    { type: "prompt", promptId: RP("09") },
  ];
}
