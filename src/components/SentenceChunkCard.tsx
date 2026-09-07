import React from 'react';
import {StyleSheet, View} from 'react-native';
import {AppText} from './AppText';
import {Chip} from './Chip';
import {useAppTheme, type AppTheme} from '../theme';

type Props = {
  text: string;
  meaning: string;
  roleLabel?: string;
  accentBar?: boolean;
};

export function SentenceChunkCard({
  text,
  meaning,
  roleLabel,
  accentBar = true,
}: Props) {
  const {theme} = useAppTheme();
  const barColor = accentBar
    ? theme.colors.accent
    : theme.colors.secondaryContainer;
  const themedStyles = React.useMemo(
    () => makeStyles(theme, barColor),
    [barColor, theme],
  );

  return (
    <View style={themedStyles.card}>
      <View style={styles.copy}>
        <View style={styles.textRow}>
          <AppText style={styles.text}>{text}</AppText>
          {roleLabel ? (
            <Chip label={roleLabel} tone={accentBar ? 'gold' : 'coralSoft'} />
          ) : null}
        </View>
        <AppText color="muted" variant="caption">
          {meaning}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 3,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
  },
  textRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

function makeStyles(theme: AppTheme, barColor: string) {
  return StyleSheet.create({
    card: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderLeftColor: barColor,
      borderLeftWidth: 4,
      borderRadius: 18,
      flexDirection: 'row',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 14,
      ...theme.shadow.soft,
    },
  });
}
