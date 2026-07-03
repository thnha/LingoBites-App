import React from 'react';
import {Pressable} from 'react-native';
import {AppCard} from './AppCard';
import {AppText} from './AppText';
import {useAppTheme} from '../theme';
import type {LessonCardView} from '../types/lesson';

type Props = {
  lesson: LessonCardView;
  onPress?: () => void;
};

export function LessonCard({lesson, onPress}: Props) {
  const {theme} = useAppTheme();
  const card = (
    <AppCard style={{gap: theme.spacing.xs}}>
      <AppText variant="h3">{lesson.title}</AppText>
      <AppText variant="caption" color="muted">
        {lesson.meta}
      </AppText>
      {lesson.blurb ? (
        <AppText color="secondary" numberOfLines={2}>
          {lesson.blurb}
        </AppText>
      ) : null}
    </AppCard>
  );

  if (!onPress) {
    return card;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {card}
    </Pressable>
  );
}
