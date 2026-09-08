import React from 'react';
import {TextInput, type TextInputProps} from 'react-native';
import {useAppTheme} from '../theme';

type Props = TextInputProps & {
  hasError?: boolean;
  label?: string;
  errorMessage?: string;
};

export function TextField({
  hasError = false,
  label,
  errorMessage,
  style,
  accessibilityLabel,
  accessibilityState,
  accessibilityHint,
  accessibilityValue,
  placeholder,
  ...rest
}: Props) {
  const {theme} = useAppTheme();
  return (
    <TextInput
      accessibilityLabel={
        accessibilityLabel ??
        label ??
        (typeof placeholder === 'string' ? placeholder : undefined)
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
      style={[
        {
          backgroundColor: theme.components.input.background,
          borderColor: hasError
            ? theme.colors.danger
            : theme.components.input.border,
          borderRadius: theme.components.input.radius,
          borderWidth: 1,
          color: theme.components.input.text,
          fontSize: theme.typography.presets.body.fontSize,
          minHeight: 48,
          padding: theme.spacing.md,
        },
        style,
      ]}
      {...rest}
    />
  );
}
