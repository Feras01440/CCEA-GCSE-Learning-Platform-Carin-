import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { focusLanding, INPUT_ATTRIBUTE, inputModalityScript, QUIET_ATTRIBUTE } from "./input-modality";

/** An element as small as the script and the helper read it. */
interface FakeElement {
  nodeType: 1;
  tabIndex: number;
  isContentEditable: boolean;
  attributes: Map<string, string>;
  focused: Array<FocusOptions | undefined>;
  control: boolean;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  setAttribute(name: string, value: string): void;
  matches(selector: string): boolean;
  focus(options?: FocusOptions): void;
}

function element({ tabIndex = -1, role, editable = false, control = false, attrs = {} }: { tabIndex?: number; role?: string; editable?: boolean; control?: boolean; attrs?: Record<string, string> } = {}): FakeElement {
  const attributes = new Map<string, string>(Object.entries(attrs));
  if (role) attributes.set("role", role);
  return {
    nodeType: 1,
    tabIndex,
    isContentEditable: editable,
    attributes,
    focused: [],
    control,
    getAttribute: (name) => attributes.get(name) ?? null,
    hasAttribute: (name) => attributes.has(name),
    setAttribute: (name, value) => {
      attributes.set(name, value);
    },
    // The helper asks one question of an element: is it natively focusable (a control)?
    matches: () => control,
    focus(options) {
      this.focused.push(options);
    },
  };
}

type Registered = { type: string; listener: (event: unknown) => void; options: unknown };

/**
 * Runs the pre-paint script against a fake page: <html>, <body> and window's listeners. `early` runs it before <html>
 * exists, as a script injected ahead of the document can be; `parsed()` then puts <html> in and fires DOMContentLoaded.
 */
function page({ early = false }: { early?: boolean } = {}) {
  const html = element();
  const body = element();
  const registered: Registered[] = [];
  const onDocument: Registered[] = [];
  const win: Record<string, unknown> = {
    addEventListener: (type: string, listener: (event: unknown) => void, options: unknown) => registered.push({ type, listener, options }),
  };
  const doc: Record<string, unknown> = {
    documentElement: early ? null : html,
    body: early ? null : body,
    addEventListener: (type: string, listener: (event: unknown) => void, options: unknown) => onDocument.push({ type, listener, options }),
  };
  new Function("window", "document", inputModalityScript)(win, doc);
  const fire = (type: string, event: Record<string, unknown> = {}) => {
    for (const r of registered.filter((x) => x.type === type)) r.listener({ target: body, ...event });
  };
  const parsed = () => {
    doc.documentElement = html;
    doc.body = body;
    for (const r of onDocument.filter((x) => x.type === "DOMContentLoaded")) r.listener({});
  };
  return { html, body, registered, fire, parsed, input: () => html.getAttribute(INPUT_ATTRIBUTE) };
}

