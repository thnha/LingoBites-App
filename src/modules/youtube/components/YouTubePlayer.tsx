import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {StyleSheet, View} from 'react-native';
import YoutubeIframe, {
  PLAYER_ERRORS,
  type YoutubeIframeRef,
} from 'react-native-youtube-iframe';

const TIME_UPDATE_INTERVAL_MS = 250;
const PLAYER_MIN_HEIGHT = 200;

export const YOUTUBE_PLAYER_ERROR_CODES = {
  INVALID_PARAMETER: 'YOUTUBE_INVALID_URL',
  HTML5_ERROR: 'YOUTUBE_PLAYER_HTML5_ERROR',
  VIDEO_NOT_FOUND: 'YOUTUBE_VIDEO_NOT_FOUND',
  EMBED_NOT_ALLOWED: 'YOUTUBE_NOT_EMBEDDABLE',
} as const;

export type YouTubePlayerErrorCode =
  (typeof YOUTUBE_PLAYER_ERROR_CODES)[keyof typeof YOUTUBE_PLAYER_ERROR_CODES]
  | 'YOUTUBE_PLAYER_UNKNOWN_ERROR';

export function mapYouTubePlayerError(error: string): YouTubePlayerErrorCode {
  switch (error) {
    case PLAYER_ERRORS.INVALID_PARAMETER:
      return YOUTUBE_PLAYER_ERROR_CODES.INVALID_PARAMETER;
    case PLAYER_ERRORS.HTML5_ERROR:
      return YOUTUBE_PLAYER_ERROR_CODES.HTML5_ERROR;
    case PLAYER_ERRORS.VIDEO_NOT_FOUND:
      return YOUTUBE_PLAYER_ERROR_CODES.VIDEO_NOT_FOUND;
    case PLAYER_ERRORS.EMBED_NOT_ALLOWED:
      return YOUTUBE_PLAYER_ERROR_CODES.EMBED_NOT_ALLOWED;
    default:
      return 'YOUTUBE_PLAYER_UNKNOWN_ERROR';
  }
}

export interface YouTubePlayerRef {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => Promise<number>;
}

export interface YouTubePlayerProps {
  videoId: string;
  onReady?: () => void;
  onTimeUpdate?: (time: number) => void;
  onError?: (error: YouTubePlayerErrorCode) => void;
}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  ({videoId, onReady, onTimeUpdate, onError}, ref) => {
    const playerRef = useRef<YoutubeIframeRef>(null);
    const [playing, setPlaying] = useState(false);
    const [ready, setReady] = useState(false);

    useImperativeHandle(ref, () => ({
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      seekTo: (seconds: number) => {
        playerRef.current?.seekTo(seconds, true);
      },
      getCurrentTime: async () => {
        const time = await playerRef.current?.getCurrentTime();
        return time ?? 0;
      },
    }));

    const handleReady = useCallback(() => {
      setReady(true);
      onReady?.();
    }, [onReady]);

    const handleChangeState = useCallback((state: string) => {
      if (state === 'playing') {
        setPlaying(true);
        return;
      }

      if (state === 'paused' || state === 'ended') {
        setPlaying(false);
      }
    }, []);

    const handleError = useCallback(
      (error: string) => {
        onError?.(mapYouTubePlayerError(error));
      },
      [onError],
    );

    useEffect(() => {
      if (!ready || !onTimeUpdate) {
        return undefined;
      }

      let cancelled = false;

      const pollCurrentTime = async () => {
        const time = await playerRef.current?.getCurrentTime();
        if (!cancelled && time != null) {
          onTimeUpdate(time);
        }
      };

      void pollCurrentTime();
      const intervalId = setInterval(() => {
        void pollCurrentTime();
      }, TIME_UPDATE_INTERVAL_MS);

      return () => {
        cancelled = true;
        clearInterval(intervalId);
      };
    }, [ready, onTimeUpdate, videoId]);

    return (
      <View style={styles.container}>
        <YoutubeIframe
          ref={playerRef}
          height={PLAYER_MIN_HEIGHT}
          play={playing}
          videoId={videoId}
          onChangeState={handleChangeState}
          onReady={handleReady}
          onError={handleError}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
        />
      </View>
    );
  },
);

YouTubePlayer.displayName = 'YouTubePlayer';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: PLAYER_MIN_HEIGHT,
  },
});
