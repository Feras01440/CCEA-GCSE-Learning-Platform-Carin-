/**
 * scripts/qa/teach-show-check.mjs — the "teach → show → check" rule (owner's ruling, 24 Sep 2026, 19:20;
 * STANDARDS.md "Teach before you check"; pipeline/prompts/author-topic.md, Depth standard).
 *
 * A gate comes only after the idea has been explained AND shown worked in front of her, inside the
 * teaching section the gate belongs to. For every gate in the teaching body this module asks whether
 * its section holds, somewhere before the gate:
 *
 *   explained  an EXPLANATION block: a `p` carrying at least EXPLAIN_WORDS words of prose (words of two
 *              or more letters, outside $…$ maths), or a titled `callout` of a teaching kind (why,
 *              mustknow, examiner) with the same number of words. A spec callout quotes the statement
 *              and a notonspec callout marks a boundary; neither teaches the idea, so neither counts.
 *   shown      a SHOWN block: a `video` or a `sim` (the method carried out in front of her), or a stepped
 *              demonstration: a `p` or a callout (not a must-know list) holding at least two worked steps,
 *              or one complete calculation (numbers and an operation on the left of "=", a number on the
 *              right: "1.5 ÷ 50 = 0.03 s"), or a conversion worked in words ("$1.05 \times 10^{7}$ grams is
 *              $1.05 \times 10^{4}$ kilograms, because …"; a calculator display written out, "6.82E8" and
 *              "$6.82 \times 10^{8}$"), or, as science demonstrates (coordinator's ruling, 25 Sep 2026), a worked
 *              answer applied to a named case in two or more numbered lines, or two or more questions about the
 *              case answered line by line (appliedSteps); under a "See it done" heading, which names the case,
 *              ordered steps count without the case named again; a `see` block. A list of terms with their
 *              definitions, or a process told in general with no case, is the explanation, not its show.
 *              Step numbers are read in every usual form (NUMBERED); maths in $…$, $$…$$, \[…\] and \(…\) (MATHS);
 *              a charge on a species is part of the species, never an operation (withoutCharges); a word of working
 *              links two pieces of maths only on one line or within eight words (isWorkingLink).
 *              A figure or a photo alone is NOT shown (25 Sep 2026, the verifier's
 *              reading of the ruling: a picture explains; it does not carry the method out step by step).
 *              A worked step is a maths relation that works with numbers (=, ≈, ≡, an arrow; a chain
 *              $a = b = c$ is two steps; the inequality signs of one segment, as in $1 \le a < 10$, are
 *              one), a maths segment reached from the one before it by a word of working ("… becomes
 *              $5(x^2 - 9)$"), or a numbered or bold-labelled line that carries out an operation on a number
 *              in words ("Multiply out: 3 times 4 is 12"). NOT a step: a formula stated ("$A = \pi r^2$",
 *              "$y = mx + c$"), a law ("$a^m \times a^n = a^{m+n}$"), a label with its value ("**Mean** is
 *              5"). Plain-text arithmetic counts, as science notes write it ("60 ÷ 10 = 6").
 *
 *              What the lint cannot see: whether the demonstration is of the same step the gate asks for.
 *              Authors apply the rule by judgement there.
 *
 * Checks in a section. "Explained" holds for the whole section (it explains once, then may show and check more
 * than once). "Shown" is spent by a check: the next check needs a demonstration after the previous one, unless it
 * follows straight on (checks with nothing between share the demonstration before them: two turns on one See it).
 *
 * One paragraph may do both (the idea in words with its two lines of working); the rule asks that both
 * have happened before the check, not that they sit in separate cards.
 *
 * Sections. The body runs to the recap heading ("You can now", role recap) or, failing that, the
 * "In the exam" pointer. A section starts at each `h` block; the blocks before the first heading (the
 * hook) are the opening section. A "See it done" section (role `see`, or an unlabelled heading the depth
 * report reads as one) is the show step of the section above it, so for this rule it continues that
 * section: its gate is checked against the teaching above it and the demonstration in it. So is a
 * section that holds nothing but visuals before its first gate (a video, a sim, a figure: "Turn a cell
 * round yourself"). A section with no gate of its own has not been closed by a check, so its teaching
 * runs on into the next section; a section that ends in a gate never lends its teaching past that gate,
 * and the opening (the hook and the hero figure, before or under the note's first heading) never carries. A section's index is its heading's position among the note's headings (the
 * opening is 0).
 *
 * The four-card rule (a gate at most every four cards) is a ceiling, never a quota: nothing here asks
 * for more gates, and a section may run several cards of explanation and demonstration before its one
 * check.
 */

