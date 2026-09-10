import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import YoutubeIframe, { YoutubeIframeRef } from 'react-native-youtube-iframe';

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
  onError?: (error: string) => void;
}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  ({ videoId, onReady, onTimeUpdate, onError }, ref) => {
    const playerRef = useRef<YoutubeIframeRef>(null);
    const [playing, setPlaying] = useState(false);

    useImperativeHandle(ref, () => ({
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      seekTo: (seconds: number) => playerRef.current?.seekTo(seconds, true),
      getCurrentTime: async () => {
        const time = await playerRef.current?.getCurrentTime();
        return time ?? 0;
      },
    }));

    const handleChangeState = useCallback((state: string) => {
      if (state === 'ended') {
        setPlaying(false);
      }
      if (state === 'playing') {
        setPlaying(true);
      }
      if (state === 'paused') {
        setPlaying(false);
      }
    }, []);

    const handleError = useCallback((error: string) => {
      onError?.(error);
    }, [onError]);

    return (
      <View style={styles.container}>
        <YoutubeIframe
          ref={playerRef}
          height={200}
          play={playing}
          videoId={videoId}
          onChangeState={handleChangeState}
          onReady={onReady}
          onError={handleError}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
});
