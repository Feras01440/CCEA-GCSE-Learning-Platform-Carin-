import { describe, expect, test } from "vitest";
import {
  checkAlgebraic,
  parseStudentExpression,
  splitSolutions,
  vectorInput,
  toLatex,
  type AlgebraForm,
  type AlgebraReason,
  type AlgebraSpec,
  type AlgebraVerdict,
} from "./algebra";

/*
 * How equivalence is decided (see algebra.ts):
 *   1. structural identity of the canonical forms (`isSame`)
 *   2. compute-engine symbolic check (`isEqual`, or simplify(a - b) === 0)
 *   3. FALLBACK: seeded numeric sampling at 12 points of the domain.
 *
 * With @cortex-js/compute-engine 0.120 step 2 returns `undefined` for most
 * non-trivial identities (algebraic-fraction sums, log laws, trig identities,
 * equations scaled by a constant), so those cases are decided by step 3. When
 * that happens the verdict carries `details.sampled`; `expectSampledIfUsed`
 * records it so a change in the engine's abilities shows up here rather than
 * silently changing behaviour.
 */

const equiv = (answer: string, extra: Partial<AlgebraSpec> = {}): AlgebraSpec => ({
  answer,
  mode: "equivalent",
  ...extra,
});
const inForm = (answer: string, form: AlgebraForm, extra: Partial<AlgebraSpec> = {}): AlgebraSpec => ({
  answer,
  mode: "form",
  form,
  ...extra,
});
const simplified = (answer: string, extra: Partial<AlgebraSpec> = {}): AlgebraSpec => ({
  answer,
  mode: "identical-after-simplify",
  ...extra,
});

function expectCorrect(v: AlgebraVerdict, reason?: AlgebraReason): AlgebraVerdict {
  expect(v.correct, v.feedback).toBe(true);
  if (reason) expect(v.reason).toBe(reason);
  else expect(["identical", "equivalent"]).toContain(v.reason);
  return v;
}

function expectWrong(v: AlgebraVerdict, reason: AlgebraReason, feedback?: RegExp): AlgebraVerdict {
  expect(v.correct, v.feedback).toBe(false);
  expect(v.reason, v.feedback).toBe(reason);
  if (feedback) expect(v.feedback).toMatch(feedback);
  return v;
}

/** If the numeric fallback was used it must have seen a meaningful number of points. */
function expectSampledIfUsed(v: AlgebraVerdict): void {
  if (v.details?.sampled !== undefined) expect(v.details.sampled).toBeGreaterThanOrEqual(4);
}

// ---------------------------------------------------------------------------
// Factorising
// ---------------------------------------------------------------------------

describe("factorised form", () => {
  const spec = inForm("(x+2)(x+3)", "factorised");

  test("accepts the factors in either order", () => {
    expectCorrect(checkAlgebraic("(x+3)(x+2)", spec), "identical");
    expectCorrect(checkAlgebraic("(x+2)(x+3)", spec), "identical");
  });

  test("accepts MathLive \\left( \\right) delimiters", () => {
    expectCorrect(checkAlgebraic("\\left(x+2\\right)\\left(x+3\\right)", spec));
  });

  test("expanded answer is equivalent but flagged as not factorised", () => {
    expectWrong(checkAlgebraic("x^2+5x+6", spec), "expanded-not-factorised", /product of brackets/);
  });

  test("(2x-1)(x+3): expanded 2x^2+5x-3 is the wrong form", () => {
    const quad = inForm("(2x-1)(x+3)", "factorised");
    expectWrong(checkAlgebraic("2x^2+5x-3", quad), "expanded-not-factorised");
    expectCorrect(checkAlgebraic("(x+3)(2x-1)", quad), "identical");
  });

  test("a bracket that can still be factorised is 'not fully factorised'", () => {
    const cubic = inForm("(x-2)(x+2)(x+1)", "factorised");
    expectWrong(checkAlgebraic("(x^2-4)(x+1)", cubic), "not-simplified", /factorised further/);
  });

  test("a numerical common factor left inside a bracket is 'not fully factorised'", () => {
    const withConst = inForm("2(x+2)(x+3)", "factorised");
    expectWrong(checkAlgebraic("(2x+4)(x+3)", withConst), "not-simplified", /common factor inside/);
    expectCorrect(checkAlgebraic("2(x+3)(x+2)", withConst));
  });

  test("three factors including a bare x", () => {
    expectCorrect(checkAlgebraic("x(x+3)(x+2)", inForm("x(x+2)(x+3)", "factorised")));
  });

  test("wrong factors are not equivalent and get a numeric counter-example", () => {
    const v = expectWrong(checkAlgebraic("(x+2)(x+4)", spec), "not-equivalent", /For example, when x = /);
    expect(v.details?.mismatchAt).toHaveProperty("x");
  });
});

// ---------------------------------------------------------------------------
// Algebraic fractions
// ---------------------------------------------------------------------------

