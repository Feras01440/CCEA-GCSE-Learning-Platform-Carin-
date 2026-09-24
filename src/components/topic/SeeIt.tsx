import { VideoEmbed } from "@/components/media/VideoEmbed";
import { SimEmbed } from "@/components/media/SimEmbed";
import { mediaFor } from "@/lib/content/media";

/**
 * "See it": the best verified video and simulation for a topic, with credit, after the lesson.
 * On the page, not in a card (01-art-direction.md §4.2): each video or simulation is its own row, the one object here,
 * so no object sits inside another. Server-renderable (the embeds themselves are click-to-load client components).
 */
export function SeeIt({ subject, slug, compact = false }: { subject: string; slug: string; compact?: boolean }) {
  const media = mediaFor(subject, slug);
  if (!media.videos.length && !media.sims.length) return null;
  return (
    <section id="see-it" aria-labelledby="see-it-title" className="section-rule" style={{ marginTop: "var(--gap-stage)" }}>
      <p className="text-meta font-medium text-ink-2">Watch or try it · optional, online only</p>
      <h2 id="see-it-title" className="font-serif-lesson mt-1 text-h2 font-medium tracking-[-0.01em]">
        See it
      </h2>
      <div className="mt-3">
        {media.videos.slice(0, compact ? 1 : 2).map((v) => (
          <VideoEmbed key={v.videoId} video={v} />
        ))}
        {media.sims.slice(0, 1).map((s) => (
          <SimEmbed key={s.url} sim={s} />
        ))}
      </div>
    </section>
  );
}
