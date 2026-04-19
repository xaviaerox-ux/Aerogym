import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Trash2, 
  Check, 
  Timer, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  Dumbbell,
  Trophy
} from 'lucide-react';
import { Session, AppState, Set, WorkoutExercise } from '../types';
import { cn } from '../lib/utils';
import { BASE_EXERCISES } from '../constants/exercises';
import { calculateVolume, getBestE1RM, suggestWeight, calculateE1RM } from '../lib/engine';

interface TrainingSessionProps {
  session: Session;
  onFinish: (session: Session) => void;
  onCancel: () => void;
  state: AppState;
}

export default function TrainingSession({ session, onFinish, onCancel, state }: TrainingSessionProps) {
  const [currentSession, setCurrentSession] = useState<Session>(session);
  const [activeExIdx, setActiveExIdx] = useState(0);

  const addExercise = (exId: string) => {
    const newEx: WorkoutExercise = {
      exerciseId: exId,
      sets: [{ id: Math.random().toString(36).substr(2, 9), reps: 10, weight: 0, completed: false }]
    };
    setCurrentSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, newEx]
    }));
  };

  const addSet = (exIdx: number) => {
    const lastSet = currentSession.exercises[exIdx].sets.slice(-1)[0];
    const newSet: Set = {
      id: Math.random().toString(36).substr(2, 9),
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || 0,
      completed: false
    };
    const newExs = [...currentSession.exercises];
    newExs[exIdx].sets.push(newSet);
    setCurrentSession(prev => ({ ...prev, exercises: newExs }));
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    const newExs = [...currentSession.exercises];
    newExs[exIdx].sets[setIdx].completed = !newExs[exIdx].sets[setIdx].completed;
    setCurrentSession(prev => ({ ...prev, exercises: newExs }));
  };

  const updateSet = (exIdx: number, setIdx: number, field: keyof Set, val: any) => {
    const newExs = [...currentSession.exercises];
    // @ts-ignore
    newExs[exIdx].sets[setIdx][field] = val;
    setCurrentSession(prev => ({ ...prev, exercises: newExs }));
  };

  const isPR = (exerciseId: string, weight: number, reps: number) => {
    const currentE1RM = calculateE1RM(weight, reps);
    const bestE1RM = getBestE1RM(state.sessions, exerciseId);
    return currentE1RM > bestE1RM && weight > 0 && reps > 0;
  };

  const handleFinish = () => {
    const totalVol = currentSession.exercises.reduce((acc, ex) => acc + calculateVolume(ex), 0);
    onFinish({ ...currentSession, totalVolume: totalVol });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start sticky top-0 bg-slate-900/80 backdrop-blur-md pt-2 pb-4 z-40">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">{currentSession.name}</h1>
          <div className="status-badge mt-1 inline-block">En Progreso</div>
        </div>
        <button onClick={onCancel} className="p-2 glass rounded-full text-slate-400">
          <X size={20} />
        </button>
      </div>

      {/* Exercises List */}
      <div className="space-y-8">
        {(currentSession.exercises || []).map((ex, exIdx) => (
          <ExerciseCard 
            key={ex.exerciseId + exIdx}
            ex={ex}
            exIdx={exIdx}
            state={state}
            onAddSet={() => addSet(exIdx)}
            onToggleSet={(sIdx) => toggleSet(exIdx, sIdx)}
            onUpdateSet={(sIdx, f, v) => updateSet(exIdx, sIdx, f, v)}
            isPR={isPR}
          />
        ))}

        <AddExerciseBtn onAdd={addExercise} />
      </div>

      {/* Finish Button */}
      <div className="pt-10 pb-6">
          <button 
            onClick={handleFinish}
            className="btn-primary w-full py-4 text-slate-950"
          >
            FINALIZAR ENTRENAMIENTO
          </button>
      </div>
    </div>
  );
}

