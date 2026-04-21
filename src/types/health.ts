export interface ZeppSleepEntry {
  date: string;
  bedtime: string;
  wakeup: string;
  deepSleepMin: number;
  lightSleepMin: number;
  remSleepMin: number;
  awakeSleepMin: number;
  totalSleepMin: number;
}

export interface ZeppActivityEntry {
  date: string;
  steps: number;
  distance: number;
  calories: number;
}

export interface DailyHealthMetric {
  date: string;
  steps?: number;
  sleep?: ZeppSleepEntry;
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
