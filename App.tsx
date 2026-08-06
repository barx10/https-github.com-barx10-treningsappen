import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import {
  ExerciseDefinition,
  WorkoutSession,
  Screen,
  WorkoutStatus,
  MuscleGroup,
  UserProfile,
  BackupData,
  FavoriteWorkout,
  GeneratedWorkout,
  SyncStatus
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
  saveFavoriteWorkouts,
  loadSyncPending,
  saveSyncPending,
} from './utils/storage';
import { loadProfile, saveProfile } from './utils/profileStorage';
import { supabase, isSupabaseConfigured } from './utils/supabaseClient';
import { syncAll, mergeCloudIntoLocal, describeSyncError } from './utils/syncService';
import { exportJSON, isExportDue } from './utils/autoExport';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { parseDateString } from './utils/dateUtils';
import { calculateWeeklyVolume } from './utils/fitnessCalculations';
import { generateRecommendations } from './utils/aiApi';
import {
  buildExercisesFromGenerated,
  cloneExercisesForNewSession,
  createSession,
} from './utils/workoutBuilders';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import ExerciseCard from './components/ExerciseCard';
import ActiveSessionView from './components/ActiveSessionView';
import ExerciseDetailModal from './components/ExerciseDetailModal';
import ExerciseFormModal from './components/ExerciseFormModal';
import FavoritesModal from './components/FavoritesModal';
import WelcomeScreen from './components/WelcomeScreen';
import RecoveryInsights from './components/RecoveryInsights';
import PinGate from './components/PinGate';
import LoadingFallback from './components/LoadingFallback';
import { lazyWithReload } from './utils/lazyWithReload';

// Lazy load heavy components. lazyWithReload henter inn ny index.html hvis
// filen ikke finnes lenger, i stedet for å la hele appen falle sammen.
const ProfileView = lazyWithReload(() => import('./components/ProfileView'));
const InfoView = lazyWithReload(() => import('./components/InfoView'));
const AgentView = lazyWithReload(() => import('./components/AgentView'));
const HistoryOverviewChart = lazyWithReload(() => import('./components/HistoryOverviewChart'));
const ExerciseDistributionChart = lazyWithReload(() => import('./components/ExerciseDistributionChart'));
const HistoryCalendar = lazyWithReload(() => import('./components/HistoryCalendar'));
import { getRecommendations, getWeeklyStats } from './utils/fitnessCalculations';
import { TrendingUp, Play, Heart, Plus, Dumbbell, Lightbulb, Flame, RefreshCw, Search, Download, Clock, ChevronLeft, Zap } from 'lucide-react';