function ExerciseCard({ ex, exIdx, state, onAddSet, onToggleSet, onUpdateSet, isPR }: any) {
  const exerciseInfo = BASE_EXERCISES.find(e => e.id === ex.exerciseId);
  const bestE1RM = getBestE1RM(state.sessions, ex.exerciseId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="text-lg font-bold text-slate-50">{exerciseInfo?.name || 'Ejercicio Desconocido'}</h3>
          <div className="flex items-center gap-2">
            {bestE1RM > 0 && (
              <p className="text-[10px] uppercase text-brand-green font-bold tracking-widest">
                Record Estimado: {bestE1RM.toFixed(1)}kg
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {/* Table Header */}
        <div className="grid grid-cols-[30px_1fr_1fr_45px_50px] gap-2 px-2 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
          <span>Serie</span>
          <span className="text-center">KG</span>
          <span className="text-center">Reps</span>
          <span className="text-center">RPE</span>
          <span className="text-right">OK</span>
        </div>

        {(ex.sets || []).map((set: Set, sIdx: number) => {
          const currentE1RM = calculateE1RM(set.weight, set.reps);
          const isSetPR = isPR(ex.exerciseId, set.weight, set.reps);

          return (
            <div key={set.id} className={cn(
              "grid grid-cols-[30px_1fr_1fr_45px_50px] gap-2 items-center p-2 rounded-xl transition-all border",
              set.completed ? "bg-brand-blue/10 border-brand-blue/20" : "bg-white/5 border-transparent"
            )}>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-slate-500">{sIdx + 1}</span>
                {isSetPR && set.completed && <Trophy size={10} className="text-yellow-400" />}
              </div>
              
              <div className="min-w-0 flex-1">
                <input 
                  type="number"
                  value={set.weight || ''}
                  placeholder="0"
                  onChange={(e) => onUpdateSet(sIdx, 'weight', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
                />
                <div className="h-3 flex items-center justify-center">
                  {set.weight > 0 && set.reps > 0 && (
                    <p className="text-[8px] text-slate-500 font-bold">1RM: {currentE1RM.toFixed(0)}</p>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <input 
                  type="number"
                  value={set.reps || ''}
                  placeholder="0"
                  onChange={(e) => onUpdateSet(sIdx, 'reps', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-100 placeholder:text-slate-600 focus:ring-1 ring-brand-blue/30"
                />
                <div className="h-3" /> {/* Spacer to align with KG column */}
              </div>

              <input 
                type="number"
                value={set.rpe || ''}
                placeholder="-"
                min="1"
                max="10"
                onChange={(e) => onUpdateSet(sIdx, 'rpe', parseInt(e.target.value) || 0)}
                className="bg-slate-800 text-center rounded-lg py-2 outline-none font-bold text-slate-400 placeholder:text-slate-600 focus:text-brand-blue"
              />

              <button 
                onClick={() => onToggleSet(sIdx)}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all ml-auto",
                  set.completed ? "bg-brand-blue text-slate-950" : "bg-slate-800 text-slate-500"
                )}
              >
                <Check size={20} strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>

      <button 
        onClick={onAddSet}
        className="w-full py-2 bg-white/5 text-slate-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-dashed border-white/10"
      >
        + Añadir Serie
      </button>
    </div>
  );
}

function AddExerciseBtn({ onAdd }: { onAdd: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 glass border-brand-blue/30 text-brand-blue rounded-2xl font-bold flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Añadir Ejercicio
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Seleccionar Ejercicio</h2>
              <button onClick={() => setIsOpen(false)} className="p-2"><X size={24} /></button>
            </div>
            <div className="space-y-2">
              {BASE_EXERCISES.map(ex => (
                <button 
                  key={ex.id}
                  onClick={() => { onAdd(ex.id); setIsOpen(false); }}
                  className="w-full p-4 glass rounded-xl flex justify-between items-center"
                >
                  <div className="text-left">
                    <p className="font-bold">{ex.name}</p>
                    <p className="text-[10px] uppercase text-slate-400 tracking-wider transition-all font-bold">{ex.muscleGroup}</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
