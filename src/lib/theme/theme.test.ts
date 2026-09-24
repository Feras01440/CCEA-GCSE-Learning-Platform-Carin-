import { describe, expect, it } from "vitest";
import { SUBJECTS } from "@/lib/content/taxonomy";
import { DEFAULT_THEME, initialTheme, isThemeName, SUBJECT_SCOPES, subjectFromPath, THEME_NAMES, themeInitScript } from "./ThemeProvider";

/** Runs the pre-paint script against a fake page and returns the data-theme it set, if any. */
function runInitScript(stored: string | null, prefersDark: boolean): string | undefined {
  return runInitScriptAt(stored, prefersDark).theme;
}

/** The same, at a URL, returning both attributes it set on <html>. */
function runInitScriptAt(stored: string | null, prefersDark: boolean, pathname?: string): Record<string, string> {
  const documentElement = { dataset: {} as Record<string, string> };
  const run = new Function("localStorage", "window", "document", themeInitScript);
  const win = pathname === undefined ? { matchMedia: () => ({ matches: prefersDark }) } : { matchMedia: () => ({ matches: prefersDark }), location: { pathname } };
  run({ getItem: () => stored }, win, { documentElement });
  return documentElement.dataset;
}

describe("theme default", () => {
  it("follows the device when nothing is stored", () => {
    expect(DEFAULT_THEME).toBe("system");
    expect(initialTheme(null)).toBe("system");
    expect(initialTheme(undefined)).toBe("system");
  });

  it("keeps a stored choice", () => {
    for (const name of THEME_NAMES) expect(initialTheme(name)).toBe(name);
  });

  it("ignores an unknown stored value", () => {
    expect(isThemeName("sepia")).toBe(false);
    expect(initialTheme("sepia")).toBe("system");
  });
});

describe("pre-paint script", () => {
  it("resolves the device preference when nothing is stored", () => {
    expect(runInitScript(null, true)).toBe("dark");
    expect(runInitScript(null, false)).toBeUndefined();
  });

  it("lets a stored choice win over the device", () => {
    expect(runInitScript("light", true)).toBeUndefined();
    expect(runInitScript("evening", true)).toBe("evening");
    expect(runInitScript("hc", false)).toBe("hc");
    expect(runInitScript("system", true)).toBe("dark");
  });

  it("treats an unknown stored value as the default", () => {
    expect(runInitScript("sepia", true)).toBe("dark");
    expect(runInitScript("sepia", false)).toBeUndefined();
  });
});

describe("subject scope", () => {
  it("names exactly the catalogue's subjects", () => {
    expect([...SUBJECT_SCOPES].sort()).toEqual(SUBJECTS.map((s) => s.id).sort());
  });

  it("reads the subject from a Learn path and nothing else", () => {
    expect(subjectFromPath("/learn/maths/")).toBe("maths");
    expect(subjectFromPath("/learn/maths")).toBe("maths");
    expect(subjectFromPath("/learn/further-maths/FM1/laws-of-logarithms/")).toBe("further-maths");
    expect(subjectFromPath("/learn/science/B1/b1-enzyme-factors/")).toBe("science");
    expect(subjectFromPath("/learn/")).toBeNull();
    expect(subjectFromPath("/learn/mathsx/")).toBeNull();
    expect(subjectFromPath("/flashcards/maths/M4/")).toBeNull();
    expect(subjectFromPath("/")).toBeNull();
    expect(subjectFromPath(null)).toBeNull();
  });

  it("is set before first paint alongside the theme, and never breaks the theme", () => {
    expect(runInitScriptAt(null, true, "/learn/further-maths/FM2/")).toEqual({ theme: "dark", subject: "further-maths" });
    expect(runInitScriptAt("hc", false, "/learn/science/B1/b1-enzyme-factors/")).toEqual({ theme: "hc", subject: "science" });
    expect(runInitScriptAt(null, false, "/learn/maths/M4/")).toEqual({ subject: "maths" });
    expect(runInitScriptAt(null, true, "/")).toEqual({ theme: "dark" });
    expect(runInitScriptAt(null, true, "/learn/")).toEqual({ theme: "dark" });
    // No location at all (the fake window above): the theme still lands.
    expect(runInitScriptAt(null, true)).toEqual({ theme: "dark" });
  });
});
