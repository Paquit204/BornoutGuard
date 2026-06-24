 import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomButton from '../components/CustomButton';
import TopBar from '../components/TopBar';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';
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
  container: { gap: Spacing.xs },
  label: { ...Typography.body, fontWeight: '500' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { fontSize: 22, fontWeight: '300', color: Colors.textPrimary },
  value: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  unit: { fontSize: 14, fontWeight: '400', color: Colors.textSecondary },
});

export default function CheckinEditScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const loaded = useRef(false);

  const [studyHours, setStudyHours] = useState(4);
  const [sleepHours, setSleepHours] = useState(7);
  const [assignments, setAssignments] = useState(2);
  const [stressLevel, setStressLevel] = useState(5);
  const [selectedMood, setSelectedMood] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loaded.current) return;
    if (params.checkin) {
      try {
        const data = JSON.parse(params.checkin as string);
        setStudyHours(data.study_hours);
        setSleepHours(data.sleep_hours);
        setAssignments(data.assignments);
        setStressLevel(data.stress_level);
        const moodIndex = MOOD_LABELS.indexOf(data.mood);
        if (moodIndex !== -1) setSelectedMood(moodIndex);
        loaded.current = true;
      } catch (e) {
        console.log('Error parsing checkin data', e);
      }
    }
  }, []);

  const preview = calculateBurnout(stressLevel, sleepHours, studyHours, assignments);
  const previewColor =
    preview.risk_level === 'Low' ? Colors.success : preview.risk_level === 'Moderate' ? Colors.warning : Colors.danger;

  const handleSave = async () => {
    if (!params.checkin) return;
    setLoading(true);

    const data = JSON.parse(params.checkin as string);
    const result = calculateBurnout(stressLevel, sleepHours, studyHours, assignments);

    const { error } = await supabase
      .from('daily_checkins')
      .update({
        study_hours: studyHours,
        sleep_hours: sleepHours,
        assignments,
        stress_level: stressLevel,
        mood: MOOD_LABELS[selectedMood],
        burnout_score: result.score,
        risk_level: result.risk_level,
      })
      .eq('id', data.id);

    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Check-in updated successfully.');
      router.replace('/checkin-list');
    }
  };

  return (
    <View style={styles.root}>
      <TopBar showBack />
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 90 }]}>
        <Text style={styles.heading}>Edit Check-in</Text>
        <Text style={styles.subheading}>Update your daily wellness data.</Text>

        <Stepper label="Study hours" value={studyHours} min={0} max={16} step={0.5} unit="h" onChange={setStudyHours} />
        <Stepper label="Sleep hours" value={sleepHours} min={0} max={12} step={0.5} unit="h" onChange={setSleepHours} />
        <Stepper label="Open assignments" value={assignments} min={0} max={20} step={1} unit="" onChange={setAssignments} />

        <Text style={styles.sliderLabel}>Stress level</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={stressLevel}
          onValueChange={setStressLevel}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor={Colors.border}
          thumbTintColor={Colors.primary}
        />
        <View style={styles.sliderEnds}>
          <Text style={styles.sliderEnd}>CALM</Text>
          <Text style={styles.sliderEnd}>OVERWHELMED</Text>
        </View>

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

        <CustomButton title="Update Check-in" onPress={handleSave} loading={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  heading: { ...Typography.heading, marginTop: Spacing.sm },
  subheading: { ...Typography.subheading, marginTop: Spacing.xs, marginBottom: Spacing.xl },
  sliderLabel: { ...Typography.body, fontWeight: '500', marginBottom: Spacing.xs },
  slider: { width: '100%', height: 40 },
  sliderEnds: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderEnd: { ...Typography.small },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: Spacing.md },
  moodBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: 10,
    backgroundColor: Colors.border,
    minWidth: 52,
  },
  moodBtnSelected: { backgroundColor: Colors.primary },
  moodEmoji: { fontSize: 24 },
  moodLabel: { ...Typography.small, marginTop: 2 },
  moodLabelSelected: { color: '#fff', fontWeight: '600' },
  previewCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.card,
    marginBottom: Spacing.md,
  },
  previewLabel: { ...Typography.small, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.5 },
  previewRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: Spacing.xs },
  previewScore: { fontSize: 40, fontWeight: '800' },
  previewMax: { ...Typography.small, marginLeft: Spacing.xs },
  previewRisk: { ...Typography.body, fontWeight: '600', marginTop: Spacing.xs },
});