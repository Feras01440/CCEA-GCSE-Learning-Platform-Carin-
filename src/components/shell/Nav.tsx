"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Compass, Ellipsis, FileText, Home, Layers, ListChecks, PenLine, Settings } from "lucide-react";
import { clsx } from "clsx";
import { CairnMark } from "@/components/companion/CairnArt";
import { isReadV2Path } from "@/components/topic/lesson-plan";

export const NAV = [
  { href: "/", label: "Today", icon: Home },
  { href: "/learn/", label: "Learn", icon: BookOpen },
  { href: "/practise/", label: "Practise", icon: PenLine },
  { href: "/papers/", label: "Papers", icon: FileText },
  { href: "/map/", label: "Map", icon: Compass },
] as const;

/** Secondary destinations: the foot of the side rail on desktop, the "More" sheet on phones. */
export const MORE_NAV = [
  { href: "/flashcards/", label: "Flashcards", icon: Layers },
  { href: "/ledger/", label: "Ledger", icon: ListChecks },
  { href: "/settings/", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.replace(/\/$/, ""));
}

/**
 * The cairn monogram: the redrawn cairn's mark (art direction v2's craft floor; CairnArt CairnMark), three asymmetric
 * stones in the ink with a lit edge. It replaced the symmetric pill stack the owner ruled out on 23 Sep.
 */
export function Wordmark({ size = 22 }: { size?: number }) {
  return <CairnMark size={size} className="text-ink" />;
}

/**
 * First run and Slides are the two surfaces with no chrome. First run: her brother's note, the Letter, the plan and the
 * first lesson are the only things on the screen, and there is nowhere to click away to except the "Skip to Today" link
 * the flow itself carries (docs/plan/review/2026-09-19-quality-bar.md, item 7). Slides: every card is the whole screen,
 * with nothing but its track and one control (decision 9; art direction v2 §8.2); the route draws its own Exit.
 */
export const isChromeFree = (pathname: string): boolean => pathname.startsWith("/welcome") || /\/slides\/?$/.test(pathname);

/**
 * The desktop rail. On a Read v2 topic page (the trial, lesson-plan.ts isReadV2Path) it folds to a 64 px column of
 * icons, so the lesson's centred column owns the width and nothing but the lesson sits beside the text (art direction
 * v2 §9). Folded, every link keeps its name for a screen reader and as a tooltip.
 */
export function SideRail({ productName }: { productName: string }) {
  const pathname = usePathname();
  if (isChromeFree(pathname)) return null;
  const folded = isReadV2Path(pathname);
  return (
    <nav
      aria-label="Primary"
      data-folded={folded || undefined}
      className={clsx(
        "hidden shrink-0 flex-col border-r border-line bg-surface/60 py-5 md:flex",
        folded ? "items-center px-2.5 md:w-16" : "px-3 md:w-56 lg:w-60",
      )}
    >
      <Link
        href="/"
        aria-label={folded ? productName : undefined}
        title={folded ? productName : undefined}
        className={clsx("mb-6 flex items-center gap-2", folded ? "tap justify-center rounded-[10px]" : "px-2")}
      >
        {/* Folded (the Read v2 trial), the mark alone at the canvas's 26 px. */}
        <Wordmark size={folded ? 26 : 22} />
        {!folded && <span className="text-[17px] font-semibold tracking-tight">{productName}</span>}
      </Link>
      <ul className={clsx("flex flex-col gap-1", folded && "items-center")}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                title={folded ? label : undefined}
                className={clsx(
                  // No transition on colour (04-critique §7.14): a theme change repaints at once, and nothing on the rail
                  // is ever caught mid-fade by a contrast check (the surfaces agent's 1.99:1 reading, 23 Sep).
                  "tap flex items-center rounded-[10px] text-ui",
                  folded ? "h-11 w-11 justify-center" : "gap-3 px-3",
                  active ? "bg-accent-3 font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                )}
              >
                <Icon size={folded ? 20 : 18} strokeWidth={1.75} aria-hidden />
                {folded ? <span className="sr-only">{label}</span> : label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className={clsx("mt-auto flex flex-col gap-1", folded && "items-center")}>
        {MORE_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(pathname, href) ? "page" : undefined}
            title={folded ? label : undefined}
            className={clsx(
              "tap flex items-center rounded-[10px] text-meta text-ink-2 hover:bg-surface-2 hover:text-ink",
              folded ? "h-11 w-11 justify-center" : "gap-3 px-3",
            )}
          >
            <Icon size={folded ? 19 : 17} strokeWidth={1.75} aria-hidden />
            {folded ? <span className="sr-only">{label}</span> : label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const MORE_PANEL_ID = "nav-more";

/**
 * The phone bar: the five primary destinations plus "More", a disclosure button that reveals
 * Flashcards, Ledger and Settings in a sheet above the bar. Escape closes it and returns focus
 * to the button; a tap outside, choosing a destination or any navigation closes it too.
 */
export function BottomTabs() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const moreActive = MORE_NAV.some((m) => isActive(pathname, m.href));

  // Any navigation closes the sheet.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      moreRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  if (isChromeFree(pathname)) return null;

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-6">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={clsx(
                  // 13 px Inter 500 under the icon: the tab label is the third legal use of --fs-micro
                  // (04-critique R3); inactive is --ink-2, since ink-3 is kept for the locator, captions and minutes.
                  "flex h-14 flex-col items-center justify-center gap-0.5 text-micro font-medium",
                  active ? "text-ink" : "text-ink-2",
                )}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.75} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            ref={moreRef}
            type="button"
            aria-expanded={open}
            aria-controls={open ? MORE_PANEL_ID : undefined}
            onClick={() => setOpen((v) => !v)}
            className={clsx(
              "flex h-14 w-full flex-col items-center justify-center gap-0.5 text-micro font-medium",
              open || moreActive ? "text-ink" : "text-ink-2",
            )}
          >
            <Ellipsis size={20} strokeWidth={open || moreActive ? 2 : 1.75} aria-hidden />
            More
          </button>
        </li>
      </ul>
      {open && (
        <div id={MORE_PANEL_ID} className="rise-in absolute inset-x-0 bottom-full border-y border-line bg-surface/95 backdrop-blur">
          <ul className="flex flex-col gap-0.5 p-2" aria-label="More">
            {MORE_NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      "tap flex items-center gap-3 rounded-[10px] px-3 text-ui",
                      active ? "bg-accent-3 font-medium text-ink" : "text-ink-2",
                    )}
                  >
                    <Icon size={18} strokeWidth={1.75} aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
