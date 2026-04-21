import React from 'react';
import { Sparkles, Activity } from 'lucide-react';
import { WorkoutRecommendation } from '../../types/health';

interface ReadinessCardProps {
  recommendation: WorkoutRecommendation;
  onImportClick: () => void;
}

export function ReadinessCard({ recommendation, onImportClick }: ReadinessCardProps) {
  const { score, label, color, description, exercises, avoid, aeroMessage } = recommendation;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass p-6 rounded-3xl relative overflow-hidden group border border-white/5">
        {/* Glow Background */}
        <div 
          className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full -mr-10 -mt-10 transition-colors duration-1000`}
          style={{ backgroundColor: color.includes('red') ? '#ef4444' : color.includes('blue') ? '#3b82f6' : '#22c55e' }}
        />

        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity size={14} />
              Estado de Recuperación
            </h3>
            <div className={`text-4xl font-black ${color} tracking-tighter`}>
              {score}
            </div>
            <p className="text-sm font-bold text-slate-200">{label}</p>
          </div>
          
          <button 
            onClick={onImportClick}
            className="text-[10px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/10 px-3 py-1.5 rounded-full border border-brand-blue/20 hover:bg-brand-blue hover:text-slate-950 transition-all"
          >
            Sincronizar Zepp
          </button>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-brand-green uppercase tracking-widest">Recomendado</p>
            <ul className="space-y-1">
              {exercises.map((ex, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-1 h-1 bg-brand-green rounded-full" />
                  {ex}
                </li>
              ))}
            </ul>
          </div>
          
          {avoid.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Evitar</p>
              <ul className="space-y-1">
                {avoid.map((ex, i) => (
                  <li key={i} className="text-xs text-red-400/70 flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/5">
          <div className="flex items-start gap-3">
            <Sparkles size={16} className="text-brand-blue mt-0.5 shrink-0" />
            <p className="text-xs text-slate-400 italic leading-relaxed font-serif">
              {aeroMessage}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
