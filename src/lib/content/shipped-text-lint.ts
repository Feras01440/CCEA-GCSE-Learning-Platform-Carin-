/**
 * Build warnings (never refusals) on the text a topic ships, read from the public bundle exactly as
 * pipeline/build-content.mts writes it to public/content/<subject>/<id>.json (the `shipped` object: its topic, note, note
 * blocks, worked examples, diagnostics, questions, find-the-mistake items, prompts, insight and sets; the verification logs
 * are not read, as no learner reads them). What ships is what is read: a withdrawn or draft item never reaches this
 * lint because the build never ships it. Each warning is one line naming the topic, the item, the field and the thing to
 * fix. Pure.
 *
 * The build's other lints are in src/components/items/content-lint.ts; these two were added on 29 Sep 2026 (the lead's
 * items b and d) in a module of their own, beside the content schema, while the engine pass owns src/components/items.
 * (Named shipped-text-lint, not content-lint, so that one name means one file: the lead, 29 Sep 2026, 18:00.)
 *
 * characterWarnings (the build prints CHARACTER): a character that must never ship in text.
 *  - a C0 control character other than a newline or a tab (U+0000 to U+001F): invisible, and in an SVG it stops the
 *    figure parsing. The JSON escapes \b, \f and \r are how most get in: "\frac" written in a JSON file with one
 *    backslash is a form feed followed by "rac". The warning names the TeX command when the letters after it complete one.
 *  - a tab or a newline inside maths ($…$ or $$…$$) directly followed by the rest of a TeX command: the JSON escapes \t
 *    and \n ate the backslash of \times, \text, \theta, \neq, \nu … (m7/standard-form printed "11.7 imes 10^8" this way:
 *    the corpus sweep of 29 Sep 2026). A tab or a newline anywhere else is ordinary whitespace.
 *  - U+FFFD, the replacement character: a character lost to a wrong encoding on its way into the file;
 *  - U+200B, U+200C, U+200D (zero-width space, non-joiner, joiner): invisible, and they split a word for search and for
 *    the marker's key words;
 *  - U+2028 and U+2029 (line and paragraph separators): a line break in some renderers and not in others;
 *  - a lone surrogate: half of an astral character (an emoji, a mathematical letter), which renders as a box.
 *
 * keyWordBarWarnings (the build prints MARKING): a "|" where it does not do what its author meant. Inside a key-word
 * entry ("cheap|less expensive|costs less") a "|" separates spellings of ONE idea, which is how the engine reads it
 * (src/components/items/text-marking.ts markText: each entry is split at "|", and an idea already paid by one group is
 * not paid again by another), so the form is right and is not warned: splitting it into separate entries would let
 * "It is cheap and less expensive" earn two marks for one idea (probed through markText on 29 Sep 2026: 1 of 2 with
 * the bar, 2 of 2 without). A barred FIRST entry is not warned either: the engine prints a group's first entry as written
 * when she misses it ("still missing cheap|less expensive|…"), but that is a display fault of the engine, fixed in the
 * engine (the lead's ruling of 29 Sep 2026, 18:00: engine faults are never fixed by reordering packs). What is warned:
 *  - a "|" in an accepted answer, a reject word, a text-long indicative point's key word or a retrieval prompt's key
 *    word: those are compared whole, so the entry can never match what she types;
 *  - a key-word entry whose "|" leaves an empty spelling or cuts a bracket ("P(A|B)", "|x|"): the marker splits at every
 *    bar, so "P(A" and "B)" are read as spellings of their own, and "B)" is the word "b".
 * A gate's answer ("backwards | back") is not a key word: the app splits it at "|" by design (gates.ts gateAlternatives).
 */

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

// ---------------------------------------------------------------------------------------------------------------------
// Where each piece of shipped text lives, in the words an author looks it up by
// ---------------------------------------------------------------------------------------------------------------------

/** An array element by its id ("parts(a)"), its step number ("steps(2)"), or its place ("options[1]"). */
const elementName = (x: unknown, i: number): string => (isObject(x) && typeof x.id === "string" ? `(${x.id})` : isObject(x) && typeof x.n === "number" ? `(${x.n})` : `[${i}]`);

