/**
 * Plain-text helpers shared by the deck, the See it and the Read note (pure).
 */

/**
 * Sentences of a markdown line, cut after . ! or ? followed by a space, never inside `$…$` or `$$…$$` and never after
 * "e.g." or "i.e.". The last piece takes whatever is left.
 */
export function splitSentences(md: string): string[] {
  const out: string[] = [];
  let start = 0;
  let inMaths = false;
  for (let i = 0; i < md.length; i += 1) {
    const ch = md[i];
    if (ch === "\\") {
      i += 1;
      continue;
    }
    if (ch === "$") {
      // `$$` opens or closes display maths as one delimiter.
      if (md[i + 1] === "$") i += 1;
      inMaths = !inMaths;
      continue;
    }
    if (inMaths) continue;
    if ((ch === "." || ch === "!" || ch === "?") && /^["')\]*]*\s/.test(md.slice(i + 1, i + 4))) {
      // "e.g. " and "i.e. " end nothing (audit CQ-19).
      if (ch === "." && /(?:^|[\s(])(?:e\.g|i\.e)$/i.test(md.slice(Math.max(0, i - 4), i))) continue;
      // Take closing quotes, brackets and emphasis markers with the sentence.
      let end = i + 1;
      while (end < md.length && /["')\]*]/.test(md[end])) end += 1;
      out.push(md.slice(start, end).trim());
      start = end;
    }
  }
  const rest = md.slice(start).trim();
  if (rest) out.push(rest);
  return out.filter((s) => s.length > 0);
}

/** Words of a TeX expression spoken plainly, for an accessible name. */
const SPOKEN_COMMANDS: Array<[RegExp, string]> = [
  [/\\left|\\right|\\displaystyle|\\,|\\;|\\:|\\!|\\quad|\\qquad/g, " "],
  [/\\times/g, " × "],
  [/\\div/g, " ÷ "],
  [/\\cdot/g, " × "],
  [/\\pm/g, " ± "],
  [/\\leq?|\\leqslant/g, " ≤ "],
  [/\\geq?|\\geqslant/g, " ≥ "],
  [/\\neq?/g, " ≠ "],
  [/\\approx/g, " ≈ "],
  [/\\pi/g, "π"],
  [/\\theta/g, "θ"],
  [/\\alpha/g, "α"],
  [/\\beta/g, "β"],
  [/\\mu/g, "μ"],
  [/\\sigma/g, "σ"],
  [/\\lambda/g, "λ"],
  [/\\infty/g, "infinity"],
  [/\\circ/g, " degrees"],
  [/\\square/g, " blank "],
  [/\\ldots|\\dots|\\cdots/g, "…"],
];

/** The argument of a TeX command at `from` (a braced group or one character), and where it ends. */
function argument(tex: string, from: number): { text: string; end: number } {
  let i = from;
  while (tex[i] === " ") i += 1;
  if (tex[i] !== "{") return { text: tex[i] ?? "", end: i + 1 };
  let depth = 0;
  for (let j = i; j < tex.length; j += 1) {
    if (tex[j] === "{") depth += 1;
    else if (tex[j] === "}") {
      depth -= 1;
      if (depth === 0) return { text: tex.slice(i + 1, j), end: j + 1 };
    }
  }
  return { text: tex.slice(i + 1), end: tex.length };
}

/**
 * A part of a spoken expression wrapped in brackets when it is more than one term at its own level ("x + 2", not
 * "2(x − 7)"), so "over" and "root" bind clearly: "(x + 2) over (x − 2)", "x over 2(x − 7)".
 */
function grouped(part: string): string {
  const s = part.trim();
  let depth = 0;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i]!;
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    else if (depth === 0 && i > 0 && /[+−=×÷±]/.test(ch)) return `(${s})`;
  }
  return s;
}

/**
 * One TeX expression as words a screen reader says well: fractions as "a over b", powers as "squared", "cubed" or "to
 * the power n", roots as "root", minus as the minus sign. Not a full TeX reader: what it does not know it reads as the
 * command's name without its backslash, never as nothing.
 */
export function spokenTex(tex: string): string {
  let s = tex;
  // Fractions, roots, text and bold first: they hold braced arguments of their own.
  for (let guard = 0; guard < 20; guard += 1) {
    const m = /\\(?:d|t)?frac|\\sqrt|\\text(?:rm|bf|it)?|\\mathrm|\\mathbf|\\boldsymbol|\\operatorname|\\vec|\\hat|\\overline|\\underline/.exec(s);
    if (!m) break;
    const at = m.index;
    const name = m[0];
    if (/frac$/.test(name)) {
      const a = argument(s, at + name.length);
      const b = argument(s, a.end);
      s = `${s.slice(0, at)} ${grouped(spokenTex(a.text))} over ${grouped(spokenTex(b.text))} ${s.slice(b.end)}`;
    } else if (name === "\\sqrt") {
      const a = argument(s, at + name.length);
      s = `${s.slice(0, at)} root ${grouped(spokenTex(a.text))} ${s.slice(a.end)}`;
    } else {
      const a = argument(s, at + name.length);
      s = `${s.slice(0, at)}${spokenTex(a.text)}${s.slice(a.end)}`;
    }
  }
  // Powers.
  s = s.replace(/\^\s*(\{[^{}]*\}|[^\s{])/g, (_, p: string) => {
    const power = p.startsWith("{") ? p.slice(1, -1).trim() : p;
    if (power === "2") return " squared";
    if (power === "3") return " cubed";
    return ` to the power ${spokenTex(power)}`;
  });
  s = s.replace(/_\s*(\{[^{}]*\}|[^\s{])/g, (_, p: string) => ` ${p.startsWith("{") ? p.slice(1, -1) : p}`);
  for (const [re, to] of SPOKEN_COMMANDS) s = s.replace(re, to);
  return s
    .replace(/\\([a-zA-Z]+)/g, " $1 ")
    .replace(/[{}]/g, "")
    .replace(/(\S)\s*([+=<>])\s*/g, "$1 $2 ")
    .replace(/(\w|\))\s*-\s*/g, "$1 − ")
    .replace(/(^|[\s(])-/g, "$1−")
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

/**
 * An option's accessible name, in Slides and in Read alike: its words, its maths spoken ("(x + 2) over (x − 2)"), and
 * after Check what it is to her. KaTeX's MathML gave Chromium's name computation nothing (audit SLIDES-4, READ-1: 11 of
 * 21 options were announced as an unnamed "radio button"), and colour alone said which was right (SLIDES-25).
 */
export function optionName(value: string, state: "" | "chosen" | "ok" | "miss" | "rest", hers: boolean): string {
  const said = spokenText(value);
  if (state === "ok") return `${said} (${hers ? "your answer, and right" : "the right answer"})`;
  if (state === "miss") return `${said} (your answer)`;
  return said;
}

/**
 * A line with `$…$` maths as plain text for an accessible name: the words kept, each formula spoken (spokenTex), the
 * markdown markers dropped. A gate's option or stem read this way is never announced as an empty name (audit READ-1,
 * SLIDES-4: KaTeX's MathML gave Chromium's name computation nothing, so 11 of 21 options had no name).
 */
export function spokenText(md: string): string {
  const out: string[] = [];
  let i = 0;
  while (i < md.length) {
    const display = md.startsWith("$$", i);
    const open = display ? 2 : md[i] === "$" && md[i - 1] !== "\\" ? 1 : 0;
    if (open) {
      const close = md.indexOf(display ? "$$" : "$", i + open);
      if (close > i) {
        out.push(` ${spokenTex(md.slice(i + open, close))} `);
        i = close + open;
        continue;
      }
    }
    out.push(md[i]!);
    i += 1;
  }
  return out
    .join("")
    .replace(/\\\$/g, "$")
    .replace(/\*\*|__|[*_`]/g, "")
    .replace(/\s+([,.;:?!])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
