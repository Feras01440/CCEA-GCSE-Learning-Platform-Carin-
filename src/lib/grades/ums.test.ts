import { describe, expect, test } from "vitest";
import {
  CCEA_BOUNDARIES,
  capGrade,
  gradeLadder,
  minRawForUms,
  rawToUms,
  rawToUmsDetail,
  subjectGradeFromRaw,
  umsGapReport,
  umsToGrade,
  unitGradeFromRaw,
  validateCombination,
  whatIfForAStar,
  type Series,
} from "./ums";

const SERIES: Series[] = ["summer-2025", "summer-2026"];
const MATHS_UNITS = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"] as const;
const FM_UNITS = ["U1", "U2", "U3", "U4"] as const;

// ---------------------------------------------------------------------------
// GCSE Mathematics — raw → UMS
// ---------------------------------------------------------------------------

describe("maths rawToUms", () => {
  test("every published raw boundary maps exactly to its fixed UMS threshold", () => {
    for (const series of SERIES) {
      const table = CCEA_BOUNDARIES.maths.rawBoundaries[series] as Record<string, Record<string, number>>;
      for (const unit of MATHS_UNITS) {
        const thresholds = (CCEA_BOUNDARIES.maths.units as Record<string, { thresholds: Record<string, number> }>)[unit]
          .thresholds;
        for (const [grade, raw] of Object.entries(table[unit])) {
          expect(rawToUms("maths", unit, raw, series), `${series} ${unit} ${grade}`).toBe(thresholds[grade]);
        }
      }
    }
  });

  test("raw 0 gives 0 UMS and full raw gives the unit maximum", () => {
    for (const series of SERIES) {
      expect(rawToUms("maths", "M1", 0, series)).toBe(0);
      expect(rawToUms("maths", "M1", 100, series)).toBe(107);
      expect(rawToUms("maths", "M2", 100, series)).toBe(131);
      expect(rawToUms("maths", "M3", 100, series)).toBe(143);
      expect(rawToUms("maths", "M4", 100, series)).toBe(180);
      expect(rawToUms("maths", "M5", 100, series)).toBe(131);
      expect(rawToUms("maths", "M6", 100, series)).toBe(160);
      expect(rawToUms("maths", "M7", 100, series)).toBe(175);
      expect(rawToUms("maths", "M8", 100, series)).toBe(220);
    }
  });

  test("conversion is monotone non-decreasing on every unit and series", () => {
    for (const series of SERIES) {
      for (const unit of MATHS_UNITS) {
        let prev = -1;
        for (let raw = 0; raw <= 100; raw++) {
          const u = rawToUms("maths", unit, raw, series);
          expect(u, `${series} ${unit} raw ${raw}`).toBeGreaterThanOrEqual(prev);
          prev = u;
        }
      }
    }
  });

  test("interpolates linearly between adjacent boundaries", () => {
    // 2025 M4: b 37 → 132, a 45 → 144; raw 41 is the midpoint → 138
    expect(rawToUms("maths", "M4", 41, "summer-2025")).toBe(138);
    // 2025 M8 above the top boundary: a 40 → 176, max 100 → 220; raw 50 → 176 + 10/60 × 44 = 183.3
    expect(rawToUms("maths", "M8", 50, "summer-2025")).toBe(183);
    // 2025 M4 below the lowest boundary: allowable d 17 → 99, raw 0 → 0; raw 10 → 58.2
    expect(rawToUms("maths", "M4", 10, "summer-2025")).toBe(58);
    // 2026 M8 a is 49 so the same raw 50 is worth less than in 2025
    expect(rawToUms("maths", "M8", 50, "summer-2026")).toBe(177);
  });

  test("anchors expose the piecewise-linear model", () => {
    const d = rawToUmsDetail("maths", "M4", 60, "summer-2025");
    expect(d.estimated).toBe(false);
    expect(d.anchors).toEqual([
      [0, 0], [17, 99], [21, 108], [29, 121], [37, 132], [45, 144], [100, 180],
    ]);
  });

  test("rejects out-of-range raw marks, unknown units and unknown series", () => {
    expect(() => rawToUms("maths", "M4", 101, "summer-2025")).toThrow(RangeError);
    expect(() => rawToUms("maths", "M4", -1, "summer-2025")).toThrow(RangeError);
    expect(() => rawToUms("maths", "M9", 50, "summer-2025")).toThrow(RangeError);
    expect(() => rawToUms("maths", "M4", 50, "summer-2024" as Series)).toThrow(RangeError);
  });
});