/** A note block as an author finds it: its place in note.blocks.json, its type and its id. */
const blockName = (b: unknown, i: number): string => {
  const type = isObject(b) && typeof b.type === "string" ? b.type : "?";
  const id = isObject(b) && typeof b.id === "string" ? ` ${b.id}` : "";
  return `note block ${i} (${type}${id})`;
};

/** Every item of a shipped bundle, named: "q.maths.m4.x.0003", "dx.x.pre#d2", "note block 12 (gate g3)", "topic", "note". */
export function shippedItems(shipped: unknown): Array<{ where: string; value: unknown }> {
  const b = isObject(shipped) ? shipped : {};
  const out: Array<{ where: string; value: unknown }> = [];
  const idOr = (x: unknown, fallback: string) => (isObject(x) && typeof x.id === "string" ? x.id : fallback);
  if (b.topic !== undefined && b.topic !== null) out.push({ where: "topic", value: b.topic });
  if (b.note !== undefined && b.note !== null) out.push({ where: "note", value: b.note });
  if (Array.isArray(b.noteBlocks)) b.noteBlocks.forEach((x, i) => out.push({ where: blockName(x, i), value: x }));
  for (const key of ["workedExamples", "questions", "findTheMistake", "prompts"] as const) {
    const list = b[key];
    if (Array.isArray(list)) list.forEach((x, i) => out.push({ where: idOr(x, `${key}[${i}]`), value: x }));
  }
  if (Array.isArray(b.diagnostics))
    b.diagnostics.forEach((set, i) => {
      const setId = idOr(set, `diagnostics[${i}]`);
      if (!isObject(set)) return;
      const { items, ...rest } = set;
      out.push({ where: setId, value: rest });
      if (Array.isArray(items)) items.forEach((it, j) => out.push({ where: `${setId}#${idOr(it, String(j))}`, value: it }));
    });
  if (b.insight !== undefined && b.insight !== null) out.push({ where: "insight", value: b.insight });
  if (Array.isArray(b.sets)) b.sets.forEach((s, i) => out.push({ where: idOr(s, `sets[${i}]`), value: s }));
  return out;
}

/** Visit every value under `value`, with its field path ("parts(a).answer.keyWords[0].any[1]"). */
function walk(value: unknown, field: string, visit: (field: string, value: unknown) => void): void {
  visit(field, value);
  if (Array.isArray(value)) value.forEach((x, i) => walk(x, `${field}${elementName(x, i)}`, visit));
  else if (isObject(value)) for (const [k, v] of Object.entries(value)) walk(v, field ? `${field}.${k}` : k, visit);
}

// ---------------------------------------------------------------------------------------------------------------------
// characterWarnings
// ---------------------------------------------------------------------------------------------------------------------

const hex = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;

const C0_NAMES: Readonly<Record<number, string>> = {
  0x00: "NULL",
  0x07: "BELL",
  0x08: "BACKSPACE",
  0x0b: "LINE TABULATION",
  0x0c: "FORM FEED",
  0x0d: "CARRIAGE RETURN",
  0x1b: "ESCAPE",
};
const TAB = 0x09;
const NEWLINE = 0x0a;

/** Why a code point must not ship, or null. Tabs and newlines are ordinary whitespace (see texEscape for maths). */
function oddCharacter(cp: number): { name: string; why: string } | null {
  if (cp < 0x20 && cp !== TAB && cp !== NEWLINE) return { name: C0_NAMES[cp] ?? "control character", why: "an invisible control character; delete it" };
  if (cp === 0xfffd) return { name: "REPLACEMENT CHARACTER", why: "a character lost to a wrong encoding on its way into the file; type the character again" };
  if (cp === 0x200b) return { name: "ZERO WIDTH SPACE", why: "invisible, and it splits a word for search and for the marker's key words; delete it" };
  if (cp === 0x200c) return { name: "ZERO WIDTH NON-JOINER", why: "invisible, and it splits a word for search and for the marker's key words; delete it" };
  if (cp === 0x200d) return { name: "ZERO WIDTH JOINER", why: "invisible, and it splits a word for search and for the marker's key words; delete it" };
  if (cp === 0x2028) return { name: "LINE SEPARATOR", why: "a line break in some renderers and not in others; use a newline or a space" };
  if (cp === 0x2029) return { name: "PARAGRAPH SEPARATOR", why: "a paragraph break in some renderers and not in others; use a newline or a space" };
  if (cp >= 0xd800 && cp <= 0xdfff) return { name: "LONE SURROGATE", why: "half of an emoji or a mathematical letter, drawn as a box; type the character again" };
  return null;
}

