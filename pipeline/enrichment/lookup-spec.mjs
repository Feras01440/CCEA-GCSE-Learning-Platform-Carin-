/**
 * lookup-spec.mjs — the workhorse for writing a crosswalk row. For each search term, print
 * which AQA section contains a hit and which Edexcel statements mention it.
 *
 *   node pipeline/enrichment/lookup-spec.mjs "placenta" "oviduct" "fallopian"
 *   node pipeline/enrichment/lookup-spec.mjs --combined-only "dispersion" "prism"
 *
 * Terms are JavaScript regular expressions, case-insensitive, so "red.shift|red shift" works.
 *
 * HOW TO READ A RESULT. A zero is as informative as a hit, and often more so:
 *   NONE across AQA 8464 and Edexcel 1SC0, but a hit in AQA 8463  -> the content is
 *       separate-science only; the crosswalk row is 'ccea-only' against combined science.
 *   NONE everywhere                                               -> genuinely CCEA-only.
 *   A hit under a heading you did not expect                      -> read the section; AQA
 *       headings mislead (its "Contraception" section names the oviduct, and its "Meiosis"
 *       section carries fertilisation, implantation and differentiation).
 *
 * THREE WAYS THIS TOOL CAN LIE TO YOU, all of which have happened:
 *   1. LINE WRAPS. The text is laid out in columns, so a two-word phrase can be split across
 *      lines: "focal length" appears in AQA 8463 4.6.2.5 but a search for "focal length"
 *      returns NONE because the words sit on different lines. SEARCH ONE DISTINCTIVE WORD,
 *      then read the hit. Never record a "ccea-only" row from a multi-word zero alone.
 *   2. HOMONYMS. "conventional" hits the nuclide-notation section, not conventional current;
 *      "prism" hits the maths specification's solids. Read the section a hit lands in.
 *   3. TRUNCATION AND BOILERPLATE, both now fixed in index-specs.mjs, but the lesson stands:
 *      confirm a surprising zero against the raw .txt with grep before believing it.
 *
 * Always search CCEA's own vocabulary first, then the synonyms: "oviduct" AND "fallopian";
 * "sperm tube" AND "vas deferens"; "retardation" AND "deceleration". A zero on CCEA's word
 * with a hit on a synonym is a matched row with a vocabulary note, not an unmatched row.
 *
 * Copyright: this prints specification text to your terminal so you can judge a match.
 * Nothing it prints may be copied into a dossier, a note or a question.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = path.join(ROOT, "docs", "sources", "cross-board");

const AQA = {
  "8464 Combined": "aqa-8464-combined",
  "8461 Biology": "aqa-8461-biology",
  "8462 Chemistry": "aqa-8462-chemistry",
  "8463 Physics": "aqa-8463-physics",
  "8300 Maths": "aqa-8300",
};
const HEADING = /^\s*([3456]\.\d+(?:\.\d+){0,3})\s+([A-Za-z(].*)$/;

const args = process.argv.slice(2);
const combinedOnly = args.includes("--combined-only");
const terms = args.filter((a) => !a.startsWith("--"));
if (!terms.length) {
  console.error('usage: node pipeline/enrichment/lookup-spec.mjs [--combined-only] "<regex>" ...');
  process.exit(1);
}

const cache = new Map();
const lines = (id) => {
  if (!cache.has(id)) {
    const p = path.join(DIR, `${id}.txt`);
    cache.set(id, fs.existsSync(p) ? fs.readFileSync(p, "utf8").split(/\r?\n/) : null);
  }
  return cache.get(id);
};

function aqaHits(id, re) {
  const ls = lines(id);
  if (!ls) return null;
  const hits = new Map();
  let head = "(before the first heading)";
  for (const ln of ls) {
    const m = HEADING.exec(ln);
    if (m) {
      const t = m[2].replace(/Key opportunities for.*$/, "").replace(/\s+\d+\s*$/, "").trim();
      if (t) head = `${m[1]} ${t.slice(0, 54)}`;
    }
    if (re.test(ln)) hits.set(head, (hits.get(head) ?? 0) + 1);
  }
  return [...hits.entries()].map(([h, n]) => `${h} x${n}`);
}

const edx = (() => {
  const p = path.join(DIR, "edexcel-1sc0-statements.txt");
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8").split(/\r?\n/) : [];
})();
const maths = (() => {
  const p = path.join(DIR, "aqa-8300-refs.txt");
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8").split(/\r?\n/) : [];
})();

for (const term of terms) {
  const re = new RegExp(term, "i");
  console.log(`\n######## ${term}`);
  for (const [label, id] of Object.entries(AQA)) {
    if (combinedOnly && !label.startsWith("8464") && !label.startsWith("8300")) continue;
    const h = aqaHits(id, re);
    if (h === null) { console.log(`  AQA ${label}: (not extracted)`); continue; }
    console.log(`  AQA ${label}: ${h.length ? h.slice(0, 6).join(" | ") : "NONE"}`);
  }
  const e = edx.filter((l) => re.test(l)).map((l) => l.split(" :: ")[0]);
  console.log(`  EDX 1SC0:     ${e.length ? e.join(", ") : "NONE"}`);
  const m = maths.filter((l) => re.test(l)).map((l) => l.split(" :: ")[0]);
  if (m.length) console.log(`  DfE codes:    ${m.join(", ")}  (shared by AQA 8300 and Edexcel 1MA1)`);
}
