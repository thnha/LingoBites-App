import React, {useEffect} from 'react';
import renderer, {act} from 'react-test-renderer';
import type {YouTubeSegment} from '../../../../shared/schemas/youtube-transcript-v1';
import {
  findActiveSegmentIndex,
  interpolateMediaTimeMs,
  TRANSCRIPT_SYNC_POLL_INTERVAL_MS,
  useTranscriptSync,
  type UseTranscriptSyncResult,
} from '../useTranscriptSync';

function makeSegment(
  index: number,
  start_ms: number,
  end_ms: number,
): YouTubeSegment {
  return {
    id: `seg-${index}`,
    index,
    start_ms,
    end_ms,
    en: `line ${index}`,
    vi: '',
    ipa: '',
  };
}

const SAMPLE_SEGMENTS = [
  makeSegment(0, 0, 3_200),
  makeSegment(1, 3_200, 6_100),
  makeSegment(2, 7_000, 9_500),
];

describe('findActiveSegmentIndex', () => {
  it('returns -1 for empty segments', () => {
    expect(findActiveSegmentIndex([], 1_000)).toBe(-1);
  });

  it('returns -1 when time is before the first segment', () => {
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, -1)).toBe(-1);
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, 0)).toBe(0);
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, 50)).toBe(0);
  });

  it('uses start_ms inclusive and end_ms exclusive', () => {
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, 3_199)).toBe(0);
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, 3_200)).toBe(1);
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, 6_099)).toBe(1);
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, 6_100)).toBe(1);
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, 7_000)).toBe(2);
  });

  it('keeps the previous segment during silence gaps', () => {
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, 6_500)).toBe(1);
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, 6_999)).toBe(1);
  });

  it('keeps the last segment after playback passes the final end', () => {
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, 9_500)).toBe(2);
    expect(findActiveSegmentIndex(SAMPLE_SEGMENTS, 60_000)).toBe(2);
  });
});

describe('interpolateMediaTimeMs', () => {
  it('linearly interpolates between two samples', () => {
    const previous = {wallMs: 0, mediaMs: 0};
    const current = {wallMs: 250, mediaMs: 250};
    expect(interpolateMediaTimeMs(previous, current, 125)).toBe(125);
  });
});

type HarnessProps = {
  segments: readonly YouTubeSegment[];
  getCurrentTimeMs: () => Promise<number>;
  onSeek?: (timeMs: number) => void;
  onResult: (result: UseTranscriptSyncResult) => void;
};

function TranscriptSyncHarness({
  segments,
  getCurrentTimeMs,
  onSeek,
  onResult,
}: HarnessProps) {
  const result = useTranscriptSync({segments, getCurrentTimeMs, onSeek});
  useEffect(() => {
    onResult(result);
  }, [onResult, result]);
  return null;
}

describe('useTranscriptSync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-10T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  async function renderHarness(
    getCurrentTimeMs: () => Promise<number>,
    segments: readonly YouTubeSegment[] = SAMPLE_SEGMENTS,
    onSeek?: (timeMs: number) => void,
  ) {
    let latest: UseTranscriptSyncResult | null = null;

    await act(async () => {
      renderer.create(
        <TranscriptSyncHarness
          segments={segments}
          getCurrentTimeMs={getCurrentTimeMs}
          onSeek={onSeek}
          onResult={result => {
            latest = result;
          }}
        />,
      );
      await Promise.resolve();
    });

    const read = () => {
      if (!latest) {
        throw new Error('hook result not ready');
      }
      return latest;
    };

    return {read};
  }

  it('tracks the active segment from polled playback time within 300ms', async () => {
    let mediaMs = 0;
    const {read} = await renderHarness(async () => mediaMs);

    await act(async () => {
      jest.advanceTimersByTime(TRANSCRIPT_SYNC_POLL_INTERVAL_MS);
      await Promise.resolve();
    });
    expect(read().activeIndex).toBe(0);

    mediaMs = 3_200;
    await act(async () => {
      jest.advanceTimersByTime(TRANSCRIPT_SYNC_POLL_INTERVAL_MS);
      await Promise.resolve();
    });
    expect(read().activeIndex).toBe(1);

    mediaMs = 6_800;
    await act(async () => {
      jest.advanceTimersByTime(TRANSCRIPT_SYNC_POLL_INTERVAL_MS);
      await Promise.resolve();
    });
    expect(read().activeIndex).toBe(1);
  });

  it('extrapolates from the latest poll so boundary crossings stay within 300ms', async () => {
    let mediaMs = 3_050;
    const {read} = await renderHarness(async () => mediaMs);

    await act(async () => {
      await Promise.resolve();
    });
    expect(read().activeIndex).toBe(0);

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });
    expect(read().activeIndex).toBe(1);
  });

  it('returns -1 for empty segments', async () => {
    const {read} = await renderHarness(async () => 0, []);
    await act(async () => {
      jest.advanceTimersByTime(TRANSCRIPT_SYNC_POLL_INTERVAL_MS);
      await Promise.resolve();
    });
    expect(read().activeIndex).toBe(-1);
  });

  it('seekToIndex jumps to a segment and notifies onSeek', async () => {
    const onSeek = jest.fn();
    const {read} = await renderHarness(async () => 0, SAMPLE_SEGMENTS, onSeek);

    await act(async () => {
      read().seekToIndex(2);
    });

    expect(read().activeIndex).toBe(2);
    expect(onSeek).toHaveBeenCalledWith(7_000);
  });

  it('seekToIndex ignores out-of-range indices', async () => {
    const onSeek = jest.fn();
    const {read} = await renderHarness(async () => 0, SAMPLE_SEGMENTS, onSeek);

    await act(async () => {
      read().seekToIndex(-1);
      read().seekToIndex(99);
    });

    expect(onSeek).not.toHaveBeenCalled();
  });

  it('supports seeking backward and forward across segments', async () => {
    let mediaMs = 8_000;
    const {read} = await renderHarness(async () => mediaMs);

    await act(async () => {
      jest.advanceTimersByTime(TRANSCRIPT_SYNC_POLL_INTERVAL_MS);
      await Promise.resolve();
    });
    expect(read().activeIndex).toBe(2);

    await act(async () => {
      read().seekToIndex(0);
    });
    expect(read().activeIndex).toBe(0);

    mediaMs = 500;
    await act(async () => {
      jest.advanceTimersByTime(TRANSCRIPT_SYNC_POLL_INTERVAL_MS);
      await Promise.resolve();
    });
    expect(read().activeIndex).toBe(0);

    await act(async () => {
      read().seekToIndex(1);
    });
    expect(read().activeIndex).toBe(1);
  });
});
