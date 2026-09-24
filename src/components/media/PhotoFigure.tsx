import { SourceNote } from "./SourceNote";

export interface PhotoRef {
  /** Local path under /img/… (downloaded with scripts/fetch-commons-image.mjs) or an absolute https URL. */
  src: string;
  alt: string;
  /** e.g. "Photo: Jane Smith, Wikimedia Commons, CC BY-SA 4.0" */
  credit: string;
  licence: string;
  licenceUrl?: string;
  sourceUrl?: string;
  caption?: string;
  /** What the examiner would ask about this photograph; shown under it so a photo is never decoration. */
  prompt?: string;
}

const linkCls = "underline decoration-line-3 underline-offset-2 hover:decoration-ink";

/**
 * A photograph with the exam-facing prompt that justifies it, and its credit and licence one tap away under "Source".
 *
 * Unlike a video, a photograph here is evidence she reads (a Benedict's colour range, a micrograph, a spectrum on a
 * wall), so it keeps its size and its colour: the row-and-desaturate treatment of 01-art-direction.md §8 is for a third
 * party's thumbnail, and applied to these it would take away the thing being taught. On the page, no frame; the height
 * is capped so a tall photograph never pushes the prose off the screen.
 */
export function PhotoFigure({ photo, className = "" }: { photo: PhotoRef; className?: string }) {
  return (
    <figure className={`mb-3 mt-4 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className="block h-auto max-h-[420px] w-auto max-w-full rounded-[var(--radius-sm)]" />
      <figcaption className="mt-3 max-w-[var(--measure)] font-sans text-meta text-ink-2">
        {photo.caption && <span className="block">{photo.caption}</span>}
        {photo.prompt && <span className="mt-1 block font-medium text-ink">Examiner’s eye: {photo.prompt}</span>}
      </figcaption>
      <SourceNote>
        {photo.sourceUrl ? (
          <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
            {photo.credit}
          </a>
        ) : (
          photo.credit
        )}
        {" · "}
        {photo.licenceUrl ? (
          <a href={photo.licenceUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
            {photo.licence}
          </a>
        ) : (
          photo.licence
        )}
      </SourceNote>
    </figure>
  );
}
