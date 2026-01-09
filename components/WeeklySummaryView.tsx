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
  // Calculate stats for current week (Monday-Sunday)
  const calculateWeeklyStats = (): WeeklyStats => {
    // Get start of week (Monday)
    const getStartOfWeek = () => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    // Parse date string consistently
    const parseDateString = (dateStr: string): Date => {
      if (dateStr.length === 10 && dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      const date = new Date(dateStr);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const startOfWeek = getStartOfWeek();
    
    const weekSessions = history.filter(session => {
      const sessionDate = parseDateString(session.date);
      return sessionDate >= startOfWeek && session.status === 'Fullført';
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
        message: `Wow! ${totalWorkouts} økter og ${totalSets} sett denne uken - det er elitetrening! Med ${Math.round(totalVolume)}kg totalt volum viser du en dedikasjon som inspirerer. Du pusher grenser og bygger en versjon av deg selv som er sterkere for hver dag. Fortsett å dominere! 💯`
      };
    }

    // Great week
    if (totalWorkouts >= 4 && totalSets >= 60) {
      return {
        emoji: '💪',
        title: 'Fantastisk uke!',
        message: `${totalWorkouts} kvalitetsøkter med ${totalSets} sett - du har virkelig levert! Konsistens er supertrikset, og du beviser at du mestrer det. Hver rep, hvert sett - kroppen din absorberer styrken. Du er på rett vei mot noe stort! 🚀`
      };
    }

    // Good progress
    if (totalWorkouts >= 3) {
      return {
        emoji: '🎯',
        title: 'Solid fremgang!',
        message: `${totalWorkouts} økter på en uke er akkurat det som bygger ekte styrke! Du har trent ${stats.uniqueExercises} forskjellige øvelser og lagt ned ${totalSets} sett. Det er ikke bare tall - det er bevis på at du satser. Hver økt er en investering i fremtidens deg! 💎`
      };
    }

    // Made a start
    if (totalWorkouts >= 1) {
      return {
        emoji: '🌟',
        title: 'Flott start!',
        message: `${totalWorkouts} ${totalWorkouts === 1 ? 'økt' : 'økter'} fullført - det som betyr mest er at du tok steget! ${totalSets} sett er ${totalSets} ganger du valgte fremgang. Å komme i gang er ofte det tøffeste, men du gjorde det! Nå handler det bare om å fortsette. Keep going! ⭐`
      };
    }

    // No workouts
    return {
      emoji: '💡',
      title: 'Klar for en ny start?',
      message: 'Forrige uke er historie - og det er helt greit! Livet skjer. Men DENNE uken? Den er din. Ett sett, én øvelse, én push-up - det er alt som skal til for å sparke i gang motoren igjen. Din fremtidige jeg vil takke deg for at du starter NÅ! 🔋'
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
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Ukesoppsummering</h1>
          <p className="text-sm text-muted">Denne uken (mandag-søndag)</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      {/* Pep Talk Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-600">
        <div className="text-6xl mb-4 text-center">{pepTalk.emoji}</div>
        <h2 className="text-2xl font-bold text-center mb-3">{pepTalk.title}</h2>
        <p className="text-center text-blue-100 leading-relaxed">{pepTalk.message}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-muted">Økter</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalWorkouts}</div>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-muted">Sett</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalSets}</div>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-muted">Volum</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(Math.round(stats.totalVolume))} kg
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-muted">Øvelser</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.uniqueExercises}</div>
        </div>
      </div>

      {/* Additional Stats */}
      {stats.avgWorkoutDuration > 0 && (
        <div className="bg-surface rounded-xl p-4 mb-6 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Treningsvarighet</h3>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-muted">Gjennomsnitt</div>
              <div className="text-xl font-bold text-white">{Math.round(stats.avgWorkoutDuration)} min</div>
            </div>
            <div>
              <div className="text-xs text-muted">Lengste økt</div>
              <div className="text-xl font-bold text-white">{Math.round(stats.longestWorkout)} min</div>
            </div>
          </div>
        </div>
      )}

      {/* Muscle Group Distribution */}
      {stats.muscleGroups.size > 0 && (
        <div className="bg-surface rounded-xl p-4 mb-6 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Muskelgrupper trent</h3>
          <div className="space-y-2">
            {Array.from(stats.muscleGroups.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([muscle, count]) => (
                <div key={muscle} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{muscle}</span>
                  <span className="text-sm font-semibold text-primary">{count} øvelser</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="bg-surface rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Prestasjoner denne uken</h3>
          <div className="grid gap-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                {achievement.icon}
                <div>
                  <div className="text-sm font-semibold text-white">{achievement.title}</div>
                  <div className="text-xs text-muted">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No workouts message */}
      {stats.totalWorkouts === 0 && (
        <div className="bg-surface rounded-xl p-6 border border-slate-700 text-center">
          <div className="text-4xl mb-3">💪</div>
          <p className="text-slate-300">
            Ingen økter registrert siste 7 dager.
            <br />
            <span className="text-sm text-muted">Start en ny økt og bygg momentum!</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklySummaryView;
