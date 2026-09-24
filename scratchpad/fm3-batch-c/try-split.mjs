import { splitChains } from "./depth.mjs";

const cases = [
  "$= 10(0.15)^{2}(0.85)^{3} = 10 \\times 0.0225 \\times 0.614125 = 0.138178125$",
  "$p = 0.12$, $q = 0.88$, $n = 7$.\n$P(\\text{exactly 1 splits}) = 7pq^{6} = 7(0.12)(0.88)^{6}$\n$= 7 \\times 0.12 \\times 0.464404086784 = 0.3900994328986$\n$= 0.3901$ to 4 decimal places.",
  "Read the row for 2 scores: $6 \\times 0.8^{2} \\times 0.2^{2} = 6 \\times 0.64 \\times 0.04 = 0.1536$. The 6 is the middle number of row 4 of Pascal's triangle.",
  "$(p + q)^{6} = p^{6} + 6p^{5}q + 15p^{4}q^{2} + 20p^{3}q^{3} + 15p^{2}q^{4} + 6pq^{5} + q^{6}$",
  "$(p + q)^{7} = p^{7} + 7p^{6}q + 21p^{5}q^{2} + 35p^{4}q^{3} + 35p^{3}q^{4} + 21p^{2}q^{5} + 7pq^{6} + q^{7}$",
  "$P(\\text{at least 2}) = 1 - (0.019770609664 + 0.109498761216) = 1 - 0.12926937088 = 0.87073062912$",
  "$P(\\text{exactly one six}) = 5pq^{4} = 5\\left(\\frac{1}{6}\\right)\\left(\\frac{5}{6}\\right)^{4} = \\frac{3125}{7776}$",
  "$z = \\frac{29.5 - 34}{5} = \\frac{-4.5}{5} = -0.9$. The minus sign says 29.5 cm is below the mean.",
  "Nothing here: $p = 0.3$ and $q = 0.7$.",
];
for (const c of cases) {
  console.log("IN : " + c.replace(/\n/g, " ⏎ "));
  console.log("OUT: " + splitChains(c).replace(/\n/g, " ⏎ "));
  console.log();
}
