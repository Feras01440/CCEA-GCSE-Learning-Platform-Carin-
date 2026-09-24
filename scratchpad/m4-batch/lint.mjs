/**
 * Style lint for the M4 batch: compiles every $...$ segment with KaTeX, checks
 * British English / banned tokens, and checks every SVG for the house rules
 * (viewBox, currentColor, no <style>/<script>/handlers/external hrefs).
 *
 *   npx tsx scratchpad/m4-batch/lint.mjs <slug> [<slug> ...]
 */
import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import { ROOT } from "./lib.mjs";

const slugs = process.argv.slice(2);
let failures = 0;
const fail = (m) => {
  failures += 1;
  console.error("FAIL", m);
};

// "Wrong" as a verdict on the learner's answer is banned; "a wrong sign" as an
// adjective is the house style (it is how the mark schemes talk).
const BANNED = [
  { re: /(^|[.:;]\s+|\n)\s*Wrong\b/, why: '"Wrong" used as a verdict' },
  { re: /\bgrade [1-9]\b/i, why: "the 9-1 grade label" },
  { re: /!/, why: "an exclamation mark" },
  { re: /\b(color|colors|analyze|organize|behavior|centimeter|meters|center)\b/i, why: "American spelling" },
];

function walkStrings(node, at, visit) {
  if (typeof node === "string") visit(node, at);
  else if (Array.isArray(node)) node.forEach((v, i) => walkStrings(v, `${at}[${i}]`, visit));
  else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walkStrings(v, `${at}.${k}`, visit);
}

function checkKatex(s, at) {
  // $...$ segments, non-greedy, not spanning $$ blocks
  const re = /\$([^$]+)\$/g;
  let m;
  while ((m = re.exec(s))) {
    try {
      katex.renderToString(m[1], { throwOnError: true, displayMode: false });
    } catch (e) {
      fail(`${at}: KaTeX failed on "${m[1]}" — ${e.message.split("\n")[0]}`);
    }
  }
}

function checkSvg(s, at) {
  if (!s.includes("<svg")) return;
  const svg = s.startsWith("data:image/svg+xml") ? decodeURIComponent(s.slice(s.indexOf(",") + 1)) : s;
  if (/<style|<script|\son[a-z]+\s*=|xlink:href|(?<!aria-labelled)href\s*=/i.test(svg)) {
    fail(`${at}: SVG contains <style>, <script>, an event handler or an href`);
  }
  if (/prefers-color-scheme/i.test(svg)) fail(`${at}: SVG contains a prefers-color-scheme rule`);
  if (!/viewBox=/.test(svg)) fail(`${at}: SVG has no viewBox`);
  if (/(?:stroke|fill)=["'](#|rgb|hsl)/i.test(svg)) fail(`${at}: SVG uses a literal colour instead of currentColor`);
  const texts = svg.match(/<text\b[^>]*>/g) ?? [];
  for (const t of texts) {
    if (!/fill=['"]currentColor['"]/.test(t) && !/<g[^>]*fill=['"]currentColor/.test(svg)) {
      fail(`${at}: <text> without fill="currentColor" (and no currentColor group): ${t}`);
    }
  }
  if (s.length > 12000) fail(`${at}: SVG string is ${s.length} bytes (limit 12000)`);
}

function checkProse(s, at) {
  if (s.includes("<svg")) return; // markup, not prose
  for (const b of BANNED) {
    if (b.re.test(s)) fail(`${at}: contains ${b.why} — "${s.slice(0, 90)}"`);
  }
}

for (const slug of slugs) {
  const dir = path.join(ROOT, "packs", "maths", "content", "m4", slug);
  for (const file of ["bundle.json", "note.blocks.json"]) {
    const p = path.join(dir, file);
    if (!fs.existsSync(p)) {
      fail(`${slug}/${file} missing`);
      continue;
    }
    const json = JSON.parse(fs.readFileSync(p, "utf8"));
    let katexCount = 0;
    let svgCount = 0;
    walkStrings(json, `${slug}/${file}`, (s, at) => {
      katexCount += (s.match(/\$[^$]+\$/g) ?? []).length;
      if (s.includes("<svg")) svgCount += 1;
      checkKatex(s, at);
      checkSvg(s, at);
      checkProse(s, at);
    });
    console.log(`${slug}/${file}: ${katexCount} KaTeX segment(s), ${svgCount} SVG(s) checked`);
  }
}

console.log(failures === 0 ? "lint: all checks pass" : `lint: ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
