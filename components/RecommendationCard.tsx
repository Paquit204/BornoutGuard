import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GlassCard from './GlassCard';

interface Props {
  recommendation: string;
  index: number;
}

export default function RecommendationCard({ recommendation, index }: Props) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B'];
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
    color: '#D1D5DB',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});