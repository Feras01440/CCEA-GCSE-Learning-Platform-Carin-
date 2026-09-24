/**
 * The lesson for maths.m7.standard-form (note.blocks.json).
 *
 * Order fixed by pipeline/prompts/author-topic.md: hook, the idea explained, see it, do it,
 * where marks are lost, in the exam, prompts. A gate closes every stretch of <= 150 words.
 */
import {
  noteSvgSlider,
  noteSvgScale,
  noteSvgAlign,
  SLIDER_ALT,
  SCALE_ALT,
  ALIGN_ALT,
} from "./svgs.mjs";

const P = "rp.maths.m7.standard-form.";

export function noteBlocks() {
  return [
    { type: "h", text: "Standard index form" },

    {
      type: "p",
      md: "The mass of an electron and the distance to the Sun cannot share a page written out in full: one needs thirty zeros in front of its digits, the other eleven behind them. Standard form ends the zero-counting — every number becomes one digit, a decimal part, and a power of ten.\nCCEA sets it in almost every M7 and M8 series, usually late on **Paper 1, where you have no calculator**. In Summer 2025 the same three-mark question appeared on both papers, and over a third of the M8 entry came away with nothing.",
    },
    {
      type: "callout",
      kind: "spec",
      title: "The statement",
      md: "**M7-NA-03** — interpret, order and calculate with numbers written in standard index form.\nThe Teacher Guidance is unusually specific: positive **and** negative powers, converting both ways, a division such as $(3.2 \\times 10^{4}) \\div (1.6 \\times 10^{-3})$ done **without a calculator**, and using standard form on one.",
      source: "CCEA GCSE Mathematics specification, statement M7-NA-03 and its Teacher Guidance",
    },
    {
      type: "gate",
      id: "g1",
      kind: "number",
      prompt: "Warm-up, one tap. Write $3 \\times 10^{2}$ as an ordinary number.",
      answer: "300",
      explain: "$10^{2}$ is 100, so this is $3 \\times 100 = 300$. That is the whole of the idea; everything else in this lesson is bookkeeping on top of it.",
    },

    { type: "h", text: "What the two parts actually mean" },
    {
      type: "p",
      md: "A number is in standard form when it looks like $a \\times 10^{n}$ with $1 \\le a < 10$ and $n$ a whole number.\nThe front number $a$ carries the **digits**. The power $n$ carries the **size**. They do different jobs, which is why $9 \\times 10^{8}$ is nine hundred million and never 72 — the 8 is not something to multiply by, it is a count of how far the digits have been moved.\nThe reason the rule insists on $1 \\le a < 10$ is that it makes the writing unique. Without it, $4\\,830\\,000$ could be written $48.3 \\times 10^{5}$ or $0.483 \\times 10^{7}$, and two numbers could no longer be compared by glancing at their powers.",
    },
    {
      type: "gate",
      id: "g2",
      kind: "choice",
      prompt: "Which of these is written in standard form?",
      options: ["$4.83 \\times 10^{6}$", "$48.3 \\times 10^{5}$", "$0.483 \\times 10^{7}$"],
      answer: "$4.83 \\times 10^{6}$",
      explain: "All three are the same number, $4\\,830\\,000$. Only the first has a front number between 1 and 10, and only that one counts as standard form on the answer line.",
    },

    {
      type: "p",
      md: "To convert, slide the decimal point and count the places. Sliding **left** makes the front number smaller, so the power goes **up**. Sliding **right** makes it bigger, so the power goes **down** — which is where negative powers come from.\nCount places, never zeros. That distinction is what saves you on a number such as $0.000\\,062$, where the zeros and the places disagree.",
    },
    {
      type: "figure",
      alt: SLIDER_ALT,
      svg: noteSvgSlider(),
      caption: "The digits never change. Only the point moves, and the power of ten is the record of how far it went.",
    },
    {
      type: "gate",
      id: "g3",
      kind: "choice",
      prompt: "Which of these is $4.7 \\times 10^{-3}$ written as an ordinary number?",
      options: ["$0.0047$", "$0.00047$", "$0.047$"],
      answer: "$0.0047$",
      explain: "A power of $-3$ slides the point three places left: $4.7 \\rightarrow 0.47 \\rightarrow 0.047 \\rightarrow 0.0047$. Notice there are only two zeros after the point but three places moved.",
    },

    { type: "h", text: "How big is big" },
    {
      type: "p",
      md: "Standard form is worth learning because it turns size into a single number you can read at a glance. Line the real world up by its powers of ten and the whole of physics and biology fits on one strip of paper.",
    },
    {
      type: "figure",
      alt: SCALE_ALT,
      svg: noteSvgScale(),
      caption: "Every quantity here is one front number and one power. Comparing two of them starts with the power, and only goes to the front number when the powers tie.",
    },
    {
      type: "gate",
      id: "g4",
      kind: "choice",
      prompt: "Which is the smallest?",
      options: ["$9 \\times 10^{-4}$", "$6 \\times 10^{-3}$", "$2 \\times 10^{-2}$"],
      answer: "$9 \\times 10^{-4}$",
      explain: "Compare the powers first: $-4$ is the furthest left on the line, so $9 \\times 10^{-4}$ is smallest even though 9 is the biggest front number. The front number only decides a tie.",
    },

    { type: "h", text: "Multiplying and dividing" },
    {
      type: "p",
      md: "The two halves are handled separately, and that is the whole method.\n**1 Deal with the front numbers** — multiply them, or divide them.\n**2 Deal with the powers** — add them when multiplying, subtract them when dividing. This is just the index law $10^{a} \\times 10^{b} = 10^{a+b}$, which works because you are joining two runs of tens end to end.\n**3 Re-normalise.** Step 1 often throws out a front number that is not between 1 and 10, so slide the point once more and adjust the power. $16 \\times 10^{4}$ becomes $1.6 \\times 10^{5}$; $0.4 \\times 10^{2}$ becomes $4 \\times 10^{1}$.",
    },
    {
      type: "gate",
      id: "g5",
      kind: "number",
      prompt: "Work out $(2 \\times 10^{5}) \\times (4 \\times 10^{-2})$.",
      answer: "8000",
      explain: "$2 \\times 4 = 8$ and $5 + (-2) = 3$, giving $8 \\times 10^{3}$. The front number was already between 1 and 10, so no re-normalising was needed this time.",
    },

    { type: "h", text: "Adding and subtracting: match the powers first" },
    {
      type: "p",
      md: "There is no index law for addition, and the examiners report that this is the part candidates find hardest by hand. You cannot add the front numbers unless the powers already agree, for the same reason you cannot add 3 metres to 4 centimetres without converting one of them.\nSo make the powers agree. Raise the smaller power to match the larger one, sliding that front number's point left to compensate, then add or subtract down the column and re-normalise.",
    },
    {
      type: "figure",
      alt: ALIGN_ALT,
      svg: noteSvgAlign(),
      caption: "One number is rewritten so both powers read $10^{5}$. Only then does the column addition mean anything.",
    },
    {
      type: "gate",
      id: "g6",
      kind: "number",
      prompt: "Work out $(5 \\times 10^{4}) + (3 \\times 10^{3})$.",
      answer: "53000",
      explain: "Rewrite $3 \\times 10^{3}$ as $0.3 \\times 10^{4}$, then $5 + 0.3 = 5.3$, giving $5.3 \\times 10^{4}$. Adding the powers as well would give $8 \\times 10^{7}$, which is more than a thousand times too big.",
    },

    { type: "h", text: "See it done" },
    {
      type: "video",
      videoId: "cxGyZ3Yx9ow",
      title: "Standard Form - Corbettmaths",
      channel: "corbettmaths",
      corbettmathsNumber: 300,
      why: "Ten minutes of conversions and calculations at the pace of someone writing them out by hand. Watch it once for the rhythm, then come back and do the gate below without pausing it.",
    },
    {
      type: "gate",
      id: "g7",
      kind: "choice",
      prompt: "Without scrolling back: which is $0.000\\,000\\,84$ in standard form?",
      options: ["$8.4 \\times 10^{-7}$", "$8.4 \\times 10^{-6}$", "$84 \\times 10^{-8}$"],
      answer: "$8.4 \\times 10^{-7}$",
      explain: "The point slides seven places right to sit after the 8, so the power is $-7$. Count places, not zeros — there are six zeros and seven places. The third option is the right size but its front number is not below 10.",
    },

    { type: "h", text: "Units before arithmetic" },
    {
      type: "p",
      md: "Standard form makes two quantities look comparable even when they are not, and CCEA has exploited that twice in recent series. **A power of ten is not a unit.** If one mass is in grams and the other in kilograms, the powers are measuring different things and comparing them means nothing.\nConvert first, to whichever unit you prefer, and write the conversion down. $1.05 \\times 10^{7}$ grams is $1.05 \\times 10^{4}$ kilograms, because dividing by 1000 lowers the power by 3.",
    },
    {
      type: "gate",
      id: "g8",
      kind: "choice",
      prompt: "$A = 3.4 \\times 10^{5}$ grams and $B = 4 \\times 10^{2}$ kilograms. Which is heavier?",
      options: ["$B$", "$A$", "They are equal"],
      answer: "$B$",
      explain: "$A$ is $3.4 \\times 10^{2}$ kg, or 340 kg, against $B$'s 400 kg. Comparing the printed powers, 5 against 2, points the wrong way, which is exactly the trap.",
    },

    { type: "h", text: "A percentage change on a standard-form number" },
    {
      type: "p",
      md: "This is the question CCEA keeps setting, and the one that goes wrong most often. Nothing about the percentage is different because the number is in standard form: find the percentage of it, add it on or take it off, then **put the answer back into standard form**.\nThe last move is the one that gets forgotten. $9 \\times 10^{8}$ increased by 30% gives $11.7 \\times 10^{8}$, which is correct arithmetic and a lost mark, because $11.7$ is not between 1 and 10. Slide once more: $1.17 \\times 10^{9}$.",
    },
    {
      type: "gate",
      id: "g9",
      kind: "number",
      prompt: "$4 \\times 10^{6}$ is increased by 50%. What is the new value?",
      answer: "6000000",
      explain: "Half of $4 \\times 10^{6}$ is $2 \\times 10^{6}$, and $4 + 2 = 6$, so the answer is $6 \\times 10^{6}$. Here the front number stayed inside the range; next time check rather than assume.",
    },

    { type: "h", text: "On the calculator" },
    {
      type: "p",
      md: "Paper 2 lets you type these straight in, using the $\\times 10^{x}$ key — not the $x^{y}$ key, and never by typing the digits $\\times 10$ and then a power, which changes what the calculator does with brackets around it.\nThe display answers in one of two ways. Some calculators show $6.82 \\times 10^{8}$ properly; others show **6.82E8** or **6.82 08**. Both mean the same thing, and neither is an answer. Copy it onto the answer line in full: $6.82 \\times 10^{8}$. An E on an answer line earns nothing.",
    },
    {
      type: "gate",
      id: "g10",
      kind: "choice",
      prompt: "Your calculator display reads **4.5E-06**. What goes on the answer line?",
      options: ["$4.5 \\times 10^{-6}$", "4.5E-06", "$4.5^{-6}$"],
      answer: "$4.5 \\times 10^{-6}$",
      explain: "The E is the calculator's shorthand for times ten to the power. Write the power out properly. $4.5^{-6}$ is a completely different number, about $0.000\\,11$.",
    },

    { type: "h", text: "Where the marks are actually lost" },
    {
      type: "callout",
      kind: "examiner",
      title: "Summer 2025, M8 Paper 1 Q7 and M7 Paper 1 Q16",
      md: "The same three-mark question, a 30% increase on a number in standard form, on both papers. On M8 over a third of candidates scored nothing and just under 40% scored all three. The reported failures were: finding the percentage and never adding it on, and leaving $1\\,170\\,000\\,000$ sitting on the answer line after the question had asked for standard form.",
      source: "ccea-cer:maths:2025-summer:M81:Q7",
    },
    {
      type: "gate",
      id: "g11",
      kind: "choice",
      prompt: "You have reached $11.7 \\times 10^{8}$ and the question said standard form. What do you write?",
      options: ["$1.17 \\times 10^{9}$", "$11.7 \\times 10^{8}$", "$1\\,170\\,000\\,000$"],
      answer: "$1.17 \\times 10^{9}$",
      explain: "All three are the same size. Only the first obeys $1 \\le a < 10$, and the final mark is for the form, not the size.",
    },
    {
      type: "callout",
      kind: "examiner",
      title: "Summer 2025, M7 Paper 1 Q16",
      md: "On the same question a few candidates read $9 \\times 10^{8}$ as $9 \\times 8 = 72$ and worked on from there. Every later step was then arithmetic on a number a hundred million times too small, and no method mark could survive it. If your answer to a question about a reservoir is 72, the reading went wrong, not the arithmetic.",
      source: "ccea-cer:maths:2025-summer:M71:Q16",
    },
    {
      type: "callout",
      kind: "examiner",
      title: "November 2025, M8 Paper 1 Q8",
      md: "Standard-form calculations with no calculator. Around 30% could not manipulate them at all and only a fifth scored full marks. The examiners singled out the **addition** as the hardest of the operations, which is the one with no index law behind it.",
      source: "ccea-cer:maths:2025-november:M81:Q8",
    },
    {
      type: "gate",
      id: "g12",
      kind: "number",
      prompt: "Work out $(7.2 \\times 10^{-3}) - (4 \\times 10^{-4})$.",
      answer: "0.0068",
      explain: "Rewrite $4 \\times 10^{-4}$ as $0.4 \\times 10^{-3}$, then $7.2 - 0.4 = 6.8$, giving $6.8 \\times 10^{-3}$. Matching the powers turns a hard subtraction into an easy one.",
    },
    {
      type: "callout",
      kind: "examiner",
      title: "November 2025, M7 Paper 1 Q17",
      md: "Three expressions to put in order, working demanded. Converting everything to ordinary numbers worked; so did converting everything to the same power of ten. What scored nothing was an order with no working, however it was arrived at. Few candidates collected all three marks.",
      source: "ccea-cer:maths:2025-november:M71:Q17",
    },
    {
      type: "callout",
      kind: "examiner",
      title: "Summer 2024, M7 Paper 1 Q15 and M8 Paper 1 Q7",
      md: "Two masses to compare, one in grams and one in kilograms. Over half of the M8 entry converted one of them and then compared as though both were done, and a sizeable minority ignored the units altogether and compared the bare front numbers. Full-mark answers put both into the same unit before looking at either.",
      source: "ccea-cer:maths:2024-summer:M71:Q15",
    },
    {
      type: "gate",
      id: "g13",
      kind: "choice",
      prompt: "A question gives one length in metres and one in kilometres. What is your first written line?",
      options: [
        "The conversion of one length into the other's unit",
        "The two powers of ten, compared",
        "The difference between the two front numbers",
      ],
      answer: "The conversion of one length into the other's unit",
      explain: "It is the line the scheme rewards and the line that stops the trap. Comparing powers across different units compares nothing at all.",
    },
    {
      type: "callout",
      kind: "examiner",
      title: "November 2024, M8 Paper 1 Q6",
      md: "A one-mark conversion into standard form followed by a one-mark calculation with a negative power. A fifth of candidates could not do the conversion, and only about a third handled the negative power. Two marks, both of them recall rather than reasoning.",
      source: "ccea-cer:maths:2024-november:M81:Q6",
    },
    {
      type: "callout",
      kind: "mustknow",
      title: "Sheet or memory?",
      md: "**On the M7 and M8 formula sheet (page 2):** nothing for this topic. It carries the prism, trapezium, sphere and cone formulae, the quadratic formula and the trigonometric rules.\n**Must be known:** $a \\times 10^{n}$ with $1 \\le a < 10$; $10^{0} = 1$ and $10^{-n} = \\dfrac{1}{10^{n}}$; $10^{a} \\times 10^{b} = 10^{a+b}$ and $10^{a} \\div 10^{b} = 10^{a-b}$; $(a \\times 10^{n})^{k} = a^{k} \\times 10^{nk}$; and the metric steps $1\\text{ kg} = 10^{3}\\text{ g}$, $1\\text{ km} = 10^{3}\\text{ m}$, $1\\text{ g} = 10^{3}\\text{ mg}$.",
    },
    {
      type: "gate",
      id: "g14",
      kind: "number",
      prompt: "Work out $(3 \\times 10^{4})^{2}$.",
      answer: "900000000",
      explain: "Square both parts: $3^{2} = 9$ and $10^{4 \\times 2} = 10^{8}$, giving $9 \\times 10^{8}$. The power is multiplied by 2, not added to itself in the front number.",
    },

    { type: "h", text: "In the exam" },
    {
      type: "p",
      md: "Expect one of four wordings. A single mark for **Write this in standard form**, usually as part (a) of a short question. Two marks for a multiplication or division, one for the working and one for the answer in the demanded form. Three marks for an ordering with **show your working** printed underneath, or for a percentage change.\nThe first mark is almost always for a correct conversion or a correct set-up written down — so write it even if the rest stalls. The last mark is almost always for the **form**: front number between 1 and 10, power correct, no E, and the unit copied onto the answer line when one is printed there.",
    },
    {
      type: "gate",
      id: "g15",
      kind: "blank",
      prompt: "You are stuck on a standard-form question with mixed units. What do you write first?",
      answer: "the conversion | convert the units | convert to the same unit | the unit conversion | change to the same unit | put both in the same unit | same unit",
      explain: "Put both quantities into one unit and write that line down. It scores on its own and it usually makes the rest of the question obvious.",
    },

    { type: "prompt", promptId: `${P}01` },
    { type: "prompt", promptId: `${P}03` },
    { type: "prompt", promptId: `${P}04` },
    { type: "prompt", promptId: `${P}05` },
    { type: "prompt", promptId: `${P}09` },
  ];
}
