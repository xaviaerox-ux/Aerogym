import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Plus, Trash2, List, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { AppState, Routine } from '../types';
import { cn } from '../lib/utils';
import { BASE_EXERCISES } from '../constants/exercises';
import { PREDEFINED_ROUTINES } from '../constants/routines';

interface RoutinesListProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onStartRoutine: (routine: Routine) => void;
  onGenerateAI: () => Promise<Routine>;
}

export default function RoutinesList({ state, updateState, onStartRoutine, onGenerateAI }: RoutinesListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      await onGenerateAI();
    } catch (err) {
      alert("Error al generar la rutina. Verifica tu conexión e IA Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteRoutine = (id: string) => {
    updateState(prev => ({
      ...prev,
      routines: prev.routines.filter(r => r.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rutinas</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              isGenerating ? "bg-slate-800 text-slate-500" : "bg-brand-blue/20 text-brand-blue border border-brand-blue/30 hover:bg-brand-blue hover:text-slate-950"
            )}
            title="Generar con IA"
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-slate-950 hover:bg-brand-blue/80 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* User Routines */}
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Mis Rutinas</h2>
        {state.routines.length === 0 && !isAdding && (
          <div className="text-center py-10 text-slate-400">
            <List size={40} className="mx-auto mb-4 opacity-20" />
            <p>Aún no has creado rutinas.</p>
          </div>
        )}

        {(state.routines || []).map(routine => (
          <div key={routine.id} className="glass p-4 rounded-2xl flex justify-between items-center group">
            <div onClick={() => onStartRoutine(routine)} className="flex-1 cursor-pointer">
              <h3 className="font-bold text-lg text-slate-50">{routine.name}</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{routine.exercises.length} Ejercicios</p>
            </div>
            <div className="flex items-center gap-2">
               <button 
                onClick={() => onStartRoutine(routine)}
                className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center"
              >
                <Play size={20} fill="currentColor" />
              </button>
              <button 
                onClick={() => deleteRoutine(routine.id)}
                className="w-10 h-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {isAdding && (
          <AddRoutineModal 
            onClose={() => setIsAdding(false)} 
            onAdd={(r) => {
              updateState(prev => ({ ...prev, routines: [...prev.routines, r] }));
              setIsAdding(false);
            }} 
          />
        )}

        {/* System Templates */}
        <div className="pt-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-brand-blue" />
            Plantillas del Sistema
          </h2>
          {PREDEFINED_ROUTINES.map(routine => (
            <div key={routine.id} className="glass p-4 rounded-2xl flex justify-between items-center group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-1">
                <div className="text-[8px] bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded-bl-lg font-bold uppercase tracking-tighter">Oficial</div>
              </div>
              <div onClick={() => onStartRoutine(routine)} className="flex-1 cursor-pointer">
                <h3 className="font-bold text-lg text-slate-50">{routine.name}</h3>
                <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{routine.description}</p>
                <p className="text-[10px] text-brand-blue uppercase tracking-widest font-bold mt-1">
                  {routine.exercises.length} Ejercicios
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const exists = state.routines.some(r => r.id === routine.id);
                    if (exists) {
                      alert('Esta rutina ya está en tu lista');
                      return;
                    }
                    updateState(prev => ({ ...prev, routines: [...prev.routines, routine] }));
                  }}
                  className="px-3 py-2 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center gap-2 transition-all hover:bg-brand-blue hover:text-slate-950 font-bold text-xs"
                >
                  <Plus size={16} />
                  Elegir
                </button>
                <button 
                  onClick={() => onStartRoutine(routine)}
                  className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center transition-all hover:bg-green-500 hover:text-slate-950"
                  title="Entrenamiento Rápido"
                >
                  <Play size={20} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddRoutineModal({ onClose, onAdd }: { onClose: () => void, onAdd: (r: Routine) => void }) {
  const [name, setName] = useState('');
  
  const handleAdd = () => {
    if (!name) return;
    const newRoutine: Routine = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      exercises: [] // Start empty, user adds during workout
    };
    onAdd(newRoutine);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="glass-dark w-full max-w-sm p-6 rounded-3xl space-y-4 border border-white/10 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-50">Nueva Rutina</h2>
        <input 
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ej. Pecho y Espalda"
          className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-brand-blue text-slate-100"
        />
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 text-slate-400 font-medium tracking-wide">Cancelar</button>
          <button onClick={handleAdd} className="btn-primary flex-1 py-3 text-slate-950">Crear</button>
        </div>
      </div>
    </div>
  );
}
