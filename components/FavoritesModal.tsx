import React from 'react';
import { FavoriteWorkout, ExerciseDefinition } from '../types';
import { X, Heart, Trash2, Zap, Clock, Calendar, TrendingUp } from 'lucide-react';

interface FavoritesModalProps {
  favorites: FavoriteWorkout[];
  exercises: ExerciseDefinition[];
  onClose: () => void;
  onStartWorkout: (favorite: FavoriteWorkout) => void;
  onDeleteFavorite: (id: string) => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  favorites,
  exercises,
  onClose,
  onStartWorkout,
  onDeleteFavorite,
}) => {
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Er du sikker på at du vil slette "${name}" fra favoritter?`)) {
      onDeleteFavorite(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-700/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-3 rounded-xl">
              <Heart size={24} className="text-white" fill="white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Mine Favoritter</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {favorites.length} {favorites.length === 1 ? 'lagret økt' : 'lagrede økter'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-slate-800/50 p-6 rounded-full mb-4">
                <Heart size={48} className="text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Ingen favoritter ennå
              </h3>
              <p className="text-sm text-slate-400 max-w-xs">
                Lagre AI-genererte treningsopplegg som favoritter for rask tilgang senere
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-background/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-colors"
                >
                  <div className="p-4">
                    {/* Title and Stats */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {favorite.name}
                        </h3>
                        {favorite.description && (
                          <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                            {favorite.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Zap size={12} className="text-emerald-500" />
                            <span>{favorite.exercises.length} øvelser</span>
                          </div>
                          {favorite.estimatedDuration && (
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-blue-500" />
                              <span>~{favorite.estimatedDuration} min</span>
                            </div>
                          )}
                          {favorite.timesUsed !== undefined && favorite.timesUsed > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp size={12} className="text-purple-500" />
                              <span>Brukt {favorite.timesUsed}x</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Focus Areas */}
                    {favorite.focusAreas && favorite.focusAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {favorite.focusAreas.map((area, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Exercise List (compact) */}
                    <div className="mb-3 bg-slate-900/50 rounded-lg p-2 border border-slate-800">
                      <div className="space-y-1">
                        {favorite.exercises.slice(0, 3).map((ex, idx) => {
                          const exerciseDef = exercises.find(
                            (e) => e.id === ex.exerciseDefinitionId
                          );
                          return (
                            <div
                              key={idx}
                              className="text-xs text-slate-400 flex items-center gap-2"
                            >
                              <span className="text-slate-600">•</span>
                              <span className="flex-1 truncate">
                                {exerciseDef?.name || 'Ukjent øvelse'}
                              </span>
                              <span className="text-slate-500">
                                {ex.sets.length} sett
                              </span>
                            </div>
                          );
                        })}
                        {favorite.exercises.length > 3 && (
                          <div className="text-xs text-slate-500 italic pl-4">
                            +{favorite.exercises.length - 3} til
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onStartWorkout(favorite)}
                        className="flex-1 bg-secondary text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                      >
                        <Zap size={18} />
                        Start denne økta
                      </button>
                      <button
                        onClick={() => handleDelete(favorite.id, favorite.name)}
                        className="bg-red-600/20 text-red-400 p-3 rounded-xl hover:bg-red-600/30 transition-colors border border-red-600/30"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="px-4 py-2 bg-slate-900/30 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar size={12} />
                      <span>
                        Lagret {new Date(favorite.createdDate).toLocaleDateString('nb-NO')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;
