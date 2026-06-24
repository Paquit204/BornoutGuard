export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
    avatar_url?: string | null; 
  created_at: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  study_hours: number;
  sleep_hours: number;
  assignments: number;
  stress_level: number;
  mood: string;
  burnout_score: number;
  risk_level: 'Low' | 'Moderate' | 'High';
  created_at: string;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface BurnoutResult {
  score: number;
  risk_level: RiskLevel;
  recommendations: string[];
}