describe("algebraic fractions", () => {
  const single = "\\frac{7x+4}{(x+2)(2x-1)}";
  const sum = "\\frac{2}{x+2}+\\frac{3}{2x-1}";

  test("a sum of fractions is equivalent to its single-fraction form (decided by sampling)", () => {
    const v = expectCorrect(checkAlgebraic(sum, equiv(single)), "equivalent");
    expectSampledIfUsed(v);
  });

  test("plain-typed fraction sum", () => {
    expectCorrect(checkAlgebraic("2/(x+2)+3/(2x-1)", equiv(single)));
  });

  test("single-fraction form rejects the unsimplified sum", () => {
    expectWrong(checkAlgebraic(sum, inForm(single, "single-fraction")), "equivalent-wrong-form", /single fraction/);
  });

  test("single-fraction form accepts the combined fraction (factorised or expanded denominator)", () => {
    expectCorrect(checkAlgebraic(single, inForm(single, "single-fraction")), "identical");
    expectCorrect(checkAlgebraic("\\frac{7x+4}{2x^2+3x-2}", inForm(single, "single-fraction")));
  });

  test("a sign slip in the numerator is reported as a sign error", () => {
    expectWrong(checkAlgebraic("\\frac{7x-4}{(x+2)(2x-1)}", equiv(single)), "sign-error", /signs/);
  });
});

// ---------------------------------------------------------------------------
// Simplest fraction
// ---------------------------------------------------------------------------

describe("simplest-fraction form", () => {
  const spec = inForm("\\frac{x+2}{x+3}", "simplest-fraction");

  test("rejects \\frac{2x+4}{2x+6} when (x+2)/(x+3) is required", () => {
    expectWrong(checkAlgebraic("\\frac{2x+4}{2x+6}", spec), "not-simplified", /common factor/);
    expectWrong(checkAlgebraic("(2x+4)/(2x+6)", spec), "not-simplified");
  });

  test("rejects a fraction whose numerator and denominator share an algebraic factor", () => {
    expectWrong(checkAlgebraic("\\frac{x^2+5x+6}{(x+3)^2}", spec), "not-simplified");
  });

  test("accepts the simplest form", () => {
    expectCorrect(checkAlgebraic("\\frac{x+2}{x+3}", spec), "identical");
  });

  test("numeric fractions: 6/8 is not simplest, 3/4 is", () => {
    const three4 = inForm("\\frac{3}{4}", "simplest-fraction");
    expectWrong(checkAlgebraic("\\frac{6}{8}", three4), "not-simplified");
    expectCorrect(checkAlgebraic("\\frac{3}{4}", three4));
  });
});

// ---------------------------------------------------------------------------
// Surds
// ---------------------------------------------------------------------------

describe("surd-rationalised form", () => {
  const spec = inForm("\\frac{5\\sqrt{2}}{6}", "surd-rationalised");

  test("accepts 5√2/6 in LaTeX, plain text and unicode", () => {
    expectCorrect(checkAlgebraic("\\frac{5\\sqrt{2}}{6}", spec), "identical");
    expectCorrect(checkAlgebraic("5sqrt2/6", spec));
    expectCorrect(checkAlgebraic("5√2/6", spec));
  });

  test("5/(3√2) has the right value but a surd in the denominator", () => {
    expectWrong(checkAlgebraic("\\frac{5}{3\\sqrt{2}}", spec), "not-simplified", /denominator/);
  });

  test("10√2/12 has a common factor to cancel", () => {
    expectWrong(checkAlgebraic("\\frac{10\\sqrt{2}}{12}", spec), "not-simplified", /common factor/);
  });

  test("5√8/12 has an unsimplified surd", () => {
    expectWrong(checkAlgebraic("\\frac{5\\sqrt{8}}{12}", spec), "not-simplified", /square factor/);
  });

  test("in equivalent mode the unrationalised and rationalised forms match", () => {
    expectCorrect(checkAlgebraic("\\frac{5\\sqrt{2}}{6}", equiv("\\frac{5}{3\\sqrt{2}}")));
  });
});

// ---------------------------------------------------------------------------
// y = mx + c
// ---------------------------------------------------------------------------

