import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import {AppCard} from './AppCard';
import {AppText} from './AppText';
import {useAppTheme} from '../theme';

export interface FlipCardProps {
  flipped: boolean;
  onFlip: () => void;
  front: React.ReactNode;
  back: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function FlipCard({
  flipped,
  onFlip,
  front,
  back,
  style,
  testID = 'flip-card',
}: FlipCardProps) {
  const {theme} = useAppTheme();

  return (
    <Pressable
      accessibilityHint="Chạm để lật thẻ"
      accessibilityLabel={
        flipped ? 'Mặt sau flashcard' : 'Mặt trước flashcard'
      }
      accessibilityRole="button"
      onPress={onFlip}
      testID={testID}>
      <AppCard
        style={StyleSheet.flatten([
          {
            minHeight: 220,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.lg,
            borderWidth: 1.5,
            borderColor: flipped
              ? theme.colors.primary
              : theme.colors.border,
            backgroundColor: theme.components.card.background,
          },
          style,
        ])}>
        <View style={styles.contentContainer}>
          {flipped ? back : front}
        </View>
        <AppText
          color="muted"
          style={styles.hintText}>
          {flipped ? '🔄 Nhấn để xem mặt trước' : '🔄 Nhấn để xem mặt sau'}
        </AppText>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  hintText: {
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
});
