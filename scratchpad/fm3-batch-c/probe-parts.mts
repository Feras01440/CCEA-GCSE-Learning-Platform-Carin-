/**
 * Probe: the three other encodings FM3 batch C needs — a completed row of Pascal's triangle as a
 * `table` part, a probability to four decimal places as a `numeric` part under an accuracy
 * instruction, and a "state two features" `text` part.
 */
import { markAnswer, matchesCommonError, instructsAccuracy } from "../../src/components/items/mark.ts";
import type { AnswerSpec, CommonError } from "../../src/lib/content/schema.ts";

const line = (label: string, r: { correct: boolean; marksAwarded: number; explanation?: unknown }, marks: number) =>
  console.log(`${label.padEnd(34)} ${r.marksAwarded}/${marks} ${r.correct ? "CORRECT" : "no     "} ${String(r.explanation).slice(0, 90)}`);

console.log("--- table: the next row of Pascal's triangle ---");
const row = [1, 5, 10, 10, 5, 1];
const table: AnswerSpec = { kind: "table", cells: row.map((v, i) => ({ row: 1, col: i + 1, value: v })) };
const cellsResponse = (values: Array<number | string>) =>
  JSON.stringify({ cells: values.map((v, i) => ({ row: 1, col: i + 1, value: String(v) })) });
line("every entry right", markAnswer(cellsResponse(row), table, { marks: 2 } as never), 2);
line("one entry wrong", markAnswer(cellsResponse([1, 5, 10, 5, 5, 1]), table, { marks: 2 } as never), 2);
line("the row above (short)", markAnswer(cellsResponse([1, 4, 6, 4, 1]), table, { marks: 2 } as never), 2);

console.log("--- numeric: a probability to 4 d.p. with the instruction in the stem ---");
const stem = "Calculate the probability that exactly two are faulty.\nGive your answer to 4 decimal places.";
console.log("instructsAccuracy:", instructsAccuracy(stem));
const prob: AnswerSpec = {
  kind: "numeric",
  value: 0.176177,
  tolerance: { type: "dp", places: 4 },
  unitRequired: false,
  acceptForms: ["decimal"],
};
const ce: CommonError = {
  misconception: "fm.binomial.p-q-swapped",
  pattern: { kind: "numeric", value: 0.0554, tolerance: { type: "dp", places: 4 } },
  feedback: "probe",
  marksTypicallyEarned: 1,
};
for (const raw of ["0.1762", "0.17618", "0.176", "0.1761", "0.18"]) {
  line(`typed ${raw}`, markAnswer(raw, prob, { marks: 3, prompt: stem, commonErrors: [ce] } as never), 3);
}
line("typed the swapped route 0.0554", markAnswer("0.0554", prob, { marks: 3, prompt: stem, commonErrors: [ce] } as never), 3);
console.log("swap error fires on 0.0554:", matchesCommonError("0.0554", ce));

console.log("--- numeric: a percentage with a unit ---");
const pct: AnswerSpec = { kind: "numeric", value: 95, tolerance: { type: "absolute", value: 0.5 }, unit: "%", unitRequired: false, acceptForms: ["decimal", "percent"] };
for (const raw of ["95", "95%", "about 95%"]) line(`typed ${raw}`, markAnswer(raw, pct, { marks: 1 } as never), 1);

console.log("--- text: state two features of a normal distribution ---");
const text: AnswerSpec = {
  kind: "text",
  accepted: [
    "It is symmetrical about the mean and its mean, median and mode are equal",
    "The curve is bell-shaped and symmetrical about the mean, and the total area under it is 1",
  ],
  keyWords: [
    { any: ["symmetrical", "symmetric", "bell-shaped", "bell shaped"], marks: 1 },
    { any: ["mean median and mode are equal", "mean = median = mode", "total area is 1", "area under the curve is 1"], marks: 1 },
  ],
  listingRule: false,
};
for (const raw of [
  "It is symmetrical about the mean and its mean, median and mode are equal",
  "The curve is bell-shaped and symmetrical about the mean, and the total area under it is 1",
  "symmetric about the mean; mean = median = mode",
  "it is bell shaped",
]) line(`typed "${raw.slice(0, 28)}"`, markAnswer(raw, text, { marks: 2 } as never), 2);

console.log("--- text: a z-value stated with a conclusion word ---");
const nature: AnswerSpec = {
  kind: "text",
  accepted: ["z = 1.24, so the value is above the mean", "1.24 above the mean"],
  keyWords: [{ any: ["1.24"], marks: 1 }, { any: ["above", "greater than the mean", "higher"], marks: 1 }],
  listingRule: false,
};
for (const raw of ["z = 1.24, so the value is above the mean", "1.24 above the mean", "1.24"]) {
  line(`typed "${raw.slice(0, 28)}"`, markAnswer(raw, nature, { marks: 2 } as never), 2);
}
