import { describe, expect, it } from "vitest";
import { NoteBlock } from "./schema";

/**
 * A note's video block may name its Corbettmaths video number. The lead's ruling (8 Oct 2026): Corbettmaths numbers carry
 * letter suffixes (267d), so the field is a number or a string of digits with at most one lower-case letter after them.
 * Nothing in src/ does arithmetic on it: VideoEmbed prints it in a sentence ("Corbettmaths video 267d").
 */
const video = (corbettmathsNumber?: unknown) => ({
  type: "video",
  videoId: "_ks2K1FuB80",
  title: "Solving quadratics graphically",
  channel: "corbettmaths",
  ...(corbettmathsNumber === undefined ? {} : { corbettmathsNumber }),
});

describe("a video block's corbettmathsNumber", () => {
  it("accepts a number, digits, and digits with one lower-case letter suffix", () => {
    for (const n of [undefined, 267, "267", "267d", "8a"]) expect(NoteBlock.safeParse(video(n)).success, String(n)).toBe(true);
  });

  it("refuses anything else", () => {
    for (const n of ["", "267dd", "d267", "267D", "26 7", "267-d", "video 267d", true, null]) {
      expect(NoteBlock.safeParse(video(n)).success, String(n)).toBe(false);
    }
  });
});
