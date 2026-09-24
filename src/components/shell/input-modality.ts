/**
 * How she is moving through the page, kept on <html> as `data-input="pointer"` or `data-input="keyboard"`, so that a
 * focus ring is drawn only where the keyboard put the focus (the owner's trial, 24 Sep 2026: "a purple rectangular line
 * around the texts that appears but disappears when I click on something").
 *
 * The page moves the keyboard by script in a few places: the next section's heading after Continue, the stage a link
 * lands on, a Slides card's title. Chrome paints its :focus-visible ring on such a place whenever it judges the last
 * input to be the keyboard, and it counts any key: on build 7, after a click on Continue, pressing Space or an arrow to
 * scroll put a heather box round the heading until the next click. The ring belongs to keyboard navigation, so the
 * modality is decided by what the keys do:
 *  - Tab (Shift+Tab too) moves the keyboard: keyboard, always.
 *  - Enter, Space and the arrows press or move a control: keyboard only while a control has focus (in the tab order,
 *    editable, or with a widget role, so a roving option counts). Pressed while a landing place has focus (a heading,
 *    a card title, a verdict: out of the tab order, no widget role) or while nothing does, they scroll or turn a card:
 *    she is reading, and the modality stays as it was.
 *  - A pointer, a mouse button or a touch: pointer.
 * app/globals.css then keeps the accent ring off a quiet place (data-focus-quiet, or anything out of the tab order)
 * while the modality is pointer, and never touches the ring under the keyboard.
 *
 * The contract every surface codes against is written out in the topic-fixes agent's STATE (25 Sep 2026) and in
 * app/globals.css beside the rules.
 */

export const INPUT_ATTRIBUTE = "data-input";
export const QUIET_ATTRIBUTE = "data-focus-quiet";

export type InputModality = "pointer" | "keyboard";

/**
 * Runs before first paint (a beforeInteractive script in app/layout.tsx), so the first key or press after load is
 * already counted. ES5 and self-contained, like the theme's init script, because it runs before any bundle. Its
 * listeners are on window in the capture phase, so no component that stops a key or a press can hide it. It reads
 * <html> when it needs it rather than once, so it also holds if it runs before the element exists (an injected
 * script does): the listeners are registered first and the starting value is written as soon as <html> is there.
 */
export const inputModalityScript = [
  "(function(){try{",
  "if(window.__cairnInput)return;window.__cairnInput=1;",
  `var A='${INPUT_ATTRIBUTE}';`,
  "var ROLE=/^(button|link|radio|checkbox|switch|tab|menuitem|menuitemradio|menuitemcheckbox|option|slider|spinbutton|textbox|searchbox|combobox|treeitem|gridcell)$/;",
  "var KEYS={'Enter':1,' ':1,'Spacebar':1,'ArrowUp':1,'ArrowDown':1,'ArrowLeft':1,'ArrowRight':1};",
  "function set(v){var r=document.documentElement;if(r&&r.getAttribute(A)!==v)r.setAttribute(A,v)}",
  "function start(){var r=document.documentElement;if(r&&!r.getAttribute(A))r.setAttribute(A,'pointer')}",
  "function control(t){",
  "if(!t||t.nodeType!==1||t===document.documentElement||t===document.body)return false;",
  "if(t.isContentEditable)return true;",
  "var role=t.getAttribute('role');",
  "if(role&&ROLE.test(role))return true;",
  "return t.tabIndex>=0}",
  "function key(e){",
  "if(e.isComposing)return;",
  "if(e.key==='Tab'){set('keyboard');return}",
  "if(KEYS[e.key]===1&&control(e.target))set('keyboard')}",
  "function press(){set('pointer')}",
  "window.addEventListener('keydown',key,true);",
  "window.addEventListener('pointerdown',press,true);",
  "window.addEventListener('mousedown',press,true);",
  "window.addEventListener('touchstart',press,{capture:true,passive:true});",
  "if(document.documentElement)start();else document.addEventListener('DOMContentLoaded',start);",
  "}catch(e){}})();",
].join("");

/** What the browser can focus without a tabindex: a control. Such an element keeps its own place in the tab order. */
const NATIVELY_FOCUSABLE = "a[href], area[href], button, input, select, textarea, summary, iframe, [contenteditable]:not([contenteditable='false'])";

/**
 * Put the keyboard on a place the page has just taken her to (a heading, a stage, a section), without scrolling, since
 * the caller scrolls: out of the tab order when it is not a control, and marked quiet, so it wears the ring only when
 * the keyboard brought her there. `always` keeps a heading or a card title quiet in every modality (the lead's ruling,
 * 25 Sep: a heading is not a keyboard-operable control); it is never applied to a control, which must keep its ring
 * for the keyboard.
 */
export function focusLanding(el: HTMLElement, { always = false }: { always?: boolean } = {}): void {
  const control = el.matches(NATIVELY_FOCUSABLE);
  if (!control && !el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  if (always && !control) el.setAttribute(QUIET_ATTRIBUTE, "always");
  else if (!el.hasAttribute(QUIET_ATTRIBUTE)) el.setAttribute(QUIET_ATTRIBUTE, "");
  el.focus({ preventScroll: true });
}
