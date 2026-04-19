import { AppState, Session, Routine, UserProfile } from '../types';

const STORAGE_KEY = 'aerogym_data';

export const DEFAULT_STATE: AppState = {
  profile: {
    name: 'Usuario',
    weight: 75,
    height: 175,
    age: 25,
    gender: 'Hombre',
    activityLevel: 'Moderado',
    goal: 'Hipertrofia',
    level: 'Principiante',
    experience: 'Cuerpo Completo',
    weeklyFrequency: 3,
  },
  sessions: [],
  routines: [],
  customExercises: [],
  onboardingComplete: false,
  version: '1.0.0',
};

export const loadState = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(data);
    // Ensure all required top-level arrays/objects exist
    return {
      ...DEFAULT_STATE,
      ...parsed,
      profile: {
        ...DEFAULT_STATE.profile,
        ...(parsed.profile || {}),
      },
      sessions: parsed.sessions || [],
      routines: parsed.routines || [],
      customExercises: parsed.customExercises || [],
    };
  } catch (e) {
    console.error('Failed to load state', e);
    return DEFAULT_STATE;
  }
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
