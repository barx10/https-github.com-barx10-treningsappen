import React, { useMemo, useState } from 'react';
import { WorkoutSession, ExerciseDefinition } from '../types';
import { Calendar, Clock, Dumbbell, Trash2, Flame, ChevronDown, ChevronUp, X } from 'lucide-react';
import { calculateCaloriesBurned } from '../utils/fitnessCalculations';

interface WorkoutHistoryCardProps {
  session: WorkoutSession;
  exercises?: ExerciseDefinition[];
  userWeight?: number;
  onDelete?: (id: string) => void;
}

const WorkoutHistoryCard: React.FC<WorkoutHistoryCardProps> = ({ session, exercises, userWeight, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const duration = useMemo(() => {
    if (!session.endTime) return '';
    const start = new Date(session.startTime).getTime();
    const end = new Date(session.endTime).getTime();
    const diffMinutes = Math.round((end - start) / 60000);
    return `${diffMinutes}m`;
  }, [session.startTime, session.endTime]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm('Er du sikker på at du vil slette denne økten fra historikken?')) {
      onDelete(session.id);
    }
  };

  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const totalVolume = session.exercises.reduce((acc, ex) => {
    return acc + ex.sets.reduce((sAcc, set) => {
      if (!set.completed || !set.weight || !set.reps) return sAcc;
      return sAcc + (set.weight * set.reps);
    }, 0);
  }, 0);

  const calories = exercises && userWeight
    ? calculateCaloriesBurned(session, exercises, userWeight)
    : null;

  return (
    <>
      <div
        className="bg-surface rounded-xl p-4 border border-slate-700 shadow-sm relative group cursor-pointer hover:border-slate-600 transition-colors"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-slate-100">{session.name}</h3>
            <div className="flex items-center text-xs text-muted space-x-3 mt-1">
              <span className="flex items-center"><Calendar size={12} className="mr-1" /> {new Date(session.date).toLocaleDateString('no-NO')}</span>
              {duration && <span className="flex items-center"><Clock size={12} className="mr-1" /> {duration}</span>}
            </div>
          </div>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 bg-slate-800 hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              aria-label="Slett økt"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-muted mb-1">Sett</div>
            <div className="text-lg font-bold text-white">{totalSets}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-muted mb-1">Volum</div>
            <div className="text-lg font-bold text-white">{(totalVolume / 1000).toFixed(1)}t</div>
          </div>
          {calories !== null ? (
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-muted mb-1 flex items-center justify-center">
                <Flame size={10} className="mr-1" />
                Kcal
              </div>
              <div className="text-lg font-bold text-orange-400">{calories}</div>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-muted mb-1">Øvelser</div>
              <div className="text-lg font-bold text-white">{session.exercises.length}</div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          {session.exercises.slice(0, 3).map((ex) => {
            const def = exercises?.find(e => e.id === ex.exerciseDefinitionId);
            return (
              <div key={ex.id} className="text-sm text-slate-400 flex justify-between">
                <span>{def?.name || 'Ukjent øvelse'}</span>
                <span className="text-muted text-xs">{ex.sets.filter(s => s.completed).length} sett</span>
              </div>
            );
          })}
          {session.exercises.length > 3 && (
            <div className="text-xs text-muted italic pt-1">
              + {session.exercises.length - 3} øvelser til
            </div>
          )}
        </div>

        <div className="flex items-center justify-center mt-3 text-xs text-primary">
          <ChevronDown size={16} className="mr-1" />
          Trykk for detaljer
        </div>
      </div>

      {/* Detail Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen p-4 flex items-start justify-center pt-8">
            <div className="bg-surface rounded-2xl border border-slate-700 w-full max-w-2xl shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-slate-700 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{session.name}</h2>
                  <div className="flex items-center text-sm text-muted space-x-4">
                    <span className="flex items-center"><Calendar size={14} className="mr-1" /> {new Date(session.date).toLocaleDateString('no-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    {duration && <span className="flex items-center"><Clock size={14} className="mr-1" /> {duration}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Summary Stats */}
              <div className="p-6 bg-slate-800/30 border-b border-slate-700">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-muted uppercase tracking-wide mb-1">Øvelser</div>
                    <div className="text-2xl font-bold text-white">{session.exercises.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted uppercase tracking-wide mb-1">Sett</div>
                    <div className="text-2xl font-bold text-white">{totalSets}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted uppercase tracking-wide mb-1">Volum</div>
                    <div className="text-2xl font-bold text-white">{(totalVolume / 1000).toFixed(1)}<span className="text-sm text-muted ml-1">t</span></div>
                  </div>
                  {calories !== null && (
                    <div className="text-center">
                      <div className="text-xs text-muted uppercase tracking-wide mb-1">Kalorier</div>
                      <div className="text-2xl font-bold text-orange-400">{calories}<span className="text-sm text-muted ml-1">kcal</span></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Exercise List */}
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {session.exercises.map((ex, idx) => {
                  const def = exercises?.find(e => e.id === ex.exerciseDefinitionId);
                  return (
                    <div key={ex.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-white">{def?.name || 'Ukjent øvelse'}</h3>
                          <div className="text-xs text-muted mt-1">{def?.muscleGroup} • {def?.type}</div>
                        </div>
                        <div className="text-xs text-muted">#{idx + 1}</div>
                      </div>

                      {ex.notes && (
                        <div className="text-xs text-slate-400 italic mb-3 bg-slate-900/50 p-2 rounded">
                          {ex.notes}
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2 text-xs text-muted uppercase tracking-wide font-semibold">
                          <div>Sett</div>
                          <div className="text-center">Vekt</div>
                          <div className="text-center">Reps</div>
                          <div className="text-center">Status</div>
                        </div>
                        {ex.sets.map((set, setIdx) => (
                          <div key={set.id} className={`grid grid-cols-4 gap-2 text-sm py-2 px-2 rounded ${set.completed ? 'bg-emerald-900/20' : 'bg-slate-900/30'}`}>
                            <div className="text-slate-300">{setIdx + 1}</div>
                            <div className="text-center text-white font-mono">{set.weight ? `${set.weight} kg` : '-'}</div>
                            <div className="text-center text-white font-mono">{set.reps || (set.durationMinutes ? `${set.durationMinutes}m` : '-')}</div>
                            <div className="text-center">
                              {set.completed ? (
                                <span className="text-emerald-400 text-xs">✓ Fullført</span>
                              ) : (
                                <span className="text-slate-600 text-xs">-</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-700 flex justify-end">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-6 py-3 bg-primary hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
                >
                  Lukk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkoutHistoryCard;