import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
} from 'react-native';
import {useAppTheme} from '../theme';

type Variant = 'primary' | 'secondary';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
};

export function AppButton({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  ...rest
}: Props) {
  const {theme} = useAppTheme();
  const spec = theme.components.button[variant];

  return (
    <Pressable
      testID="app-button"
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({pressed}) => [
        styles.base,
        {
          backgroundColor: spec.background,
          height: spec.height,
          borderRadius: spec.radius,
        },
        variant === 'secondary' && {
          borderColor: theme.components.button.secondary.border,
          borderWidth: 1,
        },
        pressed && {opacity: theme.states.pressedOpacity},
        (disabled || loading) && {opacity: theme.states.disabledOpacity},
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={spec.text} />
      ) : (
        <Text
          style={{
            color: spec.text,
            fontSize: theme.typography.size.md,
            fontWeight: theme.typography.weight.bold,
            fontFamily: theme.typography.fontFamily.primary,
          }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
});
