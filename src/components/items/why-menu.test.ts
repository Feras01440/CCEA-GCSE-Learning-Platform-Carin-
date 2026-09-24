import { describe, expect, it, vi } from "vitest";
import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WorkedExampleStep } from "@/lib/content/schema";
import { WhyMenu } from "./WorkedExampleAsQuestion";

const step: WorkedExampleStep = {
  n: 2,
  working: "x = 4",
  decision: "Divide both sides by 3.",
  whyMenu: { options: ["To make x bigger", "To undo the multiplication by 3", "Because 12 is even"], correct: 1, explain: "Dividing undoes multiplying." },
};

/** The option buttons in the element tree WhyMenu returns (it has no hooks, so it can be called directly). */
function options(node: ReactNode): ReactElement<{ role?: string; onClick?: () => void; children?: ReactNode }>[] {
  const out: ReactElement<{ role?: string; onClick?: () => void; children?: ReactNode }>[] = [];
  const walk = (n: ReactNode): void => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!isValidElement(n)) return;
    const el = n as ReactElement<{ role?: string; onClick?: () => void; children?: ReactNode }>;
    if (el.props.role === "radio") out.push(el);
    walk(el.props.children);
  };
  walk(node);
  return out;
}

describe("the why-menu marks the option she chose (engine item 10.7)", () => {
  // The runner stored the right option on a right answer and the FIRST wrong option on any wrong one, so a pick of
  // the third option was drawn as a pick of the first.
  it("reports which option she picked, and whether it was the reason", () => {
    const onAnswer = vi.fn();
    const tree = WhyMenu({ step, onAnswer, answered: null });
    options(tree)[2]!.props.onClick!();
    expect(onAnswer).toHaveBeenCalledWith(2, false);
    options(tree)[1]!.props.onClick!();
    expect(onAnswer).toHaveBeenLastCalledWith(1, true);
  });
  it("draws her pick as her choice and the reason as the reason", () => {
    const html = renderToStaticMarkup(createElement(WhyMenu, { step, onAnswer: () => {}, answered: 2 }));
    const at = (label: string) => html.indexOf(label);
    expect(at("Your choice")).toBeGreaterThan(at("Because 12 is even") - 1);
    expect(at("Your choice")).toBeGreaterThan(at("To undo the multiplication by 3"));
    expect(html.indexOf("The reason")).toBeGreaterThan(at("To undo the multiplication by 3"));
    expect(html.indexOf("The reason")).toBeLessThan(at("Because 12 is even"));
  });
});
