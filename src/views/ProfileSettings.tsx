import React from 'react';
import { AppState, Goal, Level, Experience, ActivityLevel, Gender } from '../types';
import { User, Scale, Target, Trophy, Download, Upload, RotateCcw, Calendar, Utensils, Zap, Activity, Sparkles, Loader2, X, ChefHat } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { analyzeProgressionWithAI, getNutritionalAdviceWithAI } from '../lib/aiService';
import { cn } from '../lib/utils';
import { calculateNutrition } from '../lib/engine';
import { DEFAULT_STATE } from '../lib/storage';

interface ProfileSettingsProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

export default function ProfileSettings({ state, updateState }: ProfileSettingsProps) {
  
  const updateProfile = (field: keyof typeof state.profile, val: any) => {
    updateState(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: val }
    }));
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "aerogym_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        updateState(() => json);
        alert('Datos importados correctamente');
      } catch (e) {
        alert('Archivo de backup no válido');
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (confirm('¿Quieres borrar todos tus datos y empezar de cero?')) {
      localStorage.removeItem('aerogym_data');
      window.location.reload();
    }
  };

  const nutrition = calculateNutrition(state.profile);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [mealIdea, setMealIdea] = React.useState<string | null>(null);

  const generateMealIdea = async () => {
    setIsGenerating(true);
    try {
      const advice = await getNutritionalAdviceWithAI(state.profile, nutrition);
      setMealIdea(advice);
    } catch (err) {
      alert("Aero está meditando. Inténtalo más tarde.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <h1 className="text-3xl font-bold">Perfil</h1>

      {/* Stats Summary */}
      <div className="flex items-center gap-4 glass p-6 rounded-3xl">
        <div className="w-16 h-16 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-50">{state.profile.name}</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{state.profile.level} • {state.profile.goal}</p>
        </div>
      </div>

      {/* Nutrition Plan */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Utensils size={14} /> Plan Nutricional Sugerido
        </h3>
        <div className="glass p-6 rounded-3xl space-y-6">
          <div className="text-center space-y-1">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Calorías Diarias Recomendadas</p>
            <p className="text-5xl font-black text-brand-blue">{nutrition.targetCalories}</p>
            <p className="text-[10px] text-slate-500 font-medium">Basado en tu TDEE ({nutrition.tdee} kcal) y objetivo</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <MacroCard label="Proteína" value={`${nutrition.macros.protein}g`} color="blue" />
            <MacroCard label="Grasas" value={`${nutrition.macros.fat}g`} color="yellow" />
            <MacroCard label="Carbs" value={`${nutrition.macros.carbs}g`} color="green" />
          </div>

          <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] text-slate-400 leading-relaxed italic text-center">
              "Distribución de 2g de proteína por kg de peso para maximizar {state.profile.goal.toLowerCase()} y preservar masa muscular, siguiendo evidencia científica."
            </p>
          </div>

          <button 
            onClick={generateMealIdea}
            disabled={isGenerating}
            className="w-full py-4 bg-brand-blue/10 border border-brand-blue/30 rounded-2xl flex items-center justify-center gap-2 text-brand-blue font-bold text-sm hover:bg-brand-blue hover:text-slate-950 transition-all"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <ChefHat size={18} />}
            Sugerencias de Aero (IA)
          </button>
        </div>
      </section>

      <AnimatePresence>
        {mealIdea && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass p-8 rounded-3xl max-w-md w-full relative space-y-4"
            >
              <button 
                onClick={() => setMealIdea(null)}
                className="absolute top-4 right-4 text-slate-500"
              >
                <X size={24} />
              </button>
              
              <div className="w-12 h-12 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue mb-2">
                <Sparkles size={24} />
              </div>
              
              <h2 className="text-2xl font-bold">Combustible para la Virtud</h2>
              <p className="text-slate-300 italic font-serif text-lg leading-relaxed">
                "{mealIdea}"
              </p>
              
              <button 
                onClick={() => setMealIdea(null)}
                className="w-full py-4 bg-brand-blue text-slate-950 rounded-xl font-black mt-4"
              >
                ENTENDIDO
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Sections */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Scale size={14} /> Información Personal
        </h3>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5 text-sm">
          <SettingsItem 
            label="Nombre" 
            value={state.profile.name} 
            onChange={v => updateProfile('name', v)} 
          />
          <SettingsItem 
            label="Peso (kg)" 
            type="number"
            value={state.profile.weight} 
            onChange={v => updateProfile('weight', parseFloat(v))} 
          />
          <SettingsItem 
            label="Altura (cm)" 
            type="number"
            value={state.profile.height} 
            onChange={v => updateProfile('height', parseFloat(v))} 
          />
          <SettingsItem 
            label="Edad" 
            type="number"
            value={state.profile.age} 
            onChange={v => updateProfile('age', parseInt(v))} 
          />
          <div className="flex items-center justify-between p-4">
            <span className="text-slate-400 font-medium">Género</span>
            <div className="flex gap-2">
              {['Hombre', 'Mujer'].map(g => (
                <button 
                  key={g} 
                  onClick={() => updateProfile('gender', g as Gender)}
                  className={cn("px-3 py-1 rounded-lg text-xs font-bold", state.profile.gender === g ? "bg-brand-blue text-slate-950" : "bg-slate-800 text-slate-400")}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Activity size={14} /> Nivel de Actividad
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {['Sedentario', 'Ligero', 'Moderado', 'Activo', 'Muy Activo'].map(level => (
            <button 
              key={level}
              onClick={() => updateProfile('activityLevel', level as ActivityLevel)}
              className={cn(
                "py-3 rounded-xl font-medium transition-all border text-[10px]",
                state.profile.activityLevel === level ? "bg-brand-blue border-brand-blue text-slate-950 font-bold" : "glass border-transparent text-slate-400"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Target size={14} /> Objetivo de Entrenamiento
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {['Hipertrofia', 'Fuerza', 'Definición', 'Mantenimiento'].map(goal => (
            <button 
              key={goal}
              onClick={() => updateProfile('goal', goal as Goal)}
              className={cn(
                "py-3 rounded-xl font-medium transition-all border",
                state.profile.goal === goal ? "bg-brand-blue border-brand-blue text-slate-950 font-bold" : "glass border-transparent text-slate-400"
              )}
            >
              {goal}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Trophy size={14} /> Nivel de Entrenamiento
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {['Principiante', 'Intermedio', 'Avanzado'].map(level => (
            <button 
              key={level}
              onClick={() => updateProfile('level', level as Level)}
              className={cn(
                "py-3 rounded-xl font-medium transition-all border text-sm",
                state.profile.level === level ? "bg-brand-blue border-brand-blue text-slate-950 font-bold" : "glass border-transparent text-slate-400"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <Calendar size={14} /> Experiencia de Entrenamiento
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {['PPL', 'Torso Pierna', 'Cuerpo Completo', 'Weider'].map(exp => (
            <button 
              key={exp}
              onClick={() => updateProfile('experience', exp as Experience)}
              className={cn(
                "py-3 rounded-xl font-medium transition-all border text-sm",
                state.profile.experience === exp ? "bg-brand-blue border-brand-blue text-slate-950 font-bold" : "glass border-transparent text-slate-400"
              )}
            >
              {exp}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <RotateCcw size={14} /> Frecuencia Semanal
        </h3>
        <div className="glass p-4 rounded-2xl flex items-center justify-between">
          <span className="text-slate-400 font-medium">Sesiones / Semana</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => updateProfile('weeklyFrequency', Math.max(1, state.profile.weeklyFrequency - 1))}
              className="w-8 h-8 glass rounded-lg flex items-center justify-center text-brand-blue"
            >
              -
            </button>
            <span className="font-bold text-xl text-slate-50 w-6 text-center">{state.profile.weeklyFrequency}</span>
            <button 
              onClick={() => updateProfile('weeklyFrequency', Math.min(7, state.profile.weeklyFrequency + 1))}
              className="w-8 h-8 glass rounded-lg flex items-center justify-center text-brand-blue"
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* Backup & Safety */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
          <RotateCcw size={14} /> Gestión de Datos
        </h3>
        <div className="space-y-2">
          <button onClick={exportData} className="w-full py-4 glass rounded-xl flex items-center justify-center gap-2 text-sm font-bold">
            <Download size={18} /> Exportar Backup JSON
          </button>
          <label className="w-full py-4 glass rounded-xl flex items-center justify-center gap-2 text-sm font-bold cursor-pointer transition-all hover:bg-white/5">
            <Upload size={18} /> Importar Backup JSON
            <input type="file" className="hidden" onChange={importData} accept=".json" />
          </label>
          <button onClick={resetData} className="w-full py-4 glass border-red-500/20 text-red-500 rounded-xl flex items-center justify-center gap-2 text-sm font-bold">
            Borrar Todos los Datos
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingsItem({ label, value, type = 'text', onChange }: any) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-slate-400 font-medium">{label}</span>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-transparent text-right outline-none font-bold text-brand-blue w-24"
      />
    </div>
  );
}

function MacroCard({ label, value, color }: { label: string, value: string, color: 'blue' | 'yellow' | 'green' }) {
  const colors = {
    blue: "text-brand-blue bg-brand-blue/10 border-brand-blue/20",
    yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    green: "text-brand-green bg-brand-green/10 border-brand-green/20"
  };

  return (
    <div className={cn("p-3 rounded-2xl border text-center space-y-1", colors[color])}>
      <p className="text-[10px] font-bold uppercase">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
