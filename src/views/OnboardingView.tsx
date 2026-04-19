import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Target, 
  Trophy, 
  Dumbbell,
  Scale
} from 'lucide-react';
import { AppState, Goal, Level, Experience } from '../types';
import { cn } from '../lib/utils';
import { PREDEFINED_ROUTINES } from '../constants/routines';

interface OnboardingViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onComplete: () => void;
}

export default function OnboardingView({ state, updateState, onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Bienvenido a AeroGym', description: 'Tu compañero inteligente para el gimnasio.', icon: <Dumbbell className="text-brand-blue" size={48} /> },
    { title: '¿Cuál es tu objetivo?', description: 'Personalizaremos tu volumen de entrenamiento.', icon: <Target className="text-brand-blue" size={48} /> },
    { title: 'Tu nivel actual', description: 'Adaptaremos la complejidad de los ejercicios.', icon: <Trophy className="text-brand-blue" size={48} /> },
    { title: 'Preferencia de Rutina', description: 'Seleccionaremos tu plan de trabajo inicial.', icon: <Dumbbell className="text-brand-blue" size={48} /> },
    { title: 'Casi listo', description: 'Introduce tus datos básicos.', icon: <Scale className="text-brand-blue" size={48} /> },
  ];

  const updateProfile = (field: string, val: any) => {
    updateState(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: val }
    }));
  };

  const handleFinish = () => {
    // Auto-setup routines based on choice
    const selectedExp = state.profile.experience;
    let routinesToAdd = [];
    
    if (selectedExp === 'PPL') {
      if (state.profile.weeklyFrequency >= 6) {
        routinesToAdd = PREDEFINED_ROUTINES.filter(r => ['push-a', 'pull-a', 'legs-a', 'push-b', 'pull-b', 'legs-b'].includes(r.id));
      } else {
        routinesToAdd = PREDEFINED_ROUTINES.filter(r => ['push-a', 'pull-a', 'legs-a'].includes(r.id));
      }
    } else if (selectedExp === 'Torso Pierna') {
      routinesToAdd = PREDEFINED_ROUTINES.filter(r => ['upper-b', 'legs-a'].includes(r.id));
    } else {
      routinesToAdd = [PREDEFINED_ROUTINES.find(r => r.id === 'full-body-metabolic')!].filter(Boolean);
    }

    updateState(prev => ({
      ...prev,
      routines: routinesToAdd,
      onboardingComplete: true
    }));
    onComplete();
  };

  const next = () => setStep(s => Math.min(steps.length - 1, s + 1));
  const prev = () => setStep(s => Math.max(0, s - 1));

  return (
    <div className="fixed inset-0 bg-slate-950 z-[200] flex flex-col p-8 safe-bottom">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6 w-full"
        >
          <div className="w-24 h-24 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-8">
            {steps[step].icon}
          </div>
          <h2 className="text-3xl font-bold text-slate-50">{steps[step].title}</h2>
          <p className="text-slate-400 font-medium">{steps[step].description}</p>

          {/* Dynamic Step Content */}
          <div className="pt-8">
            {step === 1 && (
              <div className="grid grid-cols-1 gap-3">
                {['Hipertrofia', 'Fuerza', 'Definición', 'Mantenimiento'].map(goal => (
                  <button 
                    key={goal}
                    onClick={() => { updateProfile('goal', goal); next(); }}
                    className={cn(
                      "py-4 rounded-2xl font-bold transition-all border",
                      state.profile.goal === goal ? "bg-brand-blue border-brand-blue text-slate-950" : "glass border-transparent text-slate-400"
                    )}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-3">
                {['Principiante', 'Intermedio', 'Avanzado'].map(level => (
                  <button 
                    key={level}
                    onClick={() => { updateProfile('level', level); next(); }}
                    className={cn(
                      "py-4 rounded-2xl font-bold transition-all border",
                      state.profile.level === level ? "bg-brand-blue border-brand-blue text-slate-950" : "glass border-transparent text-slate-400"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 gap-3">
                {['PPL', 'Torso Pierna', 'Cuerpo Completo', 'Weider'].map(exp => (
                  <button 
                    key={exp}
                    onClick={() => { updateProfile('experience', exp); next(); }}
                    className={cn(
                      "py-4 rounded-2xl font-bold transition-all border",
                      state.profile.experience === exp ? "bg-brand-blue border-brand-blue text-slate-950" : "glass border-transparent text-slate-400"
                    )}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="glass p-6 rounded-3xl space-y-4">
                  <div className="flex gap-2">
                    {['Hombre', 'Mujer'].map(g => (
                      <button 
                        key={g}
                        onClick={() => updateProfile('gender', g)}
                        className={cn("flex-1 py-3 rounded-xl font-bold text-sm border", state.profile.gender === g ? "bg-brand-blue text-slate-950" : "glass border-transparent text-slate-400")}
                      >
                        {g}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-start gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1">Altura (cm)</label>
                      <input 
                        type="number"
                        className="w-full bg-slate-900 border-none rounded-xl px-4 py-2 text-sm font-bold text-brand-blue outline-none focus:ring-1 ring-brand-blue/50"
                        value={state.profile.height}
                        onChange={e => updateProfile('height', parseFloat(e.target.value) || 0)}
                        placeholder="175"
                      />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1">Edad</label>
                      <input 
                        type="number"
                        className="w-full bg-slate-900 border-none rounded-xl px-4 py-2 text-sm font-bold text-brand-blue outline-none focus:ring-1 ring-brand-blue/50"
                        value={state.profile.age}
                        onChange={e => updateProfile('age', parseInt(e.target.value) || 0)}
                        placeholder="25"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 pt-2 border-t border-white/5">
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-widest pl-1">Nombre</label>
                    <input 
                      className="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-lg font-bold text-brand-blue outline-none focus:ring-2 ring-brand-blue/50"
                      value={state.profile.name}
                      onChange={e => updateProfile('name', e.target.value)}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-widest pl-1">Peso Actual (kg)</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-lg font-bold text-brand-blue outline-none focus:ring-2 ring-brand-blue/50"
                      value={state.profile.weight}
                      onChange={e => updateProfile('weight', parseFloat(e.target.value) || 0)}
                      placeholder="70"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleFinish}
                  className="w-full py-5 btn-primary rounded-3xl font-black text-lg text-slate-950 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={24} />
                  COMENZAR A ENTRENAR
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-8">
        {step > 0 && step < 4 ? (
          <button onClick={prev} className="p-4 text-slate-500 font-bold flex items-center gap-2">
            <ChevronLeft size={20} /> Atrás
          </button>
        ) : <div />}
        
        {step === 0 && (
          <button onClick={next} className="w-full py-5 btn-primary rounded-3xl font-black text-lg text-slate-950 flex items-center justify-center gap-2">
            SIGUIENTE <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 py-6">
        {steps.map((_, i) => (
          <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i === step ? "bg-brand-blue w-6" : "bg-slate-800")} />
        ))}
      </div>
    </div>
  );
}
