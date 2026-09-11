import {
  nextYouTubePlaybackRate,
  YOUTUBE_PLAYBACK_RATES,
  type YouTubePlaybackRate,
} from '../playbackRate';

describe('nextYouTubePlaybackRate', () => {
  it('cycles through supported rates', () => {
    expect(nextYouTubePlaybackRate(0.75)).toBe(1);
    expect(nextYouTubePlaybackRate(1)).toBe(1.25);
    expect(nextYouTubePlaybackRate(1.5)).toBe(0.75);
  });

  it('covers every configured rate', () => {
    let rate: YouTubePlaybackRate = YOUTUBE_PLAYBACK_RATES[0];
    const seen = new Set<number>();
    for (let i = 0; i < YOUTUBE_PLAYBACK_RATES.length; i += 1) {
      seen.add(rate);
      rate = nextYouTubePlaybackRate(rate);
    }
    expect(seen.size).toBe(YOUTUBE_PLAYBACK_RATES.length);
  });
});
