/**
 * A note written in the teach-first shape (docs/plan/review/2026-09-27-see-it-block-shape.md), for the tests of the
 * deck, the Read note and the schema: every section is explain → See it (our own worked steps, both forms) → an
 * optional video → Your turn; two gates carry a twin; one See it has a step she types; one section ends in two Your
 * turns because its See it worked two variants; every choice gate carries a note on each wrong option, the twin its own,
 * and every inline See it its kind (V3.1, 27 Sep 2026). Pure data with no imports, so the end-to-end specs can serve it
 * in place of the trial note's blocks.
 *
 * Every number was worked twice (27 Sep 2026): 3x(x + 7) / 6(x + 7)(x − 7) = x / 2(x − 7); 5x(x + 2) / 10(x + 2) =
 * x / 2; 4x(x + 5) / 12(x + 5) = x / 3; (x² − 4) / (x² + 5x + 6) = (x − 2) / (x + 3); (x² − 9) / (x − 3) at x = 7 is
 * 40 / 4 = 10 = 7 + 3; (x² − 16) / (x + 4) at x = 1 is −15 / 5 = −3; (x² − 25) / (x + 5) at x = 1 is −24 / 6 = −4;
 * x² − 64 = (x + 8)(x − 8); 9x² − 25 = (3x + 5)(3x − 5); x² + x − 12 = (x + 4)(x − 3), x² − 9 = (x + 3)(x − 3).
 */

export const SEE_FIXTURE_TOPIC_ID = "fm.u1.fixture-simplify";
export const SEE_FIXTURE_WE_ID = "we.fm.u1.fixture-simplify.01";

