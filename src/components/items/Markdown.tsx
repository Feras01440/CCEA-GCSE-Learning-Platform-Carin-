/**
 * Renders the mini-markdown used in content strings (md.ts): paragraphs, line breaks,
 * **bold**, *emphasis* (rendered as medium weight, never italic — plan §6.2), $maths$
 * and pipe tables. Wide tables scroll inside their own container.
 */
import { clsx } from "clsx";
import { Math as MathTex } from "@/lib/math/Math";
import { parseMd, type MdInline } from "./md";

export function MdInlines({ inlines }: { inlines: readonly MdInline[] }) {
  return (
    <>
      {inlines.map((inl, i) => {
        switch (inl.type) {
          case "text":
            return <span key={i}>{inl.text}</span>;
          case "strong":
            return (
              <strong key={i} className="font-semibold">
                {inl.text}
              </strong>
            );
          case "em":
            return (
              <em key={i} className="not-italic font-medium text-ink">
                {inl.text}
              </em>
            );
          case "math": {
            const tex = <MathTex tex={inl.tex} display={inl.display} className={inl.display ? "my-2" : undefined} />;
            if (inl.wrap === "strong")
              return (
                <strong key={i} className="font-semibold">
                  {tex}
                </strong>
              );
            if (inl.wrap === "em")
              return (
                <em key={i} className="not-italic font-medium text-ink">
                  {tex}
                </em>
              );
            return <span key={i}>{tex}</span>;
          }
          case "br":
            return <br key={i} />;
        }
      })}
    </>
  );
}

/** A size utility in a caller's className: when present it must win, so the default is left out. */
const SIZED = /(^|\s)text-(\[\d|display\b|h[123]\b|prose\b|ui\b|meta\b|micro\b)/;

/**
 * Learning prose is --fs-prose, 17 px on a phone and 18 px from md (01-art-direction.md §3). The default
 * used to be a fixed text-[16px], which also silently beat any named size a caller passed (an arbitrary
 * value sorts after text-meta in the stylesheet), so the note, the stems and "Because" all rendered at 16.
 */
export function Md({ md, className, compact = false }: { md: string; className?: string; compact?: boolean }) {
  const blocks = parseMd(md);
  return (
    <div className={clsx(!SIZED.test(className ?? "") && "text-prose", "leading-[1.6] text-ink", className)}>
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i} className={clsx(i > 0 && (compact ? "mt-2" : "mt-3"))}>
            <MdInlines inlines={b.inlines} />
          </p>
        ) : (
          <div key={i} className={clsx("overflow-x-auto", i > 0 && "mt-3")}>
            <table className="tnum min-w-full border-collapse text-ui">
              {b.header && (
                <thead>
                  <tr>
                    {b.header.map((cell, c) => (
                      <th key={c} scope="col" className="whitespace-nowrap border border-line-2 bg-surface-2 px-3 py-1.5 text-left font-semibold">
                        <MdInlines inlines={cell} />
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {b.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} className="whitespace-nowrap border border-line-2 px-3 py-1.5">
                        <MdInlines inlines={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      )}
    </div>
  );
}
