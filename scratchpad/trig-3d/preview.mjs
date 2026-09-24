/** Renders sample figures to scratchpad/trig-3d/preview.html so the drawings can be eyeballed. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cuboid, pyramid, wedge, cone, rightTri, compose } from "./figs.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));

const figs = [];

figs.push([
  "Cuboid 8x6x5 + extracted triangle",
  compose([
    {
      ...cuboid({
        w: 8,
        d: 6,
        h: 5,
        scale: 22,
        edges: { AB: "8 cm", BC: "6 cm", CG: "5 cm" },
        baseDiag: true,
        baseDiagLabel: "10 cm",
        spaceDiag: true,
        spaceDiagLabel: "AG",
        angle: "x",
      }),
      caption: "1  the solid",
    },
    {
      ...rightTri({
        base: 10,
        height: 5,
        names: ["A", "C", "G"],
        baseLabel: "AC = 10 cm",
        heightLabel: "5 cm",
        hypLabel: "AG",
        angle: "x",
      }),
      caption: "2  triangle ACG on its own",
    },
  ]),
]);

figs.push([
  "Pyramid base 10, height 12, slant edge",
  compose([
    {
      ...pyramid({
        base: 10,
        h: 12,
        scale: 17,
        edges: { AB: "10 cm" },
        diagonal: true,
        height: true,
        slantEdge: true,
        markM: true,
        innerLabels: { VM: "12 cm" }, innerSides: { VM: -1 },
        angleAtA: "y",
      }),
      caption: "1  the pyramid",
    },
    {
      ...rightTri({
        base: 7.07,
        height: 12,
        names: ["A", "M", "V"],
        baseLabel: "AM",
        heightLabel: "12 cm",
        hypLabel: "VA",
        angle: "y",
      }),
      caption: "2  triangle AMV",
    },
  ]),
]);

figs.push([
  "Pyramid, sloping face angle",
  compose([
    {
      ...pyramid({
        base: 10,
        h: 12,
        scale: 17,
        diagonal: false,
        height: true,
        slantHeight: true,
        markM: true,
        markN: true,
        angleAtN: "z",
      }),
      caption: "1  the pyramid",
    },
    {
      ...rightTri({
        base: 5,
        height: 12,
        names: ["N", "M", "V"],
        baseLabel: "MN = 5 cm",
        heightLabel: "12 cm",
        hypLabel: "VN",
        angle: "z",
      }),
      caption: "2  triangle NMV",
    },
  ]),
]);

figs.push([
  "Wedge 12 x 5 x 3.5",
  compose([
    {
      ...wedge({
        w: 12,
        d: 5,
        h: 3.5,
        scale: 18,
        edges: { AB: "12 m", BC: "5 m", CG: "3.5 m" },
        baseDiag: true,
        slopeDiag: true,
        angle: "t",
      }),
      caption: "1  the ramp",
    },
    {
      ...rightTri({
        base: 13,
        height: 3.5,
        names: ["A", "C", "G"],
        baseLabel: "AC = 13 m",
        heightLabel: "3.5 m",
        hypLabel: "AG",
        angle: "t",
      }),
      caption: "2  triangle ACG",
    },
  ]),
]);

figs.push([
  "Cone r 5, h 12",
  compose([
    { ...cone({ r: 5, h: 12, scale: 15, rLabel: "5 cm", hLabel: "12 cm", lLabel: "l", angle: "p" }), caption: "1  the cone" },
    {
      ...rightTri({
        base: 5,
        height: 12,
        names: ["P", "O", "V"],
        baseLabel: "5 cm",
        heightLabel: "12 cm",
        hypLabel: "l",
        angle: "p",
      }),
      caption: "2  the triangle",
    },
  ]),
]);

figs.push([
  "Which angle? (right vs tempting)",
  compose([
    {
      ...cuboid({ w: 8, d: 6, h: 5, scale: 20, baseDiag: true, spaceDiag: true, angle: "x" }),
      caption: "correct: between AG and AC",
    },
    {
      ...cuboid({ w: 8, d: 6, h: 5, scale: 20, spaceDiag: true, markAngle: ["G", "A", "B"], markAngleLabel: "not this" }),
      caption: "tempting: between AG and AB",
    },
  ]),
]);

const html = `<!doctype html><meta charset="utf-8"><title>trig-3d figures</title>
<style>body{font:14px system-ui;background:#fff;color:#1a1a1c;padding:12px;max-width:660px}
h2{font-size:13px;margin:18px 0 4px;color:#666}
.f{border:1px solid #ddd;border-radius:8px;padding:8px}
svg{color:#1a1a1c;width:100%;height:auto}</style>
${figs.map(([t, svg]) => `<h2>${t}</h2><div class="f">${svg}</div>`).join("\n")}`;

fs.writeFileSync(path.join(here, "preview.html"), html);
console.log("wrote preview.html");
for (const [t, svg] of figs) console.log(t, svg.length, "chars");
