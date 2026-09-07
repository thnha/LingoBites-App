import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {AppCard} from './AppCard';
import {AppText} from './AppText';
import {Chip} from './Chip';
import {MaterialIcon} from './MaterialIcon';
import {useAppTheme} from '../theme';
import type {LibraryLessonCardView} from '../types/lesson';

type Props = {
  lesson: LibraryLessonCardView;
  onPress?: () => void;
};

function formatWordCount(count: number): string {
  return count >= 1000
    ? `${(count / 1000).toFixed(1).replace('.0', '')}k`
    : String(count);
}

export function LibraryLessonCard({lesson, onPress}: Props) {
  const {theme} = useAppTheme();
  const themedStyles = React.useMemo(
    () =>
      StyleSheet.create({
        pressed: {
          opacity: theme.states.pressedOpacity,
        },
        resting: {
          opacity: 1,
        },
      }),
    [theme.states.pressedOpacity],
  );

  const card = (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <Chip label={lesson.subjectLabel} tone={lesson.subjectTone} />
        <AppText color="muted" variant="caption">
          {lesson.dateLabel}
        </AppText>
      </View>
      <AppText style={styles.title} variant="h3">
        {lesson.title}
      </AppText>
      <AppText
        color="secondary"
        numberOfLines={2}
        style={styles.blurb}
        variant="body"
      >
        {lesson.blurb}
      </AppText>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialIcon
            color={theme.colors.tertiary}
            name="menu_book"
            size={18}
          />
          <AppText color="muted" variant="caption">
            {formatWordCount(lesson.vocabularyCount)} từ
          </AppText>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcon
            color={theme.colors.secondary}
            name="schedule"
            size={18}
          />
          <AppText color="muted" variant="caption">
            {lesson.durationMin} phút
          </AppText>
        </View>
      </View>
    </AppCard>
  );

  if (!onPress) {
    return card;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        pressed ? themedStyles.pressed : themedStyles.resting,
      ]}
    >
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  blurb: {
    marginBottom: 12,
  },
  card: {
    gap: 0,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  title: {
    marginBottom: 4,
  },
});
