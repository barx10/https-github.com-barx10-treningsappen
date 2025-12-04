import React, { useState, useEffect } from 'react';
import {
  ExerciseDefinition,
  WorkoutSession,
  WorkoutExercise,
  Screen,
  WorkoutStatus,
  ExerciseType,
  UserProfile,
  BackupData
} from './types';
import {
  createEmptySession
} from './utils/initialData';
import {
  loadExercises,
  saveExercises,
  loadHistory,
  saveHistory,
  loadActiveSession,
  saveActiveSession
} from './utils/storage';
import { loadProfile, saveProfile } from './utils/profileStorage';
import { getTodayDateString } from './utils/dateUtils';
import BottomNav from './components/BottomNav';
import ExerciseCard from './components/ExerciseCard';
import WorkoutHistoryCard from './components/WorkoutHistoryCard';
import ActiveSessionView from './components/ActiveSessionView';
import ExerciseDetailModal from './components/ExerciseDetailModal';
import ExerciseFormModal from './components/ExerciseFormModal';
import WelcomeScreen from './components/WelcomeScreen';
import RecoveryInsights from './components/RecoveryInsights';
import ProfileView from './components/ProfileView';
import InfoView from './components/InfoView';
import AgentView from './components/AgentView';
import HistoryOverviewChart from './components/HistoryOverviewChart';
import { getRecommendations, getWeeklyStats } from './utils/fitnessCalculations';
import { TrendingUp, Calendar, Play, Heart, Plus, Dumbbell, Lightbulb, Flame, User, RefreshCw, Search, Download } from 'lucide-react';

