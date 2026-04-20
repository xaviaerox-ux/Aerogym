import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  LayoutDashboard, 
  TrendingUp, 
  User, 
  Settings, 
  Plus, 
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { AppState, Session, Routine, UserProfile } from './types';
import { loadState, saveState } from './lib/storage';
import { cn } from './lib/utils';
import Dashboard from './views/Dashboard';
import RoutinesList from './views/RoutinesList';
import TrainingSession from './views/TrainingSession';
import Analytics from './views/Analytics';
import ProfileSettings from './views/ProfileSettings';
import OnboardingView from './views/OnboardingView';
import CoachView from './views/CoachView';
import { PREDEFINED_ROUTINES } from './constants/routines';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'workouts' | 'analytics' | 'profile' | 'onboarding' | 'coach'>('home');
  const [state, setState] = useState<AppState>(loadState());
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!state.onboardingComplete) {
      setActiveTab('onboarding');
    }
  }, [state.onboardingComplete]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  const startSession = (routine?: Routine) => {
    // Find last performance of this routine to pre-load weights
    const lastMatchingSession = state.sessions.find(s => s.name === routine?.name);

    const newSession: Session = {
      id: Math.random().toString(36).substring(2, 11),
      name: routine?.name || 'Entrenamiento Rápido',
      date: new Date().toISOString(),
      exercises: (routine?.exercises || []).map(re => {
        const lastEx = lastMatchingSession?.exercises.find(le => le.exerciseId === re.exerciseId);
        
        // Parse reps from string (e.g., "8-12" -> 10)
        let defaultRepsNum = 10;
        if (re.defaultReps && typeof re.defaultReps === 'string') {
          const parts = re.defaultReps.split('-').map(p => parseInt(p.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            defaultRepsNum = Math.floor((parts[0] + parts[1]) / 2);
          } else if (!isNaN(parts[0])) {
            defaultRepsNum = parts[0];
          }
        }

        // Create the requested number of sets, pre-filling with last performance data if available
        const setcount = re.defaultSets || 1;
        const sets = Array.from({ length: setcount }).map((_, i) => {
          const lastSet = lastEx?.sets[i];
          return {
            id: Math.random().toString(36).substring(2, 11),
            reps: lastSet?.reps || defaultRepsNum,
            weight: lastSet?.weight || re.defaultWeight || 0,
            completed: false
          };
        });

        return {
          exerciseId: re.exerciseId,
          sets
        };
      }),
      totalVolume: 0,
    };
    setActiveSession(newSession);
  };

  const finishSession = (session: Session) => {
    updateState(prev => ({
      ...prev,
      sessions: [session, ...prev.sessions]
    }));
    setActiveSession(null);
  };

  const nextSuggestedRoutine = useMemo(() => {
    if (!state.routines || state.routines.length === 0) return PREDEFINED_ROUTINES[0];
    
    const lastSession = state.sessions[0];
    if (!lastSession) return state.routines[0];

    // Try to find the routine index that matches the last session name
    const lastRoutineIndex = state.routines.findIndex(r => r.name === lastSession.name);
    
    if (lastRoutineIndex === -1) return state.routines[0];
    
    // Cycle to next
    const nextIndex = (lastRoutineIndex + 1) % state.routines.length;
    return state.routines[nextIndex];
  }, [state.sessions, state.routines]);

  const renderContent = () => {
    if (activeSession) {
      return (
        <TrainingSession 
          session={activeSession} 
          onFinish={finishSession} 
          onCancel={() => setActiveSession(null)}
          state={state}
        />
      );
    }

    switch (activeTab) {
      case 'onboarding': return <OnboardingView state={state} updateState={updateState} onComplete={() => setActiveTab('home')} />;
      case 'home': return <Dashboard state={state} nextRoutine={nextSuggestedRoutine} onStartSession={startSession} />;
      case 'workouts': return <RoutinesList state={state} updateState={updateState} onStartRoutine={startSession} />;
      case 'analytics': return <Analytics state={state} />;
      case 'coach': return <CoachView state={state} />;
      case 'profile': return <ProfileSettings state={state} updateState={updateState} />;
      default: return <Dashboard state={state} nextRoutine={nextSuggestedRoutine} onStartSession={startSession} />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-y-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSession ? 'session' : activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      {!activeSession && state.onboardingComplete && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-dark h-20 px-6 flex items-center justify-between z-50 rounded-t-3xl border-t border-white/5">
          <NavBtn icon={<LayoutDashboard size={24} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Inicio" />
          <NavBtn icon={<Dumbbell size={24} />} active={activeTab === 'workouts'} onClick={() => setActiveTab('workouts')} label="Log" />
          <NavBtn icon={<Sparkles size={24} />} active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} label="Coach" />
          <NavBtn icon={<TrendingUp size={24} />} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} label="Stats" />
          <NavBtn icon={<User size={24} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label="Perfil" />
        </nav>
      )}
    </div>
  );
}

function NavBtn({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string }) {
  return (
    <button onClick={onClick} className={cn("nav-item text-slate-500", active && "nav-item-active text-brand-blue")}>
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wider mt-1">{label}</span>
    </button>
  );
}

