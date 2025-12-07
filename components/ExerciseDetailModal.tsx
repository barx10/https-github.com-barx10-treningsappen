import React from 'react';
import { ExerciseDefinition } from '../types';
import { X, Activity, Info, Trash2, Edit } from 'lucide-react';

import ExerciseProgressChart from './ExerciseProgressChart';
import { WorkoutSession } from '../types';

interface ExerciseDetailModalProps {
  exercise: ExerciseDefinition;
  history?: WorkoutSession[];
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (exercise: ExerciseDefinition) => void;
}

const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise, history, onClose, onDelete, onEdit }) => {

  const handleDelete = () => {
    if (confirm(`Er du sikker på at du vil slette "${exercise.name}" fra øvelsesbanken?`)) {
      if (onDelete) onDelete(exercise.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-surface w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Image Area */}
        <div className="p-4 pb-0">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="aspect-square bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden">
              {exercise.imageUrl ? (
                <img
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center text-muted">
                  <Activity size={48} className="mb-2 opacity-50" />
                  <span className="text-xs">Ingen illustrasjon</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Title Area */}
        <div className="px-4 pt-3">
          <div className="inline-block px-2 py-1 rounded-lg bg-primary/20 border border-primary/30 text-primary text-xs font-bold mb-1">
            {exercise.muscleGroup}
          </div>
          <h2 className="text-xl font-bold text-white">{exercise.name}</h2>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {history && (
            <div className="mb-4">
              <ExerciseProgressChart exerciseId={exercise.id} history={history} />
            </div>
          )}

          <div className="flex items-start space-x-3 bg-background/50 p-3 rounded-lg border border-slate-700/50">
            <Info size={20} className="text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Beskrivelse</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {exercise.description || "Ingen beskrivelse tilgjengelig for denne øvelsen enda."}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
            <div className="text-xs text-muted">
              Type: <span className="text-slate-300">{exercise.type}</span>
            </div>
            {exercise.isCustom && (
              <span className="text-xs text-secondary italic">Egen øvelse</span>
            )}
          </div>

          {onEdit && exercise.isCustom && (
            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <button
                onClick={() => onEdit(exercise)}
                className="w-full flex items-center justify-center space-x-2 p-3 text-blue-400 bg-blue-900/10 hover:bg-blue-900/20 border border-blue-900/30 rounded-xl transition-colors text-sm font-medium"
              >
                <Edit size={16} />
                <span>Rediger øvelse</span>
              </button>
            </div>
          )}

          {onDelete && (
            <div className="pt-2 mt-2">
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center space-x-2 p-3 text-red-400 bg-red-900/10 hover:bg-red-900/20 border border-red-900/30 rounded-xl transition-colors text-sm font-medium"
              >
                <Trash2 size={16} />
                <span>Slett øvelse</span>
              </button>
              <p className="text-[10px] text-muted text-center mt-2">
                Dette fjerner øvelsen fra listen din, men beholder den i historikken.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailModal;