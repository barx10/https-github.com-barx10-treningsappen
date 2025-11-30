import React from 'react';
import { WorkoutSession, ExerciseDefinition } from '../types';
import { Heart, AlertTriangle, Calendar } from 'lucide-react';
import { 
  calculateMuscleGroupRecovery, 
  findNeglectedMuscleGroups,
  getMuscleGroupEmoji,
  MuscleGroupRecovery 
} from '../utils/recoveryCalculations';

interface RecoveryInsightsProps {
  history: WorkoutSession[];
  exercises: ExerciseDefinition[];
}

const RecoveryInsights: React.FC<RecoveryInsightsProps> = ({ history, exercises }) => {
  const recovery = calculateMuscleGroupRecovery(history, exercises);
  const neglected = findNeglectedMuscleGroups(recovery);

  // Sort by days since last trained (most recent first)
  const sortedRecovery = [...recovery].sort((a, b) => 
    a.daysSinceLastTrained - b.daysSinceLastTrained
  );

  const getStatusColor = (status: MuscleGroupRecovery['status']) => {
    switch (status) {
      case 'fresh':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'warning':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
      case 'ready':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'overdue':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
    }
  };

  const getStatusIcon = (status: MuscleGroupRecovery['status']) => {
    switch (status) {
      case 'fresh':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'ready':
        return '✨';
      case 'overdue':
        return '🔴';
    }
  };

  return (
    <div className="space-y-4">
      {/* Warnings Section */}
      {neglected.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-red-300">Restitusjonstips</h3>
          </div>
          <div className="space-y-2">
            {neglected.map(warning => (
              <div key={warning.muscleGroup} className="text-sm text-red-200 flex items-start gap-2">
                <span className="text-base">{getMuscleGroupEmoji(warning.muscleGroup)}</span>
                <span>{warning.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recovery Status Grid */}
      <div className="bg-surface rounded-xl border border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-white">Muskelhelse</h3>
        </div>

        <div className="grid gap-2">
          {sortedRecovery.map(item => (
            <div
              key={item.muscleGroup}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${getStatusColor(item.status)}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getMuscleGroupEmoji(item.muscleGroup)}</span>
                <div>
                  <div className="font-medium text-sm">{item.muscleGroup}</div>
                  <div className="text-xs opacity-80">{item.message}</div>
                </div>
              </div>
              <div className="text-lg">
                {getStatusIcon(item.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-300">
            {recovery.filter(r => r.status === 'fresh').length}
          </div>
          <div className="text-xs text-green-200 mt-1">Fersk</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-300">
            {recovery.filter(r => r.status === 'ready').length}
          </div>
          <div className="text-xs text-blue-200 mt-1">Klar</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-300">
            {recovery.filter(r => r.status === 'overdue').length}
          </div>
          <div className="text-xs text-red-200 mt-1">Forsømt</div>
        </div>
      </div>

      {/* Recovery Tips */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h4 className="text-sm font-medium text-slate-300">Restitusjonsguide</h4>
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <p>✅ <span className="text-green-300">Fersk</span>: Trent i dag</p>
          <p>⚠️ <span className="text-orange-300">Advarsel</span>: Trent i går - vurder hvile</p>
          <p>✨ <span className="text-blue-300">Klar</span>: God restitusjon, klar for trening</p>
          <p>🔴 <span className="text-red-300">Forsømt</span>: Lenge siden sist, prioriter denne!</p>
        </div>
      </div>
    </div>
  );
};

export default RecoveryInsights;