describe("subject form (changing the subject)", () => {
  const simple = inForm("x=\\frac{w}{4}", "subject");

  test("accepts the subject alone on either side, in any equivalent shape", () => {
    expectCorrect(checkAlgebraic("x=\\frac{w}{4}", simple), "identical");
    expectCorrect(checkAlgebraic("x = w/4", simple));
    expectCorrect(checkAlgebraic("x=0.25w", simple));
    expectCorrect(checkAlgebraic("w/4 = x", simple));
    const harder = inForm("x=\\frac{12+3w}{8-w}", "subject");
    expectCorrect(checkAlgebraic("x=(12+3w)/(8-w)", harder));
    expectCorrect(checkAlgebraic("x=\\frac{3w+12}{8-w}", harder));
  });

  test("a numeric clearing factor is the right relationship in the wrong form", () => {
    expectWrong(checkAlgebraic("4x=w", simple), "equivalent-wrong-form", /subject/);
    expectWrong(checkAlgebraic("2x=\\frac{w}{2}", simple), "equivalent-wrong-form", /subject/);
  });

  test("the bare expression is not a formula", () => {
    expectWrong(checkAlgebraic("w/4", simple), "equivalent-wrong-form", /x = /);
  });

  test("the subject left on both sides is the wrong form", () => {
    expectWrong(checkAlgebraic("x=\\frac{w}{4}+x-x", inForm("x=\\frac{w}{4}", "subject")), "equivalent-wrong-form", /one side only/);
  });

  test("a wrong rearrangement is still wrong", () => {
    expectWrong(checkAlgebraic("x=\\frac{w}{2}", simple), "not-equivalent");
    expectWrong(checkAlgebraic("x=4w", simple), "not-equivalent");
  });

  test("a variable clearing factor is the right relationship in the wrong form", () => {
    const harder = inForm("x=(12+3w)/(8-w)", "subject");
    expectWrong(checkAlgebraic("x(8-w)=12+3w", harder), "equivalent-wrong-form", /not the subject yet/);
    expectWrong(checkAlgebraic("8x-wx=12+3w", harder), "equivalent-wrong-form", /not the subject yet/);
    expectWrong(checkAlgebraic("8x=12+3w+wx", harder), "equivalent-wrong-form", /not the subject yet/);
    expectWrong(checkAlgebraic("x=((12+3w)/(8-w))+x-x", harder), "equivalent-wrong-form", /one side only/);
    expectWrong(checkAlgebraic("12+3w=x(8-w)", harder), "equivalent-wrong-form", /not the subject yet/);
    expectWrong(checkAlgebraic("x(w-8)=-12-3w", harder), "equivalent-wrong-form");
  });

  test("an equation with the right value as one of several solutions, or with a slip, is still wrong", () => {
    const harder = inForm("x=(12+3w)/(8-w)", "subject");
    // A single sign slip in the unrearranged equation is still recognised as a sign error, not a wrong form.
    expectWrong(checkAlgebraic("x(8-w)=12-3w", harder), "sign-error");
    expectWrong(checkAlgebraic("x(8+w)=12+3w", harder), "sign-error");
    expectWrong(checkAlgebraic("x(8-w)=12+5w", harder), "not-equivalent");
    expectWrong(checkAlgebraic("x^2(8-w)=x(12+3w)", harder), "not-equivalent");
    expectWrong(checkAlgebraic("x^2=wx/4", simple), "not-equivalent");
    expectWrong(checkAlgebraic("w=4", simple), "not-equivalent");
  });

  test("a formula matches the unrearranged equation it came from when no form is required", () => {
    expectCorrect(checkAlgebraic("x=(12+3w)/(8-w)", equiv("x(8-w)=12+3w")), "equivalent");
    expectCorrect(checkAlgebraic("x(8-w)=12+3w", equiv("x=(12+3w)/(8-w)")), "equivalent");
  });
});

describe("y = mx + c form", () => {
  const spec = inForm("y=2x-1", "y=mx+c");

  test("accepts y = 2x - 1 (with or without spaces, terms in either order)", () => {
    expectCorrect(checkAlgebraic("y=2x-1", spec), "identical");
    expectCorrect(checkAlgebraic("y = 2x - 1", spec), "identical");
    expectCorrect(checkAlgebraic("y=-1+2x", spec));
  });

  test("accepts a fractional gradient", () => {
    expectCorrect(checkAlgebraic("y=-\\frac{1}{2}x+3", inForm("y=-\\frac{1}{2}x+3", "y=mx+c")));
  });

  test("the same line written implicitly is the wrong form", () => {
    expectWrong(checkAlgebraic("2x-y=1", spec), "equivalent-wrong-form", /left-hand side/);
    expectWrong(checkAlgebraic("y+1=2x", spec), "equivalent-wrong-form");
    expectWrong(checkAlgebraic("x+2y=6", inForm("y=-\\frac{1}{2}x+3", "y=mx+c")), "equivalent-wrong-form");
  });

  test("brackets or an unsimplified fraction on the right are the wrong form", () => {
    expectWrong(checkAlgebraic("y=2(x-\\frac{1}{2})", spec), "equivalent-wrong-form", /expand/);
    expectWrong(checkAlgebraic("y=\\frac{4x-2}{2}", spec), "equivalent-wrong-form");
  });

  test("just the expression 2x-1 is the right relationship but not an equation", () => {
    expectWrong(checkAlgebraic("2x-1", spec), "equivalent-wrong-form", /y = mx \+ c/);
  });

  test("uncollected terms are 'not simplified'", () => {
    expectWrong(checkAlgebraic("y=x+x-1", spec), "not-simplified", /collect/);
  });

  test("wrong intercept sign is a sign error", () => {
    expectWrong(checkAlgebraic("y=2x+1", spec), "sign-error");
  });
});

// ---------------------------------------------------------------------------
// Solution sets
// ---------------------------------------------------------------------------

