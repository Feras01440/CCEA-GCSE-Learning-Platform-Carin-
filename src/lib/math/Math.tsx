import katex from "katex";
import "katex/contrib/mhchem";

type Props = { tex: string; display?: boolean; className?: string };

/** Renders LaTeX (with mhchem \ce{} support) to accessible HTML + MathML. Safe: never throws. */
export function Math({ tex, display = false, className }: Props) {
  const html = katex.renderToString(tex, {
    displayMode: display,
    output: "htmlAndMathml",
    throwOnError: false,
    strict: "ignore",
    trust: false,
  });
  const Tag = display ? "div" : "span";
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Inline helper for prose: <M>x^2</M> */
export function M({ children }: { children: string }) {
  return <Math tex={children} />;
}