describe("maths unit grades", () => {
  test("unit grade at and just below the a boundary on M4", () => {
    expect(unitGradeFromRaw("maths", "M4", 45, "summer-2025").grade).toBe("a");
    expect(unitGradeFromRaw("maths", "M4", 44, "summer-2025").grade).toBe("b");
  });

  test("allowable d on M8 (121 UMS at raw 11 in 2025) and u below it", () => {
    const d = unitGradeFromRaw("maths", "M8", 11, "summer-2025");
    expect(d.ums).toBe(121);
    expect(d.grade).toBe("d");
    expect(unitGradeFromRaw("maths", "M8", 10, "summer-2025").grade).toBe("u");
  });

  test("M1 tops out at unit grade d even on full marks", () => {
    const r = unitGradeFromRaw("maths", "M1", 100, "summer-2026");
    expect(r.ums).toBe(107);
    expect(r.grade).toBe("d");
  });
});

// ---------------------------------------------------------------------------
// GCSE Mathematics — subject grade, A*, combinations
// ---------------------------------------------------------------------------

describe("maths umsToGrade", () => {
  test("fixed subject boundaries are exact at each threshold", () => {
    const cases: Array<[number, string]> = [
      [320, "A"], [319, "B"], [292, "B"], [291, "C*"], [268, "C*"], [267, "C"], [240, "C"], [239, "D"],
      [200, "D"], [199, "E"], [160, "E"], [120, "F"], [80, "G"], [79, "U"], [0, "U"],
    ];
    for (const [ums, grade] of cases) {
      expect(umsToGrade("maths", ums, "summer-2025"), `${ums}`).toBe(grade);
      expect(umsToGrade("maths", ums, "summer-2026"), `${ums}`).toBe(grade);
    }
  });

  test("A* is series-specific: 394 in Summer 2025, 393 in Summer 2026", () => {
    expect(umsToGrade("maths", 394, "summer-2025")).toBe("A*");
    expect(umsToGrade("maths", 393, "summer-2025")).toBe("A");
    expect(umsToGrade("maths", 393, "summer-2026")).toBe("A*");
    expect(umsToGrade("maths", 392, "summer-2026")).toBe("A");
    expect(gradeLadder("maths", "summer-2025")[0]).toEqual(["A*", 394]);
  });
});

