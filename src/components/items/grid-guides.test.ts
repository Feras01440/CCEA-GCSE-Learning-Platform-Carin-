import { describe, expect, test } from "vitest";
import { guidesFromStem } from "./grid-guides";

describe("guidesFromStem", () => {
  test("mirror lines through the origin, with TeX delimiters and unicode minus", () => {
    expect(guidesFromStem("Draw the image of triangle $A$ after a reflection in the line $y = x$.")).toEqual([{ kind: "line", a: 1, b: -1, c: 0, label: "y = x" }]);
    expect(guidesFromStem("a reflection in the line $y = −x$")).toEqual([{ kind: "line", a: 1, b: 1, c: 0, label: "y = −x" }]);
  });
  test("vertical and horizontal mirror lines", () => {
    expect(guidesFromStem("Reflect the shape in the line $x = 2$, then in the line $y = -1$.")).toEqual([
      { kind: "line", a: 1, b: 0, c: 2, label: "x = 2" },
      { kind: "line", a: 0, b: 1, c: -1, label: "y = -1" },
    ]);
  });
  test("centres of rotation and enlargement", () => {
    expect(guidesFromStem("a rotation of 90° clockwise about the origin")).toEqual([{ kind: "point", x: 0, y: 0, label: "centre" }]);
    expect(guidesFromStem("an enlargement, scale factor ½, centre $(2, 2)$")).toEqual([{ kind: "point", x: 2, y: 2, label: "centre" }]);
    expect(guidesFromStem("Triangle $A$ has vertices $(3, 1)$, $(8, 1)$ and $(3, 4)$.")).toEqual([]);
  });
});
