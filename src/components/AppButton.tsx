import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import {useAppTheme} from '../theme';

type Variant = 'primary' | 'secondary';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  accessibilityLabel,
  accessibilityState,
  testID = 'app-button',
  ...rest
}: Props) {
  const {theme} = useAppTheme();
  const spec = theme.components.button[variant];
  const isDisabled = disabled || loading;
  const buttonAccessibilityState = loading
    ? {disabled: true, busy: true}
    : {...accessibilityState, disabled: isDisabled};

  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={buttonAccessibilityState}
      disabled={isDisabled}
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
        pressed && !isDisabled && {opacity: theme.states.pressedOpacity},
        isDisabled && {opacity: theme.states.disabledOpacity},
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          accessibilityElementsHidden
          color={spec.text}
          importantForAccessibility="no"
        />
      ) : (
        <Text
          style={{
            color: spec.text,
            fontSize: theme.typography.size.md,
            fontWeight: theme.typography.weight.bold,
            fontFamily: theme.typography.fontFamily.primary,
          }}
        >
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
