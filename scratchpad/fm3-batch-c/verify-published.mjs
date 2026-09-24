/**
 * Re-executes every error route in routes.mjs against the PUBLISHED FM3 batch-C JSON, reading the
 * bundles and notes off disk (not the generators' in-memory objects):
 *
 *  - every numeric commonError on a published part is matched to a route with the same part, the
 *    same misconception and the same value (the route's exact result, at six decimals for a 4 d.p.
 *    pattern or exactly for an exact one): no distractor was typed by hand;
 *  - every route that names a question part is carried by a commonError there;
 *  - no route value is accepted by its own part's tolerance (it could never fire);
 *  - every diagnostic option route is the text of that option; every note route's value is printed
 *    in the note; every find-the-mistake route's value is the final number of its working.
 *
 *   node scratchpad/fm3-batch-c/verify-published.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { allRoutes, latexRoutes } from "./routes.mjs";
import { bFixed } from "./lib.mjs";
import { exactDec, terminatesWithin, d4 } from "./stat.mjs";

const ROOT = "C:/Users/feras/Downloads/CCEA GCSE Top Learning Platform";
const SLUGS = ["binomial-probabilities", "normal-distribution-z-probabilities", "pascals-triangle-binomial-expansion", "normal-distribution-bell-curve"];

let bad = 0;
const fail = (m) => {
  bad += 1;
  console.error("FAIL " + m);
};

const parts = new Map();
const options = new Map();
const notes = new Map();
const ftms = new Map();
const topicOf = new Map();
for (const slug of SLUGS) {
  const dir = path.join(ROOT, "packs/further-maths/content/fm3", slug);
  if (!fs.existsSync(path.join(dir, "bundle.json"))) {
    console.log(`skip ${slug} (not written yet)`);
    continue;
  }
  const bundle = JSON.parse(fs.readFileSync(path.join(dir, "bundle.json"), "utf8"));
  topicOf.set(bundle.topic.id, slug);
  for (const q of bundle.questions) for (const p of q.parts) parts.set(`${q.id}#${p.id}`, p);
  for (const d of bundle.diagnostics) for (const it of d.items) for (const o of it.options) options.set(`${d.id}#${it.id}:${o.id}`, o);
  notes.set(slug, fs.readFileSync(path.join(dir, "note.blocks.json"), "utf8"));
  bundle.findTheMistake.forEach((f, i) => ftms.set(`${slug}#ftm${i + 1}`, f));
}

const six = (x) => Number(bFixed(x, 6));
const exactNum = (x) => (terminatesWithin(x, 12) ? Number(exactDec(x, 12)) : null);

const routes = allRoutes();
const carried = new Set();
let checked = 0;

for (const r of routes) {
  if (r.where.startsWith("q.")) {
    const part = parts.get(r.where);
    if (!part) {
      const topic = r.where.replace(/^q\./, "").replace(/\.\d{4}#.*$/, "");
      if (topicOf.has(topic)) fail(`route ${r.misconception} names ${r.where}, which is not a published part`);
      continue;
    }
    const hit = (part.commonErrors ?? []).find(
      (c) => c.misconception === r.misconception && c.pattern.kind === "numeric" && (c.pattern.value === six(r.exact) || c.pattern.value === exactNum(r.exact)),
    );
    if (!hit) {
      fail(`${r.where}: no commonError ${r.misconception} carries the route value ${bFixed(r.exact, 8)} ("${r.describe}")`);
      continue;
    }
    carried.add(`${r.where}|${hit.misconception}|${hit.pattern.value}`);
    checked += 1;
    const spec = part.answer;
    if (spec.kind === "numeric") {
      const t = spec.tolerance;
      const near =
        t.type === "exact"
          ? Math.abs(spec.value - Number(bFixed(r.exact, 12))) < 1e-12
          : t.type === "dp"
            ? Number(spec.value).toFixed(t.places) === d4(r.exact).slice(0, d4(r.exact).length - (4 - t.places))
            : t.type === "absolute"
              ? Math.abs(spec.value - Number(bFixed(r.exact, 12))) <= t.value
              : t.type === "range"
                ? Number(bFixed(r.exact, 12)) >= t.min && Number(bFixed(r.exact, 12)) <= t.max
                : false;
      if (near) fail(`${r.where}: route ${r.misconception} reaches ${bFixed(r.exact, 8)}, which the part's own tolerance accepts`);
    }
  } else if (r.where.startsWith("dx.")) {
    const o = options.get(r.where);
    if (!o) {
      if ([...topicOf.keys()].some((t) => r.where.includes(t))) fail(`route names ${r.where}, which is not a published option`);
      continue;
    }
    const want = terminatesWithin(r.exact, 8) ? exactDec(r.exact, 8) : d4(r.exact);
    if (o.text !== want && o.text !== `$${want}$`) fail(`${r.where}: option text "${o.text}" but the route gives ${want}`);
    if (o.misconception !== r.misconception) fail(`${r.where}: option tagged ${o.misconception}, route is ${r.misconception}`);
    checked += 1;
  } else if (r.where.startsWith("note#") || r.where.startsWith("znote#") || r.where.startsWith("pnote#") || r.where.startsWith("bnote#")) {
    const slug = r.slug ?? SLUGS[0];
    const text = notes.get(slug);
    if (!text) continue;
    const want = terminatesWithin(r.exact, 8) ? exactDec(r.exact, 8) : d4(r.exact);
    if (!text.includes(want)) fail(`${r.where}: the note never prints the route value ${want}`);
    checked += 1;
  } else if (/^ftm\d$/.test(r.where) || /^[a-z]+-ftm\d$/.test(r.where)) {
    const slug = r.slug ?? SLUGS[0];
    const f = ftms.get(`${slug}#${r.where.replace(/^[a-z]+-/, "")}`);
    if (!f) continue;
    const want = terminatesWithin(r.exact, 8) ? exactDec(r.exact, 8) : d4(r.exact);
    const working = f.studentWorking.join("\n");
    if (!working.includes(want)) fail(`${r.where}: the find-the-mistake working never shows the route value ${want}`);
    checked += 1;
  }
}

// Algebraic routes (Pascal's triangle): the pattern's LaTeX must be the route's output, character for character.
for (const r of latexRoutes()) {
  const part = parts.get(r.where);
  if (!part) {
    const topic = r.where.replace(/^q\./, "").replace(/\.\d{4}#.*$/, "");
    if (topicOf.has(topic)) fail(`latex route ${r.misconception} names ${r.where}, which is not a published part`);
    continue;
  }
  const hit = (part.commonErrors ?? []).find((c) => c.misconception === r.misconception && c.pattern.kind === "algebraic" && c.pattern.latex === r.latex);
  if (!hit) {
    fail(`${r.where}: no algebraic commonError ${r.misconception} carries the route's ${r.latex}`);
    continue;
  }
  if (part.answer.kind === "algebraic" && part.answer.latex === r.latex) fail(`${r.where}: route ${r.misconception} equals the answer`);
  carried.add(`${r.where}|${hit.misconception}|${hit.pattern.latex}`);
  checked += 1;
}

for (const [where, part] of parts) {
  for (const c of part.commonErrors ?? []) {
    if (c.pattern.kind === "numeric" && !carried.has(`${where}|${c.misconception}|${c.pattern.value}`)) fail(`${where}: commonError ${c.misconception} = ${c.pattern.value} has no route in routes.mjs`);
    if (c.pattern.kind === "algebraic" && !carried.has(`${where}|${c.misconception}|${c.pattern.latex}`)) fail(`${where}: algebraic commonError ${c.misconception} = ${c.pattern.latex} has no route in routes.mjs`);
  }
}

console.log(`\n${checked} route(s) re-executed against ${topicOf.size} published bundle(s), ${parts.size} part(s) scanned`);
console.log(bad === 0 ? "route check: OK" : `route check: ${bad} mismatch(es)`);
if (bad > 0) process.exitCode = 1;
