import React from 'react';
import { motion } from 'motion/react';
import { Plus, Play, History, Zap, Sparkles, Activity, Footprints, Flame } from 'lucide-react';
import { AppState, Routine } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { ReadinessCard } from '../components/health/ReadinessCard';
import { ReadinessEngine } from '../lib/health/ReadinessEngine';

interface DashboardProps {
  state: AppState;
  nextRoutine?: Routine;
  onStartSession: (routine?: Routine) => void;
  onUpdateActivity: (steps: number, cardioMin: number) => void;
}

export default function Dashboard({ state, nextRoutine, onStartSession, onUpdateActivity }: DashboardProps) {
  const lastSession = state.sessions[0];
  
  const readinessRecommendation = React.useMemo(() => {
    const engine = new ReadinessEngine();
    return engine.calculateScore(state.healthMetrics || []);
  }, [state.healthMetrics]);

  // Lógica para registro rápido de pasos/cardio
  const [steps, setSteps] = React.useState('');
  const [cardio, setCardio] = React.useState('');

  const handleQuickLog = () => {
    onUpdateActivity(parseInt(steps) || 0, parseInt(cardio) || 0);
    setSteps('');
    setCardio('');
  };

  return (
    <div className="space-y-8">
      {/* Header Minimalista */}
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Hola, {state.profile.name}</h1>
        <p className="text-slate-400 font-medium">Foco y disciplina para hoy.</p>
      </div>

      {/* Readiness Score (Sin botón de importar aquí) */}
      <ReadinessCard 
        recommendation={readinessRecommendation} 
        onImportClick={() => {}} // Deshabilitado en Dashboard
        hideImportBtn={true}
      />

      {/* Siguiente Sesión (Rotación Automática PPL) */}
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
                {nextRoutine?.description || 'Basado en tu rotación actual'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] bg-brand-blue text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-tighter">TURNO ACTUAL</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(nextRoutine?.exercises?.length || 0)} Ejercicios</span>
              </div>
            </div>
            
            <div className="w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/20 group-hover:scale-110 transition-transform">
              <Play className="text-white fill-white ml-1" size={28} />
            </div>
          </div>
        </motion.button>
      </section>

      {/* Registro Rápido (Cardio/Pasos) */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Actividad Diaria</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-brand-blue">
              <Footprints size={16} />
              <span className="text-[10px] font-bold uppercase">Pasos</span>
            </div>
            <input 
              type="number" 
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="Ej: 10000"
              className="bg-transparent text-xl font-bold outline-none text-slate-50 w-full"
            />
          </div>
          <div className="glass p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-orange-400">
              <Flame size={16} />
              <span className="text-[10px] font-bold uppercase">Cardio (min)</span>
            </div>
            <input 
              type="number" 
              value={cardio}
              onChange={(e) => setCardio(e.target.value)}
              placeholder="Ej: 30"
              className="bg-transparent text-xl font-bold outline-none text-slate-50 w-full"
            />
          </div>
        </div>
        <button 
           onClick={handleQuickLog}
           className="w-full py-3 glass border-white/5 rounded-xl text-brand-blue text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/5 transition-colors"
        >
          Guardar Actividad Extra
        </button>
      </section>

      {/* Sabiduría Aero (Un solo consejo potente) */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="glass p-6 rounded-3xl border-brand-blue/10 relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-brand-blue" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sabiduría de Aero</h3>
          </div>
          <p className="text-slate-300 leading-relaxed font-serif italic text-lg">
            "La disciplina es el puente entre las metas y los logros. Hoy no es el día para cruzarlo a medias."
          </p>
        </div>
      </section>

      {/* Actividad Reciente (Solo el último) */}
      <section className="space-y-4 pb-10">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Último Registro</h2>
        {state.sessions.length > 0 ? (
          <div className="glass p-5 rounded-2xl flex justify-between items-center border border-white/5">
            <div>
              <p className="font-bold text-slate-50">{lastSession.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {format(new Date(lastSession.date), 'EEEE, d MMM', { locale: es })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-brand-green font-black text-lg">+{lastSession.totalVolume}kg</p>
              <Activity size={14} className="text-brand-green ml-auto mt-1" />
            </div>
          </div>
        ) : (
          <div className="glass p-8 rounded-2xl text-center text-slate-500 italic text-sm">
            Ninguna sesión grabada aún.
          </div>
        )}
      </section>
    </div>
  );
}
