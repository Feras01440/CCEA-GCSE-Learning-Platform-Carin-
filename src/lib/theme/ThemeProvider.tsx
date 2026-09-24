"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export type ThemeName = "light" | "dark" | "evening" | "hc" | "system";
export const THEME_NAMES: readonly ThemeName[] = ["light", "dark", "evening", "hc", "system"];
export const THEME_STORAGE_KEY = "cairn.theme";
/** With no stored choice the app follows the device. A stored choice is authoritative. */
export const DEFAULT_THEME: ThemeName = "system";

type Resolved = Exclude<ThemeName, "system">;
type Ctx = { theme: ThemeName; resolved: Resolved; setTheme: (t: ThemeName) => void };
const ThemeContext = createContext<Ctx | null>(null);

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === "string" && (THEME_NAMES as readonly string[]).includes(value);
}

/** The theme to start from: the stored choice when it is a known name, otherwise the default. */
export function initialTheme(stored: string | null | undefined): ThemeName {
  return isThemeName(stored) ? stored : DEFAULT_THEME;
}

function resolve(theme: ThemeName): Resolved {
  if (theme !== "system") return theme;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyToDocument(resolved: Resolved) {
  const el = document.documentElement;
  if (resolved === "light") delete el.dataset.theme;
  else el.dataset.theme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    try {
      setThemeState(initialTheme(localStorage.getItem(THEME_STORAGE_KEY)));
    } catch {
      /* storage unavailable: follow the device */
    }
  }, []);

  useEffect(() => {
    const apply = () => applyToDocument(resolve(theme));
    apply();
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ theme, resolved: resolve(theme), setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

/**
 * The subject scope. `data-subject` sits on <html>, the same element as `data-theme`, so the
 * theme-and-subject rules in app/globals.css (`[data-theme="dark"][data-subject="maths"]`) decide
 * the accent on one element instead of racing an inherited value down the tree. On a descendant,
 * a subject's light-paper lightness beat the dark theme's inherited one and put dark text on a
 * dark button on every dark subject page (docs/design/art-direction/04-critique.md §4).
 * Only the Learn pages of a subject carry it, as the page-level attribute did before.
 */
export const SUBJECT_SCOPES = ["maths", "further-maths", "science"] as const;
export type SubjectScopeName = (typeof SUBJECT_SCOPES)[number];

/** "/learn/maths/M4/histograms-unequal-widths/" → "maths"; anything outside a subject's Learn pages → null. */
export function subjectFromPath(pathname: string | null | undefined): SubjectScopeName | null {
  const m = /^\/learn\/([a-z-]+)(?:\/|$)/.exec(pathname ?? "");
  return m && (SUBJECT_SCOPES as readonly string[]).includes(m[1]) ? (m[1] as SubjectScopeName) : null;
}

function applySubject(subject: SubjectScopeName | null) {
  const el = document.documentElement;
  if (subject) el.dataset.subject = subject;
  else delete el.dataset.subject;
}

/**
 * Keeps <html data-subject> in step with client-side navigation. The first paint is covered by
 * themeInitScript; this runs before paint on every later route change, so a subject page never
 * shows the root accent for a frame and Today never keeps a subject's.
 */
export function SubjectScope() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    applySubject(subjectFromPath(pathname));
  }, [pathname]);
  return null;
}

/**
 * Runs before first paint so the saved theme never flashes. Mirrors initialTheme and resolve.
 * A second, independent block sets the subject scope from the URL, mirroring subjectFromPath.
 */
export const themeInitScript = [
  "(function(){try{",
  `var t=localStorage.getItem('${THEME_STORAGE_KEY}');`,
  `if(${JSON.stringify(THEME_NAMES)}.indexOf(t)<0){t='${DEFAULT_THEME}'}`,
  "if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}",
  "if(t!=='light'){document.documentElement.dataset.theme=t}",
  "}catch(e){}})();",
  "(function(){try{",
  "var m=/^\\/learn\\/([a-z-]+)(?:\\/|$)/.exec(window.location.pathname);",
  `if(m&&${JSON.stringify(SUBJECT_SCOPES)}.indexOf(m[1])>=0){document.documentElement.dataset.subject=m[1]}`,
  "}catch(e){}})();",
].join("");
