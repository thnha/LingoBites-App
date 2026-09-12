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
import type {HandoffIconName} from './icons/iconRegistry';
import {MaterialIcon} from './MaterialIcon';

export type AppButtonVariant =
  | 'primary'
  | 'secondary'
  | 'primary-accent'
  | 'secondary-coral'
  | 'outline'
  | 'ghost'
  | 'deep';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: AppButtonVariant;
  loading?: boolean;
  iconLeft?: HandoffIconName;
  iconRight?: HandoffIconName;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  variant = 'primary-accent',
  loading = false,
  iconLeft,
  iconRight,
  disabled,
  style,
  accessibilityLabel,
  accessibilityState,
  testID = 'app-button',
  ...rest
}: Props) {
  const {theme} = useAppTheme();
  const spec =
    theme.components.button[variant] ||
    theme.components.button['primary-accent'] ||
    theme.components.button['primary'] ||
    Object.values(theme.components.button)[0];
  const isDisabled = disabled || loading;
  const buttonAccessibilityState = loading
    ? {disabled: true, busy: true}
    : {...accessibilityState, disabled: isDisabled};

  const shadowStyle = spec.shadow ? theme.shadow[spec.shadow] : undefined;

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
        spec.border && {
          borderColor: spec.border,
          borderWidth: 2,
        },
        shadowStyle,
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
        <>
          {iconLeft && (
            <MaterialIcon color={spec.text} name={iconLeft} size={22} />
          )}
          <Text
            numberOfLines={3}
            style={{
              color: spec.text,
              fontSize: theme.typography.size.md,
              fontWeight: theme.typography.weight.bold,
              fontFamily: theme.typography.fontFamily.primary,
              flexShrink: 1,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          {iconRight && (
            <MaterialIcon color={spec.text} name={iconRight} size={22} />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    flexDirection: 'row',
    gap: 8,
  },
});
