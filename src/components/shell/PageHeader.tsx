/**
 * The page locator: "MATHEMATICS · M4", "TUESDAY 22 SEPTEMBER". The one surviving uppercase in the product
 * (01-art-direction.md §3.3): a breadcrumb, not a heading, once per page, at --fs-micro 13 px with 0.06 em
 * tracking in --ink-3 (one of ink-3's three legal uses). Shared with the topic hero.
 */
export const locatorCls = "text-micro font-medium uppercase tracking-[0.06em] text-ink-3";

export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  lede?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className={`mb-1 ${locatorCls}`}>{eyebrow}</p>}
        <h1 className="text-h1 font-semibold tracking-[-0.01em]">{title}</h1>
        {lede && <p className="mt-1.5 max-w-2xl text-prose text-ink-2">{lede}</p>}
      </div>
      {actions}
    </header>
  );
}
