 // app/report.tsx – minimal working version
import * as Print from 'expo-print';
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
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';
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

  const generatePDF = async () => {
    if (checkins.length === 0) {
      Alert.alert('No Data', 'No check-ins to export.');
      return;
    }

    setExporting(true);
    try {
      // simple HTML
      const html = `
        <h1>BurnoutGuard Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total entries: ${checkins.length}</p>
        <ul>
          ${checkins.map(c => `<li>${new Date(c.created_at).toLocaleDateString()} - Score: ${Math.round(c.burnout_score)}</li>`).join('')}
        </ul>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
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
        <Text style={styles.heading}>Print Report</Text>
        <Text style={styles.subheading}>Generate a PDF receipt of your wellness data.</Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Check-ins</Text>
            <Text style={styles.statValue}>{checkins.length}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.exportButton, (exporting || checkins.length === 0) && styles.disabledButton]}
          onPress={generatePDF}
          disabled={exporting || checkins.length === 0}
        >
          <Text style={styles.exportButtonText}>
            {exporting ? 'Generating...' : '🖨️ Print Receipt'}
          </Text>
        </TouchableOpacity>
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.limeGlow,
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
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.button,
  },
  disabledButton: { opacity: 0.6 },
  exportButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});