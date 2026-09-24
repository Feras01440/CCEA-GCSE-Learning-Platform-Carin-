/**
 * scripts/keyword-soft.mts - run with `npx tsx scripts/keyword-soft.mts`.
 *
 * Lists the "soft" key-word findings that the content build only counts: text-answer groups that no accepted
 * answer earns, although the part's own wording (scheme, solution, hints) does use the key word. Each one means a
 * learner who paraphrases the model answer cannot get that mark; fix by adding the wording to accepted[0] or to
 * the group. Read-only: uses src/components/items/keyword-lint.ts exactly as pipeline/build-content.mts does.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lintKeyWords } from "../src/components/items/keyword-lint";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKS = path.join(ROOT, "packs");

function bundles(dir: string, out: string[] = []): string[] {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) bundles(p, out);
    else if (f === "bundle.json") out.push(p);
  }
  return out;
}

let soft = 0;
let hard = 0;
for (const file of bundles(PACKS)) {
  const label = path.relative(PACKS, path.dirname(file)).split(path.sep).join("/");
  const r = lintKeyWords(JSON.parse(fs.readFileSync(file, "utf8")), label);
  for (const s of r.soft) console.log("SOFT", s);
  for (const h of r.hard) console.log("HARD", h);
  soft += r.soft.length;
  hard += r.hard.length;
}
console.log(`\n${hard} hard, ${soft} soft key-word finding(s)`);
