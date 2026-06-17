 import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import RecommendationCard from '../components/RecommendationCard';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { DailyCheckin } from '../types/database';

const RISK_COLORS = {
  Low: '#10B981',
  Moderate: '#F59E0B',
  High: '#EF4444',
};

export default function DashboardScreen() {
  const { profile, loading: authLoading } = useAuth();
  const [latestCheckin, setLatestCheckin] = useState<DailyCheckin | null>(null);
  const [weeklySummary, setWeeklySummary] = useState({ count: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const scoreOpacity = useSharedValue(0);
  const cardSlide = useSharedValue(40);

  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ translateY: cardSlide.value }],
  }));

  const fetchData = useCallback(async () => {
    // 1. Check authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // No user → clear session and go to login
      await supabase.auth.signOut();
      setLoading(false);          // hide spinner
      router.replace('/login');
      return;
    }

    // 2. Fetch latest check-in
    const { data: latest } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latest) setLatestCheckin(latest);

    // 3. Fetch last 7 days summary
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: weekly } = await supabase
      .from('daily_checkins')
      .select('burnout_score')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (weekly && weekly.length > 0) {
      const avg = weekly.reduce((sum, c) => sum + c.burnout_score, 0) / weekly.length;
      setWeeklySummary({ count: weekly.length, avgScore: Math.round(avg) });
    }

    // 4. All done – hide spinner and animate
    setLoading(false);
    scoreOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    cardSlide.value = withDelay(100, withTiming(0, { duration: 600 }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading || authLoading) return <LoadingSpinner message="Loading dashboard..." />;

  const riskColor = latestCheckin
    ? RISK_COLORS[latestCheckin.risk_level]
    : '#6B7280';

  const recommendations: string[] = latestCheckin
    ? getQuickRecs(latestCheckin.risk_level)
    : ['👋 Complete your first check-in to see recommendations!'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#1E3A5F', '#000000']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.name}>
              {profile?.full_name || profile?.email?.split('@')[0] || 'Student'} 👋
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileEmoji}>👤</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.cardsContainer, scoreStyle]}>
        {/* Burnout Score Card */}
        <GlassCard style={styles.scoreCard}>
          <Text style={styles.cardLabel}>Today's Burnout Score</Text>
          {latestCheckin ? (
            <>
              <Text style={[styles.scoreValue, { color: riskColor }]}>
                {Math.round(latestCheckin.burnout_score)}
              </Text>
              <Text style={styles.scoreMax}>/ 100</Text>
              <View style={[styles.riskBadge, { backgroundColor: riskColor + '25' }]}>
                <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
                <Text style={[styles.riskText, { color: riskColor }]}>
                  {latestCheckin.risk_level} Risk
                </Text>
              </View>
              {/* Progress bar */}
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${latestCheckin.burnout_score}%`,
                      backgroundColor: riskColor,
                    },
                  ]}
                />
              </View>
            </>
          ) : (
            <View style={styles.emptyScore}>
              <Text style={styles.emptyScoreText}>No check-in yet today</Text>
              <Text style={styles.emptyScoreSub}>Tap below to start</Text>
            </View>
          )}
        </GlassCard>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{weeklySummary.count}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{weeklySummary.avgScore || '--'}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>
              {latestCheckin?.mood || '--'}
            </Text>
            <Text style={styles.statLabel}>Mood</Text>
          </GlassCard>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/checkin')}
          >
            <LinearGradient
              colors={['#2563EB', '#3B82F6']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionEmoji}>📝</Text>
              <Text style={styles.actionText}>Daily Check-In</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/analytics')}
          >
            <LinearGradient
              colors={['#065F46', '#10B981']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionEmoji}>📊</Text>
              <Text style={styles.actionText}>Analytics</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {recommendations.map((rec, i) => (
          <RecommendationCard key={i} recommendation={rec} index={i} />
        ))}

        {/* Last Check-In Details */}
        {latestCheckin && (
          <>
            <Text style={styles.sectionTitle}>Last Check-In Details</Text>
            <GlassCard>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailEmoji}>📚</Text>
                  <Text style={styles.detailValue}>{latestCheckin.study_hours}h</Text>
                  <Text style={styles.detailLabel}>Study</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailEmoji}>😴</Text>
                  <Text style={styles.detailValue}>{latestCheckin.sleep_hours}h</Text>
                  <Text style={styles.detailLabel}>Sleep</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailEmoji}>📋</Text>
                  <Text style={styles.detailValue}>{latestCheckin.assignments}</Text>
                  <Text style={styles.detailLabel}>Tasks</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailEmoji}>😰</Text>
                  <Text style={styles.detailValue}>{latestCheckin.stress_level}/10</Text>
                  <Text style={styles.detailLabel}>Stress</Text>
                </View>
              </View>
            </GlassCard>
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function getQuickRecs(risk: string): string[] {
  const recs = {
    Low: [
      '✅ You\'re doing well! Maintain your healthy habits.',
      '📝 Plan ahead to prevent future stress spikes.',
      '👥 Help a classmate who might be struggling.',
    ],
    Moderate: [
      '⏰ Schedule structured breaks between study sessions.',
      '🧘 Practice 5-minute breathing exercises twice a day.',
      '💤 Prioritize getting 7-8 hours of sleep tonight.',
    ],
    High: [
      '🚨 Please reach out to a counselor or trusted adult.',
      '🏃 A 20-minute walk can significantly lower stress.',
      '📵 Take a digital detox for 1 hour before bed.',
    ],
  };
  return recs[risk as keyof typeof recs] || [];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingBottom: 32 },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { color: '#9CA3AF', fontSize: 14 },
  name: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: 2 },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  profileEmoji: { fontSize: 20 },
  cardsContainer: { padding: 20, gap: 16 },
  scoreCard: { alignItems: 'center', paddingVertical: 24 },
  cardLabel: { color: '#9CA3AF', fontSize: 13, marginBottom: 8 },
  scoreValue: { fontSize: 72, fontWeight: '800', lineHeight: 80 },
  scoreMax: { color: '#6B7280', fontSize: 16, marginTop: -4 },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
  riskText: { fontSize: 13, fontWeight: '600' },
  progressBg: {
    width: '80%',
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  emptyScore: { alignItems: 'center', paddingVertical: 16 },
  emptyScoreText: { color: '#9CA3AF', fontSize: 16 },
  emptyScoreSub: { color: '#6B7280', fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  statLabel: { color: '#6B7280', fontSize: 11, marginTop: 4 },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  actionGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionEmoji: { fontSize: 28 },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: { alignItems: 'center', gap: 4 },
  detailEmoji: { fontSize: 22 },
  detailValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  detailLabel: { color: '#6B7280', fontSize: 11 },
});