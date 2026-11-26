import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/constants/Theme';

export interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  helperText,
  error,
  leftSlot,
  rightSlot,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const { colors, radii, typography } = useAppTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.accent
      : colors.border;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={[typography.callout, { color: colors.textPrimary, fontWeight: '600' }]}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderRadius: radii.md,
          },
        ]}
      >
        {leftSlot}
        <TextInput
          placeholderTextColor={colors.textTertiary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: colors.textPrimary }, style]}
          {...rest}
        />
        {rightSlot}
      </View>
      {error ? (
        <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text>
      ) : helperText ? (
        <Text style={[typography.caption, { color: colors.textTertiary }]}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  field: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1.25,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
});