export default function App() {
  // --- State ---
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(loadActiveSession);
  // Start på ACTIVE_WORKOUT hvis vi har en aktiv økt lagret
  const [currentScreen, setCurrentScreen] = useState<Screen>(() =>
    loadActiveSession() ? Screen.ACTIVE_WORKOUT : Screen.HOME
  );

  const [exercises, setExercises] = useState<ExerciseDefinition[]>(loadExercises);
  const [history, setHistory] = useState<WorkoutSession[]>(loadHistory);
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingAiRecommendations, setLoadingAiRecommendations] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState<'all' | 'week' | 'month' | '3months'>('all');

  // Ingen automatisk AI-henting

  // --- Effects for Persistence ---
  useEffect(() => {
    saveExercises(exercises);
  }, [exercises]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveActiveSession(activeSession);
  }, [activeSession]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  // Modals State
  const [viewingExercise, setViewingExercise] = useState<ExerciseDefinition | null>(null);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<ExerciseDefinition | undefined>(undefined);

  // --- Actions ---

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Force re-render of stats and recovery insights
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleStartSession = () => {
    const session = createEmptySession();
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
    if (confirm("Er du sikker på at du vil avbryte denne økten?")) {
      setActiveSession(null);
      setCurrentScreen(Screen.HOME);
    }
  };

  const handleStartGeneratedWorkout = (workout: any) => {
    console.log('=== handleStartGeneratedWorkout called ===');
    console.log('Workout data:', JSON.stringify(workout, null, 2));
    console.log('Available exercises:', exercises.length);
    
    try {
      // Filter out exercises that don't exist in our database
      const validExercises = workout.exercises
        .map((ex: any) => {
          console.log(`Processing exercise: ${ex.exerciseId}`);
          const exercise = exercises.find(e => e.id === ex.exerciseId);
          if (!exercise) {
            console.warn(`Exercise not found: ${ex.exerciseId}`);
            console.log('Available exercise IDs:', exercises.map(e => e.id));
            return null;
          }
          
          console.log(`Found exercise: ${exercise.name}`);
          const repsValue = parseInt(ex.reps?.split('-')[0]) || 10;
          const isCardio = exercise.type === ExerciseType.CARDIO || exercise.type === ExerciseType.DURATION;
          
          return {
            id: crypto.randomUUID(),
            exerciseDefinitionId: exercise.id,
            sets: Array(ex.sets || 3).fill(null).map(() => ({
              id: crypto.randomUUID(),
              weight: 0,
              reps: isCardio ? 0 : repsValue,
              durationMinutes: isCardio ? 10 : 0,
              completed: false,
            })),
            notes: ex.notes || `AI anbefaling: ${ex.reps} reps, ${ex.restTime}s hvile`,
          };
        })
        .filter((ex): ex is WorkoutExercise => ex !== null);

      console.log('Valid exercises found:', validExercises.length);

      if (validExercises.length === 0) {
        alert('Ingen gyldige øvelser funnet i treningsopplegget. Prøv å generere på nytt.');
        return;
      }

      const newSession: WorkoutSession = {
        id: crypto.randomUUID(),
        name: workout.name || 'AI-generert økt',
        date: getTodayDateString(),
        startTime: new Date().toISOString(),
        status: WorkoutStatus.ACTIVE,
        exercises: validExercises,
      };
      
      console.log('Creating new session:', newSession);
      setActiveSession(newSession);
      console.log('Switching to ACTIVE_WORKOUT screen');
      setCurrentScreen(Screen.ACTIVE_WORKOUT);
      console.log('=== handleStartGeneratedWorkout completed ===');
    } catch (error) {
      console.error('Error starting generated workout:', error);
      alert('Kunne ikke starte treningsøkten. Prøv igjen.');
    }
  };

  const handleSaveExercise = (exercise: ExerciseDefinition) => {
    if (exerciseToEdit) {
      // Update existing
      setExercises(exercises.map(e => e.id === exercise.id ? exercise : e));
    } else {
      // Create new
      setExercises([exercise, ...exercises]);
    }
    setIsCreatingExercise(false);
    setExerciseToEdit(undefined);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
    setViewingExercise(null);
  };

  const handleEditExercise = (updatedExercise: ExerciseDefinition) => {
    setExercises(exercises.map(e => e.id === updatedExercise.id ? updatedExercise : e));
    setViewingExercise(null); // Close detail modal
    // Optionally we could keep it open with the new data, but closing is simpler for now
  };

  const handleDeleteHistory = (sessionId: string) => {
    setHistory(history.filter(s => s.id !== sessionId));
  };

  const handleImportData = (data: Partial<BackupData>) => {
    if (data.profile) {
      setProfile(data.profile);
    }
    if (data.exercises) {
      setExercises(data.exercises);
    }
    if (data.history) {
      setHistory(data.history);
    }
    if ('activeSession' in data) {
      setActiveSession(data.activeSession ?? null);
    }
    setCurrentScreen(Screen.HOME);
  };

  const exportToCSV = () => {
    const headers = ['Dato', 'Økt', 'Øvelse', 'Muskelgruppe', 'Sett', 'Reps', 'Vekt (kg)', 'Varighet (min)'];
    const rows = history.flatMap(session => 
      session.exercises.flatMap(exercise => {
        const exerciseDef = exercises.find(e => e.id === exercise.exerciseDefinitionId);
        return exercise.sets.map(set => [
          new Date(session.date).toLocaleDateString('nb-NO'),
          session.name,
          exerciseDef?.name || 'Ukjent',
          exerciseDef?.muscleGroup || '',
          '',
          set.reps || '',
          set.weight || '',
          set.durationMinutes || ''
        ]);
      })
    );

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `treningshistorikk-${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Views ---

  const renderHome = () => {
    const recentWorkouts = history.slice(0, 2);

    return (
      <div className="p-4 pb-24 space-y-6">
        <header className="flex justify-between items-center mb-6 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-white">Hei {profile.name}!</h1>
            <p className="text-muted text-sm">Klar for en sunnere uke?</p>
          </div>
          <button
            onClick={handleRefresh}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all active:scale-95"
          >
            {isRefreshing ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <Heart size={20} fill="white" />
            )}
          </button>
        </header>

        {/* Stats */}
        {(() => {
          const weekStats = getWeeklyStats(history, exercises, profile.weight);

          return (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
                <div className="flex items-center space-x-1 text-secondary mb-1">
                  <TrendingUp size={14} />
                  <span className="font-bold text-[10px] uppercase tracking-wide">Uken</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {weekStats.workouts}
                  <span className="text-xs text-muted font-normal ml-1">økter</span>
                </div>
              </div>

              <div className="bg-surface p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
                <div className="flex items-center space-x-1 text-orange-400 mb-1">
                  <Flame size={14} />
                  <span className="font-bold text-[10px] uppercase tracking-wide">Kcal</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {weekStats.totalCalories || 0}
                  <span className="text-xs text-muted font-normal ml-1"></span>
                </div>
              </div>

              <div className="bg-surface p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
                <div className="flex items-center space-x-1 text-primary mb-1">
                  <Dumbbell size={14} />
                  <span className="font-bold text-[10px] uppercase tracking-wide">Løftet</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {(() => {
                    const volume = history.reduce((total, session) => {
                      return total + session.exercises.reduce((vol, ex) => {
                        return vol + ex.sets.reduce((sVol, set) => {
                          if (!set.completed || !set.weight || !set.reps) return sVol;
                          return sVol + (set.weight * set.reps);
                        }, 0);
                      }, 0);
                    }, 0);
                    return (volume / 1000).toFixed(0);
                  })()}
                  <span className="text-xs text-muted font-normal ml-1">tonn</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Recovery Insights */}
        <RecoveryInsights key={isRefreshing ? 'refreshing' : 'stable'} history={history} exercises={exercises} />

        {/* Lokale anbefalinger for treningsuken */}
        {profile.goal && (
          <section className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center">
              <Lightbulb size={20} className="mr-2 text-yellow-400" />
              Anbefalinger for deg
            </h2>
            <div className="space-y-2">
              {getRecommendations(profile, history, exercises).map((rec: string, idx: number) => (
                <div key={idx} className="text-sm text-slate-200 flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
            {/* AI Recommendations Button */}
            <button
              onClick={async () => {
                setLoadingAiRecommendations(true);
                try {
                  const response = await fetch('/api/generate-recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profile, history, exercises })
                  });
                  const data = await response.json();
                  if (data.recommendations) {
                    setAiRecommendations(data.recommendations);
                  }
                } catch (error) {
                  console.error('Failed to get AI recommendations:', error);
                } finally {
                  setLoadingAiRecommendations(false);
                }
              }}
              disabled={loadingAiRecommendations}
              className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lightbulb size={16} />
              {loadingAiRecommendations ? 'Analyserer...' : '✨ Få dypere AI-analyse'}
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-1">
              🔒 Sender treningsdata til Google Gemini API
            </p>
            {/* AI Recommendations Display */}
            {aiRecommendations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-purple-500/30 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Lightbulb size={14} />
                  AI-analyse
                </div>
                {aiRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <p className="text-sm text-slate-200 leading-relaxed">{rec}</p>
                  </div>
                ))}
                <button
                  onClick={() => setAiRecommendations([])}
                  className="text-xs text-slate-400 hover:text-white underline mt-2"
                >
                  Skjul AI-analyse
                </button>
              </div>
            )}
          </section>
        )}

        {/* Weekly Summary with Calories */}
        {profile.weight && history.length > 0 && (() => {
          const weekStats = getWeeklyStats(history, exercises, profile.weight);
          return weekStats.workouts > 0 ? (
            <section className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-800/30 rounded-xl p-5">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center">
                <Flame size={20} className="mr-2 text-orange-400" />
                Denne uken
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Økter</div>
                  <div className="text-2xl font-bold text-white">{weekStats.workouts}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Minutter</div>
                  <div className="text-2xl font-bold text-white">{weekStats.totalMinutes}</div>
                </div>
              </div>
            </section>
          ) : null;
        })()}

        {/* Quick Start Section */}
        {!activeSession && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Start trening</h2>
            <button
              onClick={handleStartSession}
              className="w-full bg-gradient-to-r from-primary to-emerald-600 p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 group"
            >
              <div className="text-left">
                <div className="font-bold text-white text-xl group-hover:underline">Start ny økt</div>
                <div className="text-emerald-100 text-sm mt-1">Velg øvelser selv og logg fremgang</div>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Play size={28} fill="currentColor" className="text-white" />
              </div>
            </button>
          </section>
        )}

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Siste aktivitet</h2>
          <div className="space-y-3">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map(session => (
                <WorkoutHistoryCard
                  key={session.id}
                  session={session}
                  exercises={exercises}
                  userWeight={profile.weight}
                  onDelete={handleDeleteHistory}
                />
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

  const renderHistory = () => {
    const parseDateString = (dateStr: string): Date => {
      if (dateStr.length === 10 && dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      const date = new Date(dateStr);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    // Filter by date range
    let filteredHistory = history;
    const now = new Date();
    
    if (historyDateFilter !== 'all') {
      const cutoffDate = new Date(now);
      if (historyDateFilter === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (historyDateFilter === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (historyDateFilter === '3months') {
        cutoffDate.setMonth(now.getMonth() - 3);
      }
      
      filteredHistory = history.filter(s => {
        const sessionDate = parseDateString(s.date);
        return sessionDate >= cutoffDate;
      });
    }

    // Filter by search query
    if (historySearchQuery.trim()) {
      const query = historySearchQuery.toLowerCase();
      filteredHistory = filteredHistory.filter(session => 
        session.name.toLowerCase().includes(query) ||
        session.exercises.some(ex => {
          const def = exercises.find(e => e.id === ex.exerciseDefinitionId);
          return def?.name.toLowerCase().includes(query) || 
                 def?.muscleGroup.toLowerCase().includes(query);
        })
      );
    }

    return (
      <div className="p-4 pb-24 space-y-4">
        <div className="flex items-center justify-between mt-2 mb-4">
          <h1 className="text-2xl font-bold text-white">Historikk</h1>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-surface border border-slate-700 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm"
            title="Eksporter til CSV"
          >
            <Download size={16} />
            CSV
          </button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Søk etter øvelse, muskelgruppe eller øktnavn..."
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              className="w-full bg-surface border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { value: 'all', label: 'Alle' },
              { value: 'week', label: 'Siste uke' },
              { value: 'month', label: 'Siste måned' },
              { value: '3months', label: 'Siste 3 mnd' }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setHistoryDateFilter(filter.value as typeof historyDateFilter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  historyDateFilter === filter.value
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-slate-400">
          Viser {filteredHistory.length} av {history.length} økter
        </div>

        {/* Overview Chart */}
        {history.length >= 2 && (
          <HistoryOverviewChart history={history} exercises={exercises} />
        )}

        {/* History cards */}
        {filteredHistory.length > 0 ? (
          filteredHistory.map(session => (
            <WorkoutHistoryCard
              key={session.id}
              session={session}
              exercises={exercises}
              userWeight={profile.weight}
              onDelete={handleDeleteHistory}
            />
          ))
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-muted">
            {historySearchQuery ? 'Ingen økter matcher søket' : 'Ingen økter i denne perioden'}
          </div>
        )}
      </div>
    );
  };

  const renderExercises = () => {
    // Group exercises by type
    const cardioExercises = exercises.filter(
      (e) => e.type === ExerciseType.CARDIO || e.type === ExerciseType.DURATION
    ).sort((a, b) => a.name.localeCompare(b.name));

    const bodyweightExercises = exercises.filter(
      (e) => e.type === ExerciseType.BODYWEIGHT
    ).sort((a, b) => a.name.localeCompare(b.name));

    const strengthExercises = exercises.filter(
      (e) => e.type === ExerciseType.WEIGHTED
    ).sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div className="p-4 pb-24 space-y-6">
        <div className="flex justify-between items-center mt-2 mb-4">
          <h1 className="text-2xl font-bold text-white">Øvelser</h1>
          <button
            onClick={() => setIsCreatingExercise(true)}
            className="bg-primary text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Kondisjon Section */}
        {cardioExercises.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-orange-400 mb-3 flex items-center">
              <Flame size={18} className="mr-2" />
              Kondisjon
            </h2>
            <div className="space-y-3">
              {cardioExercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  onSelect={(exercise) => setViewingExercise(exercise)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Kroppsvekt Section */}
        {bodyweightExercises.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-blue-400 mb-3 flex items-center">
              <User size={18} className="mr-2" />
              Kroppsvekt
            </h2>
            <div className="space-y-3">
              {bodyweightExercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  onSelect={(exercise) => setViewingExercise(exercise)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Styrke Section */}
        {strengthExercises.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-emerald-400 mb-3 flex items-center">
              <Dumbbell size={18} className="mr-2" />
              Styrke
            </h2>
            <div className="space-y-3">
              {strengthExercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  onSelect={(exercise) => setViewingExercise(exercise)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderActiveWorkout = () => {
    if (!activeSession) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="bg-slate-800 p-6 rounded-full mb-4">
            <Dumbbell size={48} className="text-muted" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Ingen aktiv økt</h2>
            <p className="text-muted">Du har ikke startet en treningsøkt enda.</p>
          </div>
          <button
            onClick={handleStartSession}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center"
          >
            <Play size={20} className="mr-2" fill="currentColor" />
            Start ny økt
          </button>
        </div>
      );
    }

    return (
      <ActiveSessionView
        session={activeSession}
        exercises={exercises}
        history={history}
        onUpdateSession={setActiveSession}
        onFinishSession={handleFinishSession}
        onCancelSession={handleCancelSession}
        onRequestCreateExercise={() => setIsCreatingExercise(true)}
      />
    );
  };

  const renderProfile = () => (
    <ProfileView
      profile={profile}
      onUpdateProfile={setProfile}
      history={history}
      exercises={exercises}
      activeSession={activeSession}
      onImportData={handleImportData}
    />
  );

  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <WelcomeScreen onEnter={() => setShowSplash(false)} />;
  }

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-background relative shadow-2xl font-sans overflow-hidden">
      <div className="h-full overflow-y-auto scrollbar-hide">
        {currentScreen === Screen.HOME && renderHome()}
        {currentScreen === Screen.HISTORY && renderHistory()}
        {currentScreen === Screen.EXERCISES && renderExercises()}
        {currentScreen === Screen.ACTIVE_WORKOUT && renderActiveWorkout()}
        {currentScreen === Screen.PROFILE && renderProfile()}
        {currentScreen === Screen.INFO && <InfoView />}
        {currentScreen === Screen.AGENT && (
          <AgentView
            profile={profile}
            history={history}
            exercises={exercises}
            onStartWorkout={handleStartGeneratedWorkout}
          />
        )}
      </div>

      {/* Exercise Detail Modal (View/Delete) */}
      {viewingExercise && (
        <ExerciseDetailModal
          exercise={viewingExercise}
          history={history}
          onClose={() => setViewingExercise(null)}
          onDelete={handleDeleteExercise}
          onEdit={(ex) => {
            setViewingExercise(null);
            setExerciseToEdit(ex);
            setIsCreatingExercise(true);
          }}
        />
      )}

      {isCreatingExercise && (
        <ExerciseFormModal
          initialExercise={exerciseToEdit}
          onSave={handleSaveExercise}
          onClose={() => {
            setIsCreatingExercise(false);
            setExerciseToEdit(undefined);
          }}
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