describe("maths combinations", () => {
  test("recommended pathways reproduce the spec §4.5 grade ceilings", () => {
    expect(validateCombination("maths", ["M1", "M5"], "summer-2025").maxGrade).toBe("D");
    expect(validateCombination("maths", ["M2", "M6"], "summer-2025").maxGrade).toBe("C*");
    expect(validateCombination("maths", ["M3", "M7"], "summer-2025").maxGrade).toBe("B");
    expect(validateCombination("maths", ["M4", "M8"], "summer-2025").maxGrade).toBe("A*");
    expect(validateCombination("maths", ["M4", "M8"], "summer-2026").maxGrade).toBe("A*");
  });

  test("cross-tier pairs are legal and capped by their UMS maxima", () => {
    expect(validateCombination("maths", ["M3", "M8"], "summer-2025").maxGrade).toBe("A"); // 143 + 220 = 363
    expect(validateCombination("maths", ["M8", "M2"], "summer-2025")).toMatchObject({ valid: true, units: ["M2", "M8"], maxGrade: "A" });
    expect(validateCombination("maths", ["M4", "M5"], "summer-2025").maxGrade).toBe("B"); // 180 + 131 = 311
  });

  test("illegal combinations are rejected", () => {
    expect(validateCombination("maths", ["M3", "M4"], "summer-2025").valid).toBe(false);
    expect(validateCombination("maths", ["M4"], "summer-2025").valid).toBe(false);
    expect(validateCombination("maths", ["M1", "M2", "M5"], "summer-2025").valid).toBe(false);
    expect(() => subjectGradeFromRaw("maths", { M4: 50, M3: 50 }, "summer-2025")).toThrow(/exactly one of M1–M4/);
  });

  test("M2 + M6 on full marks is 291 UMS = C*, the combination ceiling", () => {
    const r = subjectGradeFromRaw("maths", { M2: 100, M6: 100 }, "summer-2025");
    expect(r.totalUms).toBe(291);
    expect(r.grade).toBe("C*");
    expect(r.cap).toBe("C*");
    expect(r.maxUms).toBe(291);
  });

  test("capGrade never lifts a grade above the cap", () => {
    expect(capGrade("maths", "A", "C*")).toBe("C*");
    expect(capGrade("maths", "D", "C*")).toBe("D");
    expect(capGrade("double-award-science", "A*A*", "AB")).toBe("AB");
  });

  test("M4 + M8 grade-a raw boundaries give exactly 320 UMS = A in 2025", () => {
    const r = subjectGradeFromRaw("maths", { M4: 45, M8: 40 }, "summer-2025");
    expect(r.totalUms).toBe(320);
    expect(r.grade).toBe("A");
    expect(r.estimated).toBe(false);
  });

  test("full marks on M4 + M8 is an A* in both series", () => {
    for (const series of SERIES) {
      const r = subjectGradeFromRaw("maths", { M4: 100, M8: 100 }, series);
      expect(r.totalUms).toBe(400);
      expect(r.grade).toBe("A*");
      expect(r.capped).toBe(false);
    }
  });
});

describe("maths what-if for A* (M4 + M8)", () => {
  // Real numbers computed by the engine from the published boundaries.
  // Summer 2025: A* = 394. M4 above a: 144 + (raw − 45)/55 × 36; M8 above a: 176 + (raw − 40)/60 × 44.
  test("Summer 2025: M8 raw needed for A*/A/B given an M4 raw", () => {
    const need = (m4: number) => {
      const r = whatIfForAStar("maths", { M4: m4 }, "summer-2025", { missingUnit: "M8" })[0];
      return r.targets.map((t) => t.rawNeeded);
    };
    expect(need(100)).toEqual([92, 19, 11]); // 180 UMS → M8 needs 214 UMS = raw 92
    expect(need(97)).toEqual([94, 20, 11]);
    expect(need(95)).toEqual([96, 21, 11]);
    expect(need(90)).toEqual([null, 23, 11]); // 173 + 220 = 393 < 394: A* impossible
    expect(need(45)).toEqual([null, 40, 23]); // grade-a boundary on both units = 320 = A
  });

  test("Summer 2026: M8 raw needed for A*/A/B given an M4 raw", () => {
    const need = (m4: number) => {
      const r = whatIfForAStar("maths", { M4: m4 }, "summer-2026", { missingUnit: "M8" })[0];
      return r.targets.map((t) => t.rawNeeded);
    };
    expect(need(100)).toEqual([92, 26, 15]);
    expect(need(97)).toEqual([94, 27, 16]);
    expect(need(95)).toEqual([95, 27, 16]);
    expect(need(90)).toEqual([100, 30, 16]); // 173 + 220 = 393 = A* exactly, so M8 must be perfect
    expect(need(85)).toEqual([null, 32, 17]);
  });

  test("the reverse direction: M4 raw needed given an M8 raw", () => {
    const r25 = whatIfForAStar("maths", { M8: 100 }, "summer-2025", { missingUnit: "M4" })[0];
    expect(r25.unit).toBe("M4");
    expect(r25.targets.map((t) => t.rawNeeded)).toEqual([91, 18, 13]);
    const r26 = whatIfForAStar("maths", { M8: 100 }, "summer-2026", { missingUnit: "M4" })[0];
    expect(r26.targets.map((t) => t.rawNeeded)).toEqual([89, 18, 13]);
    expect(whatIfForAStar("maths", { M8: 92 }, "summer-2025", { missingUnit: "M4" })[0].targets[0].rawNeeded).toBe(100);
    expect(whatIfForAStar("maths", { M8: 90 }, "summer-2025", { missingUnit: "M4" })[0].targets[0].rawNeeded).toBeNull();
  });

  test("an A* needs roughly 91–100 on M4 and 92–100 on M8", () => {
    for (const series of SERIES) {
      const aStar = gradeLadder("maths", series)[0][1];
      // Minimum M4 raw with a perfect M8
      const minM4 = minRawForUms("maths", "M4", aStar - 220, series);
      const minM8 = minRawForUms("maths", "M8", aStar - 180, series);
      expect(minM4).toBeGreaterThanOrEqual(89);
      expect(minM8).toBeGreaterThanOrEqual(92);
      expect(rawToUms("maths", "M4", minM4!, series) + 220).toBeGreaterThanOrEqual(aStar);
      expect(rawToUms("maths", "M4", minM4! - 1, series) + 220).toBeLessThan(aStar);
    }
  });

  test("infers the missing unit and orders candidates with M8 first", () => {
    const rs = whatIfForAStar("maths", { M4: 80 }, "summer-2025");
    expect(rs.map((r) => r.unit)).toEqual(["M8", "M7", "M6", "M5"]);
    // M4 + M7 can reach an A (180 + 175 = 355) but never an A*
    const m7 = rs[1];
    expect(m7.combination.maxGrade).toBe("A");
    expect(m7.targets[0].reachable).toBe(false);
    expect(m7.targets[1].reachable).toBe(true);
  });

  test("a cap makes higher targets unreachable even when the UMS arithmetic would allow it", () => {
    const r = whatIfForAStar("maths", { M2: 100 }, "summer-2025", { missingUnit: "M6", targets: ["B", "C*", "C"] })[0];
    expect(r.targets[0]).toMatchObject({ grade: "B", rawNeeded: null, reachable: false });
    // 131 UMS given; C* = 268 needs 137 on M6: c 50 → 132, c* 61 → 148, so 132 + 16(raw − 50)/11 ≥ 137 → raw 54
    expect(r.targets[1]).toMatchObject({ grade: "C*", rawNeeded: 54 });
    expect(rawToUms("maths", "M6", 54, "summer-2025") + 131).toBeGreaterThanOrEqual(268);
    expect(rawToUms("maths", "M6", 53, "summer-2025") + 131).toBeLessThan(268);
  });
});

