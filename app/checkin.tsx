import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CustomButton from '../components/CustomButton';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';
import { calculateBurnout } from '../services/burnoutCalculator';

const MOODS = ['😄', '😊', '😐', '😔', '😩'];
const MOOD_LABELS = ['Great', 'Good', 'Okay', 'Tired', 'Burned'];

// Stepper component
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
  container: { gap: 8 },
  label: { color: '#9CA3AF', fontSize: 13, fontWeight: '500' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#FFFFFF', fontSize: 22, fontWeight: '300' },
  value: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  unit: { color: '#6B7280', fontSize: 14, fontWeight: '400' },
});

export default function CheckinScreen() {
  const [studyHours, setStudyHours] = useState(4);
  const [sleepHours, setSleepHours] = useState(7);
  const [assignments, setAssignments] = useState(2);
  const [stressLevel, setStressLevel] = useState(5);
  const [selectedMood, setSelectedMood] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    preview.risk_level === 'Low'
      ? '#10B981'
      : preview.risk_level === 'Moderate'
      ? '#F59E0B'
      : '#EF4444';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <LinearGradient colors={['#1E3A5F', '#000000']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Daily Check-In</Text>
        <Text style={styles.subtitle}>How are you doing today?</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        {/* Live Preview */}
        <GlassCard style={styles.previewCard}>
          <Text style={styles.previewLabel}>Live Burnout Preview</Text>
          <Text style={[styles.previewScore, { color: previewColor }]}>
            {preview.score}
          </Text>
          <View style={[styles.riskPill, { backgroundColor: previewColor + '20' }]}>
            <Text style={[styles.riskPillText, { color: previewColor }]}>
              {preview.risk_level} Risk
            </Text>
          </View>
        </GlassCard>

        {/* Study Hours */}
        <GlassCard>
          <Stepper
            label="📚 Study Hours Today"
            value={studyHours}
            min={0}
            max={16}
            step={0.5}
            unit="hrs"
            onChange={setStudyHours}
          />
        </GlassCard>

        {/* Sleep Hours */}
        <GlassCard>
          <Stepper
            label="😴 Sleep Hours Last Night"
            value={sleepHours}
            min={0}
            max={12}
            step={0.5}
            unit="hrs"
            onChange={setSleepHours}
          />
        </GlassCard>

        {/* Assignments */}
        <GlassCard>
          <Stepper
            label="📋 Pending Assignments"
            value={assignments}
            min={0}
            max={20}
            step={1}
            unit="tasks"
            onChange={setAssignments}
          />
        </GlassCard>

        {/* Stress Level */}
        <GlassCard>
          <Text style={styles.sliderLabel}>
            😰 Stress Level:{' '}
            <Text style={{ color: '#3B82F6', fontWeight: '700' }}>
              {stressLevel}/10
            </Text>
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={stressLevel}
            onValueChange={setStressLevel}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#374151"
            thumbTintColor="#3B82F6"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderEndLabel}>Relaxed</Text>
            <Text style={styles.sliderEndLabel}>Overwhelmed</Text>
          </View>
        </GlassCard>

        {/* Mood Selector */}
        <GlassCard>
          <Text style={styles.sliderLabel}>😊 How are you feeling?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((emoji, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.moodBtn,
                  selectedMood === i && styles.moodBtnSelected,
                ]}
                onPress={() => setSelectedMood(i)}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Text style={styles.moodLabel}>{MOOD_LABELS[i]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        <CustomButton
          title="Save Check-In"
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </ScrollView>
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
  formContainer: { padding: 20, gap: 14 },
  previewCard: { alignItems: 'center', paddingVertical: 20 },
  previewLabel: { color: '#9CA3AF', fontSize: 13, marginBottom: 8 },
  previewScore: { fontSize: 56, fontWeight: '800' },
  riskPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  riskPillText: { fontSize: 13, fontWeight: '600' },
  sliderLabel: { color: '#9CA3AF', fontSize: 13, fontWeight: '500', marginBottom: 12 },
  slider: { width: '100%', height: 40 },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderEndLabel: { color: '#6B7280', fontSize: 11 },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  moodBtn: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  moodBtnSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59,130,246,0.12)',
  },
  moodEmoji: { fontSize: 26 },
  moodLabel: { color: '#6B7280', fontSize: 10 },
});