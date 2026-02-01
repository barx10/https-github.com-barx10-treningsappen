import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  ExerciseDefinition,
  WorkoutSession,
  WorkoutExercise,
  Screen,
  WorkoutStatus,
  ExerciseType,
  MuscleGroup,
  UserProfile,
  BackupData,
  FavoriteWorkout
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
  saveActiveSession,
  loadCachedRecommendations,
  saveCachedRecommendations,
  loadFavoriteWorkouts,
  saveFavoriteWorkouts
} from './utils/storage';
import { loadProfile, saveProfile } from './utils/profileStorage';
import { getTodayDateString } from './utils/dateUtils';
import { calculateWeeklyVolume } from './utils/fitnessCalculations';
import BottomNav from './components/BottomNav';
import ExerciseCard from './components/ExerciseCard';
import WorkoutHistoryCard from './components/WorkoutHistoryCard';
import ActiveSessionView from './components/ActiveSessionView';
import ExerciseDetailModal from './components/ExerciseDetailModal';
import ExerciseFormModal from './components/ExerciseFormModal';
import FavoritesModal from './components/FavoritesModal';
import WelcomeScreen from './components/WelcomeScreen';
import RecoveryInsights from './components/RecoveryInsights';
import PinGate from './components/PinGate';

// Lazy load heavy components
const ProfileView = lazy(() => import('./components/ProfileView'));
const InfoView = lazy(() => import('./components/InfoView'));
const AgentView = lazy(() => import('./components/AgentView'));
const HistoryOverviewChart = lazy(() => import('./components/HistoryOverviewChart'));
const ExerciseDistributionChart = lazy(() => import('./components/ExerciseDistributionChart'));
const HistoryCalendar = lazy(() => import('./components/HistoryCalendar'));
import { getRecommendations, getWeeklyStats } from './utils/fitnessCalculations';
import { TrendingUp, Calendar, Play, Heart, Plus, Dumbbell, Lightbulb, Flame, User, RefreshCw, Search, Download, Clock, ChevronLeft } from 'lucide-react';

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
  const [favoriteWorkouts, setFavoriteWorkouts] = useState<FavoriteWorkout[]>(loadFavoriteWorkouts);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingAiRecommendations, setLoadingAiRecommendations] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState<'all' | 'week' | 'month' | '3months'>('all');
  const [historyDisplayLimit, setHistoryDisplayLimit] = useState(5); // Show 5 at a time
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);

  // Reset display limit when filter or search changes
  useEffect(() => {
    setHistoryDisplayLimit(5);
  }, [historySearchQuery, historyDateFilter]);

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

  useEffect(() => {
    saveFavoriteWorkouts(favoriteWorkouts);
  }, [favoriteWorkouts]);

  // Modals State
  const [viewingExercise, setViewingExercise] = useState<ExerciseDefinition | null>(null);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<ExerciseDefinition | undefined>(undefined);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

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

  const handleSaveFavoriteWorkout = (workout: any, name?: string) => {
    const favoriteWorkout: FavoriteWorkout = {
      id: crypto.randomUUID(),
      name: name || workout.name || 'Favoritt økt',
      exercises: workout.exercises.map((ex: any) => {
        const exercise = exercises.find(e => e.id === ex.exerciseId);
        if (!exercise) return null;

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
          notes: ex.notes || `${ex.reps} reps, ${ex.restTime}s hvile`,
        };
      }).filter((ex: WorkoutExercise | null) => ex !== null),
      createdDate: new Date().toISOString(),
      description: workout.description,
      focusAreas: workout.focusAreas,
      estimatedDuration: workout.estimatedDuration,
      timesUsed: 0,
    };

    setFavoriteWorkouts([favoriteWorkout, ...favoriteWorkouts]);
  };

  const handleDeleteFavoriteWorkout = (id: string) => {
    setFavoriteWorkouts(favoriteWorkouts.filter(f => f.id !== id));
  };

  const handleStartFavoriteWorkout = (favorite: FavoriteWorkout) => {
    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      name: favorite.name,
      date: getTodayDateString(),
      startTime: new Date().toISOString(),
      status: WorkoutStatus.ACTIVE,
      exercises: favorite.exercises.map(ex => ({
        ...ex,
        id: crypto.randomUUID(),
        sets: ex.sets.map(set => ({
          ...set,
          id: crypto.randomUUID(),
          completed: false,
        })),
      })),
    };

    // Increment times used
    setFavoriteWorkouts(favoriteWorkouts.map(f =>
      f.id === favorite.id
        ? { ...f, timesUsed: (f.timesUsed || 0) + 1 }
        : f
    ));

    setActiveSession(newSession);
    setCurrentScreen(Screen.ACTIVE_WORKOUT);
    setShowFavoritesModal(false);
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
            <div className="grid grid-cols-4 gap-3">
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
                <div className="flex items-center space-x-1 text-emerald-400 mb-1">
                  <Clock size={14} />
                  <span className="font-bold text-[10px] uppercase tracking-wide">Min</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {weekStats.totalMinutes}
                  <span className="text-xs text-muted font-normal ml-1"></span>
                </div>
              </div>

              <div className="bg-surface p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
                <div className="flex items-center space-x-1 text-primary mb-1">
                  <Dumbbell size={14} />
                  <span className="font-bold text-[10px] uppercase tracking-wide">Løftet</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {calculateWeeklyVolume(history)}
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
                  // Check cache first
                  const cachedRecs = loadCachedRecommendations();
                  if (cachedRecs) {
                    console.log('Using cached recommendations');
                    setAiRecommendations(cachedRecs);
                    setLoadingAiRecommendations(false);
                    return;
                  }

                  // No cache, make API call
                  const response = await fetch('/api/generate-recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profile, history, exercises })
                  });
                  const data = await response.json();
                  if (data.recommendations) {
                    setAiRecommendations(data.recommendations);
                    saveCachedRecommendations(data.recommendations);
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

        {/* Favorite Workouts Section */}
        {favoriteWorkouts.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart size={20} className="text-pink-500" fill="currentColor" />
                Mine favorittøkter
              </h2>
              <button
                onClick={() => setShowFavoritesModal(true)}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Se alle ({favoriteWorkouts.length})
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {favoriteWorkouts.slice(0, 3).map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 rounded-xl border border-slate-700/50 hover:border-pink-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-base mb-1 group-hover:text-pink-400 transition-colors">
                        {favorite.name}
                      </h3>
                      <div className="flex gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Dumbbell size={12} className="text-emerald-500" />
                          {favorite.exercises.length} øvelser
                        </span>
                        {favorite.estimatedDuration && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-blue-500" />
                            ~{favorite.estimatedDuration} min
                          </span>
                        )}
                        {favorite.timesUsed !== undefined && favorite.timesUsed > 0 && (
                          <span className="flex items-center gap-1">
                            <TrendingUp size={12} className="text-purple-500" />
                            {favorite.timesUsed}x
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartFavoriteWorkout(favorite)}
                    className="w-full bg-secondary text-white py-2.5 px-4 rounded-lg font-medium hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    <Zap size={16} />
                    Start denne økta
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

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
        <Suspense fallback={<div className="h-48 bg-surface rounded-xl animate-pulse" />}>
          {filteredHistory.length >= 2 && (
            <HistoryOverviewChart history={filteredHistory} exercises={exercises} />
          )}
        </Suspense>

        {/* Exercise Distribution Chart */}
        <Suspense fallback={<div className="h-48 bg-surface rounded-xl animate-pulse" />}>
          {filteredHistory.length > 0 && (
            <ExerciseDistributionChart history={filteredHistory} exercises={exercises} />
          )}
        </Suspense>

        {/* Calendar View */}
        <Suspense fallback={<div className="h-96 bg-surface rounded-xl animate-pulse" />}>
          {filteredHistory.length > 0 ? (
            <HistoryCalendar 
              history={filteredHistory} 
              exercises={exercises} 
              userWeight={profile.weight}
              onDelete={handleDeleteHistory}
            />
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-muted">
              {historySearchQuery ? 'Ingen økter matcher søket' : 'Ingen økter i denne perioden'}
            </div>
          )}
        </Suspense>
      </div>
    );
  };

  const renderExercises = () => {
    // Kategori-info med farger
    const categoryInfo: Record<MuscleGroup, { color: string; bgColor: string; iconColor: string }> = {
      [MuscleGroup.CHEST]: { color: 'text-red-400', bgColor: 'bg-red-500/20', iconColor: 'text-red-400' },
      [MuscleGroup.BACK]: { color: 'text-blue-400', bgColor: 'bg-blue-500/20', iconColor: 'text-blue-400' },
      [MuscleGroup.SHOULDERS]: { color: 'text-purple-400', bgColor: 'bg-purple-500/20', iconColor: 'text-purple-400' },
      [MuscleGroup.ARMS]: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
      [MuscleGroup.LEGS]: { color: 'text-green-400', bgColor: 'bg-green-500/20', iconColor: 'text-green-400' },
      [MuscleGroup.CORE]: { color: 'text-orange-400', bgColor: 'bg-orange-500/20', iconColor: 'text-orange-400' },
      [MuscleGroup.CARDIO]: { color: 'text-pink-400', bgColor: 'bg-pink-500/20', iconColor: 'text-pink-400' },
      [MuscleGroup.FULL_BODY]: { color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', iconColor: 'text-cyan-400' },
    };

    // Tell antall øvelser per kategori
    const getExerciseCount = (group: MuscleGroup) => {
      return exercises.filter(e => e.muscleGroup === group).length;
    };

    // Hvis ingen kategori er valgt, vis kategorioversikten
    if (!selectedMuscleGroup) {
      const muscleGroups = Object.values(MuscleGroup);

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

          <p className="text-muted text-sm">Velg en muskelgruppe for å se øvelser</p>

          <div className="grid grid-cols-2 gap-3">
            {muscleGroups.map((group) => {
              const info = categoryInfo[group];
              const count = getExerciseCount(group);

              return (
                <button
                  key={group}
                  onClick={() => setSelectedMuscleGroup(group)}
                  className={`${info.bgColor} border border-slate-700 rounded-xl p-4 text-left hover:scale-[1.02] transition-transform active:scale-[0.98]`}
                >
                  <Dumbbell size={28} className={`${info.iconColor} mb-2`} />
                  <div className={`font-bold ${info.color}`}>{group}</div>
                  <div className="text-muted text-sm">{count} øvelser</div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Vis øvelser for valgt kategori
    const filteredExercises = exercises
      .filter(e => e.muscleGroup === selectedMuscleGroup)
      .sort((a, b) => a.name.localeCompare(b.name));

    const info = categoryInfo[selectedMuscleGroup];

    return (
      <div className="p-4 pb-24 space-y-4">
        <div className="flex items-center gap-3 mt-2 mb-4">
          <button
            onClick={() => setSelectedMuscleGroup(null)}
            className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div className="flex-1 flex items-center gap-3">
            <Dumbbell size={24} className={info.iconColor} />
            <div>
              <h1 className={`text-2xl font-bold ${info.color}`}>
                {selectedMuscleGroup}
              </h1>
              <p className="text-muted text-sm">{filteredExercises.length} øvelser</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreatingExercise(true)}
            className="bg-primary text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {filteredExercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onSelect={(exercise) => setViewingExercise(exercise)}
            />
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-muted">
            Ingen øvelser i denne kategorien
          </div>
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
    <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <ProfileView
        profile={profile}
        onUpdateProfile={setProfile}
        history={history}
        exercises={exercises}
        activeSession={activeSession}
        onImportData={handleImportData}
      />
    </Suspense>
  );

  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <PinGate>
        <WelcomeScreen onEnter={() => setShowSplash(false)} />
      </PinGate>
    );
  }

  return (
    <PinGate>
    <div className="h-screen w-full max-w-md mx-auto bg-background relative shadow-2xl font-sans overflow-hidden">
      <div className="h-full overflow-y-auto scrollbar-hide">
        {currentScreen === Screen.HOME && renderHome()}
        {currentScreen === Screen.HISTORY && renderHistory()}
        {currentScreen === Screen.EXERCISES && renderExercises()}
        {currentScreen === Screen.ACTIVE_WORKOUT && renderActiveWorkout()}
        {currentScreen === Screen.PROFILE && renderProfile()}
        {currentScreen === Screen.INFO && (
          <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
            <InfoView />
          </Suspense>
        )}
        {currentScreen === Screen.AGENT && (
          <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
            <AgentView
              profile={profile}
              history={history}
              exercises={exercises}
              onStartWorkout={handleStartGeneratedWorkout}
              onSaveFavorite={handleSaveFavoriteWorkout}
            />
          </Suspense>
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

      {showFavoritesModal && (
        <FavoritesModal
          favorites={favoriteWorkouts}
          exercises={exercises}
          onClose={() => setShowFavoritesModal(false)}
          onStartWorkout={handleStartFavoriteWorkout}
          onDeleteFavorite={handleDeleteFavoriteWorkout}
        />
      )}

      <BottomNav
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        hasActiveWorkout={!!activeSession}
      />
    </div>
    </PinGate>
  );
}