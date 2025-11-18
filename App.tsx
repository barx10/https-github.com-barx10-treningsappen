import React, { useState } from 'react';
import { 
  ExerciseDefinition, 
  WorkoutSession, 
  Screen, 
  WorkoutStatus 
} from './types';
import { 
  createInitialExercises, 
  createInitialHistory, 
  createSessionA, 
  createSessionB, 
  createEmptySession 
} from './utils/initialData';
import BottomNav from './components/BottomNav';
import ExerciseCard from './components/ExerciseCard';
import WorkoutHistoryCard from './components/WorkoutHistoryCard';
import ActiveSessionView from './components/ActiveSessionView';
import ExerciseDetailModal from './components/ExerciseDetailModal';
import ExerciseFormModal from './components/ExerciseFormModal';
import { TrendingUp, Calendar, Play, Heart, Plus } from 'lucide-react';

const INITIAL_EXERCISES = createInitialExercises();
const INITIAL_HISTORY = createInitialHistory();

export default function App() {
  // --- State ---
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  
  const [exercises, setExercises] = useState<ExerciseDefinition[]>(INITIAL_EXERCISES);
  const [history, setHistory] = useState<WorkoutSession[]>(INITIAL_HISTORY);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  
  // Modals State
  const [viewingExercise, setViewingExercise] = useState<ExerciseDefinition | null>(null);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);

  // --- Actions ---

  const handleStartSession = (type: 'A' | 'B' | 'EMPTY') => {
    let session: WorkoutSession;
    if (type === 'A') session = createSessionA();
    else if (type === 'B') session = createSessionB();
    else session = createEmptySession();
    
    setActiveSession(session);
    setCurrentScreen(Screen.ACTIVE_WORKOUT);
  };

  const handleFinishSession = () => {
    if (!activeSession) return;
    
    const completedSession: WorkoutSession = {
      ...activeSession,
      endTime: new Date().toISOString(),
      status: WorkoutStatus.COMPLETED
    };
    
    setHistory([completedSession, ...history]);
    setActiveSession(null);
    setCurrentScreen(Screen.HISTORY);
  };

  const handleCancelSession = () => {
    if(confirm("Er du sikker på at du vil avbryte denne økten?")) {
      setActiveSession(null);
      setCurrentScreen(Screen.HOME);
    }
  };

  const handleSaveNewExercise = (newExercise: ExerciseDefinition) => {
    setExercises([newExercise, ...exercises]);
    setIsCreatingExercise(false);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
    setViewingExercise(null);
  };

  // --- Views ---

  const renderHome = () => {
    const recentWorkouts = history.slice(0, 2);
    
    return (
      <div className="p-4 pb-24 space-y-6">
        <header className="flex justify-between items-center mb-6 mt-2">
           <div>
             <h1 className="text-2xl font-bold text-white">Hei!</h1>
             <p className="text-muted text-sm">Klar for en sunnere uke?</p>
           </div>
           <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg">
             <Heart size={20} fill="white" />
           </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface p-4 rounded-xl border border-slate-700">
             <div className="flex items-center space-x-2 text-secondary mb-2">
                <TrendingUp size={18} />
                <span className="font-bold text-xs uppercase tracking-wide">Aktivitet</span>
             </div>
             <div className="text-xl font-bold text-white">God start! <span className="text-2xl">🔥</span></div>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-slate-700">
             <div className="flex items-center space-x-2 text-primary mb-2">
                <Calendar size={18} />
                <span className="font-bold text-xs uppercase tracking-wide">Totalt</span>
             </div>
             <div className="text-2xl font-bold text-white">{history.length} <span className="text-sm text-muted font-normal">økter</span></div>
          </div>
        </div>

        {/* Quick Start Section */}
        {!activeSession && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Start trening</h2>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => handleStartSession('A')}
                className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-xl flex items-center justify-between hover:scale-[1.02] transition-transform shadow-lg shadow-blue-900/20 group"
              >
                <div className="text-left">
                  <div className="font-bold text-white text-lg group-hover:underline">Økt A</div>
                  <div className="text-blue-100 text-xs">Knebøy, Benkpress, Roing + Intervall</div>
                </div>
                <div className="bg-white/20 p-2 rounded-full">
                  <Play size={20} fill="currentColor" className="text-white" />
                </div>
              </button>

              <button 
                onClick={() => handleStartSession('B')}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 rounded-xl flex items-center justify-between hover:scale-[1.02] transition-transform shadow-lg shadow-emerald-900/20 group"
              >
                <div className="text-left">
                   <div className="font-bold text-white text-lg group-hover:underline">Økt B</div>
                   <div className="text-emerald-100 text-xs">Markløft, Skulderpress + Trapper</div>
                </div>
                <div className="bg-white/20 p-2 rounded-full">
                  <Play size={20} fill="currentColor" className="text-white" />
                </div>
              </button>

              <button 
                onClick={() => handleStartSession('EMPTY')}
                className="bg-surface border border-slate-700 p-3 rounded-xl text-sm font-medium text-muted hover:bg-slate-800 hover:text-white transition-colors mt-2"
              >
                + Start en tom økt (Egentrening)
              </button>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Siste aktivitet</h2>
          <div className="space-y-3">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map(session => (
                <WorkoutHistoryCard key={session.id} session={session} />
              ))
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-muted">
                Ingen historikk enda.
              </div>
            )}
          </div>
        </section>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="p-4 pb-24 space-y-4">
      <h1 className="text-2xl font-bold text-white mb-4 mt-2">Treningshistorikk</h1>
      {history.map(session => (
        <WorkoutHistoryCard key={session.id} session={session} />
      ))}
    </div>
  );

  const renderExercises = () => (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex justify-between items-center mt-2 mb-4">
        <h1 className="text-2xl font-bold text-white">Øvelser</h1>
        <button 
          onClick={() => setIsCreatingExercise(true)}
          className="bg-primary text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>
      
      <div className="space-y-3">
        {exercises.map(ex => (
          <ExerciseCard 
            key={ex.id} 
            exercise={ex} 
            onSelect={(exercise) => setViewingExercise(exercise)} 
          />
        ))}
      </div>
    </div>
  );

  const renderActiveWorkout = () => (
    <ActiveSessionView 
      session={activeSession}
      exercises={exercises}
      onUpdateSession={setActiveSession}
      onFinishSession={handleFinishSession}
      onCancelSession={handleCancelSession}
      onRequestCreateExercise={() => setIsCreatingExercise(true)}
    />
  );

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-background relative shadow-2xl font-sans">
      <div className="h-full overflow-y-auto scrollbar-hide">
        {currentScreen === Screen.HOME && renderHome()}
        {currentScreen === Screen.HISTORY && renderHistory()}
        {currentScreen === Screen.EXERCISES && renderExercises()}
        {currentScreen === Screen.ACTIVE_WORKOUT && renderActiveWorkout()}
      </div>
      
      {/* Exercise Detail Modal (View/Delete) */}
      {viewingExercise && (
        <ExerciseDetailModal 
          exercise={viewingExercise} 
          onClose={() => setViewingExercise(null)} 
          onDelete={handleDeleteExercise}
        />
      )}
      
      {/* Create Exercise Modal */}
      {isCreatingExercise && (
        <ExerciseFormModal
          onSave={handleSaveNewExercise}
          onClose={() => setIsCreatingExercise(false)}
        />
      )}
      
      <BottomNav 
        currentScreen={currentScreen} 
        onNavigate={setCurrentScreen}
        hasActiveWorkout={!!activeSession}
      />
    </div>
  );
}