describe("maths umsGapReport", () => {
  test("simple case: a few raw marks on the completion unit close the gap", () => {
    // 2025: M4 45 → 144, M8 35 → 168 (between c* 23→148 and b 31→161 … a 40→176): total 312 = B
    const r = umsGapReport("maths", { M4: 45, M8: 35 }, "summer-2025");
    expect(r.current.grade).toBe("B");
    expect(r.target).toBe("A");
    expect(r.gapUms).toBe(8);
    expect(r.focusUnit).toBe("M8");
    expect(r.extraRawOnFocus).toBe(5);
    expect(r.text).toBe("You are 8 UMS from an A; that is about 5 more raw marks on M8 (35 → 40/100).");
  });

  test("explicit target and focus unit", () => {
    const r = umsGapReport("maths", { M4: 45, M8: 35 }, "summer-2025", { target: "A", focusUnit: "M4" });
    expect(r.focusUnit).toBe("M4");
    // M4 needs 152 UMS: 144 + (raw − 45)/55 × 36 ≥ 151.5 → raw 57 → 12 more marks
    expect(r.extraRawOnFocus).toBe(12);
    expect(r.text).toMatch(/12 more raw marks on M4 \(45 → 57\/100\)/);
  });

  test("when one unit cannot close the gap the report says what else is needed", () => {
    const r = umsGapReport("maths", { M4: 60, M8: 60 }, "summer-2025", { target: "A*" });
    expect(r.gapUms).toBe(49);
    expect(r.extraRawOnFocus).toBeNull();
    expect(r.reachable).toBe(true);
    expect(r.text).toBe(
      "You are 49 UMS from an A*; even full marks on M8 (60 → 100, +29 UMS) leave 20 UMS, so you would also need 31 more raw marks on M4.",
    );
  });

  test("grades outside the combination cap are reported as unavailable", () => {
    const r = umsGapReport("maths", { M2: 80, M6: 80 }, "summer-2026", { target: "B" });
    expect(r.reachable).toBe(false);
    expect(r.text).toBe("Grade B is not available with M2 + M6; the best grade for that combination is C*.");
  });

  test("already achieved", () => {
    const r = umsGapReport("maths", { M4: 100, M8: 100 }, "summer-2026");
    expect(r.achieved).toBe(true);
    expect(r.text).toMatch(/^You already have an A\*: 400\/400 UMS is 7 UMS above the A\* boundary \(393\)\.$/);
  });
});

// ---------------------------------------------------------------------------
// GCSE Further Mathematics
// ---------------------------------------------------------------------------

