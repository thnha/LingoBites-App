import React from 'react';
import {TextInput, type TextInputProps} from 'react-native';
import {useAppTheme} from '../theme';

type Props = TextInputProps & {
  hasError?: boolean;
};

export function TextField({hasError = false, style, ...rest}: Props) {
  const {theme} = useAppTheme();
  return (
    <TextInput
      placeholderTextColor={theme.components.input.placeholder}
      style={[
        {
          backgroundColor: theme.components.input.background,
          borderColor: hasError ? theme.colors.danger : theme.components.input.border,
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
