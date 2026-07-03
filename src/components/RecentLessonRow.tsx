import React from 'react';
import {Pressable, View} from 'react-native';
import {AppText} from './AppText';
import type {HandoffIconName} from './icons/iconRegistry';
import {MaterialIcon} from './MaterialIcon';
import {useAppTheme} from '../theme';
import type {LessonCardView} from '../types/lesson';

const THUMB_ICONS: readonly HandoffIconName[] = ['sell', 'restaurant_menu', 'menu_book'];

type Props = {
  lesson: LessonCardView;
  index: number;
  onPress?: () => void;
};

export function RecentLessonRow({lesson, index, onPress}: Props) {
  const {theme} = useAppTheme();
  const thumbTone = index % 2 === 0 ? 'teal' : 'coral';
  const thumbBg =
    thumbTone === 'teal' ? theme.colors.accentSoft : theme.colors.secondarySoft;
  const thumbColor = thumbTone === 'teal' ? theme.colors.primary : theme.colors.secondary;
  const iconName = THUMB_ICONS[index % THUMB_ICONS.length];

  const row = (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        flexDirection: 'row',
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        ...theme.shadow.soft,
      }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: thumbBg,
          borderRadius: 14,
          height: 48,
          justifyContent: 'center',
          width: 48,
        }}>
        <MaterialIcon color={thumbColor} name={iconName} size={22} />
      </View>
      <View style={{flex: 1, gap: 2, minWidth: 0}}>
        <AppText numberOfLines={1} variant="label">
          {lesson.title}
        </AppText>
        <AppText color="muted" variant="caption">
          {lesson.meta}
        </AppText>
      </View>
      <MaterialIcon color={theme.colors.text.secondary} name="chevron_right" size={22} />
    </View>
  );

  if (!onPress) {
    return row;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [{opacity: pressed ? theme.states.pressedOpacity : 1}]}>
      {row}
    </Pressable>
  );
}
