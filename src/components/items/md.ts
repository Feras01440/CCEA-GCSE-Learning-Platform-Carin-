/**
 * Mini-markdown for content strings: paragraphs, line breaks, **bold**, *emphasis*,
 * $maths$ / $$maths$$ and pipe tables (the worked-example stems in the fixtures use
 * them). Nothing else — no external markdown library, no HTML pass-through.
 */
import { splitTex } from "./tex-split";

export type MdInline =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "em"; text: string }
  | { type: "math"; tex: string; display: boolean; wrap?: "strong" | "em" }
  | { type: "br" };

export type MdBlock =
  | { type: "p"; inlines: MdInline[] }
  | { type: "table"; header: MdInline[][] | null; rows: MdInline[][][] };

const EMPHASIS = /\*\*([^*\n]+?)\*\*|\*([^*\n]+?)\*/g;
const MATH_SLOT = /(\d+)/g;

type Wrap = "strong" | "em";

/**
 * One line of prose → inlines. Maths is cut out first and stood in for by a placeholder, so a
 * `*` inside $…$ is never emphasis and a **bold** span may contain a maths segment: the maths
 * keeps its wrap so the renderer can nest it instead of printing the raw markers.
 */
export function parseInline(line: string): MdInline[] {
  const maths: Array<{ tex: string; display: boolean }> = [];
  let flat = "";
  for (const seg of splitTex(line)) {
    if (seg.type === "math") {
      flat += `${maths.length}`;
      maths.push({ tex: seg.tex, display: seg.display });
    } else flat += seg.text;
  }
  const out: MdInline[] = [];
  const pushText = (text: string, wrap?: Wrap) => {
    if (!text) return;
    out.push(wrap === "strong" ? { type: "strong", text } : wrap === "em" ? { type: "em", text } : { type: "text", text });
  };
  const expand = (text: string, wrap?: Wrap) => {
    let last = 0;
    for (const m of text.matchAll(MATH_SLOT)) {
      const at = m.index ?? 0;
      pushText(text.slice(last, at), wrap);
      const seg = maths[Number(m[1])];
      out.push(wrap ? { type: "math", tex: seg.tex, display: seg.display, wrap } : { type: "math", tex: seg.tex, display: seg.display });
      last = at + m[0].length;
    }
    pushText(text.slice(last), wrap);
  };
  let last = 0;
  for (const m of flat.matchAll(EMPHASIS)) {
    const at = m.index ?? 0;
    expand(flat.slice(last, at));
    if (m[1] !== undefined) expand(m[1], "strong");
    else if (m[2] !== undefined) expand(m[2], "em");
    last = at + m[0].length;
  }
  expand(flat.slice(last));
  return out;
}

function splitCells(row: string): string[] {
  const trimmed = row.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cur = "";
  for (let i = 0; i < trimmed.length; i += 1) {
    const ch = trimmed[i];
    if (ch === "\\" && trimmed[i + 1] === "|") {
      cur += "|";
      i += 1;
    } else if (ch === "|") {
      cells.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

const SEPARATOR_CELL = /^:?-+:?$/;

function isSeparatorRow(line: string): boolean {
  const cells = splitCells(line);
  return cells.length > 0 && cells.every((c) => SEPARATOR_CELL.test(c));
}

function parseTable(lines: string[]): MdBlock {
  const sepAt = lines.findIndex(isSeparatorRow);
  const header = sepAt > 0 ? splitCells(lines[sepAt - 1]).map(parseInline) : null;
  const bodyLines = lines.filter((_, i) => i !== sepAt && (sepAt <= 0 || i !== sepAt - 1));
  const rows = bodyLines.map((l) => splitCells(l).map(parseInline));
  return { type: "table", header, rows };
}

export function parseMd(md: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  const chunks = md.replace(/\r\n?/g, "\n").split(/\n[ \t]*\n+/);
  for (const chunk of chunks) {
    const lines = chunk.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length === 0) continue;
    if (lines.every((l) => l.trim().startsWith("|"))) {
      blocks.push(parseTable(lines));
      continue;
    }
    const inlines: MdInline[] = [];
    lines.forEach((line, i) => {
      if (i > 0) inlines.push({ type: "br" });
      inlines.push(...parseInline(line.trim()));
    });
    blocks.push({ type: "p", inlines });
  }
  return blocks;
}

function inlineText(i: MdInline): string {
  switch (i.type) {
    case "br":
      return "\n";
    case "math":
      return i.tex;
    default:
      return i.text;
  }
}

/** Plain-text rendering (for aria-labels and rough length checks). */
export function mdToPlain(md: string): string {
  return parseMd(md)
    .map((b) => {
      if (b.type === "p") return b.inlines.map(inlineText).join("");
      const rows = b.header ? [b.header, ...b.rows] : b.rows;
      return rows.map((r) => r.map((cell) => cell.map(inlineText).join("")).join(" | ")).join("\n");
    })
    .join("\n\n");
}