export const EXPLAIN_WORDS = 15;
export const STEPS_SHOWN = 2;
export const TEACHING_CALLOUTS = new Set(["why", "mustknow", "examiner"]);
// A video or a sim carries the method out in front of her. A figure or a photo explains, but alone it does not show the
// method worked (the owner's ruling as the verifier read it, 25 Sep 2026: 535 gates passed on a picture alone).
const VISUAL_SHOWN = new Set(["video", "sim"]);
const VISUALS = new Set(["figure", "photo", "video", "sim"]);

/**
 * An unlabelled heading that reads as "See it done": the method carried out in front of her. The physics
 * notes say "Watch it done", "Watch it explained", "Watch the construction done". lesson-v2.mjs guesses
 * the `see` role from this same pattern, so the two scripts cannot disagree about what a see section is.
 */
export const SEE_HEADING = /\bsee it\b|\bworked in full\b|\bstart to finish\b|\bwritten out\b|\bworked example\b|\bwatch it\b|\bwatch the [a-z]+ (done|explained|drawn|worked)\b/i;
export const isSeeHeading = (text) => SEE_HEADING.test(String(text ?? ""));
const isRecap = (b) => b.type === "h" && (b.role === "recap" || /^you can now$/i.test(String(b.text ?? "").trim()));
const isPointer = (b) => b.type === "h" && (b.role === "pointer" || /^in the exam$/i.test(String(b.text ?? "").trim()));
const isSee = (b) => b.type === "h" && (b.role === "see" || (!b.role && isSeeHeading(b.text)));

// Maths in every form an author writes it: display $$…$$ and \[…\], inline \(…\) and $…$ (C2 E author, 25 Sep 2026: a
// worked line set as \[…\] display maths was read as prose, so it never counted as shown). texOf reads the segment.
const MATHS = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$]+)\$/g;
const texOf = (m) => m[1] ?? m[2] ?? m[3] ?? m[4] ?? "";
/** The inline segments of a string, \(…\) and $…$, never a display segment ($$…$$, \[…\]), which scrolls rather than clips. */
export const inlineMaths = (s) => [...String(s ?? "").matchAll(MATHS)].filter((m) => m[3] !== undefined || m[4] !== undefined).map((m) => (m[3] ?? m[4]).trim());
const RELATION = /=|\\approx|\\equiv|\\neq|≈|≡|->|\\to\b|\\rightarrow|\\Rightarrow|\\longrightarrow|⇒|→|<|>|\\le\b|\\ge\b|\\leq|\\geq|\\lt|\\gt|≤|≥/;
const LABELLED_LINE = /^\s*(\*\*[^*]{1,40}\*\*|(step\s*)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*[.):])\s*/i;

const wordsIn = (s) => String(s ?? "").split(/\s+/).filter((w) => /[A-Za-z]{2,}/.test(w)).length;
const withoutMaths = (s) => String(s ?? "").replace(MATHS, " ").replace(/\*\*/g, "");

/** Words of prose in a block's md: words outside maths. */
export const proseWords = (md) => wordsIn(withoutMaths(md));

const RELATIONS = new RegExp(RELATION.source, "g");
// An inequality sign is a condition rather than a step of working when it shares its segment with
// another one: "$1 \le a < 10$" states one range. So the inequality signs of one maths segment count
// as a single step between them, while each equals sign, approximation and arrow counts on its own.
const INEQUALITY = /^(<|>|\\le|\\ge|\\leq|\\geq|\\lt|\\gt|≤|≥)$/;
// A relation is a step of working only when it works with numbers. A formula stated ("$A = \pi r^2$", "$C = 2\pi r$",
// "$y = mx + c$": one symbol defined by an expression in letters) or a law ("$a^m \times a^n = a^{m+n}$": no number on
// either side) states the method; it does not carry it out (verifier, 25 Sep 2026: m7/standard-form g14 passed on a
// list of laws). Powers and subscripts are not the numbers that count.
const bare = (s) => String(s).replace(/[\^_]\s*(\{[^{}]*\}|\d+|[A-Za-z])/g, "");
const hasNumber = (s) => /\d/.test(bare(s));
const hasLetter = (s) => /[A-Za-z]/.test(String(s).replace(/\\(times|div|cdot|[dt]?frac|left|right|sqrt|ce|quad|,)/g, " "));
const isSymbol = (s) => /^\s*\\?[A-Za-z]+'?\s*$/.test(bare(s));
const works = (left, right) => {
  if (!String(left).trim()) return hasNumber(right); // "$= 2$" continues a line above
  if (!hasNumber(left) && !hasNumber(right)) return false; // a law
  const formula = (sym, expr) => isSymbol(sym) && hasLetter(expr) && !isSymbol(expr); // one symbol defined by letters
  return !(formula(left, right) || formula(right, left));
};
const SPLIT = new RegExp(`(${RELATION.source})`);
/** Steps in one maths segment: -1 when it holds no relation at all (the connective rule may then apply). */
const stepsInSegment = (tex) => {
  const parts = String(tex).split(SPLIT);
  if (parts.length === 1) return -1;
  let steps = 0;
  let inequality = false;
  for (let i = 1; i < parts.length; i += 2) {
    if (!works(parts[i - 1], parts[i + 1] ?? "")) continue;
    if (INEQUALITY.test(parts[i])) {
      if (!inequality) steps += 1;
      inequality = true;
    } else steps += 1;
  }
  return steps;
};

