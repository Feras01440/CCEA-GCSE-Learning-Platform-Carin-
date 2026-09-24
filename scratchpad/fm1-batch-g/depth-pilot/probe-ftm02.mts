import fs from "node:fs";
import { fixMatches } from "../../../src/components/items/mistake-marking.ts";
const B = JSON.parse(fs.readFileSync("packs/further-maths/content/fm1/laws-of-logarithms/bundle.json", "utf8"));
const f = B.findTheMistake.find((x: any) => x.id.endsWith(".02"));
console.log(JSON.stringify(f.studentWorking), JSON.stringify(f.correction));
for (const t of [...f.studentWorking, "log(x+5)/log(x-1) = log 3", "x = 4", "4"]) console.log(JSON.stringify(t).padEnd(48), JSON.stringify(fixMatches(t, f.correction)));
