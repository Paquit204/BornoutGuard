import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { supabase } from '../lib/supabase';
import { DailyCheckin } from '../types/database';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 80;

export default function AnalyticsScreen() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCheckins();
  }, []);

  const fetchCheckins = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(14);

    if (data) setCheckins(data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner message="Loading analytics..." />;

  const last7 = checkins.slice(-7);
  const avgBurnout =
    last7.length > 0
      ? Math.round(last7.reduce((s, c) => s + c.burnout_score, 0) / last7.length)
      : 0;
  const avgSleep =
    last7.length > 0
      ? (last7.reduce((s, c) => s + c.sleep_hours, 0) / last7.length).toFixed(1)
      : '—';
  const avgStress =
    last7.length > 0
      ? (last7.reduce((s, c) => s + c.stress_level, 0) / last7.length).toFixed(1)
      : '—';

  const riskCounts = { Low: 0, Moderate: 0, High: 0 };
  checkins.forEach((c) => riskCounts[c.risk_level]++);
  const totalRisk = checkins.length || 1;

  const maxScore = Math.max(...last7.map((c) => c.burnout_score), 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <LinearGradient colors={['#0D2137', '#000000']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Your wellness trends (last 14 days)</Text>
      </LinearGradient>

      {checkins.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>No Data Yet</Text>
          <Text style={styles.emptyText}>Complete daily check-ins to see your trends here.</Text>
        </View>
      ) : (
        <View style={styles.chartsContainer}>
          {/* Summary Stats */}
          <Text style={styles.sectionTitle}>7-Day Summary</Text>
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{avgBurnout}</Text>
              <Text style={styles.statLabel}>Avg Burnout</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{avgSleep}h</Text>
              <Text style={styles.statLabel}>Avg Sleep</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{avgStress}</Text>
              <Text style={styles.statLabel}>Avg Stress</Text>
            </GlassCard>
          </View>

          {/* Burnout Trend Bar Chart */}
          <Text style={styles.sectionTitle}>Burnout Score Trend</Text>
          <GlassCard>
            <View style={styles.barChart}>
              {last7.map((c, i) => {
                const barHeight = Math.max(8, (c.burnout_score / 100) * 140);
                const color =
                  c.risk_level === 'Low'
                    ? '#10B981'
                    : c.risk_level === 'Moderate'
                    ? '#F59E0B'
                    : '#EF4444';
                const date = new Date(c.created_at);
                const label = `${date.getMonth() + 1}/${date.getDate()}`;
                return (
                  <View key={c.id} style={styles.barColumn}>
                    <Text style={styles.barScore}>{Math.round(c.burnout_score)}</Text>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: barHeight,
                            backgroundColor: color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartLegend}>
              <LegendDot color="#10B981" label="Low" />
              <LegendDot color="#F59E0B" label="Moderate" />
              <LegendDot color="#EF4444" label="High" />
            </View>
          </GlassCard>

          {/* Sleep vs Study */}
          <Text style={styles.sectionTitle}>Sleep vs Study Hours</Text>
          <GlassCard>
            {last7.map((c, i) => {
              const date = new Date(c.created_at);
              const label = `${date.getMonth() + 1}/${date.getDate()}`;
              return (
                <View key={c.id} style={styles.compareRow}>
                  <Text style={styles.compareDate}>{label}</Text>
                  <View style={styles.compareBars}>
                    <View style={styles.compareBarWrap}>
                      <Text style={styles.compareBarLabel}>😴 {c.sleep_hours}h</Text>
                      <View style={styles.compareBg}>
                        <View
                          style={[
                            styles.compareFill,
                            {
                              width: `${(c.sleep_hours / 12) * 100}%`,
                              backgroundColor: '#3B82F6',
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <View style={styles.compareBarWrap}>
                      <Text style={styles.compareBarLabel}>📚 {c.study_hours}h</Text>
                      <View style={styles.compareBg}>
                        <View
                          style={[
                            styles.compareFill,
                            {
                              width: `${(c.study_hours / 16) * 100}%`,
                              backgroundColor: '#F59E0B',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </GlassCard>

          {/* Risk Distribution */}
          <Text style={styles.sectionTitle}>Risk Distribution</Text>
          <GlassCard>
            {Object.entries(riskCounts).map(([level, count]) => {
              const pct = Math.round((count / totalRisk) * 100);
              const color =
                level === 'Low' ? '#10B981' : level === 'Moderate' ? '#F59E0B' : '#EF4444';
              return (
                <View key={level} style={styles.riskRow}>
                  <Text style={[styles.riskLabel, { color }]}>{level}</Text>
                  <View style={styles.riskBarBg}>
                    <View
                      style={[
                        styles.riskBarFill,
                        { width: `${pct}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={styles.riskPct}>{count} ({pct}%)</Text>
                </View>
              );
            })}
          </GlassCard>

          {/* Mood History */}
          <Text style={styles.sectionTitle}>Mood History</Text>
          <GlassCard>
            <View style={styles.moodHistory}>
              {last7.map((c) => {
                const moodEmoji =
                  c.mood === 'Great' ? '😄'
                  : c.mood === 'Good' ? '😊'
                  : c.mood === 'Okay' ? '😐'
                  : c.mood === 'Tired' ? '😔'
                  : '😩';
                const date = new Date(c.created_at);
                return (
                  <View key={c.id} style={styles.moodHistoryItem}>
                    <Text style={styles.moodHistoryEmoji}>{moodEmoji}</Text>
                    <Text style={styles.moodHistoryDate}>
                      {date.getMonth() + 1}/{date.getDate()}
                    </Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>
        </View>
      )}
    </ScrollView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ color: '#9CA3AF', fontSize: 11 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingBottom: 40 },
  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  backBtn: { marginBottom: 12 },
  backText: { color: '#3B82F6', fontSize: 15 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#6B7280', fontSize: 14, marginTop: 4 },
  chartsContainer: { padding: 20, gap: 14 },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  statLabel: { color: '#6B7280', fontSize: 11, marginTop: 4 },
  // Bar chart
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    paddingTop: 24,
  },
  barColumn: { alignItems: 'center', flex: 1, gap: 4 },
  barScore: { color: '#9CA3AF', fontSize: 9 },
  barWrapper: {
    width: '70%',
    height: 140,
    justifyContent: 'flex-end',
  },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { color: '#6B7280', fontSize: 9, marginTop: 4 },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  // Sleep vs Study
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  compareDate: { color: '#6B7280', fontSize: 11, width: 32 },
  compareBars: { flex: 1, gap: 4 },
  compareBarWrap: { gap: 2 },
  compareBarLabel: { color: '#9CA3AF', fontSize: 10 },
  compareBg: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  compareFill: { height: '100%', borderRadius: 4 },
  // Risk
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  riskLabel: { width: 70, fontSize: 13, fontWeight: '600' },
  riskBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#374151',
    borderRadius: 5,
    overflow: 'hidden',
  },
  riskBarFill: { height: '100%', borderRadius: 5 },
  riskPct: { color: '#9CA3AF', fontSize: 11, width: 60, textAlign: 'right' },
  // Mood
  moodHistory: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodHistoryItem: { alignItems: 'center', gap: 4 },
  moodHistoryEmoji: { fontSize: 28 },
  moodHistoryDate: { color: '#6B7280', fontSize: 10 },
  // Empty
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 80,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: '#6B7280', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});