describe("further maths", () => {
  test("every published raw boundary maps exactly to its fixed UMS threshold", () => {
    for (const series of SERIES) {
      const table = CCEA_BOUNDARIES.furtherMaths.rawBoundaries[series] as Record<string, Record<string, number>>;
      for (const unit of FM_UNITS) {
        const thresholds = (CCEA_BOUNDARIES.furtherMaths.units as Record<string, { thresholds: Record<string, number> }>)[unit]
          .thresholds;
        for (const [grade, raw] of Object.entries(table[unit])) {
          expect(rawToUms("further-maths", unit, raw, series), `${series} ${unit} ${grade}`).toBe(thresholds[grade]);
        }
      }
    }
  });

  test("Summer 2025 grade-a boundaries: U1 68 → 80, U2 39, U3 41, U4 32 → 40", () => {
    expect(rawToUms("further-maths", "U1", 68, "summer-2025")).toBe(80);
    expect(rawToUms("further-maths", "U2", 39, "summer-2025")).toBe(40);
    expect(rawToUms("further-maths", "U3", 41, "summer-2025")).toBe(40);
    expect(rawToUms("further-maths", "U4", 32, "summer-2025")).toBe(40);
    expect(rawToUms("further-maths", "U1", 72, "summer-2026")).toBe(80);
    expect(rawToUms("further-maths", "U2", 37, "summer-2026")).toBe(40);
  });

  test("monotone and bounded on all units", () => {
    for (const series of SERIES) {
      for (const unit of FM_UNITS) {
        const max = unit === "U1" ? 100 : 50;
        let prev = -1;
        for (let raw = 0; raw <= max; raw++) {
          const u = rawToUms("further-maths", unit, raw, series);
          expect(u).toBeGreaterThanOrEqual(prev);
          expect(u).toBeLessThanOrEqual(max);
          prev = u;
        }
        expect(rawToUms("further-maths", unit, max, series)).toBe(max);
      }
    }
  });

  test("subject boundaries incl. series-specific A* (184 in 2025, 186 in 2026)", () => {
    expect(umsToGrade("further-maths", 184, "summer-2025")).toBe("A*");
    expect(umsToGrade("further-maths", 183, "summer-2025")).toBe("A");
    expect(umsToGrade("further-maths", 186, "summer-2026")).toBe("A*");
    expect(umsToGrade("further-maths", 185, "summer-2026")).toBe("A");
    expect(umsToGrade("further-maths", 160, "summer-2026")).toBe("A");
    expect(umsToGrade("further-maths", 146, "summer-2026")).toBe("B");
    expect(umsToGrade("further-maths", 134, "summer-2026")).toBe("C*");
    expect(umsToGrade("further-maths", 120, "summer-2026")).toBe("C");
    expect(umsToGrade("further-maths", 100, "summer-2026")).toBe("D");
    expect(umsToGrade("further-maths", 39, "summer-2026")).toBe("U");
  });

  test("U1 plus two options is required", () => {
    expect(validateCombination("further-maths", ["U1", "U2", "U3"], "summer-2025")).toMatchObject({ valid: true, maxGrade: "A*", maxUms: 200 });
    expect(validateCombination("further-maths", ["U1", "U2"], "summer-2025").valid).toBe(false);
    expect(validateCombination("further-maths", ["U2", "U3", "U4"], "summer-2025").valid).toBe(false);
    expect(validateCombination("further-maths", ["U1", "U2", "U3", "U4"], "summer-2025").valid).toBe(false);
    const r = subjectGradeFromRaw("further-maths", { U1: 100, U3: 50, U4: 50 }, "summer-2026");
    expect(r.totalUms).toBe(200);
    expect(r.grade).toBe("A*");
  });

  test("what-if: given U1 and one option, the other option's raw for A*/A/B", () => {
    // 2025: U1 90 → 80 + 22/32 × 20 = 93.75 → 94; U2 45 → 40 + 5/11 × 10 = 44.5 → 45; given 139 UMS
    const rs = whatIfForAStar("further-maths", { U1: 90, U2: 45 }, "summer-2025");
    expect(rs.map((r) => r.unit)).toEqual(["U3", "U4"]);
    expect(rs[0].givenUms).toBe(139);
    expect(rs[0].targets.map((t) => t.rawNeeded)).toEqual([46, 10, 5]); // U3 needs 45 UMS for 184
    expect(rs[1].targets.map((t) => t.rawNeeded)).toEqual([41, 8, 4]);
    const rs26 = whatIfForAStar("further-maths", { U1: 90, U2: 45 }, "summer-2026", { missingUnit: "U3" });
    expect(rs26[0].targets[0].rawNeeded).toBe(47);
  });

  test("gap report on Further Maths", () => {
    const r = umsGapReport("further-maths", { U1: 68, U2: 39, U3: 41 }, "summer-2025");
    expect(r.current.totalUms).toBe(160);
    expect(r.current.grade).toBe("A");
    expect(r.target).toBe("A*");
    expect(r.gapUms).toBe(24);
    expect(r.focusUnit).toBe("U1");
    // U1 is already worth 80 UMS, so its 20 UMS of headroom cannot cover a 24 UMS gap alone
    expect(r.extraRawOnFocus).toBeNull();
    expect(r.reachable).toBe(true);
    expect(r.text).toBe(
      "You are 24 UMS from an A*; even full marks on U1 (68 → 100, +20 UMS) leave 4 UMS, so you would also need 4 more raw marks on U2 or 4 more raw marks on U3.",
    );
    // With a strong U1 the advice lands on the option unit instead
    const r2 = umsGapReport("further-maths", { U1: 95, U2: 39, U3: 41 }, "summer-2025");
    expect(r2.focusUnit).not.toBe("U1");
    expect(r2.text).toMatch(/^You are \d+ UMS from an A\*; that is about \d+ more raw marks? on U[23]/);
  });
});

// ---------------------------------------------------------------------------
// GCSE Double Award Science
// ---------------------------------------------------------------------------

