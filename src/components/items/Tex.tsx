/**
 * Prose with inline `$…$` and display `$$…$$` maths. Plain strings render as-is (no KaTeX
 * work); display maths becomes a block, so the wrapper is a <div> whenever one is present.
 */
import { Math as MathTex } from "@/lib/math/Math";
import { splitTex } from "./tex-split";

export function Tex({ text, className, block = false }: { text: string; className?: string; block?: boolean }) {
  const segments = splitTex(text);
  const hasDisplay = segments.some((s) => s.type === "math" && s.display);
  const Tag = block || hasDisplay ? "div" : "span";
  if (segments.every((s) => s.type === "text")) return <Tag className={className}>{text}</Tag>;
  return (
    <Tag className={className}>
      {segments.map((s, i) =>
        s.type === "text" ? (
          <span key={i}>{s.text}</span>
        ) : (
          <MathTex key={i} tex={s.tex} display={s.display} className={s.display ? "my-2" : undefined} />
        ),
      )}
    </Tag>
  );
}