/**
 * A complete calculation: numbers and an operation on the left of an equals sign and a number on the
 * right ("1.5 ÷ 50 = 0.03 s", "$400 \times 0.9 = 360$", "$\frac{60}{10} = 6$",
 * "$3(3)^{2} - 8(3) + 2 = 5$"). One of these is the whole of a one-step method carried out in front of
 * her, so on its own it counts as shown; a formula ("$y = mx + c$", "$A = \pi r^2$") is not one.
 */
const ARITHMETIC_RUN = /([\d.,()\s×÷*/+\-−^]+)=\s*[-−(]?\d/g;
const texToPlain = (tex) =>
  String(tex)
    // an aligned or gathered display: its rows are lines of working, its & only aligns them
    .replace(/\\begin\{[^}]*\}|\\end\{[^}]*\}/g, " ")
    .replace(/\\\\/g, " ; ")
    .replace(/&/g, "")
    .replace(/\\[,;:! ]/g, "")
    .replace(/\\left|\\right|\\big|\\Big/g, "")
    .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\times|\\cdot/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/[{}]/g, "");
export function calculations(md) {
  const text = String(md ?? "");
  const pieces = [withoutMaths(text), ...[...text.matchAll(MATHS)].map((m) => texToPlain(texOf(m)))];
  let n = 0;
  // A conversion worked in words: "$1.05 \times 10^{7}$ grams is $1.05 \times 10^{4}$ kilograms, because dividing by
  // 1000 lowers the power by 3" (verifier, 25 Sep 2026: m7/standard-form g8, g10). A number in a worked form (an
  // operation or a power in it) is another number, with the reason given; a label with a value ("the mean is 5") is not.
  const inline = text.replace(MATHS, (m, a, b, c, d) => ` ${texToPlain(a ?? b ?? c ?? d ?? "")} `).replace(/\*\*/g, "");
  for (const m of inline.matchAll(/(-?\d[\d.,]*\s*(?:[×÷*/^]\s*-?\d[\d.,]*\s*)+(?:[a-z]+\s+)?)(?:is|equals|makes|gives)\s+-?\d(?:[^.;]|\.\d)*?\b(because|since|as)\b/gi)) if (m[1]) n += 1;
  // A calculator display turned into the written answer: "others show **6.82E8** … Copy it onto the answer line in
  // full: $6.82 \times 10^{8}$" (verifier: m7/standard-form g10). The same number in both spellings is the conversion shown.
  const displays = [...inline.matchAll(/(\d+(?:\.\d+)?)E([+-]?\d+)/g)].map((m) => Number(m[1]) * 10 ** Number(m[2]));
  const written = [...inline.matchAll(/(\d+(?:\.\d+)?)\s*[×x]\s*10\s*\^\s*\(?([+-]?\d+)/g)].map((m) => Number(m[1]) * 10 ** Number(m[2]));
  if (displays.some((d) => written.some((w) => Math.abs(d - w) <= Math.abs(w) * 1e-9))) n += 1;
  for (const piece of pieces)
    for (const m of piece.matchAll(ARITHMETIC_RUN)) {
      const left = m[1];
      if ((left.match(/\d+(\.\d+)?/g) ?? []).length >= 2 && /[×÷*/+\-−^]/.test(left.replace(/^[\s\-−]+/, ""))) n += 1;
    }
  return n;
}
/**
 * A charge or an oxidation state is part of its species, never arithmetic (C2 E author, 25 Sep 2026): "Al³⁺",
 * "$\ce{Al^{3+}}$", "Fe3+", "Cl−", "a 3+ charge", "a 1− charge", an electrode's "(−)" or "(+)". They go before an
 * operation is looked for, so a line that only states a charge is not a worked line.
 */
const withoutCharges = (s) =>
  String(s)
    .replace(/\^\s*\{?\s*\d*\s*[+\-−]\s*\}?/g, "")
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻]/g, "")
    .replace(/([A-Za-z\])])\d*[+\-−](?=[\s,.;:)}]|$)/g, "$1")
    .replace(/\(\s*[+\-−]\s*\)/g, "")
    .replace(/(^|[\s(])\d[+\-−](?=[\s,.;:)]|$)/g, "$1");

