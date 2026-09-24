import mediaMap from "../../../data/links/media-map.json";
import type { VideoRef } from "@/components/media/VideoEmbed";
import type { SimRef } from "@/components/media/SimEmbed";

export interface TopicMedia {
  videos: VideoRef[];
  sims: SimRef[];
  reading: Array<{ label: string; url: string; provider: string }>;
}

type RawVideo = { provider?: string; videoId: string; title: string; channel: string; url?: string; start?: number; end?: number; why?: string; embeddable?: boolean; corbettmathsNumber?: number };
type RawSim = { provider: "phet" | "geogebra"; url: string; title: string; licence?: string; attribution?: string; task?: string };
type RawEntry = { videos?: RawVideo[]; sims?: RawSim[]; reading?: Array<{ label: string; url: string; provider: string }> };

const topics = (mediaMap as { topics?: Record<string, RawEntry> }).topics ?? {};

const PHET_ATTRIBUTION = "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu)";

/** Verified, embeddable media for a topic, or empty lists. Videos flagged not embeddable are dropped. */
export function mediaFor(subject: string, slug: string): TopicMedia {
  const e = topics[`${subject}:${slug}`];
  if (!e) return { videos: [], sims: [], reading: [] };
  const videos: VideoRef[] = (e.videos ?? [])
    .filter((v) => v.embeddable !== false && v.videoId)
    .map((v) => ({ provider: "youtube", videoId: v.videoId, title: v.title, channel: v.channel, start: v.start, end: v.end, why: v.why, corbettmathsNumber: v.corbettmathsNumber }));
  const sims: SimRef[] = (e.sims ?? []).map((s) => ({
    provider: s.provider,
    url: s.url,
    title: s.title,
    licence: s.licence ?? (s.provider === "phet" ? "CC BY-NC 4.0" : "GeoGebra non-commercial licence"),
    attribution: s.attribution ?? (s.provider === "phet" ? PHET_ATTRIBUTION : "Made with GeoGebra®"),
    task: s.task,
  }));
  return { videos, sims, reading: e.reading ?? [] };
}

export function mediaCoverage(): { topics: number; videos: number; sims: number } {
  let videos = 0;
  let sims = 0;
  for (const e of Object.values(topics)) {
    videos += (e.videos ?? []).filter((v) => v.embeddable !== false).length;
    sims += (e.sims ?? []).length;
  }
  return { topics: Object.keys(topics).length, videos, sims };
}
