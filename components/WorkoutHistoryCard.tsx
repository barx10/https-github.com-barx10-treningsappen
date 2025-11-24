import React, { useMemo } from 'react';
import { WorkoutSession, ExerciseDefinition } from '../types';
import { Calendar, Clock, Dumbbell, Trash2, Flame } from 'lucide-react';
import { calculateCaloriesBurned } from '../utils/fitnessCalculations';

interface WorkoutHistoryCardProps {
  session: WorkoutSession;
  exercises?: ExerciseDefinition[];
  userWeight?: number;
  onDelete?: (id: string) => void;
}

const WorkoutHistoryCard: React.FC<WorkoutHistoryCardProps> = ({ session, exercises, userWeight, onDelete }) => {
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
    <div className="bg-surface rounded-xl p-4 border border-slate-700 shadow-sm relative group">
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
        {session.exercises.slice(0, 3).map((ex) => (
          <div key={ex.id} className="text-sm text-slate-400 flex justify-between">
            <span>Øvelse ID: {ex.exerciseDefinitionId.replace('ex_', '#')}</span>
            <span className="text-muted text-xs">{ex.sets.filter(s => s.completed).length} sett</span>
          </div>
        ))}
        {session.exercises.length > 3 && (
          <div className="text-xs text-muted italic pt-1">
            + {session.exercises.length - 3} øvelser til
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutHistoryCard;