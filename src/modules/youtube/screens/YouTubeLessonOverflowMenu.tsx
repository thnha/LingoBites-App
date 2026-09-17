import React, {useMemo} from 'react';
import {Modal, Pressable, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppText} from '@components/AppText';
import {MaterialIcon} from '@components/MaterialIcon';
import type {HandoffIconName} from '@components/icons/iconRegistry';
import {useAppTheme, type AppTheme} from '@theme';
import {
  formatYouTubePlaybackRate,
  type YouTubePlaybackRate,
} from '../utils/playbackRate';

export type YouTubeLessonOverflowMenuProps = {
  visible: boolean;
  onClose: () => void;
  playbackRate: YouTubePlaybackRate;
  onCyclePlaybackRate: () => void;
  abLoopStartIndex: number | null;
  abLoopEndIndex: number | null;
  abLoopActive: boolean;
  onSetAbLoopPointA: () => void;
  onSetAbLoopPointB: () => void;
  onClearAbLoop: () => void;
  repeatActive: boolean;
  onToggleRepeat: () => void;
  /**
   * SETE-325 (C-4): opens the transcript popup. Reading works offline, so
   * this row is never disabled by `disabledOffline`.
   */
  onOpenTranscript: () => void;
  /**
   * Offline reading mode: every playback-dependent row stays visible but
   * disabled, so users learn the feature exists instead of seeing controls
   * silently vanish.
   */
  disabledOffline: boolean;
};

type MenuRow = {
  testID: string;
  icon: HandoffIconName;
  label: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled: boolean;
  active: boolean;
  onSelect: () => void;
};

function OverflowRow({row}: {row: MenuRow}) {
  const {theme} = useAppTheme();
  return (
    <Pressable
      accessibilityHint={row.accessibilityHint}
      accessibilityLabel={row.accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{disabled: row.disabled, selected: row.active}}
      disabled={row.disabled}
      onPress={() => {
        row.onSelect();
      }}
      testID={row.testID}
      style={({pressed}) => [
        {
          opacity:
            pressed && !row.disabled ? theme.states.pressedOpacity : undefined,
        },
      ]}
    >
      {({pressed}) => (
        <View
          style={[
            rowStyles.row,
            {
              gap: theme.spacing.sm,
              opacity: row.disabled
                ? theme.states.disabledOpacity
                : pressed
                ? theme.states.pressedOpacity
                : 1,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
            },
          ]}
        >
          <MaterialIcon name={row.icon} size={22} />
          <AppText style={rowStyles.label} variant="body">
            {row.label}
          </AppText>
          {row.active ? (
            <AppText
              accessibilityElementsHidden
              importantForAccessibility="no"
              testID={`${row.testID}-active-mark`}
              variant="label"
            >
              ✓
            </AppText>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const rowStyles = StyleSheet.create({
  label: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
  },
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      alignItems: 'flex-end',
      backgroundColor: theme.colors.overlay,
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.xxxl + theme.gutter,
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      minWidth: 248,
      paddingVertical: theme.spacing.xs,
    },
    title: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
  });
}

/**
 * SETE-305 (Option B): overflow menu for the lesson header. Playback controls
 * (speed, A–B loop, sentence repeat) live here with text labels, so the
 * header holds a fixed set of 4 controls and Back can never be squeezed out.
 * Every row keeps its pre-existing testID, handler and enable/disable
 * condition — only the placement changed.
 */
export function YouTubeLessonOverflowMenu({
  visible,
  onClose,
  playbackRate,
  onCyclePlaybackRate,
  abLoopStartIndex,
  abLoopEndIndex,
  abLoopActive,
  onSetAbLoopPointA,
  onSetAbLoopPointB,
  onClearAbLoop,
  repeatActive,
  onToggleRepeat,
  onOpenTranscript,
  disabledOffline,
}: YouTubeLessonOverflowMenuProps) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const rateLabel = formatYouTubePlaybackRate(playbackRate);
  const rows: MenuRow[] = [
    {
      testID: 'youtube-playback-rate',
      icon: 'schedule',
      label: t('youtube.overflow_playback_rate', {rate: rateLabel}),
      accessibilityLabel: t('youtube.playback_rate_a11y', {rate: rateLabel}),
      accessibilityHint: t('youtube.playback_rate_hint'),
      disabled: disabledOffline,
      active: playbackRate !== 1,
      onSelect: onCyclePlaybackRate,
    },
    {
      testID: 'youtube-ab-loop-a',
      icon: 'flag',
      label: t('youtube.overflow_ab_loop_a'),
      accessibilityLabel: t('youtube.ab_loop_a_a11y', {
        index:
          abLoopStartIndex != null
            ? abLoopStartIndex + 1
            : t('youtube.ab_loop_unset'),
      }),
      accessibilityHint: t('youtube.ab_loop_a_hint'),
      disabled: disabledOffline,
      active: abLoopStartIndex != null,
      onSelect: onSetAbLoopPointA,
    },
    {
      testID: 'youtube-ab-loop-b',
      icon: 'compare',
      label: t('youtube.overflow_ab_loop_b'),
      accessibilityLabel: t('youtube.ab_loop_b_a11y', {
        index:
          abLoopEndIndex != null
            ? abLoopEndIndex + 1
            : t('youtube.ab_loop_unset'),
      }),
      accessibilityHint: t('youtube.ab_loop_b_hint'),
      disabled: disabledOffline,
      active: abLoopActive,
      onSelect: onSetAbLoopPointB,
    },
  ];
  if (abLoopStartIndex != null || abLoopEndIndex != null) {
    rows.push({
      testID: 'youtube-ab-loop-clear',
      icon: 'close',
      label: t('youtube.overflow_ab_loop_clear'),
      accessibilityLabel: t('youtube.ab_loop_clear_a11y'),
      accessibilityHint: t('youtube.ab_loop_clear_hint'),
      disabled: disabledOffline,
      active: false,
      onSelect: onClearAbLoop,
    });
  }
  rows.push({
    testID: 'youtube-toggle-repeat',
    icon: 'repeat',
    label: t('youtube.overflow_repeat_sentence'),
    accessibilityLabel: repeatActive
      ? t('youtube.repeat_off_a11y')
      : t('youtube.repeat_on_a11y'),
    accessibilityHint: t('youtube.repeat_toggle_hint'),
    disabled: disabledOffline,
    active: repeatActive,
    onSelect: onToggleRepeat,
  });
  rows.push({
    testID: 'youtube-open-transcript',
    icon: 'subtitles',
    label: t('youtube.overflow_transcript', {defaultValue: 'Xem transcript'}),
    accessibilityLabel: t('youtube.transcript_open_a11y', {
      defaultValue: 'Xem transcript',
    }),
    accessibilityHint: t('youtube.transcript_open_hint', {
      defaultValue: 'Mở cửa sổ transcript của video',
    }),
    disabled: false,
    active: false,
    onSelect: onOpenTranscript,
  });

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable
        accessibilityHint={t('youtube.overflow_close_hint')}
        accessibilityLabel={t('youtube.overflow_close_a11y')}
        accessibilityRole="button"
        onPress={onClose}
        style={styles.backdrop}
        testID="youtube-overflow-backdrop"
      >
        <View style={styles.sheet} testID="youtube-overflow-menu">
          <AppText color="secondary" style={styles.title} variant="label">
            {t('youtube.overflow_title')}
          </AppText>
          {rows.map(row => (
            <OverflowRow
              key={row.testID}
              row={{
                ...row,
                onSelect: () => {
                  row.onSelect();
                  onClose();
                },
              }}
            />
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}
