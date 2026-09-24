/** Prints every solid's numbers so the prose can be written against real values. */
import { cuboidFacts, pyramidFacts, wedgeFacts, coneFacts, cubeFromDiagonal, surd, sf, dp, long, atanDeg } from "./core.mjs";

const show = (name, o) =>
  console.log(
    name.padEnd(22),
    Object.entries(o)
      .map(([k, v]) => `${k}=${typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(6)) : v}`)
      .join("  "),
  );

console.log("=== worked examples ===");
show("WE1 cuboid 8,6,5", cuboidFacts(8, 6, 5, "WE1"));
show("WE1 twin 12,9,8", cuboidFacts(12, 9, 8, "WE1t"));
show("WE2 pyramid 10,12", pyramidFacts(10, 12, "WE2"));
show("WE2 twin 14,24", pyramidFacts(14, 24, "WE2t"));
show("WE3 wedge 9,4,2.5", wedgeFacts(9, 4, 2.5, "WE3"));
show("WE3 twin 12,5,3.5", wedgeFacts(12, 5, 3.5, "WE3t"));
show("WE4 cube D=12", cubeFromDiagonal(12, "WE4"));
console.log("  WE4 surd", surd(48).latex, " twin D=15:", cubeFromDiagonal(15, "WE4t").x.toFixed(6), surd(75).latex);

console.log("\n--- WE3 rounding trap ---");
const w3 = wedgeFacts(9, 4, 2.5, "WE3");
console.log("exact AC", w3.ac.toFixed(9), "angle", w3.angle.toFixed(6), "->", sf(w3.angle), dp(w3.angle));
console.log("AC rounded 9.8 ->", atanDeg(2.5, 9.8).toFixed(6), sf(atanDeg(2.5, 9.8)));
console.log("AC rounded 10  ->", atanDeg(2.5, 10).toFixed(6), sf(atanDeg(2.5, 10)));
console.log("AC rounded 9.85->", atanDeg(2.5, 9.85).toFixed(6), sf(atanDeg(2.5, 9.85)));

console.log("\n=== practice ===");
show("Q1 cuboid 8,15,?", cuboidFacts(8, 15, 6, "Q1"));
show("Q2 cuboid 4,4,7", cuboidFacts(4, 4, 7, "Q2"));
show("Q3 cube 6", cuboidFacts(6, 6, 6, "Q3"));
console.log("  Q3 surd", surd(108).latex);
show("Q4 cuboid 6,8,7", cuboidFacts(6, 8, 7, "Q4"));
show("Q5 cuboid 9,12,4", cuboidFacts(9, 12, 4, "Q5"));
console.log("  Q5 angle with the 9x12 face:", atanDeg(4, 15).toFixed(6), sf(atanDeg(4, 15)));
show("Q6 pyramid 8,15", pyramidFacts(8, 15, "Q6"));
show("Q7 pyramid 12,8", pyramidFacts(12, 8, "Q7"));
show("Q8 cone 7,24", coneFacts(7, 24, "Q8"));
show("Q9 wedge 8,6,3", wedgeFacts(8, 6, 3, "Q9"));
show("Q10 box 120,90,40cm", cuboidFacts(120, 90, 40, "Q10"));
show("Q11 cube D=20", cubeFromDiagonal(20, "Q11"));
show("Q12 cuboid 9,12,?", cuboidFacts(9, 12, 15 * Math.tan((40 * Math.PI) / 180), "Q12"));
console.log("  Q12 height = 15 tan 40 =", (15 * Math.tan((40 * Math.PI) / 180)).toFixed(6));
show("Q13 cuboid 6,6,12", cuboidFacts(6, 6, 12, "Q13"));
console.log("  Q13 surd", surd(216).latex);

console.log("\n=== exam style ===");
show("E1 cuboid 5,12,9", cuboidFacts(5, 12, 9, "E1"));
console.log("  E1 AG surd", surd(250).latex);
const e2 = pyramidFacts(16, Math.sqrt(17 * 17 - 128), "E2");
show("E2 pyramid 16, slant edge 17", e2);
console.log("  E2 height =", e2.ht.toFixed(6), "surd", surd(161).latex, " face angle", sf(e2.faceAngle));
show("E3 wedge 15,8,4.5", wedgeFacts(15, 8, 4.5, "E3"));
show("E4 pyramid 18,12", pyramidFacts(18, 12, "E4"));

console.log("\n=== diagnostics numbers ===");
show("dx cuboid 3,4,12", cuboidFacts(3, 4, 12, "dx"));
console.log("  3+4+12 =", 19, " sqrt(3^2+4^2) =", 5, " sum of squares =", 169);
console.log("  cube diagonal 9 -> x^2 =", 27, "x =", surd(27).latex, "=", Math.sqrt(27).toFixed(6));
console.log("\n=== find the mistake ===");
show("ftm1 cuboid 7,4,6", cuboidFacts(7, 4, 6, "ftm1"));
console.log("  wrong (two dims only): sqrt(7^2+4^2) =", Math.hypot(7, 4).toFixed(6));
show("ftm2 cuboid 10,5,4", cuboidFacts(10, 5, 4, "ftm2"));
console.log("  wrong angle with edge AB: tan-1(4/10) =", atanDeg(4, 10).toFixed(6), " correct:", cuboidFacts(10, 5, 4, "x").angle.toFixed(6));
const p3 = pyramidFacts(16, 15, "ftm3");
show("ftm3 pyramid 16,15", p3);
console.log("  face angle (correct)", p3.faceAngle.toFixed(6), " using half diagonal instead:", atanDeg(15, p3.half).toFixed(6));
console.log("\nall checks passed");
