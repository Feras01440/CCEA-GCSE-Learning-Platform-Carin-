/**
 * scripts/qa/we-hidden-steps.mjs — which steps of a worked example each faded mode hides.
 *
 * The same plan as src/components/items/fade.ts planFade (which the QA scripts, plain node, cannot import):
 * backward fading, faded1 hides the last step and faded2 the last two, unless the example carries its own
 * `faded` plan whose showSteps is below the step count. src/lib/build/we-figure-leaks.test.ts holds the two
 * to each other on the schema's shapes and on every published worked example.
 *
 * WorkedExampleAsQuestion.tsx shows the worked example's own figure in the full, faded and problem modes, and
 * only the twin's figure in the twin mode; so what the worked example's figure must not print is what the
 * faded modes hide (and the final answer, which the problem mode asks for).
 */

function defaultFaded(total, hide) {
  const h = Math.min(Math.max(1, hide), Math.max(1, total));
  const showSteps = Math.max(0, total - h);
  return { showSteps, studentSupplies: Array.from({ length: total - showSteps }, (_, i) => showSteps + i + 1) };
}

/**
 * @param {{ steps: Array<{ n: number }>, faded?: Array<{ showSteps: number, studentSupplies: number[] }> }} we
 * @returns {Array<{ mode: "faded1" | "faded2", showSteps: number, supplied: number[] }>}
 */
export function hiddenSteps(we) {
  const total = (we.steps ?? []).length;
  return ["faded1", "faded2"].map((mode, index) => {
    const authored = (we.faded ?? [])[index];
    const plan = authored && authored.showSteps < total ? authored : defaultFaded(total, index + 1);
    const supplied = plan.studentSupplies.filter((n) => n > plan.showSteps && n <= total).sort((a, b) => a - b);
    return { mode, showSteps: plan.showSteps, supplied };
  });
}

/**
 * The figure a mode shows, as src/components/items/WorkedExampleAsQuestion.tsx figureForMode chooses it (the
 * renderer is a .tsx the QA scripts cannot import; src/lib/build/we-figure-leaks.test.ts holds the two together):
 * the annotated `figure` for the full example; `figurePlain` when the example has one, else `figure`, for the
 * faded and problem modes. The twin mode shows only the twin's own figure.
 * @param {{ figure?: object, figurePlain?: object }} we
 * @param {"full" | "faded1" | "faded2" | "twin" | "problem"} mode
 */
export function weFigureFor(we, mode) {
  return mode === "full" ? we.figure : (we.figurePlain ?? we.figure);
}
