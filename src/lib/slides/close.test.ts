import { describe, expect, it } from "vitest";
import { eveningEnd, returnDay, returnRows, type ReturnCard } from "./close";

const now = new Date("2026-09-24T21:00:00"); // a Thursday evening
const at = (ms: number) => new Date(now.getTime() + ms);
const MIN = 60_000;
const DAY = 86_400_000;
const title = (c: ReturnCard) => (c.topicSlug === "algebraic-fractions-simplify" ? "Simplifying algebraic fractions" : "Completing the square");
const card = (id: string, due: Date, topicSlug = "algebraic-fractions-simplify"): ReturnCard => ({ id, subject: "further-maths", topicSlug, due });

describe("what comes back, said from the cards themselves", () => {
  it("counts every card, not the first three (audit CT-07), and names what they are", () => {
    const tonight = [
      ...["g1", "g2", "g7", "g3", "g4", "g5", "g6"].map((g) => card(`fm.u1.algebraic-fractions-simplify#gate:${g}`, at(10 * MIN))),
      card("rp.fm.u1.algebraic-fractions-simplify.04", at(MIN)),
      card("rp.fm.u1.algebraic-fractions-simplify.06", at(10 * MIN)),
    ];
    const { rows, more } = returnRows(tonight, now, title);
    expect(rows).toEqual([{ key: expect.any(String), when: "Tonight", what: "7 checks and 2 recall cards from Simplifying algebraic fractions", reason: null, count: 9 }]);
    expect(more).toBe(0);
  });

  it("gives a reason only when there is one: a confident miss comes back sooner (audit LD-05)", () => {
    const { rows } = returnRows(
      [card("hc:dx.fm.u1.algebraic-fractions-simplify.03:1", at(2 * DAY)), card("rp.fm.u1.completing-the-square.01", at(2 * DAY), "completing-the-square")],
      now,
      title,
    );
    expect(rows.map((r) => [r.when, r.what, r.reason])).toEqual([
      ["Saturday", "1 item from Simplifying algebraic fractions", "because you were sure and not right, so it comes back sooner"],
      ["Saturday", "1 recall card from Completing the square", null],
    ]);
  });

  it("shows the soonest three rows and counts the rest honestly", () => {
    const cards = [1, 2, 3, 4, 5].flatMap((d) => [card(`rp.x.${d}a`, at(d * DAY)), card(`rp.x.${d}b`, at(d * DAY))]);
    const { rows, more } = returnRows(cards, now, title);
    expect(rows.map((r) => r.when)).toEqual(["Tomorrow", "Saturday", "Sunday"]);
    expect(rows.map((r) => r.count)).toEqual([2, 2, 2]);
    expect(more).toBe(4);
  });

  it("leaves out what is due already and what is more than six days away", () => {
    expect(returnRows([card("rp.a", at(-MIN)), card("rp.b", at(8 * DAY))], now, title)).toEqual({ rows: [], more: 0 });
  });

  it("never names a weekday that could mean today next week", () => {
    expect(returnDay(at(6 * DAY), now)).toBe("Wednesday");
    expect(returnDay(at(7 * DAY), now)).toBeNull();
  });

  it("says tonight for what comes due before the evening ends, past midnight too", () => {
    expect(returnDay(new Date("2026-09-25T00:10:00"), new Date("2026-09-24T23:50:00"))).toBe("Tonight");
    expect(returnDay(new Date("2026-09-25T02:50:00"), new Date("2026-09-25T02:40:00"))).toBe("Tonight");
    expect(returnDay(new Date("2026-09-25T18:00:00"), new Date("2026-09-25T02:40:00"))).toBe("Later today");
    expect(returnDay(new Date("2026-09-25T21:00:00"), now)).toBe("Tomorrow");
  });

  it("ends the evening at four in the morning", () => {
    expect(eveningEnd(now)).toEqual(new Date("2026-09-25T04:00:00"));
    expect(eveningEnd(new Date("2026-09-25T01:30:00"))).toEqual(new Date("2026-09-25T04:00:00"));
  });
});
