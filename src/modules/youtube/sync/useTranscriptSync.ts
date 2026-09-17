import {useCallback, useEffect, useRef, useState} from 'react';
import type {YouTubeSegment} from '../../../shared/schemas/youtube-transcript-v1';

export const TRANSCRIPT_SYNC_POLL_INTERVAL_MS = 250;
// SETE-318: upper bound for one getCurrentTime round trip. The iframe
// answers over the WebView bridge, which can hang forever (e.g. a poll
// injected before the page's player object exists throws in-page, so no
// reply is ever posted). Without a bound, one hung call wedges the poll
// latch below and the transcript never follows a playing clip again.
export const TRANSCRIPT_SYNC_POLL_TIMEOUT_MS = 1_000;
/**
 * SETE-325 (C-1): seeking to a sentence starts playback slightly before its
 * first word so the opening sound is not clipped.
 */
export const TRANSCRIPT_SEEK_COMPENSATION_MS = 300;
const INTERPOLATION_TICK_MS = 50;

type TimeSample = {
  wallMs: number;
  mediaMs: number;
};

export type TranscriptSyncSegment = Pick<YouTubeSegment, 'start_ms' | 'end_ms'>;

/**
 * Returns the index of the segment that should be highlighted at `timeMs`.
 *
 * In-segment rule: start_ms ≤ timeMs < end_ms.
 * Silence gaps keep the previous segment; time before the first segment is -1;
 * time at or after the last segment's end keeps the last segment.
 */
export function findActiveSegmentIndex(
  segments: readonly TranscriptSyncSegment[],
  timeMs: number,
): number {
  if (segments.length === 0) {
    return -1;
  }

  if (timeMs < segments[0].start_ms) {
    return -1;
  }

  const lastIndex = segments.length - 1;
  if (timeMs >= segments[lastIndex].end_ms) {
    return lastIndex;
  }

  let lo = 0;
  let hi = lastIndex;
  let candidate = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (segments[mid].start_ms <= timeMs) {
      candidate = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (candidate < 0) {
    return -1;
  }

  if (timeMs < segments[candidate].end_ms) {
    return candidate;
  }

  return candidate;
}

export function interpolateMediaTimeMs(
  previous: TimeSample | null,
  current: TimeSample,
  nowWallMs: number,
): number {
  if (!previous || previous.wallMs >= current.wallMs) {
    return current.mediaMs;
  }

  if (nowWallMs <= current.wallMs) {
    const span = current.wallMs - previous.wallMs;
    if (span <= 0) {
      return current.mediaMs;
    }
    const ratio = (nowWallMs - previous.wallMs) / span;
    return previous.mediaMs + ratio * (current.mediaMs - previous.mediaMs);
  }

  const playbackRate =
    (current.mediaMs - previous.mediaMs) / (current.wallMs - previous.wallMs);
  return current.mediaMs + playbackRate * (nowWallMs - current.wallMs);
}

export interface UseTranscriptSyncOptions {
  segments: readonly YouTubeSegment[];
  getCurrentTimeMs: () => Promise<number>;
  onSeek?: (timeMs: number) => void;
  enabled?: boolean;
}

export interface UseTranscriptSyncResult {
  activeIndex: number;
  seekToIndex: (index: number) => void;
}

export function useTranscriptSync({
  segments,
  getCurrentTimeMs,
  onSeek,
  enabled = true,
}: UseTranscriptSyncOptions): UseTranscriptSyncResult {
  const [activeIndex, setActiveIndex] = useState(-1);
  const segmentsRef = useRef(segments);
  const getCurrentTimeMsRef = useRef(getCurrentTimeMs);
  const onSeekRef = useRef(onSeek);
  const previousSampleRef = useRef<TimeSample | null>(null);
  const currentSampleRef = useRef<TimeSample | null>(null);
  const pollInFlightRef = useRef(false);

  segmentsRef.current = segments;
  getCurrentTimeMsRef.current = getCurrentTimeMs;
  onSeekRef.current = onSeek;

  const syncActiveIndexFromMediaTime = useCallback((mediaMs: number) => {
    const nextIndex = findActiveSegmentIndex(segmentsRef.current, mediaMs);
    setActiveIndex(current => (current === nextIndex ? current : nextIndex));
  }, []);

  const seekToIndex = useCallback((index: number) => {
    const list = segmentsRef.current;
    if (index < 0 || index >= list.length) {
      return;
    }

    const targetMs = Math.max(
      0,
      list[index].start_ms - TRANSCRIPT_SEEK_COMPENSATION_MS,
    );
    const wallMs = Date.now();
    previousSampleRef.current = null;
    currentSampleRef.current = {wallMs, mediaMs: targetMs};
    setActiveIndex(index);
    onSeekRef.current?.(targetMs);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    let watchdogId: ReturnType<typeof setTimeout> | null = null;

    const clearWatchdog = () => {
      if (watchdogId !== null) {
        clearTimeout(watchdogId);
        watchdogId = null;
      }
    };

    const applySample = (mediaMs: number) => {
      clearWatchdog();
      pollInFlightRef.current = false;
      if (cancelled) {
        return;
      }
      const wallMs = Date.now();
      const previous = currentSampleRef.current;
      previousSampleRef.current = previous;
      currentSampleRef.current = {wallMs, mediaMs};
      syncActiveIndexFromMediaTime(mediaMs);
    };

    const dropPoll = () => {
      clearWatchdog();
      pollInFlightRef.current = false;
    };

    const poll = () => {
      if (pollInFlightRef.current) {
        return;
      }
      pollInFlightRef.current = true;
      // SETE-318: a hung bridge call must never wedge the latch. The
      // watchdog frees the next tick, and a late reply still carries a
      // fresh measurement, so it is applied rather than discarded.
      watchdogId = setTimeout(() => {
        watchdogId = null;
        pollInFlightRef.current = false;
      }, TRANSCRIPT_SYNC_POLL_TIMEOUT_MS);
      let pending: Promise<number>;
      try {
        pending = getCurrentTimeMsRef.current();
      } catch {
        dropPoll();
        return;
      }
      pending.then(applySample, dropPoll);
    };

    poll();
    const pollId = setInterval(poll, TRANSCRIPT_SYNC_POLL_INTERVAL_MS);

    const tickId = setInterval(() => {
      const current = currentSampleRef.current;
      if (!current) {
        return;
      }
      const nowWallMs = Date.now();
      const previous = previousSampleRef.current;
      const estimatedMs =
        previous == null
          ? current.mediaMs + (nowWallMs - current.wallMs)
          : interpolateMediaTimeMs(previous, current, nowWallMs);
      syncActiveIndexFromMediaTime(estimatedMs);
    }, INTERPOLATION_TICK_MS);

    return () => {
      cancelled = true;
      clearWatchdog();
      clearInterval(pollId);
      clearInterval(tickId);
    };
  }, [enabled, segments, syncActiveIndexFromMediaTime]);

  return {activeIndex, seekToIndex};
}
