/**
 * Splits a prose string on `$…$` (inline) and `$$…$$` (display) delimiters.
 * Pure; used by <Tex> and the mini-markdown parser. `\$` is a literal dollar;
 * an unmatched `$` is left as text so a stray currency sign never eats a sentence.
 */
export type TexSegment = { type: "text"; text: string } | { type: "math"; tex: string; display: boolean };

function findClose(input: string, from: number, delim: string, allowNewline: boolean): number {
  let i = from;
  while (i < input.length) {
    const ch = input[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (!allowNewline && ch === "\n") return -1;
    if (input.startsWith(delim, i)) return i;
    i += 1;
  }
  return -1;
}

export function splitTex(input: string): TexSegment[] {
  const out: TexSegment[] = [];
  let text = "";
  const flush = () => {
    if (text.length > 0) out.push({ type: "text", text });
    text = "";
  };
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch === "\\" && input[i + 1] === "$") {
      text += "$";
      i += 2;
      continue;
    }
    if (ch === "$") {
      const display = input[i + 1] === "$";
      const delim = display ? "$$" : "$";
      const start = i + delim.length;
      const end = findClose(input, start, delim, display);
      if (end === -1) {
        text += ch;
        i += 1;
        continue;
      }
      const tex = input.slice(start, end).trim();
      if (tex.length === 0) {
        text += delim;
        i = end + delim.length;
        continue;
      }
      flush();
      out.push({ type: "math", tex, display });
      i = end + delim.length;
      continue;
    }
    text += ch;
    i += 1;
  }
  flush();
  return out;
}

/** True when the string carries any maths delimiters (cheap check before rendering). */
export function hasTex(input: string): boolean {
  return splitTex(input).some((s) => s.type === "math");
}
