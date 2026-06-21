 import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import BottomNav from '../components/BottomNav';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';
import TopBar from '../components/TopBar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { calculateBurnout } from '../services/burnoutCalculator';

const MOODS = ['😄', '😊', '😐', '😔', '😩'];
const MOOD_LABELS = ['Happy', 'Neutral', 'Sad', 'Stressed', 'Anxious'];

function Stepper({
  value,
  min,
  max,
  step = 0.5,
  label,
  unit,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <View style={stepperStyles.container}>
      <Text style={stepperStyles.label}>{label}</Text>
      <View style={stepperStyles.controls}>
        <TouchableOpacity
          style={stepperStyles.btn}
          onPress={() => onChange(Math.max(min, +(value - step).toFixed(1)))}
        >
          <Text style={stepperStyles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={stepperStyles.value}>
          {value} <Text style={stepperStyles.unit}>{unit}</Text>
        </Text>
        <TouchableOpacity
          style={stepperStyles.btn}
          onPress={() => onChange(Math.min(max, +(value + step).toFixed(1)))}
        >
          <Text style={stepperStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  container: { gap: 4 },
  label: { fontSize: 14, fontWeight: '500', color: '#1B4332' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E0D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { fontSize: 22, fontWeight: '300', color: '#1B4332' },
  value: { fontSize: 22, fontWeight: '700', color: '#1B4332' },
  unit: { fontSize: 14, fontWeight: '400', color: '#5C6B6A' },
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

  // ✅ Animated FAB – pulse effect
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.15, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Read pre‑filled params from "Add" button
  useEffect(() => {
    if (params.studyHours) {
      setStudyHours(parseFloat(params.studyHours as string));
    }
    if (params.sleepHours) {
      setSleepHours(parseFloat(params.sleepHours as string));
    }
    if (params.assignments) {
      setAssignments(parseInt(params.assignments as string));
    }
    if (params.stressLevel) {
      setStressLevel(parseInt(params.stressLevel as string));
    }
    if (params.mood) {
      const moodIndex = MOOD_LABELS.indexOf(params.mood as string);
      if (moodIndex !== -1) setSelectedMood(moodIndex);
    }
  }, [params]);

  const handleSubmit = async () => {
    setLoading(true);
    const result = calculateBurnout(stressLevel, sleepHours, studyHours, assignments);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('daily_checkins').insert({
      user_id: user.id,
      study_hours: studyHours,
      sleep_hours: sleepHours,
      assignments,
      stress_level: stressLevel,
      mood: MOOD_LABELS[selectedMood],
      burnout_score: result.score,
      risk_level: result.risk_level,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/dashboard');
    }
  };

  const preview = calculateBurnout(stressLevel, sleepHours, studyHours, assignments);
  const previewColor =
    preview.risk_level === 'Low' ? '#2D6A4F' : preview.risk_level === 'Moderate' ? '#E8A838' : '#D9534F';

  if (loading) return <LoadingSpinner message="Saving..." />;

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
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
      >
        <Text style={styles.heading}>DAILY CHECK-IN</Text>
        <Text style={styles.subheading}>How was today?</Text>
        <Text style={styles.description}>Five quick fields. Honest answers make the score useful.</Text>

        <View style={styles.field}>
          <Stepper
            label="Study hours"
            value={studyHours}
            min={0}
            max={16}
            step={0.5}
            unit="h"
            onChange={setStudyHours}
          />
          <Text style={styles.hint}>Healthy ≤ 6h</Text>
        </View>

        <View style={styles.field}>
          <Stepper
            label="Sleep hours"
            value={sleepHours}
            min={0}
            max={12}
            step={0.5}
            unit="h"
            onChange={setSleepHours}
          />
          <Text style={styles.hint}>Optimal 7-9h</Text>
        </View>

        <View style={styles.field}>
          <Stepper
            label="Open assignments"
            value={assignments}
            min={0}
            max={20}
            step={1}
            unit=""
            onChange={setAssignments}
          />
          <Text style={styles.hint}>Light ≤ 2</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.sliderLabel}>Stress level</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={stressLevel}
            onValueChange={setStressLevel}
            minimumTrackTintColor="#2D6A4F"
            maximumTrackTintColor="#E5E0D8"
            thumbTintColor="#2D6A4F"
          />
          <View style={styles.sliderEnds}>
            <Text style={styles.sliderEnd}>CALM</Text>
            <Text style={styles.sliderEnd}>OVERWHELMED</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.sliderLabel}>Mood</Text>
          <View style={styles.moodRow}>
            {MOODS.map((emoji, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.moodBtn, selectedMood === i && styles.moodBtnSelected]}
                onPress={() => setSelectedMood(i)}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Text style={[styles.moodLabel, selectedMood === i && styles.moodLabelSelected]}>
                  {MOOD_LABELS[i]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>LIVE PREVIEW</Text>
          <View style={styles.previewRow}>
            <Text style={[styles.previewScore, { color: previewColor }]}>{preview.score}</Text>
            <Text style={styles.previewMax}>/ 100</Text>
          </View>
          <Text style={[styles.previewRisk, { color: previewColor }]}>
            {preview.risk_level} risk
          </Text>
        </View>

        <CustomButton
          title="Save today's check-in"
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
        />
      </ScrollView>

      {/* ✅ Floating Action Button with pulse animation */}
      <Animated.View style={[styles.fabWrapper, fabAnimatedStyle]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/checkin-list')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>📋</Text>
        </TouchableOpacity>
      </Animated.View>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F5F0' },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  heading: { fontSize: 24, fontWeight: '700', color: '#1B4332', marginTop: 8 },
  subheading: { fontSize: 16, fontWeight: '600', color: '#2D6A4F', marginTop: 4 },
  description: { fontSize: 14, color: '#5C6B6A', marginTop: 2, marginBottom: 16 },
  field: { marginBottom: 20 },
  hint: { fontSize: 12, color: '#A8A098', marginTop: 2, textAlign: 'right' },
  sliderLabel: { fontSize: 14, fontWeight: '500', color: '#1B4332', marginBottom: 4 },
  slider: { width: '100%', height: 40 },
  sliderEnds: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderEnd: { fontSize: 12, color: '#5C6B6A' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  moodBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#E5E0D8',
    minWidth: 52,
  },
  moodBtnSelected: { backgroundColor: '#2D6A4F' },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 10, color: '#5C6B6A', marginTop: 2 },
  moodLabelSelected: { color: '#FFFFFF', fontWeight: '600' },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  previewLabel: { fontSize: 12, fontWeight: '600', color: '#5C6B6A', letterSpacing: 0.5 },
  previewRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  previewScore: { fontSize: 40, fontWeight: '800' },
  previewMax: { fontSize: 14, color: '#A8A098', marginLeft: 4 },
  previewRisk: { fontSize: 14, fontWeight: '600', marginTop: 2 },

  // Floating Action Button
  fabWrapper: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
});