// Draws the bell-curve topic's figures with real parameters and renders them for a look.
import { nBell, nHist, nShapes, nBands, nSketch, nFour, nTail } from "./phone.mjs";
import { renderAll } from "./phone-preview.mjs";

const figs = {
  bell: nBell({ title: "t" }),
  hist: nHist({ wide: 1, narrow: 0.25, title: "t" }),
  shapes: nShapes({ leftTitle: "heights: symmetric", rightTitle: "incomes: skewed", title: "t" }),
  bands: nBands({ title: "t" }),
  sketch: nSketch({ mean: 1005, sd: 4, unit: "mass (g)", title: "t" }),
  four: nFour({ order: ["skewed", "bell", "twoPeaks", "flat"], title: "t" }),
  tail16: nTail({ mean: "μ", x: "μ + σ", z: 1, tail: "right", statement: "about 16%", showZ: false, title: "t" }),
};
await renderAll("bell", figs);
