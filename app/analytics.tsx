 import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';
import TopBar from '../components/TopBar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { DailyCheckin } from '../types/database';

const { width: screenWidth } = Dimensions.get('window');
const CHART_HEIGHT = 180;
const CHART_PADDING = { top: 10, bottom: 20, left: 30, right: 10 };
const PIE_SIZE = 120;

// ----- Helper: Pie slice path -----
function pieSlicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
}

// ----- Animated Progress Bar -----
function AnimatedProgressBar({ percentage, color }: { percentage: number; color: string }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(300, withTiming(percentage, { duration: 800, easing: Easing.out(Easing.ease) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={barStyles.track}>
      <Animated.View style={[barStyles.fill, animatedStyle, { backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E0D8',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});

// ----- Animated KPI Card -----
function KpiCard({ value, label, color = '#1B4332' }: { value: string; label: string; color?: string }) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.kpiCard, animatedStyle]}>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </Animated.View>
  );
}

// ----- Animated Line Chart with drawing effect -----
const AnimatedPath = Animated.createAnimatedComponent(Path);

function AnimatedLineChart({
  data,
  labels,
  yMax,
  color,
  height = CHART_HEIGHT,
  delay = 0,
}: {
  data: { x: number; y: number }[];
  labels: string[];
  yMax: number;
  color: string;
  height?: number;
  delay?: number;
}) {
  if (data.length === 0) return null;

  // Build path
  const minPointWidth = 36;
  const requiredWidth = data.length * minPointWidth + CHART_PADDING.left + CHART_PADDING.right;
  const chartWidth = Math.max(screenWidth - 40, requiredWidth);
  const chartHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;

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

  // Animation for stroke-dashoffset
  const progress = useSharedValue(0);
  const fadeOpacity = useSharedValue(0);

  useEffect(() => {
    fadeOpacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    progress.value = withDelay(delay, withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }));
  }, []);

  const animatedPathProps = useAnimatedProps(() => {
    // Approximate path length – use chartWidth as the max length
    const pathLength = chartWidth + 100; // enough to cover the path
    return {
      strokeDashoffset: pathLength * (1 - progress.value),
    };
  });

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeOpacity.value,
  }));

  // Y-axis ticks
  const yTicks = Array.from({ length: 6 }, (_, i) => Math.round((i / 5) * yMax));

  return (
    <Animated.View style={containerStyle}>
      <Svg width={chartWidth} height={height}>
        {/* Grid lines & y-labels */}
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
        {/* X labels */}
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
        {/* Animated line */}
        <AnimatedPath
          d={path}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeDasharray={`${chartWidth + 100}`}
          animatedProps={animatedPathProps}
        />
        {/* Data dots – appear after line draw */}
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
              opacity={1} // could animate too, but fine
            />
          );
        })}
      </Svg>
    </Animated.View>
  );
}

// ----- Animated Pie Chart -----
function AnimatedPieChart({
  data,
  colors,
  size = PIE_SIZE,
}: {
  data: { label: string; value: number }[];
  colors: string[];
  size?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <Text style={{ color: '#A8A098' }}>No data</Text>;

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  let startAngle = 0;

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={size} height={size}>
        {data.map((item, i) => {
          const angle = (item.value / total) * 360;
          const endAngle = startAngle + angle;
          const path = pieSlicePath(cx, cy, r, startAngle, endAngle);
          startAngle = endAngle;
          return <Path key={i} d={path} fill={colors[i]} stroke="#FFFFFF" strokeWidth="2" />;
        })}
        <Circle cx={cx} cy={cy} r={r * 0.5} fill="#FFFFFF" />
      </Svg>
    </Animated.View>
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
  const totalRisk = last14.length || 1;

  const pieData = [
    { label: 'Low', value: riskCounts.Low },
    { label: 'Moderate', value: riskCounts.Moderate },
    { label: 'High', value: riskCounts.High },
  ];
  const pieColors = ['#2D6A4F', '#E8A838', '#D9534F'];
  const riskLabels = ['Low', 'Moderate', 'High'];
  const riskColors = ['#2D6A4F', '#E8A838', '#D9534F'];

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Student';

  return (
    <View style={styles.root}>
      <TopBar
        showProfile={true}
        profile={{
          name: displayName,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 90 }]}
      >
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
            {/* KPI Cards */}
            <View style={styles.kpiRow}>
              <KpiCard value={`${avgScore}`} label="AVG SCORE" color="#2D6A4F" />
              <KpiCard value={`${avgSleep}h`} label="SLEEP" />
              <KpiCard value={`${avgStudy}h`} label="STUDY" />
              <KpiCard value={`${days}`} label="DAYS" />
            </View>

            {/* Trend Analysis */}
            <Text style={styles.sectionTitle}>Trend Analysis</Text>

            <Text style={styles.chartTitle}>BURNOUT TREND</Text>
            <View style={styles.chartCard}>
              <AnimatedLineChart
                data={burnoutData}
                labels={xLabels}
                yMax={100}
                color="#2D6A4F"
                delay={0}
              />
            </View>

            <Text style={styles.chartTitle}>STRESS LEVEL</Text>
            <View style={styles.chartCard}>
              <AnimatedLineChart
                data={stressData}
                labels={xLabels}
                yMax={10}
                color="#E8A838"
                delay={200}
              />
            </View>

            <Text style={styles.chartTitle}>SLEEP VS STUDY</Text>
            <View style={[styles.chartCard, { position: 'relative' }]}>
              <View style={{ position: 'relative', flexDirection: 'row' }}>
                <AnimatedLineChart
                  data={sleepData}
                  labels={xLabels}
                  yMax={12}
                  color="#2D6A4F"
                  delay={400}
                />
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  <AnimatedLineChart
                    data={studyData}
                    labels={xLabels}
                    yMax={12}
                    color="#E8A838"
                    delay={600}
                  />
                </View>
              </View>
            </View>

            {/* Risk Distribution */}
            <Text style={styles.sectionTitle}>Risk Distribution</Text>
            <View style={styles.riskCard}>
              <View style={styles.pieContainer}>
                <AnimatedPieChart data={pieData} colors={pieColors} size={120} />
                <View style={styles.legendContainer}>
                  {pieData.map((item, i) => (
                    <View key={i} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: pieColors[i] }]} />
                      <Text style={styles.legendText}>{item.label}</Text>
                      <Text style={styles.legendPercent}>
                        {totalRisk > 0 ? Math.round((item.value / totalRisk) * 100) : 0}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {riskLabels.map((label, i) => {
                const count = riskCounts[label as keyof typeof riskCounts];
                const pct = totalRisk > 0 ? Math.round((count / totalRisk) * 100) : 0;
                const color = riskColors[i];
                return (
                  <View key={label} style={styles.barRow}>
                    <Text style={styles.barLabel}>{label}</Text>
                    <AnimatedProgressBar percentage={pct} color={color} />
                    <Text style={styles.barPercent}>{pct}%</Text>
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

  // KPI Cards
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E0D8',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#A8A098',
    marginTop: 2,
    letterSpacing: 0.5,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B4332',
    marginTop: 16,
    marginBottom: 8,
  },

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

  // Risk Card
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
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  legendContainer: {
    justifyContent: 'center',
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#1B4332',
    fontWeight: '500',
    width: 70,
  },
  legendPercent: {
    fontSize: 14,
    color: '#5C6B6A',
    fontWeight: '600',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B4332',
    width: 70,
  },
  barPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C6B6A',
    width: 40,
    textAlign: 'right',
  },

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