const ALL_HIGHER = { B1H: 70, C1H: 70, P1H: 70, B2H: 80, C2H: 80, P2H: 80, U7AH: 45, U7BH: 105 };
const ALL_FOUNDATION = { B1F: 60, C1F: 60, P1F: 60, B2F: 70, C2F: 70, P2F: 70, U7AF: 45, U7BF: 105 };

describe("double award science", () => {
  test("double-grade ladder is exact at every threshold (2026) and A*A*/A*A are series-specific", () => {
    const fixed: Array<[number, string]> = [
      [480, "AA"], [479, "AB"], [462, "AB"], [461, "BB"], [438, "BB"], [420, "BC*"], [402, "C*C*"], [378, "C*C"],
      [360, "CC"], [330, "CD"], [300, "DD"], [270, "DE"], [240, "EE"], [210, "EF"], [180, "FF"], [150, "FG"],
      [120, "GG"], [119, "U"],
    ];
    for (const [ums, grade] of fixed) {
      expect(umsToGrade("double-award-science", ums, "summer-2025"), `${ums}`).toBe(grade);
      expect(umsToGrade("double-award-science", ums, "summer-2026"), `${ums}`).toBe(grade);
    }
    expect(umsToGrade("double-award-science", 544, "summer-2025")).toBe("A*A*");
    expect(umsToGrade("double-award-science", 543, "summer-2025")).toBe("A*A");
    expect(umsToGrade("double-award-science", 512, "summer-2025")).toBe("A*A");
    expect(umsToGrade("double-award-science", 511, "summer-2025")).toBe("AA");
    expect(umsToGrade("double-award-science", 541, "summer-2026")).toBe("A*A*");
    expect(umsToGrade("double-award-science", 540, "summer-2026")).toBe("A*A");
    expect(umsToGrade("double-award-science", 510, "summer-2026")).toBe("A*A");
    expect(umsToGrade("double-award-science", 509, "summer-2026")).toBe("AA");
  });

  test("unit UMS maxima follow the weightings (11% → 66, 14% → 84, Unit 7 45 + 105) and are flagged estimated", () => {
    expect(rawToUmsDetail("double-award-science", "B1H", 70, "summer-2026")).toMatchObject({ ums: 66, estimated: true });
    expect(rawToUms("double-award-science", "B2H", 80, "summer-2026")).toBe(84);
    expect(rawToUms("double-award-science", "U7AH", 45, "summer-2026")).toBe(45);
    expect(rawToUms("double-award-science", "U7BH", 105, "summer-2026")).toBe(105);
    expect(rawToUms("double-award-science", "B1H", 35, "summer-2026")).toBe(33);
    expect(rawToUms("double-award-science", "B1F", 60, "summer-2026")).toBe(48); // Foundation cap
    expect(() => rawToUms("double-award-science", "B1X", 10, "summer-2026")).toThrow(RangeError);
    expect(() => rawToUms("double-award-science", "B1F", 61, "summer-2026")).toThrow(RangeError);
  });

  test("tier-combination caps transcribed from the CCEA PDF", () => {
    const s = "summer-2026";
    expect(validateCombination("double-award-science", Object.keys(ALL_HIGHER), s).maxGrade).toBe("A*A*");
    expect(validateCombination("double-award-science", ["B1F", "C1F", "P1F", "B2H", "C2H", "P2H", "U7AH", "U7BH"], s).maxGrade).toBe("A*A*");
    expect(validateCombination("double-award-science", ["B1F", "C1F", "P1F", "B2F", "C2F", "P2F", "U7AH", "U7BH"], s).maxGrade).toBe("AB");
    expect(validateCombination("double-award-science", Object.keys(ALL_FOUNDATION), s).maxGrade).toBe("BC*");
    expect(validateCombination("double-award-science", ["B1F", "C1F", "P1H", "B2F", "C2H", "P2H", "U7AF", "U7BF"], s).maxGrade).toBe("AA");
    expect(validateCombination("double-award-science", ["B1H", "C1H", "P1H", "B2F", "C2F", "P2F", "U7AF", "U7BF"], s).maxGrade).toBe("AA");
    expect(validateCombination("double-award-science", ["B1H", "C1H", "P1H", "B2F", "C2F", "P2F", "U7AH", "U7BH"], s).maxGrade).toBe("A*A");
  });

  test("illegal science combinations", () => {
    const s = "summer-2026";
    expect(validateCombination("double-award-science", ["B1H", "C1H", "P1H", "B2H", "C2H", "P2H", "U7AH", "U7BF"], s).reason).toMatch(/same tier/);
    expect(validateCombination("double-award-science", ["B1H", "C1H", "P1H", "B2H", "C2H", "P2H", "U7AH"], s).reason).toMatch(/missing U7B/);
    expect(validateCombination("double-award-science", ["B1H", "B1F", "C1H", "P1H", "B2H", "C2H", "P2H", "U7AH", "U7BH"], s).reason).toMatch(/two tiers/);
    expect(() => subjectGradeFromRaw("double-award-science", { B1H: 70 }, s)).toThrow();
  });

  test("full marks at every tier combination reproduce the CCEA maximum grade (2026 ladder)", () => {
    const s = "summer-2026";
    const unit1 = ["B1", "C1", "P1"] as const;
    const unit2 = ["B2", "C2", "P2"] as const;
    for (let f1 = 0; f1 <= 3; f1++) {
      for (let f2 = 0; f2 <= 3; f2++) {
        for (const u7 of ["H", "F"] as const) {
          const raws: Record<string, number> = {};
          unit1.forEach((u, i) => (raws[`${u}${i < f1 ? "F" : "H"}`] = i < f1 ? 60 : 70));
          unit2.forEach((u, i) => (raws[`${u}${i < f2 ? "F" : "H"}`] = i < f2 ? 70 : 80));
          raws[`U7A${u7}`] = 45;
          raws[`U7B${u7}`] = 105;
          const r = subjectGradeFromRaw("double-award-science", raws, s);
          expect(r.grade, `${f1},${f2},${u7} total ${r.totalUms}`).toBe(r.cap);
          expect(r.estimated).toBe(true);
        }
      }
    }
  });

  test("all Higher at full marks is 600 UMS = A*A*; all Foundation is capped at BC*", () => {
    const h = subjectGradeFromRaw("double-award-science", ALL_HIGHER, "summer-2025");
    expect(h.totalUms).toBe(600);
    expect(h.grade).toBe("A*A*");
    const f = subjectGradeFromRaw("double-award-science", ALL_FOUNDATION, "summer-2025");
    expect(f.totalUms).toBeLessThan(438);
    expect(f.grade).toBe("BC*");
  });

  test("what-if on the last science paper and the gap report", () => {
    const { P2H: _omit, ...seven } = ALL_HIGHER;
    void _omit;
    const rs = whatIfForAStar("double-award-science", seven, "summer-2026");
    expect(rs.map((r) => r.unit)).toEqual(["P2H", "P2F"]);
    // 516 UMS given; A*A* needs 541 → 25 UMS on P2H = raw 24 (25/84 × 80 = 23.8)
    expect(rs[0].givenUms).toBe(516);
    expect(rs[0].targets[0]).toMatchObject({ grade: "A*A*", umsNeeded: 25, rawNeeded: 24 });
    expect(rs[0].targets[2]).toMatchObject({ grade: "AA", rawNeeded: 0 });
    // On Foundation P2 the cap for (0,1,H) is A*A*, and 25 UMS needs raw 29 of 70 (61/70 per mark)
    expect(rs[1].targets[0].rawNeeded).toBe(29);

    const gap = umsGapReport("double-award-science", { ...ALL_HIGHER, B1H: 40, P2H: 60 }, "summer-2026");
    expect(gap.estimated).toBe(true);
    expect(gap.text).toMatch(/\(estimated\)\.$/);
  });
});
