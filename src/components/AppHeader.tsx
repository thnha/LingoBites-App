import React from 'react';
import {Pressable, View} from 'react-native';
import {AppText} from './AppText';
import {useAppTheme} from '../theme';

type Props = {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: React.ReactNode;
};

export function AppHeader({
  title,
  onBack,
  backLabel = 'Quay lại',
  rightAction,
}: Props) {
  const {theme} = useAppTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        borderBottomColor: theme.colors.border,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 52,
        paddingHorizontal: theme.gutter,
        paddingVertical: theme.spacing.sm,
      }}>
      {onBack ? (
        <Pressable
          accessibilityLabel={backLabel}
          accessibilityRole="button"
          onPress={onBack}
          style={{minHeight: 44, justifyContent: 'center'}}>
          <AppText variant="label" style={{color: theme.colors.primary}}>
            {backLabel}
          </AppText>
        </Pressable>
      ) : (
        <View style={{width: 72}} />
      )}
      <AppText variant="h3" style={{flex: 1, textAlign: 'center'}}>
        {title}
      </AppText>
      <View style={{alignItems: 'flex-end', minWidth: 72}}>{rightAction}</View>
    </View>
  );
}
