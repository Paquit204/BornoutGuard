 import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';
import TopBar from '../components/TopBar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { DailyCheckin } from '../types/database';

const { width: screenWidth } = Dimensions.get('window');
const CHART_HEIGHT = 180;
const CHART_PADDING = { top: 10, bottom: 20, left: 30, right: 10 };

function buildLinePath(data: { x: number; y: number }[], chartWidth: number, chartHeight: number, yMax: number) {
  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  const xRange = maxX - minX || 1;
  let path = '';
  data.forEach((point, i) => {
    const x = CHART_PADDING.left + ((point.x - minX) / xRange) * chartWidth;
    const y = CHART_PADDING.top + chartHeight - (point.y / yMax) * chartHeight;
    if (i === 0) path = `M${x},${y}`;
    else path += ` L${x},${y}`;
  });
  return path;
}

function LineChart({
  data,
  labels,
  yMax,
  color,
  height = CHART_HEIGHT,
}: {
  data: { x: number; y: number }[];
  labels: string[];
  yMax: number;
  color: string;
  height?: number;
}) {
  if (data.length === 0) return null;

  const minPointWidth = 36;
  const requiredWidth = data.length * minPointWidth + CHART_PADDING.left + CHART_PADDING.right;
  const chartWidth = Math.max(screenWidth - 40, requiredWidth);

  const chartHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;
  const path = buildLinePath(data, chartWidth, chartHeight, yMax);

  const yTicks = Array.from({ length: 6 }, (_, i) => Math.round((i / 5) * yMax));
  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  const xRange = maxX - minX || 1;

  return (
    <Svg width={chartWidth} height={height}>
      {yTicks.map((tick, i) => {
        const y = CHART_PADDING.top + chartHeight - (tick / yMax) * chartHeight;
        return (
          <G key={i}>
            <Line
              x1={CHART_PADDING.left}
              y1={y}
              x2={chartWidth - CHART_PADDING.right}
              y2={y}
              stroke="#E5E0D8"
              strokeWidth="0.5"
              strokeDasharray="3,3"
            />
            <SvgText
              x={CHART_PADDING.left - 6}
              y={y + 3}
              fontSize="8"
              fill="#A8A098"
              textAnchor="end"
            >
              {tick}
            </SvgText>
          </G>
        );
      })}
      {data.map((point, i) => {
        const x = CHART_PADDING.left + ((point.x - minX) / xRange) * chartWidth;
        return (
          <SvgText
            key={i}
            x={x}
            y={height - 2}
            fontSize="8"
            fill="#A8A098"
            textAnchor="middle"
            transform={`rotate(-30, ${x}, ${height - 2})`}
          >
            {labels[i] || ''}
          </SvgText>
        );
      })}
      <Path d={path} stroke={color} strokeWidth="2" fill="none" />
      {data.map((point, i) => {
        const x = CHART_PADDING.left + ((point.x - minX) / xRange) * chartWidth;
        const y = CHART_PADDING.top + chartHeight - (point.y / yMax) * chartHeight;
        return (
          <Rect
            key={i}
            x={x - 3}
            y={y - 3}
            width="6"
            height="6"
            rx="3"
            fill={color}
          />
        );
      })}
    </Svg>
  );
}

export default function AnalyticsScreen() {
  const { profile } = useAuth();
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

  const last14 = checkins.slice(-14);
  const days = last14.length;
  const avgScore = days > 0 ? Math.round(last14.reduce((s, c) => s + c.burnout_score, 0) / days) : 0;
  const avgSleep = days > 0 ? (last14.reduce((s, c) => s + c.sleep_hours, 0) / days).toFixed(1) : '—';
  const avgStudy = days > 0 ? (last14.reduce((s, c) => s + c.study_hours, 0) / days).toFixed(1) : '—';

  const burnoutData = last14.map((c, i) => ({ x: i + 1, y: Math.round(c.burnout_score) }));
  const stressData = last14.map((c, i) => ({ x: i + 1, y: c.stress_level }));
  const sleepData = last14.map((c, i) => ({ x: i + 1, y: c.sleep_hours }));
  const studyData = last14.map((c, i) => ({ x: i + 1, y: c.study_hours }));

  const xLabels = last14.map((c) => {
    const d = new Date(c.created_at);
    return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });

  const riskCounts = { Low: 0, Moderate: 0, High: 0 };
  last14.forEach((c) => riskCounts[c.risk_level]++);
  const total = last14.length || 1;

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Student';

  return (
    <View style={styles.root}>
      <TopBar
        showProfile={true}
        profile={{
          name: displayName,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Your trends.</Text>
        <Text style={styles.subheading}>Patterns are easier to fix than moments.</Text>

        {checkins.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptyText}>Complete daily check-ins to see your trends here.</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{avgScore}</Text>
                <Text style={styles.statLabel}>AVG SCORE</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{avgSleep}h</Text>
                <Text style={styles.statLabel}>SLEEP</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{avgStudy}h</Text>
                <Text style={styles.statLabel}>STUDY</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{days}</Text>
                <Text style={styles.statLabel}>DAYS</Text>
              </View>
            </View>

            <Text style={styles.chartTitle}>BURNOUT TREND</Text>
            <View style={styles.chartCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={burnoutData}
                  labels={xLabels}
                  yMax={100}
                  color="#2D6A4F"
                />
              </ScrollView>
            </View>

            <Text style={styles.chartTitle}>STRESS LEVEL</Text>
            <View style={styles.chartCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={stressData}
                  labels={xLabels}
                  yMax={10}
                  color="#E8A838"
                />
              </ScrollView>
            </View>

            <Text style={styles.chartTitle}>SLEEP VS STUDY</Text>
            <View style={[styles.chartCard, { position: 'relative' }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ position: 'relative', flexDirection: 'row' }}>
                  <LineChart
                    data={sleepData}
                    labels={xLabels}
                    yMax={12}
                    color="#2D6A4F"
                  />
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <LineChart
                      data={studyData}
                      labels={xLabels}
                      yMax={12}
                      color="#E8A838"
                    />
                  </View>
                </View>
              </ScrollView>
            </View>

            <Text style={styles.chartTitle}>RISK DISTRIBUTION</Text>
            <View style={styles.riskCard}>
              {Object.entries(riskCounts).map(([level, count]) => {
                const pct = Math.round((count / total) * 100);
                const color =
                  level === 'Low' ? '#2D6A4F' : level === 'Moderate' ? '#E8A838' : '#D9534F';
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
            </View>
          </>
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F5F0' },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1B4332', marginTop: 8 },
  subheading: { fontSize: 14, color: '#5C6B6A', marginBottom: 16 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  statCard: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1B4332' },
  statLabel: { fontSize: 10, color: '#A8A098', marginTop: 2, letterSpacing: 0.5 },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4332',
    marginTop: 16,
    marginBottom: 8,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
    minHeight: CHART_HEIGHT,
    overflow: 'hidden',
  },
  riskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
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
    backgroundColor: '#E5E0D8',
    borderRadius: 5,
    overflow: 'hidden',
  },
  riskBarFill: { height: '100%', borderRadius: 5 },
  riskPct: { color: '#5C6B6A', fontSize: 11, width: 60, textAlign: 'right' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#1B4332', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: '#5C6B6A', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});