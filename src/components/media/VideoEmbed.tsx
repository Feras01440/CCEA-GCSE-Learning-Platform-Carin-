"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { clsx } from "clsx";
import { SourceNote } from "./SourceNote";

export interface VideoRef {
  provider: "youtube";
  videoId: string;
  title: string;
  channel: string;
  start?: number;
  end?: number;
  why?: string;
  corbettmathsNumber?: number;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Privacy-enhanced YouTube facade: nothing loads until she chooses to watch (no tracking, no autoplay),
 * then the nocookie player with no overlays. Watching never marks anything complete: the note places a
 * gate after the clip, and that gate carries the "watching is not practice" line.
 *
 * A video is a row, not a banner (01-art-direction.md §8): a 112 px thumbnail (160 px from md), desaturated a
 * little with a 6% ink veil so a third party's image is not the loudest thing in the lesson, then the title and
 * the channel. Where it plays from and how is one tap away under "Source".
 */
export function VideoEmbed({ video, className = "" }: { video: VideoRef; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1", autoplay: "1" });
  if (video.start) params.set("start", String(video.start));
  if (video.end) params.set("end", String(video.end));
  const src = `https://www.youtube-nocookie.com/embed/${video.videoId}?${params.toString()}`;
  const poster = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${video.videoId}${video.start ? `&t=${video.start}s` : ""}`;
  const detail = [video.channel, video.corbettmathsNumber ? `Corbettmaths video ${video.corbettmathsNumber}` : null, video.start ? `from ${clock(video.start)}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={clsx("my-5 font-sans", className)}>
      {playing ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-sm)] bg-surface-2">
          <iframe
            src={src}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${video.title} (${video.channel})`}
          className="group flex min-h-[52px] w-full items-center gap-3 rounded-[var(--radius)] border border-line-2 bg-surface p-2 text-left hover:bg-surface-2 sm:gap-4"
        >
          <span className="relative block h-[63px] w-[112px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-2 md:h-[90px] md:w-[160px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover [filter:saturate(0.75)]" />
            <span aria-hidden className="absolute inset-0 bg-ink opacity-[0.06]" />
            <span aria-hidden className="absolute inset-0 grid place-items-center">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-surface text-ink">
                <Play size={14} strokeWidth={1.5} fill="currentColor" className="translate-x-px" />
              </span>
            </span>
          </span>
          <span className="min-w-0 py-1">
            <span className="block text-ui font-medium leading-snug text-ink">{video.title}</span>
            <span className="mt-0.5 block text-meta text-ink-2">{detail}</span>
          </span>
        </button>
      )}
      {video.why && <p className="mt-2 text-meta text-ink-2">{video.why}</p>}
      <SourceNote>
        Plays from YouTube, privacy-enhanced, only when you press play; nothing loads before that.{" "}
        <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-line-3 underline-offset-2 hover:decoration-ink">
          Open it on YouTube
        </a>
        .
      </SourceNote>
    </div>
  );
}
