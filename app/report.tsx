 // app/report.tsx
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { DailyCheckin } from '../types/database';

export default function ReportScreen() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCheckins();
  }, []);

  const fetchCheckins = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setCheckins(data || []);
    }
    setLoading(false);
  };

  const generateCSV = async () => {
    if (checkins.length === 0) {
      Alert.alert('No Data', 'No check-ins to export.');
      return;
    }

    setExporting(true);

    try {
      const headers = 'Date,Study Hours,Sleep Hours,Assignments,Stress Level,Mood,Burnout Score,Risk Level\n';
      const rows = checkins.map((c) => {
        const date = new Date(c.created_at).toLocaleDateString();
        return `${date},${c.study_hours},${c.sleep_hours},${c.assignments},${c.stress_level},${c.mood},${c.burnout_score},${c.risk_level}`;
      }).join('\n');

      const csv = headers + rows;
      const fileUri = (FileSystem as any).documentDirectory + 'burnout_report.csv';

      await FileSystem.writeAsStringAsync(fileUri, csv);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Share not available', 'Your device does not support sharing.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <TopBar showBack />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Export Report</Text>
        <Text style={styles.subheading}>
          Download your check-in history as a CSV file. You can open it in Excel or Google Sheets.
        </Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Check-ins</Text>
            <Text style={styles.statValue}>{checkins.length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Data Range</Text>
            <Text style={styles.statValue}>
              {checkins.length > 0
                ? `${new Date(checkins[checkins.length - 1].created_at).toLocaleDateString()} - ${new Date(checkins[0].created_at).toLocaleDateString()}`
                : 'No data'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.exportButton, (exporting || checkins.length === 0) && styles.disabledButton]}
          onPress={generateCSV}
          disabled={exporting || checkins.length === 0}
        >
          <Text style={styles.exportButtonText}>
            {exporting ? 'Generating...' : 'Download CSV'}
          </Text>
        </TouchableOpacity>

        {checkins.length === 0 && (
          <Text style={styles.noData}>No check-ins found. Complete a daily check-in first.</Text>
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  heading: { ...Typography.heading, marginTop: Spacing.sm },
  subheading: { ...Typography.subheading, marginTop: Spacing.xs, marginBottom: Spacing.xl },
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    marginBottom: Spacing.xl,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statLabel: { ...Typography.body, fontWeight: '500' },
  statValue: { ...Typography.body, color: Colors.textSecondary },
  exportButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  disabledButton: { opacity: 0.6 },
  exportButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  noData: {
    textAlign: 'center',
    color: Colors.danger,
    marginTop: Spacing.lg,
    ...Typography.body,
  },
});