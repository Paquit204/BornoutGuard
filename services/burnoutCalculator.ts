import { BurnoutResult } from '../types/database';

export function calculateBurnout(
  stressLevel: number,
  sleepHours: number,
  studyHours: number,
  assignments: number
): BurnoutResult {
  // Normalize each component to 0-100

  // Stress component (30%) — already 1-10, normalize to 0-100
  const stressScore = ((stressLevel - 1) / 9) * 100;

  // Sleep deprivation component (25%) — ideal is 8h, deprivation if below
  const sleepDeprivation = Math.max(0, ((8 - sleepHours) / 8) * 100);

  // Excessive study component (25%) — ideal max is 8h/day
  const excessStudy = Math.min(100, (Math.max(0, studyHours - 4) / 8) * 100);

  // Workload pressure component (20%) — 0-5 assignments is normal
  const workloadPressure = Math.min(100, (assignments / 10) * 100);

  const score =
    stressScore * 0.30 +
    sleepDeprivation * 0.25 +
    excessStudy * 0.25 +
    workloadPressure * 0.20;

  const finalScore = Math.round(Math.min(100, Math.max(0, score)));

  let risk_level: 'Low' | 'Moderate' | 'High';
  if (finalScore <= 33) risk_level = 'Low';
  else if (finalScore <= 66) risk_level = 'Moderate';
  else risk_level = 'High';

  const recommendations = getRecommendations(risk_level, stressLevel, sleepHours, studyHours);

  return { score: finalScore, risk_level, recommendations };
}

function getRecommendations(
  risk: string,
  stress: number,
  sleep: number,
  study: number
): string[] {
  const recs: string[] = [];

  if (sleep < 7) recs.push('🌙 Aim for 7-9 hours of sleep to restore cognitive function');
  if (study > 8) recs.push('📚 Break study sessions with 10-min breaks every 50 minutes');
  if (stress > 7) recs.push('🧘 Practice 5-minute mindfulness or deep breathing exercises');
  if (risk === 'High') {
    recs.push('🚨 Talk to a counselor or trusted adult about your stress levels');
    recs.push('🏃 Physical activity for 30 minutes can significantly reduce cortisol');
  }
  if (risk === 'Moderate') {
    recs.push('⏰ Create a structured schedule with dedicated rest time');
    recs.push('👥 Connect with classmates to share workload and support each other');
  }
  if (risk === 'Low') {
    recs.push('✅ Great job maintaining balance! Keep up healthy habits');
    recs.push('📝 Plan ahead to prevent future stress spikes');
  }

  return recs.slice(0, 3);
}