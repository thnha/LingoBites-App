import React, {useId, useState} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type BlurEvent,
  type FocusEvent,
  type TextInputProps,
} from 'react-native';
import {useAppTheme} from '../theme';
import {AppText} from './AppText';

type Props = TextInputProps & {
  hasError?: boolean;
  label?: string;
  errorMessage?: string;
};

const FOCUS_RING_WIDTH = 4;
const MULTILINE_RADIUS = 20;
const IDLE_BORDER_ALPHA = 0.35;

/**
 * Applies an alpha channel to an `#rgb` / `#rrggbb` theme color.
 * Falls back to the solid color when the value cannot be parsed, so
 * non-hex theme tokens keep rendering instead of breaking.
 */
function withAlpha(color: string, alpha: number): string {
  const hex = color.startsWith('#') ? color.slice(1) : color;
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map(part => part + part)
          .join('')
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return color;
  }
  const red = parseInt(full.slice(0, 2), 16);
  const green = parseInt(full.slice(2, 4), 16);
  const blue = parseInt(full.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${alpha})`;
}

export function TextField({
  hasError = false,
  label,
  errorMessage,
  style,
  multiline,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityLabelledBy,
  accessibilityState,
  accessibilityHint,
  accessibilityValue,
  placeholder,
  ...rest
}: Props) {
  const {theme} = useAppTheme();
  const [focused, setFocused] = useState(false);
  const rawId = useId();
  const labelNativeId = `textfield-label-${rawId.replace(
    /[^a-zA-Z0-9-_]/g,
    '',
  )}`;

  const hasErrorText = errorMessage !== undefined && errorMessage !== '';
  const invalid = hasError || hasErrorText;
  const radius = multiline ? MULTILINE_RADIUS : theme.radius.pill;
  const borderColor = invalid
    ? theme.colors.danger
    : focused
      ? theme.colors.accent
      : withAlpha(theme.colors.accent, IDLE_BORDER_ALPHA);
  // The halo ring is always laid out (fully transparent when idle) so
  // focusing the field never shifts surrounding layout. The transparent
  // value is derived from the theme token to satisfy no-color-literals.
  const ringColor =
    focused && !invalid
      ? theme.colors.accentSoft
      : withAlpha(theme.colors.accentSoft, 0);

  const handleFocus = (event: FocusEvent) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: BlurEvent) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <AppText nativeID={labelNativeId} variant="label">
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.focusRing,
          {
            borderColor: ringColor,
            borderRadius: radius + FOCUS_RING_WIDTH,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={
            accessibilityLabel ??
            label ??
            (typeof placeholder === 'string' ? placeholder : undefined)
          }
          accessibilityLabelledBy={
            label ? (accessibilityLabelledBy ?? labelNativeId) : (
              accessibilityLabelledBy
            )
          }
          accessibilityHint={accessibilityHint ?? errorMessage}
          accessibilityState={accessibilityState}
          accessibilityValue={
            errorMessage
              ? {...accessibilityValue, text: errorMessage}
              : accessibilityValue
          }
          placeholder={placeholder}
          placeholderTextColor={theme.components.input.placeholder}
          multiline={multiline}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            {
              backgroundColor: theme.components.input.background,
              borderColor,
              borderRadius: radius,
              borderWidth: 2,
              color: theme.components.input.text,
              fontSize: theme.typography.presets.body.fontSize,
              minHeight: 48,
              padding: theme.spacing.md,
            },
            style,
          ]}
          {...rest}
        />
      </View>
      {hasErrorText ? (
        <AppText
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          color="danger"
          variant="caption"
        >
          {errorMessage}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  focusRing: {
    borderWidth: FOCUS_RING_WIDTH,
  },
});