/**
 * The JSON escapes that eat a TeX command's backslash, by the control character they leave: the escape's letter and the
 * commands that start with it (a command is only named when the letters after the character complete one exactly).
 */
const TEX_AFTER_ESCAPE: Readonly<Record<number, { letter: string; commands: readonly string[] }>> = {
  0x08: { letter: "b", commands: ["beta", "bar", "binom", "bf", "boxed", "bullet", "big", "bigg", "bigl", "bigr", "bmod", "backslash", "begin", "bot", "breve"] },
  0x0c: { letter: "f", commands: ["frac", "forall", "frown", "fbox"] },
  0x0d: { letter: "r", commands: ["right", "rho", "rangle", "rightarrow", "rightleftharpoons", "rm", "rfloor", "rceil", "rbrace", "rvert"] },
  0x09: { letter: "t", commands: ["times", "text", "textbf", "textit", "textrm", "textsf", "texttt", "textup", "textstyle", "textdegree", "theta", "tfrac", "tan", "tanh", "to", "triangle", "therefore", "tau", "tilde", "top", "tag", "tbinom", "thinspace"] },
  0x0a: { letter: "n", commands: ["neq", "ne", "nu", "nabla", "not", "neg", "newline", "notin", "nmid", "ni", "nless", "ngtr", "nleq", "ngeq", "nexists", "natural", "nearrow"] },
};

/** The TeX command a JSON escape ate at `at` (the control character's index), or null. */
function texEscape(s: string, at: number, cp: number): string | null {
  const esc = TEX_AFTER_ESCAPE[cp];
  if (!esc) return null;
  const letters = /^[A-Za-z]+/.exec(s.slice(at + 1))?.[0] ?? "";
  const command = esc.letter + letters;
  return letters && esc.commands.includes(command) ? command : null;
}

/** For each UTF-16 index of `s`, whether it stands inside maths ($…$ or $$…$$; an escaped \$ is a dollar sign). */
function insideMaths(s: string): boolean[] {
  const inside: boolean[] = new Array<boolean>(s.length).fill(false);
  let open: "$" | "$$" | null = null;
  for (let i = 0; i < s.length; i += 1) {
    if (s[i] === "\\") {
      if (open) inside[i] = true;
      i += 1;
      if (open && i < s.length) inside[i] = true;
      continue;
    }
    if (s[i] === "$") {
      const delim = s[i + 1] === "$" ? "$$" : "$";
      if (open === null) open = delim;
      else if (open === delim) open = null;
      else {
        inside[i] = true;
        continue;
      }
      if (delim === "$$") i += 1;
      continue;
    }
    if (open) inside[i] = true;
  }
  return inside;
}

/** A short excerpt around `at`, on one line, with every character this lint names shown as <U+XXXX>. */
function excerpt(s: string, at: number): string {
  const from = Math.max(0, at - 30);
  const to = Math.min(s.length, at + 30);
  let out = "";
  for (let i = from; i < to; i += 1) {
    const cp = s.codePointAt(i) ?? 0;
    const width = cp > 0xffff ? 2 : 1;
    if (oddCharacter(cp) || i === at) out += `<${hex(cp)}>`;
    else if (cp === NEWLINE) out += " ";
    else out += s.slice(i, i + width);
    i += width - 1;
  }
  return `${from > 0 ? "…" : ""}${out}${to < s.length ? "…" : ""}`;
}

/**
 * Warnings on characters that must never ship, one line per field and character: the topic, the item, the field, the
 * code point and its name, where it stands, what to do, and an excerpt with the character shown as <U+XXXX>.
 * @param shipped the public bundle as the build writes it (pipeline/build-content.mts `shipped`)
 * @param label the topic as the build names it ("maths/content/m7/standard-form")
 */
