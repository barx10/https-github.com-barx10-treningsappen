import React, { useState, useEffect, useRef } from 'react';
import {
  WorkoutSession,
  WorkoutExercise,
  ExerciseDefinition,
  WorkoutSet,
  ExerciseType,
  WorkoutStatus
} from '../types';
import { Plus, Trash2, Check, Search, X, Clock, TrendingUp } from 'lucide-react';
import PRCelebration from './PRCelebration';
import { calculatePersonalRecords, checkPRStatus } from '../utils/prTracking';
import RestTimer from './RestTimer';

interface ActiveSessionViewProps {
  session: WorkoutSession | null;
  exercises: ExerciseDefinition[];
  history: WorkoutSession[];
  onUpdateSession: (session: WorkoutSession) => void;
  onFinishSession: () => void;
  onCancelSession: () => void;
  onRequestCreateExercise: () => void;
}

const ActiveSessionView: React.FC<ActiveSessionViewProps> = ({
  session,
  exercises,
  history,
  onUpdateSession,
  onFinishSession,
  onCancelSession,
  onRequestCreateExercise
}) => {
  const [isExerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  const exerciseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [prCelebration, setPRCelebration] = useState<{ exerciseName: string; prType: 'weight' | 'reps' | 'volume'; value: number } | null>(null);
  
  // Calculate PRs including current session's completed sets
  const personalRecords = React.useMemo(() => {
    // Include current session in history for PR calculation if it has completed sets
    const historyWithCurrent = session && session.exercises.some(ex => ex.sets.some(s => s.completed))
      ? [...history, { ...session, status: WorkoutStatus.COMPLETED }]
      : history;
    return calculatePersonalRecords(historyWithCurrent, exercises);
  }, [history, exercises, session]);

  // Timer Logic
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      const start = new Date(session.startTime).getTime();
      const now = new Date().getTime();
      setElapsedTime(Math.floor((now - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) return null;

  const handleAddExercise = (def: ExerciseDefinition) => {
    const isCardioOrTime = def.type === ExerciseType.CARDIO || def.type === ExerciseType.DURATION;

    // Find last session with this exercise
    const lastSessionWithExercise = history.find(s =>
      s.exercises.some(e => e.exerciseDefinitionId === def.id)
    );

    let initialSets: WorkoutSet[] = [];
    let notes = '';

    if (lastSessionWithExercise) {
      const lastExercise = lastSessionWithExercise.exercises.find(e => e.exerciseDefinitionId === def.id);
      if (lastExercise && lastExercise.sets.length > 0) {
        initialSets = lastExercise.sets.map(s => ({
          id: crypto.randomUUID(),
          weight: s.weight,
          reps: s.reps,
          durationMinutes: s.durationMinutes,
          completed: false
        }));
        notes = `Sist: ${new Date(lastSessionWithExercise.date).toLocaleDateString('no-NO')}`;
      }
    }

    if (initialSets.length === 0) {
      initialSets = [
        {
          id: crypto.randomUUID(),
          weight: 0,
          reps: isCardioOrTime ? 0 : 10,
          durationMinutes: isCardioOrTime ? 10 : 0,
          completed: false
        }
      ];
    }

    const newExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      exerciseDefinitionId: def.id,
      sets: initialSets,
      notes: notes
    };
    onUpdateSession({
      ...session,
      exercises: [...session.exercises, newExercise]
    });
    setExerciseModalOpen(false);
    setSearchQuery("");
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...session.exercises];
    const previousSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];

    updatedExercises[exerciseIndex].sets.push({
      id: crypto.randomUUID(),
      weight: previousSet ? previousSet.weight : 0,
      reps: previousSet ? previousSet.reps : 0,
      durationMinutes: previousSet ? previousSet.durationMinutes : 0,
      completed: false
    });
    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  const removeExercise = (exerciseId: string, shouldConfirm = true) => {
    if (shouldConfirm && !confirm('Fjern denne øvelsen fra økten?')) return;
    onUpdateSession({
      ...session,
      exercises: session.exercises.filter(ex => ex.id !== exerciseId)
    });
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...session.exercises];
    const targetExercise = updatedExercises[exerciseIndex];
    if (!targetExercise) return;

    if (targetExercise.sets.length === 1) {
      if (confirm('Dette er siste sett. Vil du fjerne hele øvelsen?')) {
        removeExercise(targetExercise.id, false);
      }
      return;
    }

    targetExercise.sets = targetExercise.sets.filter((_, idx) => idx !== setIndex);
    updatedExercises[exerciseIndex] = targetExercise;
    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  const handleUpdateSet = (exIndex: number, setIndex: number, field: keyof WorkoutSet, value: number | boolean) => {
    const updatedExercises = [...session.exercises];
    const updatedSet = {
      ...updatedExercises[exIndex].sets[setIndex],
      [field]: value
    };
    updatedExercises[exIndex].sets[setIndex] = updatedSet;
    
    // Check for PR when completing a set
    if (field === 'completed' && value === true) {
      const exerciseId = updatedExercises[exIndex].exerciseDefinitionId;
      const prComparisons = checkPRStatus(exerciseId, updatedSet, personalRecords);
      
      // Show celebration for new PRs
      const newPR = prComparisons.find(c => c.isNewPR);
      if (newPR) {
        const exerciseName = exercises.find(e => e.id === exerciseId)?.name || '';
        setPRCelebration({
          exerciseName,
          prType: newPR.type,
          value: newPR.currentValue
        });
      }
    }
    
    onUpdateSession({ ...session, exercises: updatedExercises });
    
    // Set as current exercise and scroll to it
    if (field === 'completed' || currentExerciseIndex !== exIndex) {
      setCurrentExerciseIndex(exIndex);
      setTimeout(() => {
        exerciseRefs.current[exIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: Custom/Newest first? Or just alphabetical. Let's stick to default sort from props.

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-slate-800 shadow-md">
        <div className="p-4 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg text-white">{session.name}</h2>
            <div className="text-secondary font-mono text-sm font-medium flex items-center">
              <Clock size={14} className="mr-1" />
              {formatTime(elapsedTime)}
            </div>
          </div>
          <button
            onClick={onFinishSession}
            className="bg-secondary text-surface px-5 py-2 rounded-full font-bold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20"
          >
            Fullfør Økt
          </button>
        </div>
        <div className="px-4 pb-3">
          <RestTimer />
        </div>
      </div>

      {/* Exercises List */}
      <div className="p-4 space-y-6">
        {session.exercises.map((workoutExercise, exIndex) => {
          const def = exercises.find(e => e.id === workoutExercise.exerciseDefinitionId);
          if (!def) return null;

          const isCardio = def.type === ExerciseType.CARDIO || def.type === ExerciseType.DURATION;
          const isBodyweight = def.type === ExerciseType.BODYWEIGHT;
          const isCurrent = currentExerciseIndex === exIndex;

          return (
            <div 
              key={workoutExercise.id} 
              ref={(el) => { exerciseRefs.current[exIndex] = el; }}
              className={`bg-surface rounded-xl overflow-hidden border shadow-sm transition-all ${
                isCurrent ? 'border-primary ring-2 ring-primary/50' : 'border-slate-700'
              }`}
            >
              <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-blue-100">{def.name}</h3>
                  {workoutExercise.notes && (
                    <p className="text-xs text-muted mt-1 italic">{workoutExercise.notes}</p>
                  )}
                </div>
                <button
                  className="text-red-400 hover:text-red-200 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  onClick={() => removeExercise(workoutExercise.id)}
                  aria-label="Fjern øvelse"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-2">
                {/* Headers based on type */}
                <div className="grid grid-cols-10 gap-2 mb-2 px-2 text-[10px] uppercase tracking-wider text-muted font-semibold text-center">
                  <div className="col-span-1">#</div>
                  <div className="col-span-3">
                    {isCardio ? 'Minutter' : 'Kg / Motstand'}
                  </div>
                  <div className="col-span-3">
                    {isCardio ? 'Ferdig?' : 'Reps'}
                  </div>
                  <div className="col-span-3"></div>
                </div>

                {workoutExercise.sets.map((set, setIndex) => {
                  // Check PR status for this set
                  const prComparisons = set.weight || set.reps ? checkPRStatus(def.id, set, personalRecords) : [];
                  const nearPR = prComparisons.find(c => c.isNearPR);
                  const isPR = prComparisons.find(c => c.isNewPR);
                  
                  return (
                  <div key={set.id} className={`grid grid-cols-10 gap-2 mb-2 items-center transition-colors rounded-lg p-1 ${set.completed ? 'bg-secondary/10' : ''}`}>
                    <div className="col-span-1 text-center font-mono text-sm text-muted">{setIndex + 1}</div>

                    {/* Input 1: Weight / Duration */}
                    <div className="col-span-3">
                      {isCardio ? (
                        <input
                          type="number"
                          value={set.durationMinutes || ''}
                          placeholder="Min"
                          onChange={(e) => handleUpdateSet(exIndex, setIndex, 'durationMinutes', parseFloat(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-background border border-slate-700 rounded p-2 text-center font-mono focus:border-primary focus:outline-none"
                        />
                      ) : (
                        !isBodyweight && (
                          <input
                            type="number"
                            value={set.weight || ''}
                            placeholder="Kg"
                            onChange={(e) => handleUpdateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value))}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-background border border-slate-700 rounded p-2 text-center font-mono focus:border-primary focus:outline-none"
                          />
                        )
                      )}
                      {isBodyweight && <div className="text-xs text-center text-muted">-</div>}
                    </div>

                    {/* Input 2: Reps / Checkbox fallback for Cardio */}
                    <div className="col-span-3">
                      {!isCardio ? (
                        <input
                          type="number"
                          value={set.reps || ''}
                          placeholder="0"
                          onChange={(e) => handleUpdateSet(exIndex, setIndex, 'reps', parseFloat(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-background border border-slate-700 rounded p-2 text-center font-mono focus:border-primary focus:outline-none"
                        />
                      ) : (
                        <div className="flex justify-center items-center h-full text-xs text-muted">
                          {set.durationMinutes ? 'Tid' : '-'}
                        </div>
                      )}
                    </div>

                    {/* Checkbox Button */}
                    <div className="col-span-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleUpdateSet(exIndex, setIndex, 'completed', !set.completed)}
                        className={`h-10 flex-1 rounded-lg flex items-center justify-center transition-all ${set.completed
                          ? 'bg-secondary text-white shadow-lg shadow-emerald-900/20 scale-105'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                      >
                        {set.completed ? <Check size={20} strokeWidth={3} /> : <Check size={18} />}
                      </button>
                      <button
                        onClick={() => handleRemoveSet(exIndex, setIndex)}
                        className="h-10 w-10 rounded-lg flex items-center justify-center bg-slate-800 text-slate-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                        aria-label="Slett sett"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    {/* PR Indicator */}
                    {(nearPR || isPR) && (
                      <div className="col-span-10 text-center text-xs mt-1">
                        {isPR && (
                          <div className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/30">
                            <TrendingUp size={12} />
                            <span className="font-semibold">NY PR! 🏆</span>
                          </div>
                        )}
                        {!isPR && nearPR && (
                          <div className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                            <TrendingUp size={12} />
                            <span>På vei mot PR - {Math.round(nearPR.percentageOfPR)}%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })}

                <button
                  onClick={() => handleAddSet(exIndex)}
                  className="w-full py-3 mt-2 flex items-center justify-center text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg border border-dashed border-primary/30 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  {isCardio ? 'Legg til intervall / runde' : 'Legg til sett'}
                </button>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => setExerciseModalOpen(true)}
          className="w-full py-4 bg-surface border border-slate-700 hover:border-primary text-text rounded-xl flex flex-col items-center justify-center transition-all shadow-sm"
        >
          <Plus size={24} className="mb-2 text-primary" />
          <span className="font-semibold">Legg til øvelse</span>
        </button>

        <div className="pt-8 pb-4 flex justify-center">
          <button
            onClick={onCancelSession}
            className="text-red-500 text-sm font-medium hover:text-red-400 flex items-center opacity-80 hover:opacity-100"
          >
            <Trash2 size={14} className="mr-1" /> Avbryt økt
          </button>
        </div>
      </div>

      {/* Add Exercise Search Modal */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center gap-3 bg-slate-900">
            <Search className="text-muted" size={20} />
            <input
              autoFocus
              type="text"
              placeholder="Søk etter øvelser..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-lg placeholder:text-slate-600 text-white"
            />
            <button onClick={() => setExerciseModalOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <button
              onClick={() => onRequestCreateExercise()}
              className="w-full p-4 mb-4 bg-primary/10 border border-primary/50 rounded-xl flex items-center justify-center text-primary font-bold"
            >
              <Plus size={18} className="mr-2" /> Lag ny øvelse
            </button>

            {filteredExercises.map(ex => (
              <button
                key={ex.id}
                onClick={() => handleAddExercise(ex)}
                className="w-full text-left p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-500 flex justify-between items-center group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">{ex.name}</div>
                  <div className="text-xs text-muted">{ex.muscleGroup} • {ex.type}</div>
                </div>
                <Plus size={18} className="text-muted group-hover:text-white" />
              </button>
            ))}
            {filteredExercises.length === 0 && (
              <div className="text-center text-muted mt-10">Ingen øvelser funnet.</div>
            )}
          </div>
        </div>
      )}
      
      {/* PR Celebration */}
      {prCelebration && (
        <PRCelebration
          exerciseName={prCelebration.exerciseName}
          prType={prCelebration.prType}
          value={prCelebration.value}
          onClose={() => setPRCelebration(null)}
        />
      )}
    </div>
  );
};

export default ActiveSessionView;