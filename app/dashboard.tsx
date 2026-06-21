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
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';
import TopBar from '../components/TopBar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { DailyCheckin } from '../types/database';

const RISK_COLORS = {
  Low: '#2D6A4F',
  Moderate: '#E8A838',
  High: '#D9534F',
};

export default function DashboardScreen() {
  const { profile, loading: authLoading } = useAuth();
  const [latestCheckin, setLatestCheckin] = useState<DailyCheckin | null>(null);
  const [weeklySummary, setWeeklySummary] = useState({ count: 0, avgScore: 0 });
  const [weeklyAverages, setWeeklyAverages] = useState({ sleep: 0, study: 0, stress: 0 });
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      await supabase.auth.signOut();
      setLoading(false);
      router.replace('/login');
      return;
    }

    const { data: latest } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latest) setLatestCheckin(latest);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: weekly } = await supabase
      .from('daily_checkins')
      .select('burnout_score, sleep_hours, study_hours, stress_level')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (weekly && weekly.length > 0) {
      const avgScore = weekly.reduce((s, c) => s + c.burnout_score, 0) / weekly.length;
      setWeeklySummary({ count: weekly.length, avgScore: Math.round(avgScore) });

      const avgSleep = weekly.reduce((s, c) => s + c.sleep_hours, 0) / weekly.length;
      const avgStudy = weekly.reduce((s, c) => s + c.study_hours, 0) / weekly.length;
      const avgStress = weekly.reduce((s, c) => s + c.stress_level, 0) / weekly.length;
      setWeeklyAverages({
        sleep: Math.round(avgSleep * 10) / 10,
        study: Math.round(avgStudy * 10) / 10,
        stress: Math.round(avgStress * 10) / 10,
      });
    }

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
    : '#A8A098';

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
        contentContainerStyle={[styles.content, { paddingBottom: 90 }]} // 👈 added padding
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D6A4F" />
        }
      >
        <Text style={styles.greeting}>Hello there.</Text>
        <Text style={styles.greetingSub}>Two-minute check-in, then we’ll show you where you stand.</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.cardLabel}>MOST RECENT SCORE</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: riskColor }]}>
              {latestCheckin ? Math.round(latestCheckin.burnout_score) : '--'}
            </Text>
            <Text style={styles.scoreMax}>/ 100</Text>
          </View>
          <View style={styles.riskBadge}>
            <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
            <Text style={[styles.riskText, { color: riskColor }]}>
              {latestCheckin ? `${latestCheckin.risk_level} risk` : 'No data'}
            </Text>
            {latestCheckin && (
              <Text style={styles.riskSub}>· Healthy balance maintained.</Text>
            )}
          </View>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: latestCheckin ? `${Math.min(latestCheckin.burnout_score, 100)}%` : '0%',
                  backgroundColor: riskColor,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>0 - LOW</Text>
            <Text style={styles.progressLabel}>33</Text>
            <Text style={styles.progressLabel}>66</Text>
            <Text style={styles.progressLabel}>100 - HIGH</Text>
          </View>
        </View>

        <View style={styles.weeklyCard}>
          <Text style={styles.weeklyTitle}>THIS WEEK, ON AVERAGE</Text>
          <View style={styles.weeklyRow}>
            <View style={styles.weeklyItem}>
              <Text style={styles.weeklyValue}>{weeklyAverages.sleep}h</Text>
              <Text style={styles.weeklyLabel}>SLEEP</Text>
            </View>
            <View style={styles.weeklyItem}>
              <Text style={styles.weeklyValue}>{weeklyAverages.study}h</Text>
              <Text style={styles.weeklyLabel}>STUDY</Text>
            </View>
            <View style={styles.weeklyItem}>
              <Text style={styles.weeklyValue}>{weeklyAverages.stress}/10</Text>
              <Text style={styles.weeklyLabel}>STRESS</Text>
            </View>
          </View>
        </View>

        <View style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>FOR YOU, RIGHT NOW</Text>
          <Text style={styles.motivationHeading}>KEEP GOING</Text>
          <Text style={styles.motivationText}>
            You're in a good rhythm{'\n'}
            Protect what's working: same sleep window, same study blocks, same boundaries.
          </Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={() => router.push('/checkin')}>
          <Text style={styles.startButtonText}>START</Text>
          <Text style={styles.startButtonSub}>Today's check-in</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F5F0' },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  greeting: { fontSize: 18, fontWeight: '600', color: '#1B4332', marginBottom: 4 },
  greetingSub: { fontSize: 14, color: '#5C6B6A', marginBottom: 16 },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  cardLabel: { fontSize: 12, fontWeight: '600', color: '#5C6B6A', letterSpacing: 0.5 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  scoreValue: { fontSize: 48, fontWeight: '800' },
  scoreMax: { fontSize: 16, color: '#A8A098', marginLeft: 4 },
  riskBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  riskDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  riskText: { fontSize: 14, fontWeight: '600' },
  riskSub: { fontSize: 14, color: '#5C6B6A', marginLeft: 4 },
  progressBg: {
    height: 6,
    backgroundColor: '#E5E0D8',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabel: { fontSize: 10, color: '#A8A098' },
  weeklyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  weeklyTitle: { fontSize: 12, fontWeight: '600', color: '#5C6B6A', letterSpacing: 0.5 },
  weeklyRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  weeklyItem: { alignItems: 'center' },
  weeklyValue: { fontSize: 20, fontWeight: '700', color: '#1B4332' },
  weeklyLabel: { fontSize: 12, color: '#5C6B6A', marginTop: 2 },
  motivationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  motivationTitle: { fontSize: 12, fontWeight: '600', color: '#5C6B6A', letterSpacing: 0.5 },
  motivationHeading: { fontSize: 22, fontWeight: '700', color: '#1B4332', marginTop: 4 },
  motivationText: { fontSize: 14, color: '#4A5A58', marginTop: 4, lineHeight: 20 },
  startButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  startButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  startButtonSub: { fontSize: 12, color: '#D4E2D0', marginTop: 2 },
});