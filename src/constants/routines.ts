import { Routine } from '../types';

export const PREDEFINED_ROUTINES: Routine[] = [
  {
    id: 'push-a',
    name: 'Push A',
    description: 'Enfoque en Pecho Pesado y Hombros',
    exercises: [
      { exerciseId: 'bench-press', defaultSets: 3, defaultReps: '5-8', defaultWeight: 60 },
      { exerciseId: 'incline-bb-press', defaultSets: 3, defaultReps: '6-8', defaultWeight: 40 },
      { exerciseId: 'pec-dec', defaultSets: 3, defaultReps: '12-15', defaultWeight: 70 },
      { exerciseId: 'db-overhead-press', defaultSets: 3, defaultReps: '8-10', defaultWeight: 30 },
      { exerciseId: 'lateral-raises', defaultSets: 3, defaultReps: '12-20', defaultWeight: 15 },
      { exerciseId: 'tricep-extensions', defaultSets: 3, defaultReps: '12-15', defaultWeight: 25 },
    ]
  },
  {
    id: 'pull-a',
    name: 'Pull A',
    description: 'Enfoque en Tirón Vertical y Remo Hammer',
    exercises: [
      { exerciseId: 'lat-pulldown', defaultSets: 3, defaultReps: '8-10', defaultWeight: 77.5 },
      { exerciseId: 'hammer-row', defaultSets: 3, defaultReps: '8-12', defaultWeight: 42.5 },
      { exerciseId: 'chest-supported-row', defaultSets: 3, defaultReps: '6-8', defaultWeight: 50 },
      { exerciseId: 'reverse-flys', defaultSets: 3, defaultReps: '10', defaultWeight: 42.5 },
      { exerciseId: 'bb-curls', defaultSets: 3, defaultReps: '8-12', defaultWeight: 25 },
      { exerciseId: 'hammer-curls', defaultSets: 3, defaultReps: '10-12', defaultWeight: 20 },
    ]
  },
  {
    id: 'legs-a',
    name: 'Legs A',
    description: 'Enfoque en Prensa y Extensiones',
    exercises: [
      { exerciseId: 'leg-press-45', defaultSets: 3, defaultReps: '8-12', defaultWeight: 200 },
      { exerciseId: 'leg-extensions', defaultSets: 3, defaultReps: '12-15', defaultWeight: 35 },
      { exerciseId: 'lunges', defaultSets: 3, defaultReps: '10-12' },
      { exerciseId: 'romanian-deadlift', defaultSets: 3, defaultReps: '8-10' },
      { exerciseId: 'leg-curls', defaultSets: 3, defaultReps: '12', defaultWeight: 35 },
      { exerciseId: 'calf-raises', defaultSets: 3, defaultReps: '12-15', defaultWeight: 50 },
    ]
  },
  {
    id: 'push-b',
    name: 'Push B',
    description: 'Enfoque en Pecho Inclinado y Press Militar Barra',
    exercises: [
      { exerciseId: 'incline-bb-press', defaultSets: 3, defaultReps: '6-8', defaultWeight: 45 },
      { exerciseId: 'chest-machine-press', defaultSets: 3, defaultReps: '10-12' },
      { exerciseId: 'pec-dec', defaultSets: 3, defaultReps: '10-12', defaultWeight: 90 },
      { exerciseId: 'bb-overhead-press', defaultSets: 3, defaultReps: '6-8', defaultWeight: 35 },
      { exerciseId: 'lateral-raises', defaultSets: 3, defaultReps: '12-15', defaultWeight: 20 },
      { exerciseId: 'assisted-dips', defaultSets: 3, defaultReps: '12-15', defaultWeight: 90 },
    ]
  },
  {
    id: 'pull-b',
    name: 'Pull B',
    description: 'Enfoque en Remo Polea Baja y Mancuernas',
    exercises: [
      { exerciseId: 'lat-pulldown', defaultSets: 3, defaultReps: '8-12', defaultWeight: 77.5 },
      { exerciseId: 'seated-row', defaultSets: 3, defaultReps: '10-12' },
      { exerciseId: 'db-rows', defaultSets: 3, defaultReps: '8', defaultWeight: 50 },
      { exerciseId: 'reverse-flys', defaultSets: 3, defaultReps: '12-15', defaultWeight: 42.5 },
      { exerciseId: 'db-alt-curls', defaultSets: 3, defaultReps: '10-12' },
      { exerciseId: 'concentration-curls', defaultSets: 3, defaultReps: '10-12', defaultWeight: 35 },
    ]
  },
  {
    id: 'legs-b',
    name: 'Legs B',
    description: 'Enfoque en Sentadilla y Prensa Ligera',
    exercises: [
      { exerciseId: 'squats', defaultSets: 3, defaultReps: '8', defaultWeight: 40 },
      { exerciseId: 'leg-press-light', defaultSets: 3, defaultReps: '10-12', defaultWeight: 150 },
      { exerciseId: 'leg-extensions', defaultSets: 3, defaultReps: '12', defaultWeight: 35 },
      { exerciseId: 'romanian-deadlift', defaultSets: 3, defaultReps: '8-10' },
      { exerciseId: 'leg-curls', defaultSets: 3, defaultReps: '10-12', defaultWeight: 35 },
      { exerciseId: 'calf-raises', defaultSets: 3, defaultReps: '12-15', defaultWeight: 50 },
    ]
  },
];
