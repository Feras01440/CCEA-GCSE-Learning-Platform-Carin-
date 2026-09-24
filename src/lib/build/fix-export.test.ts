import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * scripts/fix-export.mjs guards the static export: Next 16 writes RSC prefetch payloads as nested
 * folders (out/learn/maths/M4/__next.learn/$d$subject/$d$unit/__PAGE__.txt) while the client requests
 * the dotted file beside the route (…/M4/__next.learn.$d$subject.$d$unit.__PAGE__.txt). Without the
 * flattened copies every prefetch 404s and each tap becomes a full reload.
 */
const SCRIPT = path.resolve(__dirname, "../../../scripts/fix-export.mjs");

let out: string;

beforeEach(() => {
  out = fs.mkdtempSync(path.join(os.tmpdir(), "cairn-fix-export-"));
});

afterEach(() => {
  fs.rmSync(out, { recursive: true, force: true });
});

function write(rel: string, body: string) {
  const p = path.join(out, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
}

function run(): string {
  return execFileSync(process.execPath, [SCRIPT, out], { encoding: "utf8" });
}

describe("fix-export", () => {
  it("writes the dotted payload file beside the route for every nested __next payload", () => {
    write("learn/maths/M4/index.html", "<html></html>");
    write("learn/maths/M4/__next.learn/$d$subject/$d$unit/__PAGE__.txt", "unit payload");
    write("learn/maths/M4/__next._tree.txt", "tree");
    write("learn/__next.learn/__PAGE__.txt", "learn payload");
    write("__next.__PAGE__.txt", "root payload");

    const log = run();

    expect(log).toContain("2 flattened RSC payload file(s) written");
    expect(fs.readFileSync(path.join(out, "learn/maths/M4/__next.learn.$d$subject.$d$unit.__PAGE__.txt"), "utf8")).toBe("unit payload");
    expect(fs.readFileSync(path.join(out, "learn/__next.learn.__PAGE__.txt"), "utf8")).toBe("learn payload");
    // The originals stay in place and unrelated files are untouched.
    expect(fs.existsSync(path.join(out, "learn/maths/M4/__next.learn/$d$subject/$d$unit/__PAGE__.txt"))).toBe(true);
    expect(fs.readFileSync(path.join(out, "learn/maths/M4/__next._tree.txt"), "utf8")).toBe("tree");
    expect(fs.readFileSync(path.join(out, "__next.__PAGE__.txt"), "utf8")).toBe("root payload");
  });

  it("is idempotent and never overwrites a flattened file the exporter already produced", () => {
    write("papers/10001/__next.papers/$d$paperId/__PAGE__.txt", "nested");
    write("papers/10001/__next.papers.$d$paperId.__PAGE__.txt", "already flat");

    const first = run();
    expect(first).toContain("0 flattened RSC payload file(s) written, 1 already present");
    expect(fs.readFileSync(path.join(out, "papers/10001/__next.papers.$d$paperId.__PAGE__.txt"), "utf8")).toBe("already flat");

    write("map/__next.map/__PAGE__.txt", "map payload");
    expect(run()).toContain("1 flattened RSC payload file(s) written, 1 already present");
    expect(run()).toContain("0 flattened RSC payload file(s) written, 2 already present");
  });

  it("fails loudly when the export folder does not exist", () => {
    expect(() => execFileSync(process.execPath, [SCRIPT, path.join(out, "missing")], { encoding: "utf8", stdio: "pipe" })).toThrow();
  });
});
