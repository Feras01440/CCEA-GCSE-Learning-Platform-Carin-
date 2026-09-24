/**
 * Replaces lines [start, end] (1-based, inclusive) of a file with the contents of another file, after
 * checking that the first and last lines being replaced are the ones expected.
 *   node splice.mjs <file> <start> <end> <replacement file> "<expected first line>" "<expected last line>"
 */
import fs from "node:fs";

const [file, s, e, repl, firstExpected, lastExpected] = process.argv.slice(2);
const start = Number(s);
const end = Number(e);
const lines = fs.readFileSync(file, "utf8").split("\n");
const first = lines[start - 1];
const last = lines[end - 1];
if (firstExpected !== undefined && first.trim() !== firstExpected.trim()) throw new Error(`line ${start} is "${first}", expected "${firstExpected}"`);
if (lastExpected !== undefined && last.trim() !== lastExpected.trim()) throw new Error(`line ${end} is "${last}", expected "${lastExpected}"`);
const replacement = fs.readFileSync(repl, "utf8").replace(/\n$/, "").split("\n");
const out = [...lines.slice(0, start - 1), ...replacement, ...lines.slice(end)];
fs.writeFileSync(file, out.join("\n"), "utf8");
const st = fs.statSync(file);
console.log(`${file}: lines ${start}-${end} (${end - start + 1}) replaced by ${replacement.length} lines; now ${out.length} lines, ${st.size} B, ${st.mtime.toISOString()}`);
