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
import { Dumbbell, TrendingUp, Calendar, Quote, Sparkles } from 'lucide-react';
import { analyzeProgressionWithAI } from '../lib/aiService';

interface AnalyticsProps {
  state: AppState;
}

export default function Analytics({ state }: AnalyticsProps) {
  // Volume over time (last 7 workouts)
  const volumeData = (state.sessions || [])
    .slice(0, 10)
    .reverse()
    .map(s => ({
      name: format(new Date(s.date), 'dd/MM', { locale: es }),
      val: s.totalVolume
    }));

  // Workouts per day in last 7 days
  const last7Days = [...Array(7)].map((_, i) => {
    const d = subDays(new Date(), i);
    const count = (state.sessions || []).filter(s => isSameDay(new Date(s.date), d)).length;
    return { name: format(d, 'eee', { locale: es }), count };
  }).reverse();

  // Get PR Progression for specific exercises (e.g., Bench Press, Squat)
  const getExerciseProgression = (id: string, name: string) => {
    const data = (state.sessions || [])
      .filter(s => s.exercises.some(e => e.exerciseId === id))
      .reverse()
      .map(s => {
        const ex = s.exercises.find(e => e.exerciseId === id);
        const bestE1RM = ex?.sets.reduce((max, set) => {
          const e1rm = set.weight * (1 + (set.reps / 30)); // Simple E1RM formula
          return e1rm > max ? e1rm : max;
        }, 0) || 0;
        return {
          date: format(new Date(s.date), 'dd/MM'),
          e1rm: Math.round(bestE1RM)
        };
      })
      .filter(d => d.e1rm > 0);

    if (data.length < 2) return null;

    return (
      <div key={id} className="space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{name}</p>
        <div className="h-32 glass p-2 rounded-xl">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line 
                type="stepAfter" 
                dataKey="e1rm" 
                stroke="#4ade80" 
                strokeWidth={2} 
                dot={false}
              />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', fontSize: '10px' }}
                labelStyle={{ display: 'none' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const mainExercises = [
    { id: 'bench-press', name: 'Press de Banca' },
    { id: 'squats', name: 'Sentadilla' },
    { id: 'romanian-deadlift', name: 'Peso Muerto Rumano' }
  ];

  const [coachAdvice, setCoachAdvice] = React.useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = React.useState(false);

  React.useEffect(() => {
    if (state.sessions.length > 0 && !coachAdvice) {
      setLoadingAdvice(true);
      analyzeProgressionWithAI(state.sessions, state.profile)
        .then(setCoachAdvice)
        .finally(() => setLoadingAdvice(false));
    }
  }, [state.sessions.length]);

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Estadísticas</h1>
        {state.sessions.length > 0 && !coachAdvice && !loadingAdvice && (
          <button 
            onClick={() => {
              setLoadingAdvice(true);
              analyzeProgressionWithAI(state.sessions, state.profile)
                .then(setCoachAdvice)
                .finally(() => setLoadingAdvice(false));
            }}
            className="p-2 glass rounded-full text-brand-blue"
          >
            <Sparkles size={20} />
          </button>
        )}
      </div>

      {(coachAdvice || loadingAdvice) && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="glass-dark border-brand-blue/20 p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote size={40} className="text-brand-blue" />
              </div>
              <h3 className="text-xs font-bold text-brand-blue uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <Sparkles size={14} />
                Sabiduría de Aero
              </h3>
              {loadingAdvice ? (
                <div className="flex gap-2 items-center text-slate-500 text-sm italic">
                  <span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse" />
                  Aero está meditando sobre tus progresos...
                </div>
              ) : (
                <p className="text-slate-200 leading-relaxed italic font-serif text-lg">
                  "{coachAdvice}"
                </p>
              )}
           </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp size={20} className="text-brand-blue" />
          Progresión de Volumen
        </h2>
        <div className="h-64 glass p-4 rounded-2xl">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <YAxis 
                hide 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Line 
                type="monotone" 
                dataKey="val" 
                stroke="#38bdf8" 
                strokeWidth={3} 
                dot={{ fill: '#38bdf8', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Dumbbell size={20} className="text-orange-400" />
          Records Estimados (1RM)
        </h2>
        <div className="space-y-4">
          {mainExercises.map(ex => getExerciseProgression(ex.id, ex.name))}
          {(state.sessions || []).length < 2 && (
             <div className="glass p-8 rounded-2xl text-center">
                <p className="text-slate-500 text-sm italic">Completa al menos 2 sesiones para ver gráficas de progresión por ejercicio.</p>
             </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar size={20} className="text-brand-green" />
          Consistencia Semanal
        </h2>
        <div className="h-48 glass p-4 rounded-2xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
               <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
              />
              <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                {last7Days.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#4ade80' : '#1e293b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Muscle Focus */}
       <section className="space-y-4">
        <h2 className="text-lg font-semibold px-1">Carga Muscular</h2>
        <div className="grid grid-cols-2 gap-3">
          {['Pecho', 'Espalda', 'Piernas', 'Hombros'].map(muscle => (
            <div key={muscle} className="glass p-3 rounded-xl flex justify-between items-center border border-white/5">
              <span className="text-sm font-medium text-slate-200">{muscle}</span>
              <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-blue" style={{ width: Math.floor(Math.random() * 40) + 30 + '%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

