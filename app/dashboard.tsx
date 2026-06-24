 // app/dashboard.tsx
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Stop,
  LinearGradient as SvgGradient,
  Line as SvgLine,
  Text as SvgText,
} from 'react-native-svg';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';
import TopBar from '../components/TopBar';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { calculateBurnout } from '../services/burnoutCalculator';
import { DailyCheckin } from '../types/database';

const { width: screenWidth } = Dimensions.get('window');

const getDayName = (date: Date) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days[date.getDay() === 0 ? 6 : date.getDay() - 1];
};

export default function DashboardScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyHistory, setWeeklyHistory] = useState<DailyCheckin[]>([]);
  const [currentCheckin, setCurrentCheckin] = useState<DailyCheckin | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const { data: history } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (history && history.length > 0) {
        setWeeklyHistory(history);
        const todayStr = new Date().toDateString();
        const latest = history[history.length - 1];
        if (new Date(latest.created_at).toDateString() === todayStr) {
          setCurrentCheckin(latest);
          const result = calculateBurnout(
            latest.stress_level,
            latest.sleep_hours,
            latest.study_hours,
            latest.assignments
          );
          setRecommendations(result.recommendations.slice(0, 3));
        } else {
          setCurrentCheckin(null);
          setRecommendations([]);
        }
      } else {
        setWeeklyHistory([]);
        setCurrentCheckin(null);
        setRecommendations([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingSpinner message="Loading your metrics..." />;

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User';

  const chartWidth = screenWidth - 68;
  const chartHeight = 140;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 25;

  const points: { x: number; y: number; val: number; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const dStr = d.toDateString();
    const match = weeklyHistory.find((h) => new Date(h.created_at).toDateString() === dStr);
    const score = match ? match.stress_level : 0;
    const x = paddingLeft + ((chartWidth - paddingLeft - paddingRight) / 6) * i;
    const y = paddingTop + (chartHeight - paddingTop - paddingBottom) * (1 - (score > 0 ? score : 0) / 10);
    points.push({ x, y, val: score, label: getDayName(d) });
  }

  return (
    <View style={styles.rootContainer}>
      <TopBar
        key={profile?.avatar_url || 'no-avatar'}
        showProfile
        profile={{ name: displayName }}
        onSearchPress={() => console.log('🔍 Search')}
        onNotificationPress={() => console.log('🔔 Notifications')}
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.greetingHeader}>Wellness Tracker</Text>
          <Text style={styles.greetingSub}>Your daily wellbeing assistant</Text>
        </View>

        {/* Metric Cards */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.metricCardLight]}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
              <Feather name="activity" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.metricLabel}>Stress Level</Text>
            <Text style={styles.metricValue}>
              {currentCheckin ? `${currentCheckin.stress_level}/10` : 'N/A'}
            </Text>
          </View>

          <View style={[styles.metricCard, styles.metricCardBlack]}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(159,232,112,0.15)' }]}>
              <Feather name="moon" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.metricLabelBlack}>Sleep Hours</Text>
            <Text style={styles.metricValueBlack}>
              {currentCheckin ? `${currentCheckin.sleep_hours}h` : 'N/A'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/checkin')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Daily Check-in</Text>
          <Text style={styles.primaryButtonSub}>How are you feeling today?</Text>
        </TouchableOpacity>

        {/* Stress Trend Chart */}
        <View style={styles.cardLight}>
          <Text style={styles.cardTitleLight}>Stress Trend</Text>
          <View style={styles.chartWrapper}>
            <Svg width={chartWidth} height={chartHeight}>
              <Defs>
                <SvgGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={Colors.primary} stopOpacity={0.2} />
                  <Stop offset="100%" stopColor={Colors.primary} stopOpacity={0.0} />
                </SvgGradient>
              </Defs>
              
              {[2, 5, 8].map((level) => {
                const yPos = paddingTop + (chartHeight - paddingTop - paddingBottom) * (1 - level / 10);
                return (
                  <SvgLine
                    key={level}
                    x1={paddingLeft}
                    y1={yPos}
                    x2={chartWidth - paddingRight}
                    y2={yPos}
                    stroke={Colors.border}
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                );
              })}

              {points.map((p, idx) => {
                if (idx === 0) return null;
                const prev = points[idx - 1];
                if (prev.val === 0 || p.val === 0) return null;
                return (
                  <SvgLine
                    key={idx}
                    x1={prev.x}
                    y1={prev.y}
                    x2={p.x}
                    y2={p.y}
                    stroke={Colors.primary}
                    strokeWidth={2.5}
                  />
                );
              })}

              {points.map((p, idx) => (
                <React.Fragment key={idx}>
                  {p.val > 0 && (
                    <Circle cx={p.x} cy={p.y} r={4} fill={Colors.primary} />
                  )}
                  <SvgText
                    x={p.x}
                    y={chartHeight - 5}
                    fontSize="10"
                    fill={Colors.textSecondary}
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {p.label}
                  </SvgText>
                </React.Fragment>
              ))}
            </Svg>
          </View>
        </View>

        {/* Recommendations Card */}
        <View style={styles.cardLight}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.cardTitleLight}>Recommendations</Text>
            <Feather name="info" size={18} color={Colors.primary} />
          </View>
          {currentCheckin ? (
            recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <View style={[styles.recommendationDot, { backgroundColor: Colors.primary }]} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.recommendationText}>No recommendations available.</Text>
            )
          ) : (
            <Text style={styles.recommendationText}>
              Complete a check‑in to get personalised recommendations.
            </Text>
          )}
          {currentCheckin && (
            <TouchableOpacity
              style={styles.seeAllLink}
              onPress={() => router.push('/analytics')}
            >
              <Text style={styles.seeAllLinkText}>View all insights →</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: 20,
  },
  welcomeContainer: {
    marginBottom: Spacing.lg,
  },
  greetingHeader: {
    ...Typography.heading,
    fontSize: 26,
  },
  greetingSub: {
    ...Typography.subheading,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.limeGlow,     // ✅ lime glow border
    ...Shadows.card,                 // ✅ dark shadow
  },
  metricCardLight: {
    backgroundColor: Colors.card,
  },
  metricCardBlack: {
    backgroundColor: Colors.black,
    borderColor: Colors.limeGlow,     // ✅ lime glow on dark card
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  metricValue: {
    ...Typography.heading,
    fontSize: 22,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  metricLabelBlack: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '500',
  },
  metricValueBlack: {
    ...Typography.heading,
    fontSize: 22,
    color: Colors.primary,
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.button,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  primaryButtonSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  cardLight: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.limeGlow,     // ✅ lime glow border
    ...Shadows.card,                 // ✅ dark shadow
  },
  cardTitleLight: {
    ...Typography.bodyBold,
    fontSize: 15,
    marginBottom: Spacing.md,
    color: Colors.textPrimary,
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  recommendationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
    marginTop: 6,
  },
  recommendationText: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  seeAllLink: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-end',
  },
  seeAllLinkText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});