// A link that runs on across a line break and past eight words joins two separate statements, not one line of working
// (c2-aluminium-extraction: "… Al³⁺ ion gains three electrons and becomes aluminium … / **Anode (+).** Each O²⁻ …").
const isWorkingLink = (between) => CONNECTIVE.test(between) && !(between.includes("\n") && between.trim().split(/\s+/).length > 8);

/** An operation carried out, in words or signs. */
const OPERATION = /\b(times|multipl\w*|divid\w*|plus|minus|add\w*|subtract\w*|squar\w*|root|halv\w*|doubl\w*|leav\w*|gives?|makes?|cancel\w*|expand\w*|factoris\w*|substitut\w*)\b|[×÷*/+−]|\\times|\\div|\\frac/i;
/** A maths segment reached from the one before it by a word of working ("so", "becomes", "gives" …) is a step too. */
const CONNECTIVE = /\b(so|becomes?|gives|giving|then|leaves|leaving|to get|which is|hence|equals|simplifies to|cancels to|turns into)\b/i;

/**
 * Worked steps in a block's md: each relation inside a maths segment is one step, so a chain
 * $a = b = c$ is two; a maths segment with no relation that follows another maths segment through a
 * word of working ("… becomes $5(x^2 - 9)$") is one; and a numbered or bold-labelled line that
 * carries maths or a number is one when its maths has not already counted.
 */
export function workedSteps(md) {
  const text = String(md ?? "");
  let steps = 0;
  let last = -1;
  for (const m of text.matchAll(MATHS)) {
    const tex = texOf(m);
    const rel = stepsInSegment(tex);
    if (rel >= 0) steps += rel; // a relation, counted only where it works with numbers
    // "… becomes $5(x^2 - 9)$": the word of working joins two pieces of maths on one line, or across a line break
    // within eight words; a "becomes" three sentences and a line away joins nothing
    else if (last >= 0 && isWorkingLink(text.slice(last, m.index))) steps += 1;
    last = m.index + m[0].length;
  }
  // plain-text working, as science notes write it: "60 ÷ 10 = 6 daisies per quadrat" (an equals sign
  // outside maths with a number beside it)
  const PLAIN_RELATION = /[\d)]\s*(=|≈|→)\s*[-−£(\d]/g;
  steps += (withoutMaths(text).match(PLAIN_RELATION) ?? []).length;
  for (const line of text.split("\n")) {
    if (!LABELLED_LINE.test(line)) continue;
    const rest = line.replace(LABELLED_LINE, "");
    const maths = [...rest.matchAll(MATHS)];
    // a labelled line whose working already counted as a step adds nothing; one that carries out an operation on a
    // number in words ("Multiply out: 3 times 4 is 12", "Subtract 5 to leave 7") is one. A label with a value
    // ("**Mean** is 5", "**Range** is 12") reports a result; it works nothing (verifier, 25 Sep 2026).
    if (maths.some((m) => RELATION.test(texOf(m))) || new RegExp(PLAIN_RELATION.source).test(withoutMaths(rest))) continue;
    if ((maths.length || /\d/.test(withoutMaths(rest))) && OPERATION.test(withoutCharges(rest.replace(/\*\*/g, "")))) steps += 1;
  }
  return steps;
}

/** Does this block explain the idea? */
export function explains(b) {
  if (b.type === "p") return proseWords(b.md) >= EXPLAIN_WORDS;
  if (b.type === "callout") return Boolean(String(b.title ?? "").trim()) && TEACHING_CALLOUTS.has(b.kind) && proseWords(b.md) >= EXPLAIN_WORDS;
  return false;
}

