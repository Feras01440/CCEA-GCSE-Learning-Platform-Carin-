import fs from "node:fs";
const slug = process.argv[2];
const blocks = JSON.parse(fs.readFileSync(`packs/further-maths/content/fm3/${slug}/note.blocks.json`, "utf8"));
const words = (s) => String(s ?? "").replace(/\$[^$]*\$/g, " x ").split(/\s+/).filter(Boolean).length;
blocks.forEach((b, i) => {
  let d = "";
  if (b.type === "h") d = `"${b.text}" role=${b.role ?? "-"}`;
  else if (b.type === "p") d = `${words(b.md)}w ${String(b.md).slice(0, 110).replace(/\n/g, " / ")}`;
  else if (b.type === "callout") d = `${b.kind} "${b.title ?? ""}" ${words(b.md)}w ${String(b.md).slice(0, 80).replace(/\n/g, " / ")}`;
  else if (b.type === "gate") d = `${b.id} ${b.kind} ${String(b.prompt).slice(0, 90)}`;
  else if (b.type === "figure") { const vb = /viewBox=["']([^"']+)["']/.exec(b.svg ?? "")?.[1]; const fs_ = [...String(b.svg ?? "").matchAll(/font-size[=:]\s*["']?([\d.]+)/g)].map(m=>+m[1]); d = `vb=${vb} minFont=${Math.min(...fs_)} cap=${words(b.caption)}w "${String(b.caption ?? "").slice(0, 70)}"`; }
  else if (b.type === "video") d = `${b.videoId ?? b.id} ${b.start ?? ""}-${b.end ?? ""}`;
  else if (b.type === "prompt") d = `${b.id ?? b.promptId ?? ""}`;
  else if (b.type === "hero") d = `lede ${words(b.lede)}w minutes ${b.minutes}`;
  else d = JSON.stringify(b).slice(0, 100);
  console.log(String(i).padStart(2), b.type.padEnd(8), d);
});
