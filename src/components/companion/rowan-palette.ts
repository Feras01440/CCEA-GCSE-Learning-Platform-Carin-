/**
 * Rowan's palette, and the hills', exactly as the approved design canvas drew them
 * (docs/design/2026-09-23-art-direction-v2.md §2.2 and §7; the generator's tokens.mjs).
 *
 * Each colour is specified in LCH (CSS lch(), D50) and drawn with the sRGB hex the canvas computed from it.
 * rowan-figure.test.ts recomputes every hex from its triple with the canvas's own conversion, and checks each triple
 * against the token of the same name in app/globals.css ("ART DIRECTION V2"), so the drawing, the canvas and the
 * design tokens cannot drift apart.
 *
 * Fixed, not themed. The hare is the same hare at night (§2.4) and in high contrast, so nothing here follows the
 * theme's ink or paper: the pupils and the mouth are the fixed ink, not var(--ink), which turns light in dark mode.
 * Only the 24 px mark (RowanMark) is drawn in currentColor, because it sits in a line of text.
 */

export interface PaletteEntry {
  /** CSS lch(): lightness %, chroma, hue. */
  lch: readonly [number, number, number];
  /** The sRGB rendering the canvas used. */
  hex: string;
  /** The design token in app/globals.css carrying the same LCH value, where there is one. */
  token?: string;
}

export const ROWAN_PALETTE = {
  // the ink of the drawing: pupils, mouth, the letter's tint, the ground and cast shadows (fixed; --ink is themed)
  ink: { lch: [18, 3, 85], hex: "#2E2C28" },
  // the hare
  fur: { lch: [60, 36, 62], hex: "#B98559", token: "--fur" },
  furShade: { lch: [50, 34, 60], hex: "#9C6B45", token: "--fur-shade" },
  cream: { lch: [91, 12, 85], hex: "#EEE4CE", token: "--cream" },
  earRose: { lch: [74, 28, 28], hex: "#E7A59F", token: "--ear-rose" },
  nose: { lch: [45, 30, 40], hex: "#945B4C", token: "--nose" },
  // the one warm accent: the scarf, a bush in flower
  gorse: { lch: [80, 72, 90], hex: "#E1C42F", token: "--gorse" },
  gorseDeep: { lch: [68, 68, 85], hex: "#C6A014", token: "--gorse-deep" },
  // the heather stone, the letter's seal
  heather: { lch: [58, 44, 330], hex: "#BD71B3", token: "--heather" },
  heatherLight: { lch: [72, 34, 330], hex: "#DA9DD1", token: "--heather-light" },
  // the letter's fold line
  paperDeep: { lch: [70, 8, 85], hex: "#B1AA9D" },
  // the cairn
  stoneTop: { lch: [85, 5, 85], hex: "#D8D4CB", token: "--stone-top" },
  stoneLight: { lch: [78, 5, 85], hex: "#C5C0B8", token: "--stone-light" },
  stoneMid: { lch: [66, 6, 85], hex: "#A5A096", token: "--stone-mid" },
  stoneDark: { lch: [52, 6, 82], hex: "#817B72", token: "--stone-dark" },
  lichen: { lch: [74, 30, 125], hex: "#A2BF88", token: "--lichen" },
  lichenShade: { lch: [62, 28, 122], hex: "#879D6B", token: "--lichen-shade" },
  // the hills and the sky
  sky: { lch: [94, 8, 235], hex: "#DFF1FA", token: "--sky" },
  skyDeep: { lch: [88, 12, 240], hex: "#C8E1F0", token: "--sky-deep" },
  hill: { lch: [70, 30, 135], hex: "#8EB683", token: "--hill" },
  hillLight: { lch: [76, 30, 132], hex: "#A1C691", token: "--hill-light" },
  hillDark: { lch: [58, 28, 135], hex: "#719567", token: "--hill-dark" },
  hillFar: { lch: [80, 16, 145], hex: "#B2CDB5", token: "--hill-far" },
  eveSky: { lch: [88, 12, 60], hex: "#EED8C9", token: "--eve-sky" },
  eveHaze: { lch: [92, 9, 62], hex: "#F5E5D9", token: "--eve-haze" },
  moon: { lch: [88, 30, 90], hex: "#EDDCA3", token: "--moon" },
} as const satisfies Record<string, PaletteEntry>;

type Name = keyof typeof ROWAN_PALETTE;

/** The hex of every colour, by name: what the drawings use. */
export const C = Object.fromEntries(Object.entries(ROWAN_PALETTE).map(([k, v]) => [k, v.hex])) as { [K in Name]: string };

/** The two fixed whites of the drawings: the eyes' whites and catchlights, and the letter's paper. */
export const WHITE = "#FFFFFF";
export const LETTER_PAPER = "#FFFDF7";