export function characterWarnings(shipped: unknown, label: string): string[] {
  const out: string[] = [];
  for (const { where, value } of shippedItems(shipped))
    walk(value, "", (field, v) => {
      if (typeof v !== "string") return;
      let maths: boolean[] | null = null;
      for (let i = 0; i < v.length; i += 1) {
        const cp = v.codePointAt(i) ?? 0;
        const odd = oddCharacter(cp);
        const command = odd ? texEscape(v, i, cp) : (cp === TAB || cp === NEWLINE) && (maths ??= insideMaths(v))[i] ? texEscape(v, i, cp) : null;
        if (odd || command) {
          const name = odd?.name ?? (cp === TAB ? "TAB" : "NEWLINE");
          const why = command
            ? `the JSON escape "\\${TEX_AFTER_ESCAPE[cp]!.letter}" ate the backslash of \\${command}, so she reads "${command.slice(1)}"; write "\\\\${command}" in the JSON file`
            : odd!.why;
          out.push(`${label} ${where} ${field || "(text)"}: ${hex(cp)} ${name}${command && !odd ? " inside maths" : ""} at character ${i + 1}: ${why}: "${excerpt(v, i)}"`);
        }
        if (cp > 0xffff) i += 1;
      }
    });
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// keyWordBarWarnings
// ---------------------------------------------------------------------------------------------------------------------

const BRACKETS: ReadonlyArray<readonly [string, string]> = [
  ["(", ")"],
  ["[", "]"],
  ["{", "}"],
];
/** A spelling the marker would read that is empty, or cuts a bracket in two. */
function brokenSpelling(piece: string): string | null {
  if (piece.trim() === "") return "an empty spelling (a bar at the start or the end, or two together)";
  for (const [open, close] of BRACKETS) if (piece.split(open).length !== piece.split(close).length) return `"${piece.trim()}", a spelling that cuts a bracket in two`;
  return null;
}

/**
 * Warnings on a "|" that does not do what its author meant (see the header): one in an accepted answer, a reject word, an
 * indicative point's key word or a prompt's key word (compared whole, never matched), and a key-word entry whose bars
 * leave an empty spelling or cut a bracket. One line each, naming the topic, the item and part, and the string.
 * @param shipped the public bundle as the build writes it (pipeline/build-content.mts `shipped`)
 * @param label the topic as the build names it
 */
export function keyWordBarWarnings(shipped: unknown, label: string): string[] {
  const out: string[] = [];
  const b = isObject(shipped) ? shipped : {};
  const prompts = new Set((Array.isArray(b.prompts) ? b.prompts : []).filter(isObject));
  for (const { where, value } of shippedItems(shipped)) {
    const at = (field: string) => `${label} ${where}${field ? ` ${field}` : ""}`;
    if (isObject(value) && prompts.has(value))
      strings(value.keyWords).forEach((k, i) => {
        if (k.includes("|")) out.push(`${at(`keyWords[${i}]`)}: the retrieval prompt's key word "${k}" holds a "|", but a prompt's key word is compared whole, so its chip never lights; write each spelling as its own key word`);
      });
    walk(value, "", (field, v) => {
      if (!isObject(v)) return;
      if (v.kind === "text") {
        strings(v.accepted).forEach((a, i) => {
          if (a.includes("|")) out.push(`${at(field)}: accepted answer ${i + 1} "${a}" holds a "|", but an accepted answer is compared whole, so it never matches what she types; write each spelling as its own accepted answer`);
        });
        (Array.isArray(v.keyWords) ? v.keyWords : []).forEach((g, gi) => {
          if (!isObject(g)) return;
          const any = strings(g.any);
          any.forEach((k, j) => {
            if (!k.includes("|")) return;
            const broken = k.split("|").map(brokenSpelling).find((x) => x !== null);
            if (broken) out.push(`${at(field)}: key-word group ${gi + 1} entry ${j + 1} "${k}": the marker splits an entry at every "|", so it reads ${broken}; write that key word without a bar, or split its spellings cleanly`);
          });
          strings(g.reject).forEach((r, k) => {
            if (r.includes("|")) out.push(`${at(field)}: key-word group ${gi + 1}'s reject word ${k + 1} "${r}" holds a "|", but a reject word is compared whole, so it never cancels anything; write each spelling as its own reject word`);
          });
        });
      }
      if (v.kind === "text-long")
        (Array.isArray(v.indicativeContent) ? v.indicativeContent : []).forEach((point, pi) => {
          if (!isObject(point)) return;
          strings(point.keyWords).forEach((k) => {
            if (k.includes("|")) out.push(`${at(field)}: indicative point ${pi + 1}'s key word "${k}" holds a "|", but an indicative key word is compared whole, so the band evidence never finds it; write each spelling as its own key word`);
          });
        });
    });
  }
  return out;
}
