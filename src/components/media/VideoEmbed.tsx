"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Play, WifiOff } from "lucide-react";
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
 * Whether the device says it has a connection: true on the server and until mounted (so the first paint is the one the
 * server drew), then `navigator.onLine`, followed as it changes. "Online" is only the device's belief, so it gates what
 * is started, never what is already playing.
 */
function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const read = () => setOnline(typeof navigator === "undefined" || navigator.onLine !== false);
    read();
    window.addEventListener("online", read);
    window.addEventListener("offline", read);
    return () => {
      window.removeEventListener("online", read);
      window.removeEventListener("offline", read);
    };
  }, []);
  return online;
}

/**
 * Privacy-enhanced YouTube facade: nothing loads until she chooses to watch (no tracking, no autoplay),
 * then the nocookie player with no overlays. Watching never marks anything complete: the note places a
 * gate after the clip, and that gate carries the "watching is not practice" line.
 *
 * A video is a row, not a banner (01-art-direction.md §8): a 112 px thumbnail (160 px from md), desaturated a
 * little with a 6% ink veil so a third party's image is not the loudest thing in the lesson, then the title and
 * the channel. Where it plays from and how is one tap away under "Source".
 *
 * Offline (emotional-design rule 8: offline is calm; the trial audit's READ-14): the row stays, so she knows the video
 * is there, but it is not a button, since pressing it opened a blank grey player; one line under it names the
 * connection and says what to use instead. `offline` is that second half, from the host that knows the section: the
 * note's own worked steps above the video ("The worked steps above show the same method."); without it the line says
 * only what is true everywhere, that the video waits for a connection and the lesson does not wait for the video. Its
 * "why" line ("Watch it once, then answer the check") is not shown offline, since it cannot be done. Back online, the
 * row is a button again.
 */
export function VideoEmbed({ video, className = "", offline }: { video: VideoRef; className?: string; offline?: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const online = useOnline();
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1", autoplay: "1" });
  if (video.start) params.set("start", String(video.start));
  if (video.end) params.set("end", String(video.end));
  const src = `https://www.youtube-nocookie.com/embed/${video.videoId}?${params.toString()}`;
  const poster = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${video.videoId}${video.start ? `&t=${video.start}s` : ""}`;
  const detail = [video.channel, video.corbettmathsNumber ? `Corbettmaths video ${video.corbettmathsNumber}` : null, video.start ? `from ${clock(video.start)}` : null]
    .filter(Boolean)
    .join(" · ");

  const thumbnail = (withPlay: boolean) => (
    <span className="relative block h-[63px] w-[112px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-2 md:h-[90px] md:w-[160px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover [filter:saturate(0.75)]" />
      <span aria-hidden className="absolute inset-0 bg-ink opacity-[0.06]" />
      {withPlay && (
        <span aria-hidden className="absolute inset-0 grid place-items-center">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-surface text-ink">
            <Play size={14} strokeWidth={1.5} fill="currentColor" className="translate-x-px" />
          </span>
        </span>
      )}
    </span>
  );
  const names = (
    <span className="min-w-0 py-1">
      <span className="block text-ui font-medium leading-snug text-ink">{video.title}</span>
      <span className="mt-0.5 block text-meta text-ink-2">{detail}</span>
    </span>
  );

  return (
    <div className={clsx("my-5 font-sans", className)} data-video={video.videoId} data-video-state={playing ? "playing" : online ? "ready" : "offline"}>
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
      ) : online ? (
        <button
          type="button"
          onClick={() => {
            // The device may have lost its connection since the last event: then this is the offline row, not a player.
            if (typeof navigator !== "undefined" && navigator.onLine === false) return;
            setPlaying(true);
          }}
          aria-label={`Play video: ${video.title} (${video.channel})`}
          className="group flex min-h-[52px] w-full items-center gap-3 rounded-[var(--radius)] border border-line-2 bg-surface p-2 text-left hover:bg-surface-2 sm:gap-4"
        >
          {thumbnail(true)}
          {names}
        </button>
      ) : (
        <div className="flex min-h-[52px] w-full items-center gap-3 rounded-[var(--radius)] border border-line-2 bg-surface p-2 sm:gap-4">
          {thumbnail(false)}
          {names}
        </div>
      )}
      {!playing && !online ? (
        <p data-video-offline role="status" className="mt-2 flex items-start gap-2 text-meta text-ink-2">
          <WifiOff size={16} strokeWidth={1.5} aria-hidden className="mt-[2px] shrink-0" />
          <span>
            No connection, so this video cannot play here. {offline ?? "It plays once you are back online; nothing in the lesson waits for it."}
          </span>
        </p>
      ) : (
        video.why && <p className="mt-2 text-meta text-ink-2">{video.why}</p>
      )}
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
