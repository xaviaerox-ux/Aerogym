import { Exercise } from '../types';

export const BASE_EXERCISES: Exercise[] = [
  // PECHO
  { id: 'bench-press', name: 'Press de Banca', muscleGroup: 'Pecho', type: 'Compuesto' },
  { id: 'incline-bb-press', name: 'Press Inclinado con Barra', muscleGroup: 'Pecho', type: 'Compuesto' },
  { id: 'incline-db-press', name: 'Press Superior con Mancuernas', muscleGroup: 'Pecho', type: 'Compuesto' },
  { id: 'chest-machine-press', name: 'Máquina de Pecho', muscleGroup: 'Pecho', type: 'Compuesto' },
  { id: 'pec-dec', name: 'Pec Deck / Aperturas', muscleGroup: 'Pecho', type: 'Aislamiento' },
  
  // ESPALDA
  { id: 'lat-pulldown', name: 'Jalón al Pecho', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'hammer-row', name: 'Remo Hammer', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'chest-supported-row', name: 'Remo Soporte Pecho', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'seated-row', name: 'Remo en Polea Baja', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'db-rows', name: 'Remo con Mancuerna', muscleGroup: 'Espalda', type: 'Compuesto' },
  
  // PIERNAS
  { id: 'squats', name: 'Sentadilla con Barra', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'leg-press-45', name: 'Prensa 45º', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'leg-press-light', name: 'Prensa Ligera', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'leg-extensions', name: 'Extensiones de Cuádriceps', muscleGroup: 'Cuádriceps', type: 'Aislamiento' },
  { id: 'romanian-deadlift', name: 'Peso Muerto Rumano', muscleGroup: 'Isquios', type: 'Compuesto' },
  { id: 'leg-curls', name: 'Curl Femoral', muscleGroup: 'Isquios', type: 'Aislamiento' },
  { id: 'lunges', name: 'Zancadas', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'calf-raises', name: 'Gemelos', muscleGroup: 'Gemelos', type: 'Aislamiento' },

  // HOMBROS
  { id: 'db-overhead-press', name: 'Press Militar con Mancuernas', muscleGroup: 'Hombros', type: 'Compuesto' },
  { id: 'bb-overhead-press', name: 'Press Militar con Barra', muscleGroup: 'Hombros', type: 'Compuesto' },
  { id: 'lateral-raises', name: 'Elevaciones Laterales', muscleGroup: 'Hombros', type: 'Aislamiento' },
  { id: 'reverse-flys', name: 'Reverse Fly / Pájaros', muscleGroup: 'Hombros', type: 'Aislamiento' },

  // BRAZOS
  { id: 'tricep-extensions', name: 'Extensión de Tríceps', muscleGroup: 'Tríceps', type: 'Aislamiento' },
  { id: 'assisted-dips', name: 'Fondos Asistidos', muscleGroup: 'Tríceps', type: 'Compuesto' },
  { id: 'bb-curls', name: 'Curl de Bíceps con Barra', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'hammer-curls', name: 'Curl Martillo', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'db-alt-curls', name: 'Curl Mancuernas Alterno', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'concentration-curls', name: 'Curl Concentrado', muscleGroup: 'Bíceps', type: 'Aislamiento' },

  // CORE / OTROS
  { id: 'plank', name: 'Plancha Abdominal', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'hanging-leg-raises', name: 'Elevaciones de Piernas Colgado', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'calf-raises', name: 'Elevación de Talones de Pie', muscleGroup: 'Gemelos', type: 'Aislamiento' },
];
