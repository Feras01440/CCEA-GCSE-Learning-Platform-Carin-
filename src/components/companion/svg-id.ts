import { useId } from "react";

/**
 * An id for a clipPath that is unique on the page and safe inside `url(#…)`. React's useId carries delimiters
 * («r1» in React 19, :r1: before it) that a fragment reference does not match reliably; they only ever wrap the
 * id, so dropping them keeps every id distinct.
 */
export function useSvgId(prefix: string): string {
  return prefix + useId().replace(/[^A-Za-z0-9_-]/g, "");
}
