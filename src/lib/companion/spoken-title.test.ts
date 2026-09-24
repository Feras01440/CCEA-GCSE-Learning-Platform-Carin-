/**
 * A catalogue title is the specification's name for a topic; a line that says it needs a teacher's form, and
 * never another topic's name. Found on the dev server on M4 histograms, 20 Sep 2026: "Histograms with unequal
 * class widths (frequency density) and estimating the median is not difficult. It is sly, which is worse."
 * Found by the topic-page agent, 23 Sep 2026: cutting at a comma or "and" turned "Index laws with zero and
 * negative powers" into "Index laws with zero", and "Sketching the graphs of sin x, cos x and tan x" into
 * "Sketching the graphs of sin x". A title is now cut only where the part kept is still the whole name.
 */
import { describe, expect, it } from "vitest";
import { topicsFor, unitsFor, type Subject } from "@/lib/content/taxonomy";
import { DEFAULT_PLAN } from "@/lib/plan/exam-plan";
import { freshState } from "./memory";
import { SPOKEN_TITLE_WORDS, buildCompanionContext, spokenTitle, withoutAsides } from "./context";

const HISTOGRAMS = "Histograms with unequal class widths (frequency density) and estimating the median";

describe("spoken titles", () => {
  it("drops an aside in brackets and keeps a bracket of mathematics", () => {
    expect(spokenTitle("Simplifying, multiplying and dividing algebraic fractions (factorise and cancel)")).toBe(
      "Simplifying, multiplying and dividing algebraic fractions",
    );
    expect(spokenTitle("Index laws with zero and negative powers (numbers)")).toBe("Index laws with zero and negative powers");
    expect(spokenTitle("Pascal's triangle and expanding (p + q)ⁿ")).toBe("Pascal's triangle and expanding (p + q)ⁿ");
    expect(withoutAsides(HISTOGRAMS)).toBe("Histograms with unequal class widths and estimating the median");
  });

  it("leaves a short title whole, its 'and' included", () => {
    expect(spokenTitle("Sine and cosine rules")).toBe("Sine and cosine rules");
    expect(spokenTitle("Speed, distance and time")).toBe("Speed, distance and time");
    expect(spokenTitle("Standard form: multiplying and dividing")).toBe("Standard form: multiplying and dividing");
  });

  it("never cuts a title at a comma or 'and' into another topic's name", () => {
    for (const title of [
      "Index laws with zero and negative powers",
      "Sketching the graphs of sin x, cos x and tan x",
      "Effect of a linear transformation on mean and SD",
      "Upper and lower bounds in addition and multiplication",
      "Solving quadratic equations by factorising, completing the square and the formula",
    ]) {
      expect(spokenTitle(title), title).toBe(title);
    }
    expect(spokenTitle(HISTOGRAMS)).toBe("Histograms with unequal class widths and estimating the median");
  });

  it("cuts a long title only where the head is still the whole name: a colon, a semicolon, 'including', 'using'", () => {
    expect(spokenTitle("Direct and inverse proportion including squares and cubes")).toBe("Direct and inverse proportion");
    expect(spokenTitle("Line of best fit through (x̄, ȳ): drawing, equation and use")).toBe("Line of best fit through (x̄, ȳ)");
    expect(spokenTitle("Solving quadratic equations in context using the quadratic formula")).toBe("Solving quadratic equations in context");
  });

  it("over the whole catalogue: every spoken title is the title without its asides, or a head cut at a safe place", () => {
    const subjects: Subject[] = ["maths", "further-maths", "science"];
    let checked = 0;
    for (const subject of subjects) {
      for (const unit of unitsFor(subject)) {
        for (const t of topicsFor(subject, unit.code)) {
          const whole = withoutAsides(t.title);
          const said = spokenTitle(t.title);
          checked++;
          if (said === whole) continue;
          const rest = whole.slice(said.length);
          expect(whole.startsWith(said), t.title).toBe(true);
          expect(/^(:|;| including | using )/.test(rest), `${t.title} → "${said}"`).toBe(true);
          expect(said.split(" ").length, t.title).toBeGreaterThanOrEqual(3);
        }
      }
    }
    expect(checked).toBeGreaterThan(300);
  });

  it("says the topic the page's way, prefers the hero's display title, and earns the sly line only on a short one", () => {
    const now = new Date("2026-10-01T19:00:00");
    const base = { now, plan: DEFAULT_PLAN, state: freshState(now) };
    const long = buildCompanionContext({ ...base, topic: { slug: "histograms", unit: "M4", subject: "maths", title: HISTOGRAMS, examinerFlagged: true } });
    expect(long.slots.topicTitle).toBe("Histograms with unequal class widths and estimating the median");
    expect(long.flags.topicIsSly).toBe(true);
    expect(long.flags.topicTitleShort).toBe(false);

    const given = buildCompanionContext({
      ...base,
      topic: { slug: "histograms", unit: "M4", subject: "maths", title: HISTOGRAMS, shortTitle: "Histograms with unequal class widths", examinerFlagged: true },
    });
    expect(given.slots.topicTitle).toBe("Histograms with unequal class widths");
    expect(given.flags.topicTitleShort).toBe(true);
    expect(SPOKEN_TITLE_WORDS).toBe(6);

    // A display title that carries mathematics is not said: a line is plain text, so the catalogue's name is.
    const tex = buildCompanionContext({
      ...base,
      topic: { slug: "growth-decay", unit: "M8", subject: "maths", title: "Growth and decay", shortTitle: "Growth, decay and the graphs of $y = k^{x}$" },
    });
    expect(tex.slots.topicTitle).toBe("Growth and decay");

    const next = buildCompanionContext({ ...base, nextTopic: { slug: "histograms", title: HISTOGRAMS } });
    expect(next.slots.nextTopicTitle).toBe("Histograms with unequal class widths and estimating the median");
  });
});
