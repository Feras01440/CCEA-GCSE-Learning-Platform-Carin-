/** Re-evaluates every printed "a² + b² (+ c²) = N" and "√N = v" claim in the two output files. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "packs/maths/content/m8/pythagoras-and-trigonometry-in-3d");
const raw = [fs.readFileSync(path.join(DIR, "bundle.json"), "utf8"), fs.readFileSync(path.join(DIR, "note.blocks.json"), "utf8")].join("\n");
// JSON escapes every backslash; undo that so the LaTeX reads normally
const text = raw
  .replace(/\\\\/g, "\\")
  .replace(/\\n/g, "\n")
  .replace(/\\,/g, ""); // LaTeX thin space inside long numbers: 27\,500 -> 27500

const num = (s) => Number(String(s).replace(/[^0-9.]/g, ""));
let checked = 0;
let bad = 0;

const sumRe = /(\d+(?:\.\d+)?)\^2\s*\+\s*(\d+(?:\.\d+)?)\^2(?:\s*\+\s*(\d+(?:\.\d+)?)\^2)?\s*=\s*([\d,\s]*\d)/g;
for (const m of text.matchAll(sumRe)) {
  const a = +m[1];
  const b = +m[2];
  const c = m[3] ? +m[3] : 0;
  const expect = a * a + b * b + c * c;
  const got = num(m[4]);
  checked += 1;
  // "= 64 + 36 = 100" leaves "64" as the first capture; accept either the sum or the first addend
  if (Math.abs(got - expect) > 1e-9 && Math.abs(got - a * a) > 1e-9) {
    bad += 1;
    console.log(`MISMATCH  ${m[0].replace(/\s+/g, " ").slice(0, 80)}  -> expected ${expect}`);
  }
}

let sqrtChecked = 0;
let sqrtBad = 0;
// a letter in front means it is an equation in an unknown (x root 3 = 9), not an evaluation
for (const m of text.matchAll(/(?<![A-Za-z])(\d*)\\sqrt\{(\d+(?:\.\d+)?)\}\s*=\s*(\d+(?:\.\d+)?)(?!\s*\\sqrt|\\sqrt)/g)) {
  const k = m[1] === "" ? 1 : +m[1];
  const N = +m[2];
  const v = +m[3];
  const exact = k * Math.sqrt(N);
  const places = (m[3].split(".")[1] ?? "").length;
  const rounded = Math.abs(exact - v) <= 0.5 * 10 ** -places + 1e-9;
  const truncated = Math.abs(Math.trunc(exact * 10 ** places) / 10 ** places - v) < 1e-9;
  sqrtChecked += 1;
  if (!rounded && !truncated) {
    sqrtBad += 1;
    console.log(`SQRT MISMATCH  ${m[0]}  -> sqrt(${N}) = ${exact}`);
  }
}

// every "= a + b (+ c) = N" addition written out in full
let addChecked = 0;
let addBad = 0;
for (const m of text.matchAll(/=\s*(\d[\d,]*)\s*\+\s*(\d[\d,]*)(?:\s*\+\s*(\d[\d,]*))?\s*=\s*(\d[\d,]*)/g)) {
  const parts = [m[1], m[2], m[3]].filter(Boolean).map(num);
  const expect = parts.reduce((t, x) => t + x, 0);
  const got = num(m[4]);
  addChecked += 1;
  if (Math.abs(got - expect) > 1e-9) {
    addBad += 1;
    console.log(`ADD MISMATCH  ${m[0].replace(/\s+/g, " ")}  -> expected ${expect}`);
  }
}

console.log(`sum-of-squares claims: ${checked} checked, ${bad} wrong`);
console.log(`square-root claims: ${sqrtChecked} checked, ${sqrtBad} wrong`);
console.log(`written-out additions: ${addChecked} checked, ${addBad} wrong`);
if (bad + sqrtBad + addBad > 0) process.exitCode = 1;
