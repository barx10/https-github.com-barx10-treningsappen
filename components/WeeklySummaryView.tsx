import React from 'react';
import { WorkoutSession, UserProfile, ExerciseDefinition, MuscleGroup } from '../types';
import { TrendingUp, Dumbbell, Target, Award, Calendar, Flame, X } from 'lucide-react';

interface WeeklySummaryViewProps {
  history: WorkoutSession[];
  profile: UserProfile;
  exercises: ExerciseDefinition[];
  onClose: () => void;
}

interface WeeklyStats {
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number; // kg
  uniqueExercises: number;
  muscleGroups: Map<MuscleGroup, number>;
  avgWorkoutDuration: number; // minutes
  longestWorkout: number; // minutes
}

const WeeklySummaryView: React.FC<WeeklySummaryViewProps> = ({ history, profile, exercises, onClose }) => {
  // Calculate stats for last 7 days
  const calculateWeeklyStats = (): WeeklyStats => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekSessions = history.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= sevenDaysAgo && session.status === 'Fullført';
    });

    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;
    const uniqueExerciseIds = new Set<string>();
    const muscleGroupCounts = new Map<MuscleGroup, number>();
    let totalDuration = 0;
    let longestWorkout = 0;

    weekSessions.forEach(session => {
      session.exercises.forEach(exercise => {
        uniqueExerciseIds.add(exercise.exerciseDefinitionId);
        
        const exerciseDef = exercises.find(e => e.id === exercise.exerciseDefinitionId);
        if (exerciseDef) {
          muscleGroupCounts.set(
            exerciseDef.muscleGroup,
            (muscleGroupCounts.get(exerciseDef.muscleGroup) || 0) + 1
          );
        }

        exercise.sets.forEach(set => {
          if (set.completed) {
            totalSets++;
            if (set.reps) totalReps += set.reps;
            if (set.weight && set.reps) totalVolume += set.weight * set.reps;
          }
        });
      });

      if (session.startTime && session.endTime) {
        const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 / 60;
        totalDuration += duration;
        if (duration > longestWorkout) longestWorkout = duration;
      }
    });

    return {
      totalWorkouts: weekSessions.length,
      totalSets,
      totalReps,
      totalVolume,
      uniqueExercises: uniqueExerciseIds.size,
      muscleGroups: muscleGroupCounts,
      avgWorkoutDuration: weekSessions.length > 0 ? totalDuration / weekSessions.length : 0,
      longestWorkout
    };
  };

  const stats = calculateWeeklyStats();

  // Generate personalized pep talk
  const generatePepTalk = (): { title: string; message: string; emoji: string } => {
    const { totalWorkouts, totalSets, totalVolume } = stats;

    // Amazing performance
    if (totalWorkouts >= 5 && totalSets >= 100) {
      return {
        emoji: '🔥',
        title: 'Du er ustoppelig!',
        message: 'Dette er elitetrening! Med denne frekvensen og volumet er du på vei mot utrolige resultater. Du viser en dedikasjon som få besitter. Fortsett å dominere!'
      };
    }

    // Great week
    if (totalWorkouts >= 4 && totalSets >= 60) {
      return {
        emoji: '💪',
        title: 'Fantastisk uke!',
        message: 'Du har virkelig levert denne uken! Konsistens er nøkkelen til suksess, og du beviser det hver dag. Kroppen din vil takke deg for innsatsen.'
      };
    }

    // Good progress
    if (totalWorkouts >= 3) {
      return {
        emoji: '🎯',
        title: 'Solid fremgang!',
        message: 'Tre eller flere økter på en uke? Det er det som bygger styrke og vaner! Du er godt på vei mot målene dine. Hver økt teller!'
      };
    }

    // Made a start
    if (totalWorkouts >= 1) {
      return {
        emoji: '🌟',
        title: 'Flott start!',
        message: 'Å komme i gang er ofte det vanskeligste. Du har tatt første steg, og det er noe å være stolt av! Husk at små steg leder til store forandringer.'
      };
    }

    // No workouts
    return {
      emoji: '💡',
      title: 'Ny uke, ny sjanse!',
      message: 'Forrige uke er historie. Denne uken er din mulighet til å vise hva du er laget av. Start i dag - din fremtidige jeg vil takke deg!'
    };
  };

  const pepTalk = generatePepTalk();

  // Generate achievement badges
  const getAchievements = (): Array<{ icon: React.ReactNode; title: string; description: string }> => {
    const achievements = [];

    if (stats.totalWorkouts >= 5) {
      achievements.push({
        icon: <Flame className="w-6 h-6 text-orange-500" />,
        title: '5+ økter',
        description: 'Brennende dedikasjon!'
      });
    }

    if (stats.totalWorkouts >= 3) {
      achievements.push({
        icon: <Calendar className="w-6 h-6 text-blue-500" />,
        title: '3+ økter',
        description: 'Konsistent trening'
      });
    }

    if (stats.totalVolume >= 10000) {
      achievements.push({
        icon: <Dumbbell className="w-6 h-6 text-purple-500" />,
        title: '10+ tonn løftet',
        description: 'Enormt volum!'
      });
    } else if (stats.totalVolume >= 5000) {
      achievements.push({
        icon: <Dumbbell className="w-6 h-6 text-purple-400" />,
        title: '5+ tonn løftet',
        description: 'Imponerende styrke'
      });
    }

    if (stats.uniqueExercises >= 15) {
      achievements.push({
        icon: <Target className="w-6 h-6 text-green-500" />,
        title: '15+ øvelser',
        description: 'Allsidig trening'
      });
    }

    if (stats.longestWorkout >= 90) {
      achievements.push({
        icon: <Award className="w-6 h-6 text-yellow-500" />,
        title: '90+ min økt',
        description: 'Utholdenhetsmester'
      });
    }

    return achievements;
  };

  const achievements = getAchievements();

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('nb-NO');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ukesoppsummering</h1>
          <p className="text-sm text-gray-600">Siste 7 dager</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Pep Talk Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
        <div className="text-6xl mb-4 text-center">{pepTalk.emoji}</div>
        <h2 className="text-2xl font-bold text-center mb-3">{pepTalk.title}</h2>
        <p className="text-center text-blue-50 leading-relaxed">{pepTalk.message}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Økter</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats.totalWorkouts}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Sett</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats.totalSets}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Volum</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {formatNumber(Math.round(stats.totalVolume))} kg
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Øvelser</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats.uniqueExercises}</div>
        </div>
      </div>

      {/* Additional Stats */}
      {stats.avgWorkoutDuration > 0 && (
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Treningsvarighet</h3>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-500">Gjennomsnitt</div>
              <div className="text-xl font-bold text-gray-800">{Math.round(stats.avgWorkoutDuration)} min</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Lengste økt</div>
              <div className="text-xl font-bold text-gray-800">{Math.round(stats.longestWorkout)} min</div>
            </div>
          </div>
        </div>
      )}

      {/* Muscle Group Distribution */}
      {stats.muscleGroups.size > 0 && (
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Muskelgrupper trent</h3>
          <div className="space-y-2">
            {Array.from(stats.muscleGroups.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([muscle, count]) => (
                <div key={muscle} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{muscle}</span>
                  <span className="text-sm font-semibold text-blue-600">{count} øvelser</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Prestasjoner denne uken</h3>
          <div className="grid gap-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {achievement.icon}
                <div>
                  <div className="text-sm font-semibold text-gray-800">{achievement.title}</div>
                  <div className="text-xs text-gray-600">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No workouts message */}
      {stats.totalWorkouts === 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="text-4xl mb-3">💪</div>
          <p className="text-gray-600">
            Ingen økter registrert siste 7 dager.
            <br />
            <span className="text-sm">Start en ny økt og bygg momentum!</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklySummaryView;
