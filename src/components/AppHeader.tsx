import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {AppText} from './AppText';
import {useAppTheme, type AppTheme} from '../theme';

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
  const themedStyles = React.useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={themedStyles.header}>
      {onBack ? (
        <Pressable
          accessibilityLabel={backLabel}
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <AppText variant="label" style={themedStyles.backText}>
            {backLabel}
          </AppText>
        </Pressable>
      ) : (
        <View style={styles.sidePlaceholder} />
      )}
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.rightAction}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    justifyContent: 'center',
    minHeight: 44,
  },
  rightAction: {
    alignItems: 'flex-end',
    minWidth: 72,
  },
  sidePlaceholder: {
    width: 72,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    backText: {
      color: theme.colors.primary,
    },
    header: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 52,
      paddingHorizontal: theme.gutter,
      paddingVertical: theme.spacing.sm,
    },
  });
}
