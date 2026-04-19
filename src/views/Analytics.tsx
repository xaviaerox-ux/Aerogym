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
import { Dumbbell, TrendingUp, Calendar } from 'lucide-react';

interface AnalyticsProps {
  state: AppState;
}

export default function Analytics({ state }: AnalyticsProps) {
  // Volume over time (last 7 workouts)
  const volumeData = (state.sessions || [])
    .slice(0, 7)
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

  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-3xl font-bold">Estadísticas</h1>

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

      {/* Muscle Focus Placeholder */}
       <section className="space-y-4">
        <h2 className="text-lg font-semibold">Carga Muscular</h2>
        <div className="grid grid-cols-2 gap-3">
          {['Pecho', 'Espalda', 'Piernas', 'Brazos'].map(muscle => (
            <div key={muscle} className="glass p-3 rounded-xl flex justify-between items-center">
              <span className="text-sm font-medium text-slate-200">{muscle}</span>
              <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-blue" style={{ width: '60%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
