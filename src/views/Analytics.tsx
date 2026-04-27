import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { AppState } from '../types';
import { format, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dumbbell, TrendingUp, Calendar, Quote, Sparkles, Filter, Activity } from 'lucide-react';
import { analyzeProgressionWithAI } from '../lib/aiService';
import { cn } from '../lib/utils';

type TimeFilter = 'week' | 'month' | 'mesocycle';

interface AnalyticsProps {
  state: AppState;
}

export default function Analytics({ state }: AnalyticsProps) {
  const [filter, setFilter] = React.useState<TimeFilter>('month');

  // Filtrar sesiones según el tiempo
  const filteredSessions = React.useMemo(() => {
    const sessions = [...(state.sessions || [])].reverse();
    if (filter === 'week') return sessions.slice(-7);
    if (filter === 'month') return sessions.slice(-30);
    return sessions; // Mesociclo = Todo el historial actual
  }, [state.sessions, filter]);

  // Volume data
  const volumeData = filteredSessions.map(s => ({
    name: format(new Date(s.date), 'dd/MM', { locale: es }),
    val: s.totalVolume
  }));

  // Consistencia (siempre última semana para contexto rápido)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = subDays(new Date(), i);
    const count = (state.sessions || []).filter(s => isSameDay(new Date(s.date), d)).length;
    return { name: format(d, 'eee', { locale: es }), count };
  }).reverse();

  const getExerciseProgression = (id: string, name: string) => {
    const data = (state.sessions || [])
      .filter(s => s.exercises.some(e => e.exerciseId === id))
      .reverse()
      .map(s => {
        const ex = s.exercises.find(e => e.exerciseId === id);
        const bestE1RM = ex?.sets.reduce((max, set) => {
          const e1rm = set.weight * (1 + (set.reps / 30));
          return e1rm > max ? e1rm : max;
        }, 0) || 0;
        return {
          date: format(new Date(s.date), 'dd/MM'),
          e1rm: Math.round(bestE1RM)
        };
      })
      .filter(d => d.e1rm > 0);

    if (data.length < 2) return null;

    // Aplicar filtro de tiempo a los datos del ejercicio
    const exerciseData = filter === 'week' ? data.slice(-7) : filter === 'month' ? data.slice(-30) : data;

    return (
      <div key={id} className="space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">{name}</p>
        <div className="h-24 glass p-2 rounded-xl">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={exerciseData}>
              <Line type="monotone" dataKey="e1rm" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', fontSize: '10px' }} labelStyle={{ display: 'none' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const [coachAdvice, setCoachAdvice] = React.useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = React.useState(false);

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Estadísticas</h1>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
          {(['week', 'month', 'mesocycle'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all",
                filter === f ? "bg-brand-blue text-slate-950" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {f === 'week' ? 'Semana' : f === 'month' ? 'Mes' : 'Meso'}
            </button>
          ))}
        </div>
      </div>

      {/* Volumen Principal */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-blue" /> Volumen Total (kg)
          </h2>
        </div>
        <div className="h-64 glass p-4 rounded-3xl border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }} />
              <Line type="monotone" dataKey="val" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Salud y Recuperación */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
          <Activity size={16} className="text-purple-400" /> Tendencias de Salud
        </h2>
        {state.healthMetrics && state.healthMetrics.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {(() => {
              const activeMetrics = state.healthMetrics.filter(m => (m.steps || 0) > 0 || m.sleep);
              const sliceSize = filter === 'week' ? 7 : filter === 'month' ? 30 : 90;
              const dataWithValues = activeMetrics.slice(-sliceSize);
              
              const maxSteps = activeMetrics.length > 0 ? Math.max(...activeMetrics.map(m => m.steps || 0)) : 0;
              const sleepEntries = activeMetrics.filter(m => m.sleep);
              const avgSleep = sleepEntries.length > 0 
                ? sleepEntries.reduce((acc, m) => acc + (m.sleep?.totalSleepMin || 0), 0) / sleepEntries.length 
                : 0;

              return (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Récord Pasos</p>
                      <p className="text-xl font-black text-brand-blue">{maxSteps.toLocaleString()}</p>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Media Sueño</p>
                      <p className="text-xl font-black text-purple-400">{(avgSleep / 60).toFixed(1)}h</p>
                    </div>
                  </div>
                  <div className="h-40 glass p-4 rounded-2xl border border-white/5">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataWithValues}>
                        <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), 'dd/MM')} hide />
                        <Tooltip labelFormatter={(d) => format(new Date(d), 'PPPP', { locale: es })} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                        <Bar dataKey="steps" fill="#38bdf8" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="glass p-8 rounded-3xl text-center text-slate-500 italic text-sm">
            Importa tus datos en Perfil para ver tendencias.
          </div>
        )}
      </section>

      {/* Records de Ejercicios */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
          <Dumbbell size={16} className="text-orange-400" /> Estimación 1RM
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'bench-press', name: 'Press de Banca' },
            { id: 'squats', name: 'Sentadilla' },
            { id: 'romanian-deadlift', name: 'Peso Muerto Rumano' }
          ].map(ex => getExerciseProgression(ex.id, ex.name))}
        </div>
      </section>
    </div>
  );
}
