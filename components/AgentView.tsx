import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, TrendingUp, Calendar, AlertCircle, Loader2, RefreshCw, X, Heart } from 'lucide-react';
import type { WorkoutSession, ExerciseDefinition, UserProfile } from '../types';
import { loadCachedWorkout, saveCachedWorkout, clearCachedWorkout } from '../utils/storage';

interface AgentViewProps {
  profile: UserProfile;
  history: WorkoutSession[];
  exercises: ExerciseDefinition[];
  onStartWorkout: (workout: GeneratedWorkout) => void;
  onSaveFavorite?: (workout: GeneratedWorkout, name?: string) => void;
}

interface GeneratedWorkout {
  name: string;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    reps: string;
    restTime: number;
    notes?: string;
  }>;
  totalDuration: number;
  focusAreas: string[];
  reasoning: string;
}

const AgentView: React.FC<AgentViewProps> = ({ profile, history, exercises, onStartWorkout, onSaveFavorite }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [swappingExerciseIndex, setSwappingExerciseIndex] = useState<number | null>(null);
  const [alternativeExercises, setAlternativeExercises] = useState<ExerciseDefinition[]>([]);
  const [isCached, setIsCached] = useState(false);

  const generateWorkout = async (forceRefresh = false) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Get this week's sessions (from Monday)
      const getStartOfWeek = () => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      const parseDateString = (dateStr: string): Date => {
        if (dateStr.length === 10 && dateStr.includes('-')) {
          const [year, month, day] = dateStr.split('-').map(Number);
          return new Date(year, month - 1, day);
        }
        const date = new Date(dateStr);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      };

      const startOfWeek = getStartOfWeek();
      const weekHistory = history.filter(s => {
        const sessionDate = parseDateString(s.date);
        return sessionDate >= startOfWeek && s.status === 'Fullført';
      });

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedWorkout = loadCachedWorkout(weekHistory);
        if (cachedWorkout) {
          console.log('Using cached workout');
          setGeneratedWorkout(cachedWorkout);
          setIsCached(true);
          setIsGenerating(false);
          return;
        }
      }

      setIsCached(false);

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      console.log('Sending request to /api/generate-workout...');

      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            goal: profile.goal || 'general',
            age: profile.age,
            weight: profile.weight,
            gender: profile.gender,
          },
          weekHistory: weekHistory.map(s => ({
            date: s.date,
            exercises: s.exercises.map(e => {
              const def = exercises.find(ex => ex.id === e.exerciseDefinitionId);
              const completedSets = e.sets.filter(set => set.completed);
              const totalVolume = completedSets.reduce((sum, set) =>
                sum + ((set.weight || 0) * (set.reps || 0)), 0);
              const maxWeight = Math.max(...completedSets.map(set => set.weight || 0), 0);
              const totalReps = completedSets.reduce((sum, set) => sum + (set.reps || 0), 0);

              return {
                name: def?.name || 'Unknown',
                muscleGroup: def?.muscleGroup || 'Unknown',
                type: def?.type || 'Unknown',
                setsCompleted: completedSets.length,
                setsPlanned: e.sets.length,
                totalReps,
                maxWeight,
                totalVolume,
                setDetails: completedSets.map(set => ({
                  weight: set.weight || 0,
                  reps: set.reps || 0,
                })),
              };
            }),
          })),
          availableExercises: exercises.map(e => ({
            id: e.id,
            name: e.name,
            type: e.type,
            muscleGroup: e.muscleGroup,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API feil (${response.status}): ${errorText}`);
      }

      const workout: GeneratedWorkout = await response.json();
      console.log('Workout generated:', workout);
      
      // Save to cache
      saveCachedWorkout(workout, weekHistory);
      
      setGeneratedWorkout(workout);
      setIsCached(false);
    } catch (err) {
      console.error('Error generating workout:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Forespørselen tok for lang tid. Prøv igjen.');
      } else {
        setError(err instanceof Error ? err.message : 'Kunne ikke generere treningsopplegg');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const startGeneratedWorkout = () => {
    if (!generatedWorkout) return;
    onStartWorkout(generatedWorkout);
  };

  const saveFavoriteWorkout = () => {
    if (!generatedWorkout || !onSaveFavorite) return;

    const name = prompt('Gi favorittøkten et navn:', generatedWorkout.name);
    if (name === null) return; // User cancelled

    onSaveFavorite(generatedWorkout, name || generatedWorkout.name);
    alert('Økten er lagret som favoritt! 💚');
  };

  const handleSwapExercise = (exerciseIndex: number) => {
    if (!generatedWorkout) return;
    
    const currentExercise = exercises.find(e => e.id === generatedWorkout.exercises[exerciseIndex].exerciseId);
    if (!currentExercise) return;

    // Find alternative exercises from same muscle group (include secondary matches)
    const alternatives = exercises
      .filter(e => {
        if (e.id === currentExercise.id) return false;
        
        // Match if primary muscle groups match
        if (e.muscleGroup === currentExercise.muscleGroup) return true;
        
        // Match if current exercise's primary is in alternative's secondaries
        if (e.secondaryMuscleGroups?.includes(currentExercise.muscleGroup)) return true;
        
        // Match if alternative's primary is in current exercise's secondaries
        if (currentExercise.secondaryMuscleGroups?.includes(e.muscleGroup)) return true;
        
        return false;
      })
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, 3); // Take 3 random alternatives

    setAlternativeExercises(alternatives);
    setSwappingExerciseIndex(exerciseIndex);
  };

  const replaceExercise = (newExerciseId: string) => {
    if (!generatedWorkout || swappingExerciseIndex === null) return;

    const updatedExercises = [...generatedWorkout.exercises];
    updatedExercises[swappingExerciseIndex] = {
      ...updatedExercises[swappingExerciseIndex],
      exerciseId: newExerciseId,
    };

    setGeneratedWorkout({
      ...generatedWorkout,
      exercises: updatedExercises,
    });

    // Close swap modal
    setSwappingExerciseIndex(null);
    setAlternativeExercises([]);
  };

  const cancelSwap = () => {
    setSwappingExerciseIndex(null);
    setAlternativeExercises([]);
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      <header className="flex items-center space-x-3 mb-6 mt-2">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Sparkles size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Trenings-Agent</h1>
          <p className="text-muted text-sm">Personlig treningsopplegg med AI</p>
        </div>
      </header>

      {/* Info Card */}
      <div className="bg-surface rounded-xl border border-slate-700 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Zap size={20} className="text-yellow-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">Hvordan det fungerer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-agenten analyserer din profil, treningsmål og denne ukens aktivitet for å lage 
              et personlig treningsopplegg tilpasset deg. Den tar hensyn til restitusjon, 
              muskelgruppebalanse og dine tidligere økter.
            </p>
          </div>
        </div>
        
        {/* Privacy Notice */}
        <div className="flex items-start gap-2 pt-2 border-t border-slate-700/50">
          <span className="text-xs">🔒</span>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Ved å bruke AI-funksjonen sender vi din treningshistorikk og profil til Google Gemini API for analyse. 
            Ingen personidentifiserbar informasjon (navn, e-post) sendes. Data lagres ikke permanent.
          </p>
        </div>

        {/* AI Model Info */}
        <div className="flex items-center gap-2 pt-2 text-[10px] text-slate-600">
          <Sparkles size={10} />
          <span>Modell: gemini-3-flash-preview</span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={() => generateWorkout(false)}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl 
                   font-semibold flex items-center justify-center gap-2 hover:from-purple-700 
                   hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                   shadow-lg shadow-purple-900/20"
      >
        {isGenerating ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Genererer treningsopplegg...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Generer nytt treningsopplegg
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-400 mb-1">Feil</h3>
            <p className="text-xs text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Generated Workout */}
      {generatedWorkout && (
        <div className="space-y-4">
          {/* Cache Badge with Force Refresh */}
          {isCached && (
            <div className="flex items-center justify-between px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-blue-400" />
                <span className="text-xs text-blue-300">Lagret opplegg fra i dag</span>
              </div>
              <button
                onClick={() => generateWorkout(true)}
                disabled={isGenerating}
                className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-xs text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
                title="Generer helt nytt opplegg"
              >
                <RefreshCw size={12} />
                <span>Generer nytt</span>
              </button>
            </div>
          )}
          
          {/* Workout Header */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-5 space-y-3">
            <h2 className="text-lg font-bold text-white">{generatedWorkout.name}</h2>
            
            {generatedWorkout.focusAreas && generatedWorkout.focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {generatedWorkout.focusAreas.map((area, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                    {area}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-300 pt-2">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{generatedWorkout.exercises?.length || 0} øvelser</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={16} />
                <span>~{generatedWorkout.totalDuration || 0} min</span>
              </div>
            </div>

            {generatedWorkout.reasoning && (
              <p className="text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-700">
                {generatedWorkout.reasoning}
              </p>
            )}
          </div>

          {/* Exercises */}
          {generatedWorkout.exercises && generatedWorkout.exercises.length > 0 && (
            <div className="space-y-3">
              {generatedWorkout.exercises.map((ex, i) => {
              const exercise = exercises.find(e => e.id === ex.exerciseId);
              if (!exercise) return null;

              return (
                <div key={i} className="bg-surface rounded-xl border border-slate-700 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{exercise.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{exercise.muscleGroup}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-purple-400">#{i + 1}</span>
                      <button
                        onClick={() => handleSwapExercise(i)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Bytt øvelse"
                      >
                        <RefreshCw size={16} className="text-slate-400 hover:text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-slate-300">
                    <div>
                      <span className="text-slate-500">Sett:</span> {ex.sets}
                    </div>
                    <div>
                      <span className="text-slate-500">Reps:</span> {ex.reps}
                    </div>
                    <div>
                      <span className="text-slate-500">Hvile:</span> {ex.restTime}s
                    </div>
                  </div>

                  {ex.notes && (
                    <p className="text-xs text-slate-400 mt-2 italic">{ex.notes}</p>
                  )}
                </div>
              );
            })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={startGeneratedWorkout}
              className="flex-1 bg-secondary text-white py-4 rounded-xl font-semibold
                         hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2
                         shadow-lg shadow-emerald-900/20"
            >
              <Zap size={20} />
              Start denne økten
            </button>
            {onSaveFavorite && (
              <button
                onClick={saveFavoriteWorkout}
                className="px-6 py-4 bg-gradient-to-br from-pink-600 to-rose-600 text-white rounded-xl font-semibold
                           hover:from-pink-500 hover:to-rose-500 transition-colors flex items-center justify-center gap-2
                           shadow-lg shadow-pink-900/20"
                title="Lagre som favoritt"
              >
                <Heart size={20} />
              </button>
            )}
            <button
              onClick={() => generateWorkout(true)}
              disabled={isGenerating}
              className="px-6 py-4 bg-slate-700 text-white rounded-xl font-semibold 
                         hover:bg-slate-600 transition-colors flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generer nytt opplegg"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Exercise Swap Modal */}
      {swappingExerciseIndex !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={cancelSwap}>
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Bytt til annen øvelse</h3>
              <button onClick={cancelSwap} className="p-1 hover:bg-slate-700 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {alternativeExercises.length > 0 ? (
              <div className="space-y-2">
                {alternativeExercises.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => replaceExercise(alt.id)}
                    className="w-full bg-surface border border-slate-700 hover:border-purple-500 rounded-lg p-4 text-left transition-all hover:scale-[1.02]"
                  >
                    <div className="font-semibold text-white">{alt.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{alt.muscleGroup} • {alt.type}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>Ingen alternative øvelser funnet for denne muskelgruppen.</p>
              </div>
            )}

            <button
              onClick={cancelSwap}
              className="w-full bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentView;
