/**
 * Post-export fix for Next.js 16 static output on Windows.
 *
 * The exporter writes React Server Component prefetch payloads as nested paths, e.g.
 *   out/learn/maths/M4/__next.learn/$d$subject/$d$unit/__PAGE__.txt
 * while the client requests the flattened name in the route folder:
 *   /learn/maths/M4/__next.learn.$d$subject.$d$unit.__PAGE__.txt
 * Every prefetch therefore 404s (soft navigation still works via __next._full.txt, but slower and noisy).
 * This script writes the flattened copies so both names resolve. Idempotent; run after `next build`.
 * Usage: node scripts/fix-export.mjs [outDir]   (outDir defaults to ./out; the argument exists for tests)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, "out");
if (!fs.existsSync(OUT)) {
  console.error("out/ not found; run next build first");
  process.exit(1);
}

let written = 0;
let skipped = 0;

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith("__next.")) flatten(dir, p, e.name);
      else walk(p);
    }
  }
}

/** For out/<route>/__next.<seg>/<a>/<b>/__PAGE__.txt write out/<route>/__next.<seg>.<a>.<b>.__PAGE__.txt */
function flatten(routeDir, nextDir, nextName) {
  const stack = [{ dir: nextDir, parts: [] }];
  while (stack.length) {
    const { dir, parts } = stack.pop();
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) stack.push({ dir: p, parts: [...parts, e.name] });
      else if (e.isFile()) {
        const flat = path.join(routeDir, [nextName, ...parts, e.name].join("."));
        if (fs.existsSync(flat)) {
          skipped++;
          continue;
        }
        fs.copyFileSync(p, flat);
        written++;
      }
    }
  }
}

walk(OUT);
console.log(`fix-export: ${written} flattened RSC payload file(s) written, ${skipped} already present`);
