/**
 * Maths (CCEA GCSE Mathematics, 504): examiner-insight source for pipeline/mine/build-insights.mjs.
 * Read from the private CER blocks (pipeline/mine/cer-blocks/maths) for the Higher units M3, M4,
 * M71, M72, M81, M82 across Summer 2023-2025 and November 2024-2025. All wording is ours.
 */
import { misconceptions } from "./maths.misconceptions.mjs";
import { insights as partA } from "./maths.insights-a.mjs";
import { insights as partB } from "./maths.insights-b.mjs";

export default {
  subject: "maths",
  misconceptions,
  insights: [...partA, ...partB],
};