describe("solution sets", () => {
  const spec = equiv("x=2 or x=-3");

  test("order-insensitive, with 'or', commas, \\text{ or }, 'and' or bare values", () => {
    expectCorrect(checkAlgebraic("x=-3, x=2", spec), "identical");
    expectCorrect(checkAlgebraic("x = 2, -3", spec), "identical");
    expectCorrect(checkAlgebraic("2 or -3", spec), "identical");
    expectCorrect(checkAlgebraic("x=2\\text{ or }x=-3", spec), "identical");
    expectCorrect(checkAlgebraic("x=2 and x=-3", spec), "identical");
    expect(checkAlgebraic("x=-3, x=2", spec).feedback).toMatch(/all 2 solutions/);
  });

  test("explicit solutionSet with a fraction root", () => {
    const s = equiv("x=\\frac{1}{2}", { solutionSet: ["x=\\frac{1}{2}", "x=-3"] });
    expectCorrect(checkAlgebraic("x=\\frac{1}{2}, x=-3", s));
    expectCorrect(checkAlgebraic("x=-3, x=0.5", s));
  });

  test("x = ±3 expands to both roots (LaTeX and unicode)", () => {
    const pm = equiv("x=3", { solutionSet: ["x=3", "x=-3"] });
    expectCorrect(checkAlgebraic("x=\\pm3", pm));
    expectCorrect(checkAlgebraic("x = ±3", pm));
  });

  test("one root only is a partial solution set", () => {
    expectWrong(checkAlgebraic("x=2", spec), "partial-solution-set", /1 of the 2/);
  });

  test("a root with the wrong sign is reported as a sign error", () => {
    expectWrong(checkAlgebraic("x=2, x=3", spec), "sign-error", /x = 3 has the wrong sign/);
  });

  test("both roots plus a spurious one is 'extra solutions'", () => {
    expectWrong(checkAlgebraic("x=2, x=-3, x=5", spec), "extra-solutions", /not a solution/);
  });

  test("completely wrong roots", () => {
    expectWrong(checkAlgebraic("x=1, x=4", spec), "not-equivalent");
  });

  test("using the wrong unknown", () => {
    expectWrong(checkAlgebraic("y=2, y=-3", spec), "not-equivalent", /unknown in this equation is x/);
  });

  test("a list of answers when a single answer is expected", () => {
    expectWrong(checkAlgebraic("x=2, x=3", equiv("x=2")), "not-equivalent", /single answer/);
  });

  test("single root written as a decimal", () => {
    expectCorrect(checkAlgebraic("x=0.5", equiv("x=\\frac{1}{2}")));
  });

  test("splitSolutions handles the common ways of listing roots", () => {
    expect(splitSolutions("x=2 or x=-3")).toEqual(["x=2", "x=-3"]);
    expect(splitSolutions("x=\\pm3")).toEqual(["x=+3", "x=-3"]);
    expect(splitSolutions("{2, -3}")).toEqual(["2", "-3"]);
    expect(splitSolutions("x \\in \\{2, -3\\}")).toEqual(["2", "-3"]);
    expect(splitSolutions("x=2;x=-3")).toEqual(["x=2", "x=-3"]);
    expect(splitSolutions("x=\\frac{1}{2}, x=-3")).toEqual(["x=\\frac{1}{2}", "x=-3"]);
    expect(splitSolutions("(1,2), (3,4)")).toEqual(["(1,2)", "(3,4)"]);
  });
});

// ---------------------------------------------------------------------------
// Equations scaled by a constant
// ---------------------------------------------------------------------------

describe("equations compared up to a constant factor", () => {
  const spec = equiv("2x+3y=7");

  test("2x+3y=7 ≡ 4x+6y=14 and ≡ -2x-3y=-7", () => {
    expectSampledIfUsed(expectCorrect(checkAlgebraic("4x+6y=14", spec), "equivalent"));
    expectCorrect(checkAlgebraic("-2x-3y=-7", spec));
  });

  test("rearranged form 3y=7-2x", () => {
    expectCorrect(checkAlgebraic("3y=7-2x", spec));
  });

  test("identical equation", () => {
    expectCorrect(checkAlgebraic("2x+3y=7", spec), "identical");
  });

  test("different constant is not equivalent, with a counter-example", () => {
    expectWrong(checkAlgebraic("2x+3y=8", spec), "not-equivalent", /For example, when/);
  });
});

// ---------------------------------------------------------------------------
// Changing the subject
// ---------------------------------------------------------------------------

describe("changing the subject", () => {
  const spec = equiv("x=\\frac{4y}{5-v}");

  test("x = -4y/(v-5) typed as plain text matches x = 4y/(5-v)", () => {
    expectSampledIfUsed(expectCorrect(checkAlgebraic("x = -4y/(v-5)", spec), "equivalent"));
  });

  test("x = (-4y)/(v-5) in LaTeX", () => {
    expectCorrect(checkAlgebraic("x=\\frac{-4y}{v-5}", spec));
  });

  test("the expression alone (no 'x =') is accepted as equivalent", () => {
    expectCorrect(checkAlgebraic("\\frac{4y}{5-v}", spec), "equivalent");
  });

  test("losing the minus sign is a sign error", () => {
    expectWrong(checkAlgebraic("x=\\frac{4y}{v-5}", spec), "sign-error");
  });

  test("alternatives: an answer matching only an alternative is accepted", () => {
    const either = equiv("5", { alternatives: ["\\frac{1}{5}"] });
    expectCorrect(checkAlgebraic("0.2", either));
    expectCorrect(checkAlgebraic("5", either), "identical");
  });

  test("alternatives are still subject to the required form", () => {
    const s = inForm("(x+2)(x+3)", "factorised", { alternatives: ["x^2+5x+6"] });
    expectWrong(checkAlgebraic("x^2+5x+6", s), "expanded-not-factorised");
  });
});

// ---------------------------------------------------------------------------
// Sign errors
// ---------------------------------------------------------------------------

