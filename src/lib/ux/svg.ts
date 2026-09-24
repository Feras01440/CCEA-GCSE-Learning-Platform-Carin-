/**
 * Authored SVGs are inlined into the page so `currentColor` follows the theme.
 * An inlined `<style>` element applies to the WHOLE document (e.g. `svg{color:#6f7686}` would recolour every
 * icon on the page), and embedded `prefers-color-scheme` rules would follow the OS rather than the app theme,
 * so style elements, scripts and external references are removed before inlining.
 */
export function sanitizeInlineSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/\s(xlink:)?href\s*=\s*("(?!#)[^"]*"|'(?!#)[^']*')/gi, "")
    .replace(/<svg\b[^>]*>/i, (tag) =>
      /viewBox/i.test(tag) ? tag.replace(/\s(width|height)\s*=\s*("[^"]*"|'[^']*')/gi, "") : tag,
    );
}

/**
 * The width of an SVG's viewBox, in its own units, or null when it has none. sanitizeInlineSvg strips `width` and
 * `height`, so an inlined figure takes the width of its box and every label scales with it: a 400-unit figure in a
 * 720 px column would draw its 14-unit labels at 25 px. Capping the box at this many CSS pixels keeps a figure at
 * its drawn size and never larger (docs/plan/review/2026-09-22-depth-standard.md, figures).
 */
export function svgViewBoxWidth(svg: string): number | null {
  const tag = /<svg\b[^>]*>/i.exec(svg)?.[0];
  const box = tag ? /\sviewBox\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] : undefined;
  if (!box) return null;
  const parts = box.trim().split(/[\s,]+/).map(Number);
  return parts.length === 4 && Number.isFinite(parts[2]) && parts[2] > 0 ? parts[2] : null;
}

/** Decodes `data:image/svg+xml…` sources; returns null if it is not an SVG data URI. */
export function decodeSvgDataUri(src: string): string | null {
  const m = /^data:image\/svg\+xml(;charset=[^;,]+)?(;utf8)?(;base64)?,(.*)$/is.exec(src.trim());
  if (!m) return null;
  try {
    const body = m[3] ? atob(m[4]) : decodeURIComponent(m[4]);
    return /^\s*<svg[\s>]/i.test(body) ? body : null;
  } catch {
    return null;
  }
}
