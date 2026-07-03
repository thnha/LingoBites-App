import React from 'react';
import {View} from 'react-native';
import {AppText} from './AppText';
import {IconButton} from './IconButton';
import {useAppTheme} from '../theme';

type Props = {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: React.ReactNode;
};

export function ScreenHeader({
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
        flexDirection: 'row',
        height: 56,
        justifyContent: 'space-between',
        paddingHorizontal: theme.gutter,
      }}>
      <View style={{alignItems: 'center', flexDirection: 'row', gap: 4, minWidth: 0}}>
        {onBack ? (
          <IconButton
            accessibilityLabel={backLabel}
            icon="arrow_back"
            iconSize={24}
            onPress={onBack}
            tone="bare"
          />
        ) : (
          <View style={{width: 40}} />
        )}
        <AppText
          numberOfLines={1}
          style={{color: theme.colors.primary, fontSize: 20, fontWeight: '600'}}>
          {title}
        </AppText>
      </View>
      <View style={{alignItems: 'flex-end', minWidth: 40}}>{rightAction}</View>
    </View>
  );
}
