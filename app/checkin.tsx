 // app/checkin.tsx
import Slider from '@react-native-community/slider';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomNav from '../components/BottomNav';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';
import TopBar from '../components/TopBar';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { calculateBurnout } from '../services/burnoutCalculator';
import { DailyCheckin } from '../types/database';

const MOODS = ['😄', '😊', '😐', '😔', '😩'];
const MOOD_LABELS = ['Happy', 'Neutral', 'Sad', 'Stressed', 'Anxious'];

interface StepperProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit: string;
  onChange: (v: number) => void;
}

function Stepper({ value, min, max, step = 0.5, label, unit, onChange }: StepperProps) {
  return (
    <View style={stepperStyles.container}>
      <Text style={stepperStyles.label}>{label}</Text>
      <View style={stepperStyles.controls}>
        <TouchableOpacity style={stepperStyles.btn} onPress={() => onChange(Math.max(min, +(value - step).toFixed(1)))}>
          <Text style={stepperStyles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={stepperStyles.value}>{value} <Text style={stepperStyles.unit}>{unit}</Text></Text>
        <TouchableOpacity style={stepperStyles.btn} onPress={() => onChange(Math.min(max, +(value + step).toFixed(1)))}>
          <Text style={stepperStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: { ...Typography.body, fontWeight: '500' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 22, fontWeight: '300', color: Colors.textPrimary },
  value: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  unit: { fontSize: 14, fontWeight: '400', color: Colors.textSecondary },
});

export default function CheckinScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [studyHours, setStudyHours] = useState(4);
  const [sleepHours, setSleepHours] = useState(7);
  const [assignments, setAssignments] = useState(2);
  const [stressLevel, setStressLevel] = useState(5);
  const [selectedMood, setSelectedMood] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingCheckin, setExistingCheckin] = useState<DailyCheckin | null>(null);

  const TABLE_NAME = 'daily_checkins';

  const checkToday = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCheckingExisting(false); return; }
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) {
      console.error('❌ checkToday error:', error);
    } else if (data && data.length > 0) {
      setExistingCheckin(data[0]);
    } else {
      setExistingCheckin(null);
    }
    setCheckingExisting(false);
  }, []);

  useEffect(() => { checkToday(); }, []);
  useFocusEffect(useCallback(() => { checkToday(); }, [checkToday]));

  useEffect(() => {
    if (existingCheckin) return;
    if (params.studyHours) setStudyHours(parseFloat(params.studyHours as string));
    if (params.sleepHours) setSleepHours(parseFloat(params.sleepHours as string));
    if (params.assignments) setAssignments(parseInt(params.assignments as string));
    if (params.stressLevel) setStressLevel(parseInt(params.stressLevel as string));
    if (params.mood) {
      const idx = MOOD_LABELS.indexOf(params.mood as string);
      if (idx !== -1) setSelectedMood(idx);
    }
  }, [params, existingCheckin]);

  const handleSubmit = async () => {
    setLoading(true);
    const result = calculateBurnout(stressLevel, sleepHours, studyHours, assignments);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      setLoading(false);
      return;
    }

    // Double-check no existing today
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const { data: existing, error: checkError } = await supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString())
      .limit(1);
    if (checkError) {
      Alert.alert('Error', checkError.message);
      setLoading(false);
      return;
    }
    if (existing && existing.length > 0) {
      Alert.alert('Already Checked In', 'You already checked in today.');
      setLoading(false);
      return;
    }

    // ✅ Insert new check-in
    const newCheckin = {
      user_id: user.id,
      study_hours: studyHours,
      sleep_hours: sleepHours,
      assignments,
      stress_level: stressLevel,
      mood: MOOD_LABELS[selectedMood],
      burnout_score: result.score,
      risk_level: result.risk_level,
    };
    console.log('📝 Inserting check-in:', newCheckin);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(newCheckin)
      .select(); // para mabalik ang inserted record

    setLoading(false);
    if (error) {
      console.error('❌ Insert error:', error);
      Alert.alert('Error', error.message);
    } else {
      console.log('✅ Check-in saved:', data);
      Alert.alert('Success', 'Check‑in saved!');
      // ✅ Diretso sa listahan
      router.replace('/checkin-list');
    }
  };

  const preview = calculateBurnout(stressLevel, sleepHours, studyHours, assignments);
  const previewColor = preview.risk_level === 'Low' ? Colors.success : preview.risk_level === 'Moderate' ? Colors.warning : Colors.danger;

  if (checkingExisting) return <LoadingSpinner message="Loading..." />;

  if (existingCheckin) {
    const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Student';
    return (
      <View style={styles.root}>
        <TopBar showProfile profile={{ name: displayName }} />
        <View style={styles.existingContainer}>
          <Text style={styles.existingIcon}>📅</Text>
          <Text style={styles.existingTitle}>Already checked in today</Text>
          <Text style={styles.existingDate}>
            {new Date(existingCheckin.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.existingSub}>You can update or delete your entry.</Text>
          <TouchableOpacity style={styles.updateButton} onPress={() => router.push({ pathname: '/checkin-edit', params: { checkin: JSON.stringify(existingCheckin) } })}>
            <Text style={styles.updateButtonText}>Update your check‑in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goBackLink} onPress={() => router.back()}>
            <Text style={styles.goBackLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
        <BottomNav />
      </View>
    );
  }

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Student';
  return (
    <View style={styles.root}>
      <TopBar showProfile profile={{ name: displayName }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 140 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>DAILY CHECK-IN</Text>
        <Text style={styles.subheading}>How was today?</Text>
        <Text style={styles.description}>Five quick fields. Honest answers make the score useful.</Text>
        <View style={styles.card}>
          <View style={styles.field}>
            <Stepper label="Study hours" value={studyHours} min={0} max={16} step={0.5} unit="h" onChange={setStudyHours} />
            <Text style={styles.hint}>Healthy ≤ 6h</Text>
          </View>
          <View style={styles.field}>
            <Stepper label="Sleep hours" value={sleepHours} min={0} max={12} step={0.5} unit="h" onChange={setSleepHours} />
            <Text style={styles.hint}>Optimal 7-9h</Text>
          </View>
          <View style={styles.field}>
            <Stepper label="Open assignments" value={assignments} min={0} max={20} step={1} unit="" onChange={setAssignments} />
            <Text style={styles.hint}>Light ≤ 2</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.sliderLabel}>Stress level</Text>
            <Slider style={styles.slider} minimumValue={1} maximumValue={10} step={1} value={stressLevel} onValueChange={setStressLevel} minimumTrackTintColor={Colors.primary} maximumTrackTintColor={Colors.border} thumbTintColor={Colors.primary} />
            <View style={styles.sliderEnds}><Text style={styles.sliderEnd}>CALM</Text><Text style={styles.sliderEnd}>OVERWHELMED</Text></View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sliderLabel}>Mood</Text>
          <View style={styles.moodRow}>
            {MOODS.map((emoji, i) => (
              <TouchableOpacity key={i} style={[styles.moodBtn, selectedMood === i && styles.moodBtnSelected]} onPress={() => setSelectedMood(i)}>
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Text style={[styles.moodLabel, selectedMood === i && styles.moodLabelSelected]}>{MOOD_LABELS[i]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>LIVE PREVIEW</Text>
          <View style={styles.previewRow}><Text style={[styles.previewScore, { color: previewColor }]}>{preview.score}</Text><Text style={styles.previewMax}>/ 100</Text></View>
          <Text style={[styles.previewRisk, { color: previewColor }]}>{preview.risk_level} risk</Text>
        </View>
        <CustomButton title="Save today's check-in" onPress={handleSubmit} loading={loading} variant="primary" />
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/checkin-list')}>
        <Text style={styles.fabIcon}>📋</Text>
      </TouchableOpacity>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm },
  heading: { ...Typography.heading, marginTop: Spacing.sm },
  subheading: { ...Typography.subheading, color: Colors.primary, marginTop: Spacing.xs },
  description: { ...Typography.body, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.limeGlow, ...Shadows.card },
  field: { marginBottom: Spacing.md },
  hint: { ...Typography.small, textAlign: 'right', marginTop: 2 },
  sliderLabel: { ...Typography.body, fontWeight: '500', marginBottom: Spacing.xs },
  slider: { width: '100%', height: 40 },
  sliderEnds: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderEnd: { ...Typography.small },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
  moodBtn: { alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs, borderRadius: BorderRadius.md, backgroundColor: Colors.border, minWidth: 52 },
  moodBtnSelected: { backgroundColor: Colors.primary },
  moodEmoji: { fontSize: 24 },
  moodLabel: { ...Typography.small, marginTop: 2 },
  moodLabelSelected: { color: '#fff', fontWeight: '600' },
  previewCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.limeGlow, ...Shadows.card, marginBottom: Spacing.md },
  previewLabel: { ...Typography.small, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.5 },
  previewRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: Spacing.xs },
  previewScore: { fontSize: 40, fontWeight: '800' },
  previewMax: { ...Typography.small, marginLeft: Spacing.xs },
  previewRisk: { ...Typography.body, fontWeight: '600', marginTop: Spacing.xs },
  fab: { position: 'absolute', bottom: 80, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
  fabIcon: { fontSize: 28, color: '#fff' },
  existingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingBottom: 80 },
  existingIcon: { fontSize: 48, marginBottom: Spacing.md },
  existingTitle: { ...Typography.heading, textAlign: 'center', marginBottom: Spacing.sm, color: Colors.textPrimary },
  existingDate: { ...Typography.body, fontWeight: '500', color: Colors.primary, marginBottom: Spacing.xs, textAlign: 'center' },
  existingSub: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, paddingHorizontal: Spacing.md },
  updateButton: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, width: '100%', alignItems: 'center', ...Shadows.button },
  updateButtonText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  goBackLink: { paddingVertical: 8 },
  goBackLinkText: { ...Typography.body, color: Colors.textSecondary, fontWeight: '500', textDecorationLine: 'underline' },
});