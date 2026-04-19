import React from 'react';
import { motion } from 'motion/react';
import { Plus, Play, History, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { AppState, Routine } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface DashboardProps {
  state: AppState;
  nextRoutine?: Routine;
  onStartSession: (routine?: Routine) => void;
}

export default function Dashboard({ state, nextRoutine, onStartSession }: DashboardProps) {
  const lastSession = state.sessions[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Bienvenido, {state.profile.name}</h1>
        <p className="text-slate-400 font-medium">Vamos a darle duro hoy.</p>
      </div>

      {/* Suggested Action */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Siguiente Sesión</h2>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onStartSession(nextRoutine)}
          className="w-full glass bg-brand-blue/20 border-brand-blue/30 rounded-3xl p-6 text-left relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-brand-blue/20 transition-all"></div>
          
          <div className="relative z-10 flex justify-between items-center">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-50">{nextRoutine?.name || 'Entrenar'}</h3>
              <p className="text-slate-400 font-medium text-sm line-clamp-1 max-w-[200px]">
                {nextRoutine?.description || 'Basado en tu plan personalizado'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] bg-brand-blue text-slate-950 px-2 py-0.5 rounded font-black uppercase">RECOMENDADO</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{nextRoutine?.exercises.length} Ejercicios</span>
              </div>
            </div>
            
            <div className="w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/20 group-hover:scale-110 transition-transform">
              <Play className="text-white fill-white ml-1" size={28} />
            </div>
          </div>
        </motion.button>

        <button 
          onClick={() => onStartSession()}
          className="w-full py-4 glass border-white/5 rounded-2xl text-slate-400 text-sm font-bold uppercase tracking-widest hover:text-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Entrenamiento Rápido / Variación
        </button>
      </section>

      {/* Recent Progress */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History size={20} className="text-brand-blue" />
          Actividad Reciente
        </h2>
        {state.sessions.length > 0 ? (
          <div className="glass p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-50">{lastSession.name}</p>
                <p className="text-xs text-slate-400 font-medium">{format(new Date(lastSession.date), 'EEEE, d MMM')}</p>
              </div>
              <div className="text-right">
                <p className="text-brand-green font-bold text-sm">+{lastSession.totalVolume}kg</p>
                <p className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Progreso</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass p-8 rounded-xl text-center text-slate-400 italic font-medium">
            Aún no hay registros. ¡Empieza tu primera sesión!
          </div>
        )}
      </section>

      {/* Muscle Focus (Visual Idea) */}
      <section className="space-y-4 pb-10">
         <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap size={20} className="text-yellow-400" />
          Estadísticas Semanales
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Progreso Objetivo" value="12%" icon={<TrendingUp size={16} />} color="blue" />
          <StatCard label="Consistencia" value="85%" icon={<CheckCircle size={16} />} color="green" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: 'blue' | 'green' }) {
  return (
    <div className="glass p-4 rounded-xl">
      <div className={cn("mb-2", color === 'blue' ? "text-brand-blue" : "text-brand-green")}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-50">{value}</p>
      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">{label}</p>
    </div>
  );
}