/**
 * A worked answer applied to a case, in ordered steps (the coordinator's ruling, 25 Sep 2026, from the B2 D author):
 * science demonstrates by applying the idea to a named situation line by line, with no arithmetic ("The figure's
 * weeds as a full answer: 1. Some weeds had a mutation … [1] 2. The weedkiller killed …"). Counts when the block has
 * two or more numbered lines, they are not a list of terms with definitions ("1. **Variation:** the individuals
 * differ"), and the block names its case: a mark per line ("[1]"), a number, the figure or a drawn thing it reads, a
 * worked answer ("worked", "answer", "the marks", "for example"), or a situation set up before the list ("Then a
 * drought …", "If …", "Say …", "Wanted: …"). A process told in general, with no case, is the explanation, not its show.
 */
// A step number in any form authors write it (P2 C author, 25 Sep 2026): "1." "1)" "1:" "Step 1." "Step 1:"
// "**Step 1:**" "**Step 1: the equation.**" "Step one:", bold or not.
const STEP_WORDS = "one|two|three|four|five|six|seven|eight|nine|ten";
const NUMBERED = new RegExp(String.raw`^\s*(\*\*)?(step\s+(\d+|${STEP_WORDS})|\d+)\s*[.):]([^*\n]{0,40}\*\*)?\s+\S`, "i");
const NUMBERING = new RegExp(String.raw`^\s*(\*\*)?(step\s+(\d+|${STEP_WORDS})|\d+)\s*[.):]([^*\n]{0,40}\*\*)?\s+`, "i");
const DEFINITION_LINE = /^\s*(\*\*)?\d+[.)](\*\*)?\s+(\*\*[^*]+\*\*\s*[:—–-]|\*\*[^*]+[:—–-]\*\*)/;
/** Two or more numbered lines that are not a list of terms with their definitions. */
export function orderedSteps(md) {
  const numbered = String(md ?? "").split("\n").filter((l) => NUMBERED.test(l));
  return numbered.length >= 2 && numbered.filter((l) => DEFINITION_LINE.test(l)).length * 2 < numbered.length;
}
const CASE_CUE = /\[\d\]|\bthe (figure|diagram|graph|table|photo|photograph|dish|curve|cross|pedigree|drawing)('s)?\b|\bworked\b|\banswers?\b|\bthe marks?\b|\bmarks'|\bfor example\b|\be\.g\.|\bwanted\b/i;
const SITUATION_OPENER = /^\s*(then|when|if|suppose|say|imagine|take|here)\b/i;
/** Worked questions answered line by line: "**Which is most effective against bacteria A?** Y: it has the largest …". */
const QA_LINE = /^\s*\*\*[^*]+\?\*\*\s*\S/;
export function appliedSteps(md) {
  // two or more questions about the case, each answered from it, are the case worked through
  if (String(md ?? "").split("\n").filter((l) => QA_LINE.test(l)).length >= 2) return true;
  if (!orderedSteps(md)) return false;
  const lines = String(md ?? "").split("\n");
  const intro = lines.slice(0, lines.findIndex((l) => NUMBERED.test(l))).join(" ");
  const withoutNumbering = lines.map((l) => l.replace(NUMBERING, "")).join("\n");
  return CASE_CUE.test(md) || /\d/.test(withoutMaths(withoutNumbering)) || SITUATION_OPENER.test(intro);
}

/** Does this block show the idea worked in front of her? */
export function shows(b) {
  if (VISUAL_SHOWN.has(b.type)) return true;
  if (b.type === "see") return true; // the design case's See it block: the method carried out, step by step
  // a must-know callout lists the facts to carry into the paper; a list of facts is not the method carried out
  if (b.type === "callout" && b.kind === "mustknow") return false;
  if (b.type === "p" || b.type === "callout") return workedSteps(b.md) >= STEPS_SHOWN || calculations(b.md) >= 1 || appliedSteps(b.md);
  return false;
}

/**
 * Check one note.
 * @param {Array<object>} blocks  note.blocks.json
 * @returns {{ gates: number, sections: Array<{index:number, heading:string, role:string|null, joined:string[], gates:Array<{id:string, explained:boolean, shown:boolean}>}>, failures: Array<{gate:string, section:string, sectionIndex:number, role:string|null, missing:string[]}> }}
 */
export function teachShowCheck(blocks) {
  const recapAt = blocks.findIndex(isRecap);
  const pointerAt = blocks.findIndex(isPointer);
  const end = recapAt >= 0 ? recapAt : pointerAt >= 0 ? pointerAt : blocks.length;
  const body = blocks.slice(0, end).filter((b) => b.type !== "hero");

  const sections = [];
  let cur = { index: 0, heading: "(opening)", role: null, joined: [], items: [] };
  sections.push(cur);
  let headingNo = 0;
  // Blocks under a "See it done" heading: there the heading names the case ("See it done: one aseptic transfer"), so
  // ordered steps count as the demonstration without a case named in the block itself.
  const inSeeSection = new Set();
  let inSee = false;
  for (const b of body) {
    if (b.type === "h") {
      headingNo += 1;
      inSee = isSee(b);
      if (isSee(b) && (cur.items.length || cur.index > 0)) {
        cur.joined.push(String(b.text ?? ""));
        continue;
      }
      cur = { index: headingNo, heading: String(b.text ?? ""), role: b.role ?? null, joined: [], items: [] };
      sections.push(cur);
      continue;
    }
    if (inSee) inSeeSection.add(b);
    cur.items.push(b);
  }
  // A section that holds nothing but a demonstration before its first gate (a video, a sim, a figure:
  // "Turn a cell round yourself") is the show step of the section above, like "See it done".
  for (let i = sections.length - 1; i >= 1; i -= 1) {
    const s = sections[i];
    const first = s.items.findIndex((b) => b.type === "gate");
    const before = first < 0 ? s.items : s.items.slice(0, first);
    const prev = sections[i - 1];
    // never for a section that names itself a new idea, variant, twist …: that is new teaching
    const teachingRole = s.role && s.role !== "see";
    if (!teachingRole && prev.items.length && before.length && before.every((b) => VISUALS.has(b.type))) {
      prev.items.push(...s.items);
      prev.joined.push(s.heading, ...s.joined);
      sections.splice(i, 1);
    }
  }
  // A section with no gate of its own has not been closed by a check: its explanation and its figure
  // are still in front of her when the next section's gate arrives ("the graph above"), so it runs on
  // into the next section. A section that ends in a gate never lends its teaching past that gate.
  // The opening (the hook and the hero figure, before the first heading or under the note's first heading) is not
  // teaching: it never carries into the first section as its show (verifier, 25 Sep 2026: b1-fieldwork-sampling g1
  // and g2 passed on the hook's quadrat pictures).
  const opening = sections.find((s) => s.items.length);
  for (let i = sections.length - 2; i >= 0; i -= 1) {
    const s = sections[i];
    if (s === opening || !s.items.length || s.items.some((b) => b.type === "gate")) continue;
    const next = sections[i + 1];
    next.items.unshift(...s.items);
    next.joined.unshift(...(s.index > 0 ? [s.heading] : []), ...s.joined);
    sections.splice(i, 1);
  }

  const rows = [];
  const failures = [];
  let gates = 0;
  for (const s of sections) {
    let explained = false;
    let shown = false;
    const row = { index: s.index, heading: s.heading, role: s.role, joined: s.joined, gates: [] };
    s.items.forEach((b, k) => {
      if (b.type === "gate") {
        gates += 1;
        row.gates.push({ id: b.id, explained, shown });
        if (!explained || !shown)
          failures.push({ gate: b.id, section: s.heading, sectionIndex: s.index, role: s.role, missing: [...(explained ? [] : ["explained"]), ...(shown ? [] : ["shown"])] });
        // A check spends its demonstration: the next check in the section needs its own, shown after this one
        // (verifier, 25 Sep 2026: m8/equation-of-a-circle g11 passed on a demonstration before the previous
        // check while its own move is taught after it). Checks that follow one another with nothing between
        // share the demonstration before them (two turns on one See it, the design case's "1 of 2, 2 of 2").
        // The explanation is not spent: a section explains once, then may show and check more than once.
        if (s.items[k + 1]?.type !== "gate") shown = false;
        return;
      }
      explained ||= explains(b);
      shown ||= shows(b) || (inSeeSection.has(b) && (b.type === "p" || b.type === "callout") && orderedSteps(b.md));
    });
    if (s.items.length) rows.push(row);
  }
  return { gates, sections: rows, failures };
}

/** One line for a failure, naming the rule. */
export function describeFailure(f) {
  const lacks = f.missing.length === 2 ? "before anything in its section explains or shows the idea" : f.missing[0] === "explained" ? "before its section explains the idea (it is only shown)" : "before its section shows the idea worked (it is only explained)";
  return `teach → show → check: gate ${f.gate} in "${f.section}"${f.role ? ` [${f.role}]` : ""} comes ${lacks}`;
}
