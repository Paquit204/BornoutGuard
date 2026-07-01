 // app/checkin-view.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { Colors, Spacing, Typography } from '../constants/theme';
import { DailyCheckin } from '../types/database';

export default function CheckinViewScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  if (!params.checkin) {
    return (
      <View style={styles.root}>
        <TopBar showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={styles.errorTitle}>No data provided</Text>
          <Text style={styles.errorDescription}>The check‑in data couldn't be loaded.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  let checkin: DailyCheckin;
  try {
    checkin = JSON.parse(params.checkin as string);
  } catch (e) {
    return (
      <View style={styles.root}>
        <TopBar showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Invalid data</Text>
          <Text style={styles.errorDescription}>The check‑in data is corrupted.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const date = new Date(checkin.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const riskColor =
    checkin.risk_level === 'Low'
      ? Colors.success
      : checkin.risk_level === 'Moderate'
      ? Colors.warning
      : Colors.danger;

  return (
    <View style={styles.root}>
      <TopBar showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Check‑in Details</Text>
        <Text style={styles.date}>{date}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Mood</Text>
            <Text style={styles.value}>{checkin.mood}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Study Hours</Text>
            <Text style={styles.value}>{checkin.study_hours} h</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sleep Hours</Text>
            <Text style={styles.value}>{checkin.sleep_hours} h</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Assignments</Text>
            <Text style={styles.value}>{checkin.assignments}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Stress Level</Text>
            <Text style={styles.value}>{checkin.stress_level} / 10</Text>
          </View>
        </View>

        <View style={[styles.card, styles.scoreCard]}>
          <Text style={styles.scoreLabel}>Burnout Score</Text>
          <Text style={[styles.scoreValue, { color: riskColor }]}>{checkin.burnout_score} / 100</Text>
          <Text style={[styles.riskLevel, { color: riskColor }]}>{checkin.risk_level} Risk</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  heading: { ...Typography.heading, marginTop: Spacing.sm },
  date: { ...Typography.subheading, color: Colors.primary, marginTop: Spacing.xs, marginBottom: Spacing.lg },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { ...Typography.body, fontWeight: '500', color: Colors.textSecondary },
  value: { ...Typography.body, fontWeight: '600', color: Colors.textPrimary },
  scoreCard: { alignItems: 'center' },
  scoreLabel: { ...Typography.body, fontWeight: '500', color: Colors.textSecondary },
  scoreValue: { fontSize: 40, fontWeight: '800', marginVertical: Spacing.xs },
  riskLevel: { ...Typography.body, fontWeight: '600' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  errorIcon: { fontSize: 60, marginBottom: Spacing.md },
  errorTitle: { ...Typography.heading, color: Colors.danger, marginBottom: Spacing.sm },
  errorDescription: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  backButton: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
  backButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});