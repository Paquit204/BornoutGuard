 // components/CustomButton.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Gradients, Shadows, Spacing, Typography } from '../constants/theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}

export default function CustomButton({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  disabled = false,
  style,
}: Props) {
  // Primary variant – gradient button
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[styles.primaryButton, styles.buttonShadow, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Gradients.primary}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={[styles.primaryText, Typography.button]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Other variants – flat
  const bgColors = {
    secondary: Colors.card,
    danger: Colors.danger,
    outline: 'transparent',
  };
  const textColors = {
    secondary: Colors.textPrimary,
    danger: Colors.white,
    outline: Colors.primary,
  };
  const borderColors = {
    secondary: Colors.cardBorder,
    danger: Colors.danger,
    outline: Colors.primary,
  };

  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.flatButton,
        { backgroundColor: bgColors[variant as keyof typeof bgColors] },
        isOutline && { borderWidth: 1.5, borderColor: borderColors[variant as keyof typeof borderColors] },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant as keyof typeof textColors]} size="small" />
      ) : (
        <Text style={[styles.flatText, Typography.button, { color: textColors[variant as keyof typeof textColors] }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    height: 54,
    width: '100%',
    alignSelf: 'center',
  },
  buttonShadow: {
    ...Shadows.button,
  },
  gradient: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: Colors.white,
  },
  flatButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderWidth: 0,
    ...Shadows.card,
  },
  flatText: {
    // color is set dynamically
  },
  disabled: {
    opacity: 0.5,
  },
});