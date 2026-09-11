export const YOUTUBE_PLAYBACK_RATES = [0.75, 1, 1.25, 1.5] as const;

export type YouTubePlaybackRate = (typeof YOUTUBE_PLAYBACK_RATES)[number];

export function nextYouTubePlaybackRate(
  current: YouTubePlaybackRate,
): YouTubePlaybackRate {
  const index = YOUTUBE_PLAYBACK_RATES.indexOf(current);
  const next = (index + 1) % YOUTUBE_PLAYBACK_RATES.length;
  return YOUTUBE_PLAYBACK_RATES[next];
}

export function formatYouTubePlaybackRate(rate: YouTubePlaybackRate): string {
  return rate === 1 ? '1×' : `${rate}×`;
}
