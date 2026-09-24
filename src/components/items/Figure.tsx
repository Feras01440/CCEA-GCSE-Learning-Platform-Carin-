/**
 * Renders the figure kinds the item components can show on their own: a themed SVG file,
 * a photo with its credit, or an inline SVG string. Generated figures (svg-gen, jsxgraph,
 * mafs, apparatus) belong to the interactive family and fall back to their description.
 */
import { clsx } from "clsx";
import type { FigureSpec } from "@/lib/content/schema";
import { GeneratedFigure } from "@/components/figures/generated";
import { decodeSvgDataUri, sanitizeInlineSvg, svgViewBoxWidth } from "@/lib/ux/svg";
import { MdInlines } from "./Markdown";
import { parseInline } from "./md";

export function Figure({ spec, caption }: { spec: FigureSpec; caption?: string }) {
  switch (spec.kind) {
    case "svg": {
      const inline = decodeSvgDataUri(spec.src);
      if (inline) return <InlineSvg svg={inline} alt={spec.alt} caption={caption} />;
      return (
        <figure className="my-3">
          <img src={spec.src} alt={spec.alt} className="mx-auto max-w-full" />
          {caption && (
        <figcaption className="mt-1.5 text-center text-meta text-ink-2">
          <MdInlines inlines={parseInline(caption)} />
        </figcaption>
      )}
        </figure>
      );
    }
    case "photo":
      return (
        <figure className="my-3">
          <img src={spec.src} alt={spec.alt} className="mx-auto max-w-full rounded-[var(--radius-sm)]" />
          <figcaption className="mt-1.5 text-meta text-ink-2">
            {caption && (
              <>
                <MdInlines inlines={parseInline(caption)} /> ·{" "}
              </>
            )}
            {spec.credit} ({spec.licence})
          </figcaption>
        </figure>
      );
    case "svg-gen": {
      const gen = <GeneratedFigure generator={spec.generator} data={spec.data} options={spec.options} />;
      if (gen) return gen;
      return <p className="my-3 rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2 text-meta text-ink-2">Figure: generated {spec.generator}.</p>;
    }
    case "apparatus":
      return <p className="my-3 rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2 text-meta text-ink-2">Apparatus: {spec.parts.join(", ")}.</p>;
    case "jsxgraph":
    case "mafs":
      return <p className="my-3 rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2 text-meta text-ink-2">Interactive figure.</p>;
  }
}

/**
 * An inline SVG string authored by the pipeline (trusted content), with its text alternative.
 *
 * Drawn at most at its viewBox width in CSS pixels: the sanitiser strips `width`, so without the cap a small figure
 * stretches to the column and its labels with it (a 400-unit figure at 720 px draws 14-unit labels at 25 px). On a
 * phone the column is narrower than most viewBoxes, so the figure fits the column as before. Left-aligned with the
 * text it illustrates, the caption under it (01-art-direction.md §3 and §7: nothing is centred but a figure in its frame).
 */
export function InlineSvg({ svg, alt, caption, className }: { svg: string; alt: string; caption?: string; className?: string }) {
  const clean = sanitizeInlineSvg(svg);
  const width = svgViewBoxWidth(clean);
  return (
    <figure className={className ?? "mb-3 mt-4"}>
      <div
        role="img"
        aria-label={alt}
        className={clsx("max-w-full text-ink [&>svg]:h-auto", width ? "[&>svg]:block [&>svg]:w-full" : "[&>svg]:max-w-full")}
        style={width ? { maxWidth: `${width}px` } : undefined}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
      {caption && (
        <figcaption className="mt-3 max-w-[var(--measure)] text-meta text-ink-2">
          <MdInlines inlines={parseInline(caption)} />
        </figcaption>
      )}
    </figure>
  );
}
