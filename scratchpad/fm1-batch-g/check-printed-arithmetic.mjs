/**
 * Every printed equality chain re-executed (22 Sep). For each maths segment "$…$" in a bundle and its note, the
 * segment is split on "=" and every side that is purely numeric (numbers, \frac, brackets, + − × and pmatrix
 * grids, with a scalar or several matrices multiplied together) is evaluated exactly enough (1e-9); every such
 * side must agree with every other. Sides holding a letter are skipped, so "\det A = (4)(2) - (1)(3) = 5"
 * checks "(4)(2) - (1)(3)" against "5". Also flags "\text{ take away }" chains the same way.
 *
 *   node scratchpad/fm1-batch-g/check-printed-arithmetic.mjs <slug…>   (fm1 slugs)
 */
import fs from "node:fs";

const slugs = process.argv.slice(2);
let checked = 0;
const findings = [];

/* ---------------- tokenizer and evaluator over numbers and matrices ---------------- */

function tokenize(s) {
  const t = [];
  let i = 0;
  const src = s
    .replace(/\\left|\\right|\\,|\\;|\\!|\\ /g, " ")
    .replace(/\\text\{\s*take away\s*\}/g, " - ")
    .replace(/\\dfrac|\\tfrac/g, "\\frac")
    .replace(/−/g, "-")
    .replace(/\\cdot|\\times|×/g, "*");
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      t.push({ k: "num", v: Number(src.slice(i, j)) });
      i = j;
      continue;
    }
    if (src.startsWith("\\frac", i)) { t.push({ k: "frac" }); i += 5; continue; }
    if (src.startsWith("\\begin{pmatrix}", i)) { t.push({ k: "mopen" }); i += 15; continue; }
    if (src.startsWith("\\end{pmatrix}", i)) { t.push({ k: "mclose" }); i += 13; continue; }
    if (src.startsWith("\\\\", i)) { t.push({ k: "row" }); i += 2; continue; }
    if ("+-*/()&{}".includes(c)) { t.push({ k: c }); i++; continue; }
    return null; // a letter, a command or anything else: not a purely numeric side
  }
  return t;
}

const isM = (x) => Array.isArray(x);
const mul = (a, b) => {
  if (!isM(a) && !isM(b)) return a * b;
  if (!isM(a)) return b.map((r) => r.map((v) => a * v));
  if (!isM(b)) return a.map((r) => r.map((v) => v * b));
  if (a[0].length !== b.length) throw new Error("non-conformable product printed");
  return a.map((r) => b[0].map((_, j) => r.reduce((s, v, k) => s + v * b[k][j], 0)));
};
const add = (a, b, sign) => {
  if (!isM(a) && !isM(b)) return a + sign * b;
  if (isM(a) && isM(b) && a.length === b.length && a[0].length === b[0].length) return a.map((r, i) => r.map((v, j) => v + sign * b[i][j]));
  throw new Error("number added to a matrix");
};

function parse(tokens) {
  let p = 0;
  const peek = () => tokens[p];
  const eat = (k) => { if (!tokens[p] || tokens[p].k !== k) throw new Error(`expected ${k}`); return tokens[p++]; };
  function expr() {
    let v;
    if (peek() && (peek().k === "-" || peek().k === "+")) { const s = eat(peek().k).k === "-" ? -1 : 1; v = mul(s, term()); }
    else v = term();
    while (peek() && (peek().k === "+" || peek().k === "-")) {
      const s = eat(peek().k).k === "-" ? -1 : 1;
      v = add(v, term(), s);
    }
    return v;
  }
  function term() {
    let v = factor();
    for (;;) {
      const n = peek();
      if (!n) break;
      if (n.k === "*") { eat("*"); v = mul(v, factor()); continue; }
      if (n.k === "/") { eat("/"); const d = factor(); if (isM(d)) throw new Error("divided by a matrix"); v = mul(v, 1 / d); continue; }
      if (n.k === "(" || n.k === "frac" || n.k === "mopen" || n.k === "num") { v = mul(v, factor()); continue; }
      break;
    }
    return v;
  }
  function factor() {
    const n = peek();
    if (!n) throw new Error("unexpected end");
    if (n.k === "-") { eat("-"); return mul(-1, factor()); }
    if (n.k === "num") { eat("num"); return n.v; }
    if (n.k === "(") { eat("("); const v = expr(); eat(")"); return v; }
    if (n.k === "{") { eat("{"); const v = expr(); eat("}"); return v; }
    if (n.k === "frac") { eat("frac"); eat("{"); const a = expr(); eat("}"); eat("{"); const b = expr(); eat("}"); return mul(a, 1 / b); }
    if (n.k === "mopen") {
      eat("mopen");
      const rows = [[]];
      let cellTokens = [];
      const flush = () => { rows[rows.length - 1].push(parse(cellTokens)); cellTokens = []; };
      while (peek() && peek().k !== "mclose") {
        const k = peek().k;
        if (k === "&") { eat("&"); flush(); continue; }
        if (k === "row") { eat("row"); flush(); rows.push([]); continue; }
        cellTokens.push(tokens[p++]);
      }
      flush();
      eat("mclose");
      return rows;
    }
    throw new Error(`unexpected ${n.k}`);
  }
  const v = expr();
  if (p !== tokens.length) throw new Error("trailing tokens");
  return v;
}

const same = (a, b) => {
  if (isM(a) !== isM(b)) return false;
  if (!isM(a)) return Math.abs(a - b) < 1e-9;
  return a.length === b.length && a[0].length === b[0].length && a.every((r, i) => r.every((v, j) => Math.abs(v - b[i][j]) < 1e-9));
};
const show = (v) => (isM(v) ? `(${v.map((r) => r.map((x) => +x.toFixed(6)).join(" ")).join("; ")})` : String(+v.toFixed(6)));

/* ---------------- walk every string ---------------- */

function checkString(where, s) {
  const segs = [...s.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
  for (const seg of segs) {
    if (!seg.includes("=")) continue;
    // "\ne" and inequalities are not chains of equal values
    if (/\\ne\b|\\neq|<|>|\\le|\\ge|\\approx/.test(seg)) continue;
    const sides = seg.split("=").map((x) => x.trim()).filter(Boolean);
    const vals = [];
    for (const side of sides) {
      const tk = tokenize(side);
      if (!tk || tk.length === 0) continue;
      try { vals.push({ side, v: parse(tk) }); } catch { /* not a numeric side */ }
    }
    for (let i = 1; i < vals.length; i++) {
      checked++;
      if (!same(vals[0].v, vals[i].v)) findings.push(`${where}\n    "${seg.slice(0, 160)}"\n    ${vals[0].side.slice(0, 60)} -> ${show(vals[0].v)}  but  ${vals[i].side.slice(0, 60)} -> ${show(vals[i].v)}`);
    }
  }
}

function walk(o, p) {
  if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${p}[${i}]`));
  if (o && typeof o === "object") return Object.entries(o).forEach(([k, v]) => { if (k !== "svg") walk(v, `${p}.${k}`); });
  if (typeof o === "string") checkString(p, o);
}

for (const slug of slugs) {
  for (const f of ["bundle.json", "note.blocks.json"]) {
    const file = `packs/further-maths/content/fm1/${slug}/${f}`;
    if (fs.existsSync(file)) walk(JSON.parse(fs.readFileSync(file, "utf8")), `${slug}/${f}`);
  }
}
console.log(`printed arithmetic: ${checked} equalities re-executed`);
if (findings.length === 0) console.log("no findings");
else {
  for (const f of findings) console.log(`FINDING ${f}`);
  process.exitCode = 1;
}
