 // components/RecommendationCard.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '../constants/theme';
import GlassCard from './GlassCard';

interface Props {
  recommendation: string;
  index: number;
}

export default function RecommendationCard({ recommendation, index }: Props) {
  const colors = [Colors.primary, Colors.secondary, '#3B82F6'];
  const color = colors[index % colors.length];

  return (
    <GlassCard style={styles.card}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.text}>{recommendation}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    padding: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 10,
  },
  text: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
});