/** The worked example the second section's See it names (its steps carry a why-menu and an input, which a See it never shows). */
export const SEE_FIXTURE_WORKED_EXAMPLE = {
  id: SEE_FIXTURE_WE_ID,
  topic: SEE_FIXTURE_TOPIC_ID,
  specRefs: ["FM1-ALF-01"],
  paper: { unit: "FM1", calculator: true, resources: [] as string[] },
  stem: "Simplify fully\n$\\dfrac{x^{2}+x-12}{x^{2}-9}$",
  steps: [
    {
      n: 1,
      working: "$x^{2}+x-12 = (x+4)(x-3)$",
      decision: "Two numbers that multiply to $-12$ and add to $1$: $4$ and $-3$.",
      earns: ["MW1"],
    },
    {
      n: 2,
      working: "$x^{2}-9 = (x+3)(x-3)$",
      decision: "A square minus a square: $9 = 3^{2}$.",
      earns: ["MW1"],
      input: { kind: "algebraic", latex: "(x+3)(x-3)", equivalence: "equivalent", variables: ["x"], form: "factorised" },
    },
    {
      n: 3,
      working: "$\\dfrac{(x+4)(x-3)}{(x+3)(x-3)} = \\dfrac{x+4}{x+3}$",
      decision: "The bracket $(x-3)$ multiplies both lines, so it divides out.",
      earns: ["MW1"],
      whyMenu: { options: ["It multiplies both whole lines", "It is the last bracket written"], correct: 0, explain: "Only a factor of both lines divides out." },
    },
  ],
  finalAnswer: "$\\dfrac{x+4}{x+3}$",
  twin: {
    stem: "Simplify fully $\\dfrac{x^{2}-2x-15}{x^{2}-25}$",
    answer: { kind: "algebraic", latex: "\\frac{x+3}{x+5}", equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" },
  },
  faded: [{ showSteps: 1, studentSupplies: [2, 3] }],
  verification: "ver.we.fm.u1.fixture-simplify.01",
  version: 1,
};

export const SEE_FIXTURE_VERIFICATION = [{ id: "ver.we.fm.u1.fixture-simplify.01", itemId: SEE_FIXTURE_WE_ID, status: "published" }];

export const SEE_FIXTURE_PROMPTS = [
  {
    id: "rp.fm.u1.fixture-simplify.01",
    topic: SEE_FIXTURE_TOPIC_ID,
    specRefs: ["FM1-ALF-01"],
    kind: "formula",
    prompt: "$a^{2}-b^{2} = $ ?",
    answer: "$(a+b)(a-b)$, the difference of two squares.",
    keyWords: ["a + b", "a - b"],
  },
  {
    id: "rp.fm.u1.fixture-simplify.02",
    topic: SEE_FIXTURE_TOPIC_ID,
    specRefs: ["FM1-ALF-01"],
    kind: "trap",
    prompt: "After the brackets, what is the last check before the answer line?",
    answer: "The numbers: no numerical factor left on both lines",
    keyWords: ["numbers"],
  },
];

export const SEE_FIXTURE_BLOCKS = [
  {
    type: "hero",
    lede: "An algebraic fraction cancels the way $\\frac{12}{18}$ does: only what multiplies the whole top and the whole bottom divides out.",
    can: ["Cancel a factor both lines share.", "Factorise first, common factor first.", "Finish on the numbers."],
    minutes: 12,
  },
  { type: "h", text: "Only a factor divides out", role: "idea" },
  {
    type: "p",
    md: "Cancelling divides the top and the bottom by the same thing, so only a **factor** can go: something the whole line is multiplied by.",
  },
  {
    type: "see",
    kind: "calculation",
    stem: "Simplify $\\dfrac{3x(x+7)}{6(x+7)(x-7)}$.",
    steps: [
      { n: 1, working: "$3x(x+7) = 3 \\times x \\times (x+7)$", decision: "Read the top as its factors: a $3$, an $x$ and the bracket $(x+7)$." },
      { n: 2, working: "$6(x+7)(x-7) = 3 \\times 2 \\times (x+7)(x-7)$", decision: "Read the bottom the same way: the $6$ is $3 \\times 2$." },
      { n: 3, working: "$\\dfrac{3x(x+7)}{6(x+7)(x-7)} = \\dfrac{x}{2(x-7)}$", decision: "Divide out what both lines share: the $3$ and the bracket $(x+7)$.", earns: ["W1"] },
    ],
    finalAnswer: "$\\dfrac{x}{2(x-7)}$",
  },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "What does $\\dfrac{5x(x+2)}{10(x+2)}$ simplify to?",
    options: ["$\\dfrac{x}{2}$", "$\\dfrac{5x}{10}$", "$\\dfrac{x+2}{2}$"],
    answer: "$\\dfrac{x}{2}$",
    explain:
      "Divide out what both lines share, as step 3 of See it did: the bracket $(x+2)$, then the $5$, since $10 = 5 \\times 2$. That leaves $\\dfrac{x}{2}$. Stopping at $\\dfrac{5x}{10}$ leaves a $5$ on both lines, and $\\dfrac{x+2}{2}$ strikes the $x$ instead of the bracket.",
    twin: {
      prompt: "What does $\\dfrac{4x(x+5)}{12(x+5)}$ simplify to?",
      options: ["$\\dfrac{x}{3}$", "$\\dfrac{4x}{12}$", "$\\dfrac{x+5}{3}$"],
      answer: "$\\dfrac{x}{3}$",
      explain: "The bracket $(x+5)$ and the $4$ divide out of both lines, since $12 = 4 \\times 3$, leaving $\\dfrac{x}{3}$.",
      optionNotes: [
        { option: "$\\dfrac{4x}{12}$", why: "The bracket has gone, but a $4$ still divides both lines: $12 = 4 \\times 3$.", misconception: "fm.algfrac.not-fully-simplified" },
        { option: "$\\dfrac{x+5}{3}$", why: "The bracket is the factor both lines share, so it is the one that goes; the $x$ on top stays.", misconception: "maths.alg-fractions.cancel-terms-not-factors" },
      ],
    },
    optionNotes: [
      {
        option: "$\\dfrac{5x}{10}$",
        why: "Dividing out the bracket is right, but a $5$ still divides both lines, since $10 = 5 \\times 2$: fully means nothing shared is left.",
        misconception: "fm.algfrac.not-fully-simplified",
      },
      {
        option: "$\\dfrac{x+2}{2}$",
        why: "The bracket $(x+2)$ is on both lines, so it is the one that divides out; the $x$ is on the top only, so it stays.",
        misconception: "maths.alg-fractions.cancel-terms-not-factors",
      },
    ],
  },
  { type: "h", text: "Factorise first", role: "variant" },
  { type: "p", md: "When a line is not yet a product, factorise it first; only then can you see what both lines share." },
  { type: "see", workedExample: SEE_FIXTURE_WE_ID },
  { type: "video", videoId: "tlKN8NNNxdI", title: "Simplifying Algebraic Fractions", channel: "corbettmaths", why: "The method at writing speed.", end: 341 },
  {
    type: "gate",
    id: "g2",
    kind: "choice",
    prompt: "Simplify $\\dfrac{x^{2}-4}{x^{2}+5x+6}$.",
    options: ["$\\dfrac{x-2}{x+3}$", "$\\dfrac{x+2}{x+3}$", "$\\dfrac{-4}{5x+6}$"],
    answer: "$\\dfrac{x-2}{x+3}$",
    explain:
      "Factorise both lines first, as the worked steps did: the top is $(x+2)(x-2)$ and the bottom is $(x+2)(x+3)$, so $(x+2)$ divides out, leaving $\\dfrac{x-2}{x+3}$. Striking the $x^{2}$ terms cancels terms, not factors.",
    optionNotes: [
      { option: "$\\dfrac{x+2}{x+3}$", why: "The bracket on both lines is $(x+2)$, so it is the one that divides out; $(x-2)$ is on the top only and stays." },
      {
        option: "$\\dfrac{-4}{5x+6}$",
        why: "The two $x^{2}$ are terms of sums, not factors: striking them changes the value. Factorise first; only a shared bracket goes.",
        misconception: "maths.alg-fractions.cancel-terms-not-factors",
      },
    ],
  },
  { type: "h", text: "Simplify before you substitute", role: "variant" },
  { type: "p", md: "A value is quicker and safer from the simplified line: factorise, divide out, then put the number in." },
  {
    type: "see",
    kind: "calculation",
    stem: "Find the value of $\\dfrac{x^{2}-9}{x-3}$ when $x = 7$.",
    steps: [
      { n: 1, working: "$\\dfrac{x^{2}-9}{x-3} = \\dfrac{(x+3)(x-3)}{x-3}$", decision: "Factorise the top: a square minus a square." },
      { n: 2, working: "$\\dfrac{(x+3)(x-3)}{x-3} = x+3$", decision: "The bracket $(x-3)$ multiplies the whole top and is the whole bottom, so it divides out." },
      {
        n: 3,
        working: "$x+3 = 10$ when $x = 7$",
        decision: "Put $7$ into the simplified line: $7 + 3 = 10$.",
        input: { kind: "numeric", value: 10, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] },
      },
    ],
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: "What is the value of $\\dfrac{x^{2}-16}{x+4}$ when $x = 1$?",
    answer: "-3",
    explain: "Simplify first, as step 2 of See it did: $\\dfrac{(x+4)(x-4)}{x+4} = x-4$, so at $x = 1$ the value is $1 - 4 = -3$.",
    twin: {
      prompt: "What is the value of $\\dfrac{x^{2}-25}{x+5}$ when $x = 1$?",
      answer: "-4",
      explain: "It simplifies to $x-5$, so at $x = 1$ the value is $1 - 5 = -4$.",
    },
  },
  { type: "h", text: "Two squares, with and without a number in front", role: "variant" },
  { type: "p", md: "Take the square root of each part. With a number in front of $x^{2}$, the root takes the number with it." },
  {
    type: "see",
    kind: "calculation",
    stem: "Factorise $x^{2}-49$, then $4x^{2}-49$.",
    steps: [
      { n: 1, working: "$x^{2}-49 = (x+7)(x-7)$", decision: "$49 = 7^{2}$, so one bracket takes $+7$ and the other $-7$.", earns: ["MW1"] },
      { n: 2, working: "$4x^{2}-49 = (2x+7)(2x-7)$", decision: "$4x^{2} = (2x)^{2}$: the root of $4x^{2}$ is $2x$, not $4x$.", earns: ["MW1"] },
    ],
  },
  {
    type: "gate",
    id: "g4",
    kind: "blank",
    prompt: "Fill the gap: $x^{2}-64 = (x+8)(x-\\square)$",
    answer: "8",
    explain: "$64 = 8^{2}$, so the second bracket takes $-8$, as step 1 of See it showed.",
  },
  {
    type: "gate",
    id: "g5",
    kind: "choice",
    prompt: "Which is $9x^{2}-25$ factorised?",
    options: ["$(3x+5)(3x-5)$", "$(9x+5)(9x-5)$", "$(3x-5)^{2}$"],
    answer: "$(3x+5)(3x-5)$",
    explain: "Take the root of each part, as step 2 of See it did: $9x^{2} = (3x)^{2}$ and $25 = 5^{2}$, so the brackets hold $3x$ and $5$, one plus and one minus.",
    optionNotes: [
      { option: "$(9x+5)(9x-5)$", why: "The root of $9x^{2}$ is $3x$: $(9x)^{2}$ would be $81x^{2}$." },
      { option: "$(3x-5)^{2}$", why: "One bracket squared has a middle term, $-30x$; a square minus a square has none, so its two brackets differ in sign.", misconception: "fm.algfrac.dots-not-spotted" },
    ],
  },
  { type: "h", text: "You can now", role: "recap" },
  { type: "p", md: "Cancel only factors, never terms.\nFactorise first, common factor first.\nFinish on the numbers." },
  { type: "h", text: "In the exam", role: "pointer" },
  { type: "p", md: "**Simplify fully** usually finishes a longer question. Factorise every line first." },
  { type: "prompt", promptId: "rp.fm.u1.fixture-simplify.01" },
  { type: "prompt", promptId: "rp.fm.u1.fixture-simplify.02" },
];
