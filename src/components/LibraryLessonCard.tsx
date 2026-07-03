import React from 'react';
import {Pressable, View} from 'react-native';
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
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : String(count);
}

export function LibraryLessonCard({lesson, onPress}: Props) {
  const {theme} = useAppTheme();

  const card = (
    <AppCard style={{gap: 0}}>
      <View
        style={{
          alignItems: 'flex-start',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
        <Chip label={lesson.subjectLabel} tone={lesson.subjectTone} />
        <AppText color="muted" variant="caption">
          {lesson.dateLabel}
        </AppText>
      </View>
      <AppText style={{marginBottom: 4}} variant="h3">
        {lesson.title}
      </AppText>
      <AppText color="secondary" numberOfLines={2} style={{marginBottom: 12}} variant="body">
        {lesson.blurb}
      </AppText>
      <View style={{flexDirection: 'row', gap: 16}}>
        <View style={{alignItems: 'center', flexDirection: 'row', gap: 5}}>
          <MaterialIcon color={theme.colors.tertiary} name="menu_book" size={18} />
          <AppText color="muted" variant="caption">
            {formatWordCount(lesson.vocabularyCount)} từ
          </AppText>
        </View>
        <View style={{alignItems: 'center', flexDirection: 'row', gap: 5}}>
          <MaterialIcon color={theme.colors.secondary} name="schedule" size={18} />
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
      style={({pressed}) => [{opacity: pressed ? theme.states.pressedOpacity : 1}]}>
      {card}
    </Pressable>
  );
}