describe("sign-error near misses", () => {
  test("constant term sign", () => {
    expectWrong(checkAlgebraic("3x+7", equiv("3x-7")), "sign-error", /signs/);
  });

  test("middle term sign of a quadratic", () => {
    expectWrong(checkAlgebraic("x^2-x-6", equiv("x^2+x-6")), "sign-error");
  });

  test("whole expression negated", () => {
    expectWrong(checkAlgebraic("-x^2-x+6", equiv("x^2+x-6")), "sign-error");
  });

  test("two signs swapped in a factorised answer is beyond a single sign slip (limitation)", () => {
    expectWrong(checkAlgebraic("(x-3)(x+2)", equiv("(x+3)(x-2)")), "not-equivalent");
  });
});

// ---------------------------------------------------------------------------
// Unparseable input
// ---------------------------------------------------------------------------

describe("unparseable input", () => {
  test("unbalanced bracket", () => {
    expectWrong(checkAlgebraic("2x+(3", equiv("2x+3")), "unparseable", /could not read/);
  });

  test("empty or blank answer", () => {
    expectWrong(checkAlgebraic("", equiv("2x+3")), "unparseable", /Type an answer first/);
    expectWrong(checkAlgebraic("   ", equiv("2x+3")), "unparseable");
  });

  test("truncated LaTeX", () => {
    expectWrong(checkAlgebraic("\\frac{1}{", equiv("2x+3")), "unparseable");
  });

  test("a broken marking-scheme answer is reported, not marked wrong", () => {
    expectWrong(checkAlgebraic("2x+3", equiv("2x+(3")), "unparseable", /expected answer/);
  });

  test("parseStudentExpression exposes the parse error", () => {
    const bad = parseStudentExpression("2x+(3");
    expect(bad.expr).toBeNull();
    expect(bad.error).toMatch(/unexpected operator/);

    const good = parseStudentExpression("x^2");
    expect(good.latex).toBe("x^{2}");
    expect(good.expr).not.toBeNull();
    expect(good.error).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Plain-text typing
// ---------------------------------------------------------------------------

describe("plain-text typing", () => {
  const spec = equiv("6x^2-4x+1");

  test("caret, unicode superscript, unicode minus and ** / * operators", () => {
    expectCorrect(checkAlgebraic("6x^2-4x+1", spec), "identical");
    expectCorrect(checkAlgebraic("6x²-4x+1", spec), "identical");
    expectCorrect(checkAlgebraic("6x^2−4x+1", spec), "identical");
    expectCorrect(checkAlgebraic("6*x**2 - 4*x + 1", spec), "identical");
  });

  test("terms in a different order", () => {
    expectCorrect(checkAlgebraic("1-4x+6x^2", spec));
  });

  test("toLatex normalises typed maths", () => {
    expect(toLatex("6x²-4x+1")).toBe("6x^{2}-4x+1");
    expect(toLatex("sqrt(2)")).toBe("\\sqrt{2}");
    expect(toLatex("5√2/6")).toBe("5\\sqrt{2}/6");
    expect(toLatex("x>=3")).toBe("x\\ge 3");
    expect(toLatex("x^-1")).toBe("x^{-1}");
    expect(toLatex("e^(2x)")).toBe("e^{2x}");
    expect(toLatex("abs(x-1)")).toBe("\\left|x-1\\right|");
    expect(toLatex("x=±3")).toBe("x=\\pm 3");
    // LaTeX passes through untouched
    expect(toLatex("\\frac{2}{x+2}+\\frac{3}{2x-1}")).toBe("\\frac{2}{x+2}+\\frac{3}{2x-1}");
  });
});

// ---------------------------------------------------------------------------
// Log laws (domain-restricted sampling)
// ---------------------------------------------------------------------------

describe("log laws", () => {
  const positive = { domain: { x: [1, 5] as [number, number], y: [1, 5] as [number, number] } };
  const spec = equiv("\\log(x^2y)", positive);

  test("log(x²y) ≡ 2 log x + log y for x, y > 0 (decided by sampling)", () => {
    expectSampledIfUsed(expectCorrect(checkAlgebraic("2\\log x+\\log y", spec), "equivalent"));
    expectCorrect(checkAlgebraic("\\log x^2+\\log y", spec));
    expectCorrect(checkAlgebraic("2log(x)+log(y)", spec));
  });

  test("natural logs", () => {
    expectCorrect(checkAlgebraic("2\\ln x+\\ln y", equiv("\\ln(x^2y)", positive)));
  });

  test("without a domain the sampler skips points where a side is undefined", () => {
    expectCorrect(checkAlgebraic("2\\log x+\\log y", equiv("\\log(x^2y)")));
  });

  test("2 log x - log y is wrong; against the expanded scheme it is a sign error", () => {
    expectWrong(checkAlgebraic("2\\log x-\\log y", spec), "not-equivalent");
    expectWrong(checkAlgebraic("2\\log x-\\log y", equiv("2\\log x+\\log y", positive)), "sign-error");
  });
});

// ---------------------------------------------------------------------------
// Trig identities
// ---------------------------------------------------------------------------

describe("trig identities", () => {
  test("sin²x + cos²x ≡ 1 (either way round, LaTeX or plain)", () => {
    expectCorrect(checkAlgebraic("\\sin^2 x+\\cos^2 x", equiv("1")), "equivalent");
    expectCorrect(checkAlgebraic("1", equiv("\\sin^2 x+\\cos^2 x")), "equivalent");
    expectCorrect(checkAlgebraic("sin(x)^2+cos(x)^2", equiv("1")));
  });

  test("sin²x - cos²x is not 1", () => {
    expectWrong(checkAlgebraic("\\sin^2 x-\\cos^2 x", equiv("1")), "not-equivalent", /For example/);
  });

  test("tan x ≡ sin x / cos x and 1 - cos²θ ≡ sin²θ", () => {
    expectSampledIfUsed(expectCorrect(checkAlgebraic("\\tan x", equiv("\\frac{\\sin x}{\\cos x}"))));
    expectCorrect(checkAlgebraic("1-\\cos^2\\theta", equiv("\\sin^2\\theta")));
  });
});

// ---------------------------------------------------------------------------
// Completed square
// ---------------------------------------------------------------------------

describe("completed-square form", () => {
  const spec = inForm("2(x+1)^2-3", "completed-square");

  test("accepts a(x+p)²+q", () => {
    expectCorrect(checkAlgebraic("2(x+1)^2-3", spec), "identical");
    expectCorrect(checkAlgebraic("(x-3)^2-4", inForm("(x-3)^2-4", "completed-square")), "identical");
  });

  test("the expanded quadratic is the wrong form", () => {
    expectWrong(checkAlgebraic("2x^2+4x-1", spec), "equivalent-wrong-form", /a\(x \+ p\)² \+ q/);
    expectWrong(checkAlgebraic("x^2-6x+5", inForm("(x-3)^2-4", "completed-square")), "equivalent-wrong-form");
  });

  test("uncombined constants are 'not simplified'", () => {
    expectWrong(checkAlgebraic("2(x+1)^2-1-2", spec), "not-simplified", /constant terms/);
  });

  test("two squared brackets is not the form", () => {
    expectWrong(checkAlgebraic("(x+1)^2+(x+1)^2-3", spec), "equivalent-wrong-form");
  });

  test("wrong constant is simply not equivalent", () => {
    expectWrong(checkAlgebraic("(x-3)^2-5", inForm("(x-3)^2-4", "completed-square")), "not-equivalent");
  });

  test("in equivalent mode the completed square matches the expanded quadratic", () => {
    expectCorrect(checkAlgebraic("2(x+1)^2-3", equiv("2x^2+4x-1")));
  });
});

// ---------------------------------------------------------------------------
// Expanded form
// ---------------------------------------------------------------------------

describe("expanded form", () => {
  const spec = inForm("x^2+5x+6", "expanded");

  test("accepts the expanded, collected polynomial", () => {
    expectCorrect(checkAlgebraic("x^2+5x+6", spec), "identical");
    expectCorrect(checkAlgebraic("2x^2+5x-3", inForm("2x^2+5x-3", "expanded")), "identical");
  });

  test("brackets left in are the wrong form", () => {
    expectWrong(checkAlgebraic("(x+2)(x+3)", spec), "equivalent-wrong-form", /multiply out/);
    expectWrong(checkAlgebraic("(2x-1)(x+3)", inForm("2x^2+5x-3", "expanded")), "equivalent-wrong-form");
  });

  test("uncollected like terms are 'not simplified'", () => {
    expectWrong(checkAlgebraic("x^2+2x+3x+6", spec), "not-simplified", /like terms/);
    expectWrong(checkAlgebraic("6x+5x^2-3-4x^2", inForm("x^2+6x-3", "expanded")), "not-simplified");
  });
});

// ---------------------------------------------------------------------------
// Inequalities, simplification mode, equations vs expressions, coefficients
// ---------------------------------------------------------------------------

describe("inequalities", () => {
  test("x > 3 ≡ 3 < x ≡ 2x > 6", () => {
    expectCorrect(checkAlgebraic("3<x", equiv("x>3")), "identical");
    expectCorrect(checkAlgebraic("2x>6", equiv("x>3")), "equivalent");
  });

  test("reversed or non-strict inequality is not equivalent", () => {
    expectWrong(checkAlgebraic("x<3", equiv("x>3")), "not-equivalent");
    expectWrong(checkAlgebraic("x \\ge 3", equiv("x>3")), "not-equivalent");
  });

  test("plain-text <= maps to \\le", () => {
    expectCorrect(checkAlgebraic("x<=3", equiv("x\\le3")), "identical");
  });
});

describe("identical-after-simplify mode", () => {
  test("answers that simplify to the scheme's form are accepted", () => {
    expectCorrect(checkAlgebraic("\\frac{2x+4}{2}", simplified("x+2")), "identical");
    expectCorrect(checkAlgebraic("2x+3x", simplified("5x")), "identical");
    expectCorrect(checkAlgebraic("x^2+2x+3x+6", simplified("x^2+5x+6")), "identical");
    expectCorrect(checkAlgebraic("(x+2)(x+3)", simplified("x^2+5x+6")), "identical");
  });
});

describe("equation versus bare expression", () => {
  test("y = 2x - 1 and 2x - 1 are accepted for each other", () => {
    expectCorrect(checkAlgebraic("2x-1", equiv("y=2x-1")), "equivalent");
    expectCorrect(checkAlgebraic("y=2x-1", equiv("2x-1")), "equivalent");
  });
});

describe("integer-coefficients form", () => {
  const spec = inForm("2x+y=6", "integer-coefficients");

  test("fractional or decimal coefficients are the wrong form", () => {
    expectWrong(checkAlgebraic("x+\\frac{1}{2}y=3", spec), "equivalent-wrong-form", /integer coefficients/);
    expectWrong(checkAlgebraic("0.5x+y=3", inForm("x+2y=6", "integer-coefficients")), "equivalent-wrong-form");
  });

  test("integer coefficients accepted", () => {
    expectCorrect(checkAlgebraic("2x+y=6", spec), "identical");
  });
});

// ---------------------------------------------------------------------------
// Numbers, constants and several variables
// ---------------------------------------------------------------------------

describe("numbers, constants and several variables", () => {
  test("decimal and fraction forms of a number", () => {
    expectCorrect(checkAlgebraic("0.75", equiv("\\frac{3}{4}")));
    expectCorrect(checkAlgebraic("2^{10}", equiv("1024")));
    expectCorrect(checkAlgebraic("2\\pi", equiv("\\pi \\cdot 2")));
  });

  test("a decimal approximation of π is not π", () => {
    expectWrong(checkAlgebraic("3.14", equiv("\\pi")), "not-equivalent");
  });

  test("(a+b)² with two variables", () => {
    expectCorrect(checkAlgebraic("a^2+2ab+b^2", equiv("(a+b)^2")));
    expectWrong(checkAlgebraic("a^2+b^2", equiv("(a+b)^2")), "not-equivalent", /a = .* and b = /);
  });

  test("removable singularities are ignored by sampling (documented limitation)", () => {
    expectCorrect(checkAlgebraic("\\frac{x^2-1}{x-1}", equiv("x+1")));
  });
});

describe("a solution set typed with degree signs", () => {
  const spec = { answer: "x=30, x=150", variables: ["x"], form: "solution-set" } as never;
  test("the degree sign or the word is not part of the value", () => {
    expect(splitSolutions("30° and 150°")).toEqual(["30", "150"]);
    expect(splitSolutions("x = 30 degrees or x = 150 degrees")).toEqual(["x = 30", "x = 150"]);
    expect(splitSolutions("30^{\\circ}, 150^\\circ")).toEqual(["30", "150"]);
    for (const raw of ["30° and 150°", "x = 30° or x = 150°", "30 degrees, 150 degrees", "x=30,150"]) {
      expect(checkAlgebraic(raw, spec).correct, raw).toBe(true);
    }
    expect(checkAlgebraic("30°, 210°", spec).correct).toBe(false);
  });
});

describe("logarithm forms", () => {
  const single = { answer: "\\log 8x^3", mode: "form", form: "single-log" } as never;
  const expanded = { answer: "2\\log a + 3\\log b", mode: "form", form: "expanded-logs" } as never;
  test("single-log wants exactly one log and nothing outside it", () => {
    expect(checkAlgebraic("\\log 8x^3", single).correct).toBe(true);
    expect(checkAlgebraic("\\log(8x^3)", single).correct).toBe(true);
    expect(checkAlgebraic("y = \\log 8x^3", single).correct).toBe(true);
    const coefficient = checkAlgebraic("3\\log 2x", single);
    expect(coefficient.correct).toBe(false);
    expect(coefficient.reason).toBe("equivalent-wrong-form");
    expect(checkAlgebraic("\\log 8 + 3\\log x", single).correct).toBe(false);
    expect(checkAlgebraic("\\log 4x^3", single).correct).toBe(false);
  });
  test("a number added to the log is named as added, not as a number in front of it (laws-of-logarithms q0006)", () => {
    // "Express 2 + log x as a single logarithm": typing the question back is right in value and wrong in form, and the
    // 2 is added, not multiplied, so the "number in front of the log belongs inside as a power" reading is wrong advice.
    const q6 = { answer: "\\log 100x", mode: "form", form: "single-log" } as never;
    const added = checkAlgebraic("2 + \\log x", q6);
    expect(added.correct).toBe(false);
    expect(added.reason).toBe("equivalent-wrong-form");
    expect(added.feedback).not.toMatch(/in front of the log/);
    expect(added.feedback).toMatch(/added/);
    expect(checkAlgebraic("\\log x + 2", q6).feedback).toMatch(/added/);
    // A number in front of the log is still named as one.
    expect(checkAlgebraic("3\\log 2x", single).feedback).toMatch(/in front of the log/);
  });
  test("expanded-logs wants no product, quotient or power inside any log", () => {
    expect(checkAlgebraic("2\\log a + 3\\log b", expanded).correct).toBe(true);
    expect(checkAlgebraic("3\\log b + 2\\log a", expanded).correct).toBe(true);
    const combined = checkAlgebraic("\\log(a^2 b^3)", expanded);
    expect(combined.correct).toBe(false);
    expect(combined.reason).toBe("equivalent-wrong-form");
    expect(checkAlgebraic("\\log a^2 + \\log b^3", expanded).correct).toBe(false);
    expect(checkAlgebraic("2\\log a + 2\\log b", expanded).correct).toBe(false);
  });
  test("a quotient as a single log, and its expansion with a minus", () => {
    const q = { answer: "\\log \\frac{ac}{b^4}", mode: "form", form: "single-log" } as never;
    expect(checkAlgebraic("\\log \\frac{ac}{b^4}", q).correct).toBe(true);
    expect(checkAlgebraic("\\log(ac) - \\log(b^4)", q).correct).toBe(false);
    const e = { answer: "\\log a + \\log c - 4\\log b", mode: "form", form: "expanded-logs" } as never;
    expect(checkAlgebraic("\\log a + \\log c - 4\\log b", e).correct).toBe(true);
    expect(checkAlgebraic("\\log(ac) - \\log(b^4)", e).correct).toBe(false);
  });
});

describe("vectors in i and j", () => {
  const spec = { answer: "3i + 4j", mode: "equivalent", variables: ["i", "j"] } as never;
  test("every honest spelling of the vector is the vector", () => {
    for (const raw of ["3i + 4j", "3i+4j", "4j + 3i", "3\\mathbf{i} + 4\\mathbf{j}", "3\\hat{i}+4\\hat{j}", "\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}", "(3, 4)", "3i + 4j m/s", "3i + 4j N"]) {
      expect(checkAlgebraic(raw, spec).correct, raw).toBe(true);
    }
  });
  test("a different vector is not, and the feedback names i and j", () => {
    const v = checkAlgebraic("3i - 4j", spec);
    expect(v.correct).toBe(false);
    expect(checkAlgebraic("4i + 3j", spec).correct).toBe(false);
    expect(checkAlgebraic("\\begin{pmatrix} 4 \\\\ 3 \\end{pmatrix}", spec).correct).toBe(false);
    expect(v.feedback).not.toMatch(/e_i|e_j/);
    expect(v.reason).toBe("sign-error");
  });
  test("vectorInput leaves ordinary letters alone", () => {
    expect(vectorInput("2i - 5j")).toBe("2e_i - 5e_j");
    expect(vectorInput("\\sin x + i")).toBe("\\sin x + e_i");
  });
});

describe("the constant of integration in either case", () => {
  const spec = { answer: "2x^4 + c", mode: "equivalent", variables: ["x"] } as never;
  test("+ C earns a spec written + c, and the constant is still required", () => {
    expect(checkAlgebraic("2x^4 + C", spec).correct).toBe(true);
    expect(checkAlgebraic("2x^4 + c", spec).correct).toBe(true);
    expect(checkAlgebraic("2x^4", spec).correct).toBe(false);
    expect(checkAlgebraic("2x^4 + k", spec).correct).toBe(false);
  });
});

describe("a vector with its unit after a tuple or a column", () => {
  const spec = { answer: "3i + 4j", mode: "equivalent", variables: ["i", "j"] } as never;
  test("the unit comes off before the pair is read", () => {
    for (const raw of ["(3, 4) m/s", "\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix} m/s^2", "3\\mathbf{i} + 4\\mathbf{j} m/s", "(3, 4) N"]) {
      expect(checkAlgebraic(raw, spec).correct, raw).toBe(true);
    }
  });
});

describe("a fraction before a function is its coefficient", () => {
  const spec = { answer: "\\frac{1}{2}\\log n", mode: "equivalent", variables: ["n"] } as never;
  test("1/2 log n is half of log n", () => {
    expect(checkAlgebraic("1/2 \\log n", spec).correct).toBe(true);
    expect(checkAlgebraic("1/2 log n", spec).correct).toBe(true);
    expect(checkAlgebraic("0.5 \\log n", spec).correct).toBe(true);
    // "\\log n / 2" reads as log(n/2) under the engine precedence, as it would on paper; the bracketed form is the half.
    expect(checkAlgebraic("(\\log n)/2", spec).correct).toBe(true);
    expect(checkAlgebraic("2 \\log n", spec).correct).toBe(false);
  });
});

describe("single-log-expanded", () => {
  const spec = { answer: "\\log 8x^3", mode: "form", form: "single-log-expanded" } as never;
  test("the argument must be multiplied out", () => {
    expect(checkAlgebraic("\\log 8x^3", spec).correct).toBe(true);
    expect(checkAlgebraic("\\log(8x^3)", spec).correct).toBe(true);
    const bracket = checkAlgebraic("\\log\\left((2x)^3\\right)", spec);
    expect(bracket.correct).toBe(false);
    expect(bracket.reason).toBe("equivalent-wrong-form");
    expect(checkAlgebraic("\\log(2^3 x^3)", spec).correct).toBe(false);
    expect(checkAlgebraic("3\\log 2x", spec).correct).toBe(false);
  });
});

describe("a squared unit after a vector", () => {
  const spec = { answer: "3i - 4j", mode: "equivalent", variables: ["i", "j"] } as never;
  test("m/s² in every spelling comes off", () => {
    for (const raw of ["3i - 4j m/s²", "3\\mathbf{i} - 4\\mathbf{j} m/s²", "(3i - 4j) m/s²", "3i - 4j m/s^{2}", "3i - 4j m s⁻²", "3i - 4j ms^-2"]) {
      expect(checkAlgebraic(raw, spec).correct, raw).toBe(true);
    }
  });
});
