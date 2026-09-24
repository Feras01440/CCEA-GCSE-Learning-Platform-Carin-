import fs from "node:fs";
const WORDS = 6;
const wc = (t) => t.split(" ").filter(Boolean).length;
function spokenTitle(title) {
  const noParens = title.replace(/[ ]*[(][^)]*[)]/g, "").split(" ").filter(Boolean).join(" ");
  if (wc(noParens) <= WORDS) return noParens;
  const cuts = [];
  for (const sep of [":", ";", ",", " and ", " including ", " using "]) {
    let i = noParens.indexOf(sep);
    while (i >= 0) { cuts.push(i); i = noParens.indexOf(sep, i + 1); }
  }
  for (const i of cuts.sort((a, b) => a - b)) {
    const head = noParens.slice(0, i).trim();
    if (wc(head) >= 3) return head;
  }
  return noParens;
}
const bad = [], long = [];
let n = 0;
for (const d of fs.readdirSync("public/content")) {
  const p = "public/content/" + d;
  if (!fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) {
    if (!f.endsWith(".json")) continue;
    const b = JSON.parse(fs.readFileSync(p + "/" + f, "utf8"));
    const t = b.note?.title ?? b.topic?.title;
    if (!t) continue;
    n++;
    const s = spokenTitle(t);
    if (/[,;:]$/.test(s) || /\band$/i.test(s) || wc(s) < 2) bad.push([t, s]);
    if (s.length > 44) long.push([s.length, s]);
  }
}
console.log("bundles with a title:", n);
console.log("fragments (end in , ; : or 'and', or < 2 words):", bad.length);
bad.slice(0, 10).forEach(([t, s]) => console.log("  " + t + "  ->  " + s));
console.log("spokenTitle over 44 chars:", long.length);
long.sort((a,b)=>b[0]-a[0]).slice(0, 6).forEach(([l, s]) => console.log("  " + l + "  " + s));