/** Colour scheme per muscle group on the exercise overview. */
const CATEGORY_INFO: Record<MuscleGroup, { color: string; bgColor: string; iconColor: string }> = {
  [MuscleGroup.CHEST]: { color: 'text-red-400', bgColor: 'bg-red-500/20', iconColor: 'text-red-400' },
  [MuscleGroup.BACK]: { color: 'text-blue-400', bgColor: 'bg-blue-500/20', iconColor: 'text-blue-400' },
  [MuscleGroup.SHOULDERS]: { color: 'text-purple-400', bgColor: 'bg-purple-500/20', iconColor: 'text-purple-400' },
  [MuscleGroup.ARMS]: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
  [MuscleGroup.LEGS]: { color: 'text-green-400', bgColor: 'bg-green-500/20', iconColor: 'text-green-400' },
  [MuscleGroup.CORE]: { color: 'text-orange-400', bgColor: 'bg-orange-500/20', iconColor: 'text-orange-400' },
  [MuscleGroup.CARDIO]: { color: 'text-pink-400', bgColor: 'bg-pink-500/20', iconColor: 'text-pink-400' },
  [MuscleGroup.FULL_BODY]: { color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', iconColor: 'text-cyan-400' },
};

const HISTORY_FILTERS = [
  { value: 'all', label: 'Alle' },
  { value: 'week', label: 'Siste uke' },
  { value: 'month', label: 'Siste måned' },
  { value: '3months', label: 'Siste 3 mnd' },
] as const;

type HistoryDateFilter = (typeof HISTORY_FILTERS)[number]['value'];

/** Alt som speiles til skyen. activeSession holdes utenfor med vilje. */
type SyncableState = {
  profile: UserProfile;
  exercises: ExerciseDefinition[];
  history: WorkoutSession[];
  favorites: FavoriteWorkout[];
};

/** Hvor lenge det må være stille før en endring pushes. */
const SYNC_DEBOUNCE_MS = 2000;

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
  const [aiError, setAiError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingAiRecommendations, setLoadingAiRecommendations] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState<HistoryDateFilter>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  // Modals
  const [viewingExercise, setViewingExercise] = useState<ExerciseDefinition | null>(null);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<ExerciseDefinition | undefined>(undefined);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  // Auth + Sync state
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const hasMergedRef = useRef(false);
  const syncReadyRef = useRef(false);
  const lastSyncedRef = useRef<string | null>(null);

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

  // Auth listener
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setAuthUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // On first sign-in: merge cloud data into local state
  useEffect(() => {
    if (!authUser || hasMergedRef.current) return;
    hasMergedRef.current = true;
    setSyncStatus('syncing');
    setSyncError(null);
    mergeCloudIntoLocal(
      { profile, exercises, history, favorites: favoriteWorkouts },
      authUser.id
    ).then(merged => {
      if (merged.profile) setProfile(merged.profile);
      if (merged.history) setHistory(merged.history);
      if (merged.exercises) setExercises(merged.exercises);
      if (merged.favorites) setFavoriteWorkouts(merged.favorites);
      setSyncStatus('synced');
    }).catch(error => {
      setSyncStatus('error');
      setSyncError(describeSyncError(error));
    }).finally(() => {
      // Først nå er det trygt å pushe: ellers ville auto-synken skrevet lokal
      // state tilbake til skyen mens sammenslåingen fortsatt pågikk.
      syncReadyRef.current = true;
    });
  }, [authUser]);

  // Background sync helper
  const triggerSync = (state: SyncableState) => {
    if (!authUser) return;

    // syncAll pusher hele historikken hver gang, så hopp over hvis ingenting
    // har endret seg siden forrige vellykkede synk.
    const signature = JSON.stringify(state);
    if (signature === lastSyncedRef.current) return;

    if (!navigator.onLine) { saveSyncPending(true); setSyncStatus('offline'); return; }
    setSyncStatus('syncing');
    setSyncError(null);
    syncAll(state, authUser.id)
      .then(() => {
        lastSyncedRef.current = signature;
        setSyncStatus('synced');
      })
      .catch(error => {
        setSyncStatus('error');
        setSyncError(describeSyncError(error));
        saveSyncPending(true);
      });
  };

  // Auto-synk: samler opp endringer og pusher én gang når det har vært stille
  // en stund. Dekker øvelser og favoritter, som ellers bare ble sikkerhets-
  // kopiert tilfeldigvis, neste gang du fullførte en økt.
  // activeSession er bevisst utelatt – den endrer seg for hvert sett du logger.
  useEffect(() => {
    if (!authUser || !syncReadyRef.current) return;
    const timer = setTimeout(
      () => triggerSync({ profile, exercises, history, favorites: favoriteWorkouts }),
      SYNC_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [authUser, profile, exercises, history, favoriteWorkouts]);

  // Flush pending sync when back online
  useEffect(() => {
    const handleOnline = () => {
      if (authUser && loadSyncPending()) {
        triggerSync({ profile, exercises, history, favorites: favoriteWorkouts });
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [authUser, profile, exercises, history, favoriteWorkouts]);

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

    const newHistory = [completedSession, ...history];
    setHistory(newHistory);
    setActiveSession(null);
    setCurrentScreen(Screen.HISTORY);

    // Auto-export JSON backup only when due, deferred to avoid blocking navigation
    if (isExportDue()) {
      setTimeout(() => {
        exportJSON({ profile, exercises, history: newHistory, activeSession: null });
      }, 500);
    }

    // En fullført økt er det mest verdifulle vi har, og appen blir gjerne lagt
    // vekk med én gang. Push nå i stedet for å vente på debouncen – den
    // etterfølgende auto-synken hopper over siden signaturen blir lik.
    triggerSync({ profile, exercises, history: newHistory, favorites: favoriteWorkouts });
  };

  const handleCancelSession = () => {
    if (confirm("Er du sikker på at du vil avbryte denne økten?")) {
      setActiveSession(null);
      setCurrentScreen(Screen.HOME);
    }
  };

  const handleStartGeneratedWorkout = (workout: GeneratedWorkout) => {
    const validExercises = buildExercisesFromGenerated(
      workout,
      exercises,
      (reps, rest) => `AI anbefaling: ${reps} reps, ${rest}s hvile`
    );

    if (validExercises.length === 0) {
      alert('Ingen gyldige øvelser funnet i treningsopplegget. Prøv å generere på nytt.');
      return;
    }

    setActiveSession(createSession(workout.name || 'AI-generert økt', validExercises));
    setCurrentScreen(Screen.ACTIVE_WORKOUT);
  };

  const handleSaveExercise = (exercise: ExerciseDefinition) => {
    setExercises(prev =>
      exerciseToEdit ? prev.map(e => (e.id === exercise.id ? exercise : e)) : [exercise, ...prev]
    );
    setIsCreatingExercise(false);
    setExerciseToEdit(undefined);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id));
    setViewingExercise(null);
  };

  const handleDeleteHistory = (sessionId: string) => {
    setHistory(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleSaveFavoriteWorkout = (workout: GeneratedWorkout, name?: string) => {
    const favoriteWorkout: FavoriteWorkout = {
      id: crypto.randomUUID(),
      name: name || workout.name || 'Favoritt økt',
      exercises: buildExercisesFromGenerated(workout, exercises),
      createdDate: new Date().toISOString(),
      description: workout.description,
      focusAreas: workout.focusAreas,
      estimatedDuration: workout.estimatedDuration ?? workout.totalDuration,
      timesUsed: 0,
    };

    setFavoriteWorkouts(prev => [favoriteWorkout, ...prev]);
  };

  const handleSaveSessionAsFavorite = (session: WorkoutSession) => {
    const name = prompt('Gi favorittøkten et navn:', session.name);
    if (name === null) return; // User cancelled

    const favoriteWorkout: FavoriteWorkout = {
      id: crypto.randomUUID(),
      name: name || session.name,
      exercises: cloneExercisesForNewSession(session.exercises),
      createdDate: new Date().toISOString(),
      timesUsed: 0,
    };

    setFavoriteWorkouts(prev => [favoriteWorkout, ...prev]);
    alert('Økten er lagret som favoritt! 💚');
  };

  const handleDeleteFavoriteWorkout = (id: string) => {
    setFavoriteWorkouts(prev => prev.filter(f => f.id !== id));
  };

  const handleStartFavoriteWorkout = (favorite: FavoriteWorkout) => {
    const newSession = createSession(
      favorite.name,
      cloneExercisesForNewSession(favorite.exercises)
    );

    setFavoriteWorkouts(prev =>
      prev.map(f => (f.id === favorite.id ? { ...f, timesUsed: (f.timesUsed || 0) + 1 } : f))
    );

    setActiveSession(newSession);
    setCurrentScreen(Screen.ACTIVE_WORKOUT);
    setShowFavoritesModal(false);
  };

  const handleFetchAiRecommendations = async (forceRefresh = false) => {
    setLoadingAiRecommendations(true);
    setAiError(null);

    try {
      if (!forceRefresh) {
        const cached = loadCachedRecommendations();
        if (cached) {
          setAiRecommendations(cached);
          return;
        }
      }

      const recommendations = await generateRecommendations(profile, history, exercises);
      setAiRecommendations(recommendations);
      saveCachedRecommendations(recommendations);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Kunne ikke hente AI-analyse');
    } finally {
      setLoadingAiRecommendations(false);
    }
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

  // --- Derived data ---

  const weekStats = useMemo(
    () => getWeeklyStats(history, exercises, profile.weight),
    [history, exercises, profile.weight]
  );

  const weeklyVolume = useMemo(() => calculateWeeklyVolume(history), [history]);

  const localRecommendations = useMemo(
    () => (profile.goal ? getRecommendations(profile, history, exercises) : []),
    [profile, history, exercises]
  );

  const filteredHistory = useMemo(() => {
    let result = history;

    if (historyDateFilter !== 'all') {
      const cutoffDate = new Date();
      if (historyDateFilter === 'week') cutoffDate.setDate(cutoffDate.getDate() - 7);
      if (historyDateFilter === 'month') cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      if (historyDateFilter === '3months') cutoffDate.setMonth(cutoffDate.getMonth() - 3);

      result = result.filter(s => parseDateString(s.date) >= cutoffDate);
    }

    const query = historySearchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(session =>
        session.name.toLowerCase().includes(query) ||
        session.exercises.some(ex => {
          const def = exercises.find(e => e.id === ex.exerciseDefinitionId);
          return def?.name.toLowerCase().includes(query) ||
                 def?.muscleGroup.toLowerCase().includes(query);
        })
      );
    }

    return result;
  }, [history, exercises, historyDateFilter, historySearchQuery]);

  // --- Views ---

  const renderHome = () => {
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
        <div className="grid grid-cols-4 gap-3">
          {[
            { Icon: TrendingUp, tone: 'text-secondary', label: 'Uken', value: weekStats.workouts, unit: 'økter' },
            { Icon: Flame, tone: 'text-orange-400', label: 'Kcal', value: weekStats.totalCalories || 0 },
            { Icon: Clock, tone: 'text-emerald-400', label: 'Min', value: weekStats.totalMinutes },
            { Icon: Dumbbell, tone: 'text-primary', label: 'Løftet', value: weeklyVolume, unit: 'tonn' },
          ].map(({ Icon, tone, label, value, unit }) => (
            <div key={label} className="bg-surface p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
              <div className={`flex items-center space-x-1 mb-1 ${tone}`}>
                <Icon size={14} />
                <span className="font-bold text-[10px] uppercase tracking-wide">{label}</span>
              </div>
              <div className="text-xl font-bold text-white">
                {value}
                {unit && <span className="text-xs text-muted font-normal ml-1">{unit}</span>}
              </div>
            </div>
          ))}
        </div>

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
              {localRecommendations.map((rec: string, idx: number) => (
                <div key={idx} className="text-sm text-slate-200 flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
            {/* AI Recommendations Button */}
            <button
              onClick={() => handleFetchAiRecommendations()}
              disabled={loadingAiRecommendations}
              className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lightbulb size={16} />
              {loadingAiRecommendations ? 'Analyserer...' : '✨ Få dypere AI-analyse'}
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-1">
              🔒 Sender treningsdata til Google Gemini API
            </p>
            {/* Error */}
            {aiError && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/40 rounded-lg text-xs text-red-300">
                {aiError}
              </div>
            )}
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
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => handleFetchAiRecommendations(true)}
                    disabled={loadingAiRecommendations}
                    className="text-xs text-purple-300 hover:text-white underline disabled:opacity-50"
                  >
                    Ny analyse
                  </button>
                  <button
                    onClick={() => setAiRecommendations([])}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Skjul AI-analyse
                  </button>
                </div>
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
            {HISTORY_FILTERS.map(filter => (
              <button
                key={filter.value}
                onClick={() => setHistoryDateFilter(filter.value)}
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
        <Suspense fallback={<LoadingFallback variant="block" className="h-48" />}>
          {filteredHistory.length >= 2 && (
            <HistoryOverviewChart history={filteredHistory} exercises={exercises} />
          )}
        </Suspense>

        {/* Exercise Distribution Chart */}
        <Suspense fallback={<LoadingFallback variant="block" className="h-48" />}>
          {filteredHistory.length > 0 && (
            <ExerciseDistributionChart history={filteredHistory} exercises={exercises} />
          )}
        </Suspense>

        {/* Calendar View */}
        <Suspense fallback={<LoadingFallback variant="block" className="h-96" />}>
          {filteredHistory.length > 0 ? (
            <HistoryCalendar
              history={filteredHistory}
              exercises={exercises}
              userWeight={profile.weight}
              onDelete={handleDeleteHistory}
              onSaveAsFavorite={handleSaveSessionAsFavorite}
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
              const info = CATEGORY_INFO[group];
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

    const info = CATEGORY_INFO[selectedMuscleGroup];

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
        onSaveAsFavorite={handleSaveSessionAsFavorite}
      />
    );
  };

  const renderProfile = () => (
    <Suspense fallback={<LoadingFallback />}>
      <ProfileView
        profile={profile}
        onUpdateProfile={setProfile}
        history={history}
        exercises={exercises}
        activeSession={activeSession}
        onImportData={handleImportData}
        authUser={authUser}
        syncStatus={syncStatus}
        syncError={syncError}
        onShowAuthModal={() => setShowAuthModal(true)}
        onSignOut={async () => { await supabase.auth.signOut(); setAuthUser(null); hasMergedRef.current = false; setSyncStatus('idle'); setSyncError(null); }}
      />
    </Suspense>
  );

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
          <Suspense fallback={<LoadingFallback />}>
            <InfoView />
          </Suspense>
        )}
        {currentScreen === Screen.AGENT && (
          <Suspense fallback={<LoadingFallback />}>
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

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
    </PinGate>
  );
}