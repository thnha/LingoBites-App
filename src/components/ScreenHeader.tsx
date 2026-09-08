import React from 'react';
import {StyleSheet, View} from 'react-native';
import {AppText} from './AppText';
import {IconButton} from './IconButton';
import {useAppTheme, type AppTheme} from '../theme';

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
  const themedStyles = React.useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={themedStyles.header}>
      <View style={styles.titleRow}>
        {onBack ? (
          <IconButton
            accessibilityLabel={backLabel}
            icon="arrow_back"
            iconSize={24}
            onPress={onBack}
            tone="bare"
          />
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <AppText numberOfLines={1} style={themedStyles.title}>
          {title}
        </AppText>
      </View>
      <View style={styles.rightAction}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  backPlaceholder: {
    width: 44,
  },
  rightAction: {
    alignItems: 'flex-end',
    minWidth: 40,
  },
  titleRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    minWidth: 0,
  },
});

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      height: 56,
      justifyContent: 'space-between',
      paddingHorizontal: theme.gutter,
    },
    title: {
      color: theme.colors.primary,
      flexShrink: 1,
      fontSize: theme.typography.size.lg,
      fontWeight: theme.typography.weight.medium,
    },
  });
}
