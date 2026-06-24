 // components/GlassCard.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Shadows } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GlassCard({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadows.card,
    overflow: 'hidden',
  },
});