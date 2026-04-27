export interface HealthSleepEntry {
  date: string;
  bedtime: string;
  wakeup: string;
  deepSleepMin: number;
  lightSleepMin: number;
  remSleepMin: number;
  awakeSleepMin: number;
  totalSleepMin: number;
}

export interface HealthActivityEntry {
  date: string;
  steps: number;
  distance: number;
  calories: number;
}

export interface DailyHealthMetric {
  date: string;
  steps?: number;
  weight?: number;
  calories?: number;
  cardioMin?: number;
  sleep?: HealthSleepEntry;
}

export interface WorkoutRecommendation {
  score: number;
  level: 'rest' | 'light' | 'moderate' | 'full' | 'peak';
  label: string;
  color: string;
  description: string;
  exercises: string[];
  avoid: string[];
  aeroMessage: string;
}