const READING_KEYS = ["Enter", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

describe("input modality: html[data-input]", () => {
  it("starts as pointer, before any input", () => {
    expect(page().input()).toBe("pointer");
  });

  it("says keyboard on Tab, whatever has focus", () => {
    const p = page();
    p.fire("keydown", { key: "Tab" });
    expect(p.input()).toBe("keyboard");
    p.fire("pointerdown");
    p.fire("keydown", { key: "Tab", shiftKey: true, target: element() });
    expect(p.input()).toBe("keyboard");
  });

  it("says keyboard on Enter, Space and the arrows while a control has focus", () => {
    const controls = {
      button: element({ tabIndex: 0, control: true }),
      "a roving option out of the tab order": element({ tabIndex: -1, role: "radio" }),
      field: element({ tabIndex: 0, control: true }),
      "an editable region": element({ editable: true }),
    };
    for (const [what, target] of Object.entries(controls)) {
      for (const key of READING_KEYS) {
        const p = page();
        p.fire("keydown", { key, target });
        expect(p.input(), `${JSON.stringify(key)} on ${what}`).toBe("keyboard");
      }
    }
  });

  it("leaves it as it was when those keys are pressed on a landing place or on the page: that is reading, not moving", () => {
    const heading = element({ tabIndex: -1, attrs: { [QUIET_ATTRIBUTE]: "" } });
    const verdict = element({ tabIndex: -1, role: "status" });
    for (const key of READING_KEYS) {
      const p = page();
      for (const target of [heading, verdict, p.body, p.html]) p.fire("keydown", { key, target });
      expect(p.input(), `${JSON.stringify(key)} while reading`).toBe("pointer");
      // And a keyboard user who scrolls from a heading stays a keyboard user.
      p.fire("keydown", { key: "Tab" });
      p.fire("keydown", { key, target: heading });
      expect(p.input()).toBe("keyboard");
    }
  });

  it("says pointer on a pointer, a mouse button or a touch", () => {
    for (const type of ["pointerdown", "mousedown", "touchstart"]) {
      const p = page();
      p.fire("keydown", { key: "Tab" });
      p.fire(type);
      expect(p.input(), type).toBe("pointer");
    }
  });

  it("ignores every other key, and keys pressed while composing text", () => {
    const button = element({ tabIndex: 0, control: true });
    const p = page();
    for (const key of ["a", "Escape", "Shift", "PageDown", "Home", "1"]) p.fire("keydown", { key, target: button });
    p.fire("keydown", { key: "Enter", target: button, isComposing: true });
    expect(p.input()).toBe("pointer");
  });

  it("holds when it runs before <html> exists: it listens at once and starts as pointer once the page is parsed", () => {
    const p = page({ early: true });
    expect(p.registered.map((r) => r.type)).toContain("keydown");
    expect(p.input()).toBeNull();
    p.parsed();
    expect(p.input()).toBe("pointer");
    p.fire("keydown", { key: "Tab" });
    expect(p.input()).toBe("keyboard");
  });

  it("listens in the capture phase, so no component can swallow a key or a press first", () => {
    const { registered } = page();
    const capture = (o: unknown) => o === true || (typeof o === "object" && o !== null && (o as { capture?: boolean }).capture === true);
    expect(registered.map((r) => r.type).sort()).toEqual(["keydown", "mousedown", "pointerdown", "touchstart"]);
    for (const r of registered) expect(capture(r.options), r.type).toBe(true);
  });

  it("the stylesheet keeps the ring for the keyboard and drops it on a quiet place under a pointer", () => {
    const css = readFileSync(path.resolve(__dirname, "../../../app/globals.css"), "utf8").replace(/\s+/g, " ");
    expect(css).toContain(":focus-visible { outline: 2px solid var(--accent); outline-offset: 2px;");
    expect(css).toContain(`html[${INPUT_ATTRIBUTE}="pointer"] :is([${QUIET_ATTRIBUTE}], [tabindex="-1"]):focus-visible { outline: none; }`);
    expect(css).toContain(`[${QUIET_ATTRIBUTE}="always"]:focus-visible { outline: none; }`);
  });
});

describe("focusLanding: the keyboard put on a place the page took her to", () => {
  it("marks a landing place quiet, takes it out of the tab order and focuses it without scrolling", () => {
    const heading = element();
    focusLanding(heading as unknown as HTMLElement);
    expect(heading.getAttribute("tabindex")).toBe("-1");
    expect(heading.getAttribute(QUIET_ATTRIBUTE)).toBe("");
    expect(heading.focused).toEqual([{ preventScroll: true }]);
  });

  it("keeps a control's own tab stop and never makes a control quiet in every modality", () => {
    const button = element({ tabIndex: 0, control: true });
    focusLanding(button as unknown as HTMLElement, { always: true });
    expect(button.hasAttribute("tabindex")).toBe(false);
    expect(button.getAttribute(QUIET_ATTRIBUTE)).toBe("");
  });

  it("keeps a tabindex that is already there, and an 'always' already given", () => {
    const title = element({ attrs: { tabindex: "-1", [QUIET_ATTRIBUTE]: "always" } });
    focusLanding(title as unknown as HTMLElement);
    expect(title.getAttribute("tabindex")).toBe("-1");
    expect(title.getAttribute(QUIET_ATTRIBUTE)).toBe("always");
    const heading = element();
    focusLanding(heading as unknown as HTMLElement, { always: true });
    expect(heading.getAttribute(QUIET_ATTRIBUTE)).toBe("always");
  });
});
