import { normaliseText } from "../../src/components/items/text-marking.ts";
for (const s of ["$1 - (P(0) + P(1) + P(2))$", "$1 - P(0) + P(1) + P(2)$", "$1 - (P(0) + P(1) + P(2) + P(3))$", "5 or 6", "4, 5 or 6"]) console.log(JSON.stringify(s), "->", JSON.stringify(normaliseText(s)));
