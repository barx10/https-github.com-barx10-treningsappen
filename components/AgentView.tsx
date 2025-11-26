import React, { useState } from 'react';
import { Sparkles, Zap, TrendingUp, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import type { WorkoutSession, ExerciseDefinition, UserProfile } from '../types';

interface AgentViewProps {
  profile: UserProfile;
  history: WorkoutSession[];
  exercises: ExerciseDefinition[];
  onStartWorkout: (workout: GeneratedWorkout) => void;
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

const AgentView: React.FC<AgentViewProps> = ({ profile, history, exercises, onStartWorkout }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Get this week's sessions
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekHistory = history.filter(s => new Date(s.date) >= weekAgo);

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
              return {
                name: def?.name || 'Unknown',
                muscleGroup: def?.muscleGroup || 'Unknown',
                type: def?.type || 'Unknown',
                sets: e.sets.length,
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
      setGeneratedWorkout(workout);
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
      </div>

      {/* Generate Button */}
      <button
        onClick={generateWorkout}
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
                    <span className="text-sm font-bold text-purple-400">#{i + 1}</span>
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

          {/* Start Workout Button */}
          <button
            onClick={startGeneratedWorkout}
            className="w-full bg-secondary text-white py-4 rounded-xl font-semibold 
                       hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 
                       shadow-lg shadow-emerald-900/20"
          >
            <Zap size={20} />
            Start denne økten
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentView;
