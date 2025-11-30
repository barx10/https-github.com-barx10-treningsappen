import { WorkoutSession, WorkoutSet, ExerciseDefinition } from '../types';

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxWeightDate: string;
  maxReps: number;
  maxRepsDate: string;
  maxVolume: number; // weight * reps in single set
  maxVolumeDate: string;
  totalVolume: number; // total weight * reps across all sets in a session
  totalVolumeDate: string;
}

export interface PRComparison {
  type: 'weight' | 'reps' | 'volume';
  isNewPR: boolean;
  isNearPR: boolean; // Within 90% of PR
  currentValue: number;
  previousPR: number;
  percentageOfPR: number;
}

/**
 * Calculate all personal records for each exercise
 */
export function calculatePersonalRecords(
  history: WorkoutSession[],
  exercises: ExerciseDefinition[]
): Map<string, PersonalRecord> {
  const records = new Map<string, PersonalRecord>();

  const completedSessions = history.filter(s => s.status === 'Fullført');

  exercises.forEach(exercise => {
    let maxWeight = 0;
    let maxWeightDate = '';
    let maxReps = 0;
    let maxRepsDate = '';
    let maxVolume = 0;
    let maxVolumeDate = '';
    let totalVolume = 0;
    let totalVolumeDate = '';

    completedSessions.forEach(session => {
      const workoutExercise = session.exercises.find(
        e => e.exerciseDefinitionId === exercise.id
      );

      if (!workoutExercise) return;

      let sessionTotalVolume = 0;

      workoutExercise.sets.forEach(set => {
        if (!set.completed) return;

        // Max weight
        if (set.weight && set.weight > maxWeight) {
          maxWeight = set.weight;
          maxWeightDate = session.date;
        }

        // Max reps
        if (set.reps && set.reps > maxReps) {
          maxReps = set.reps;
          maxRepsDate = session.date;
        }

        // Max volume (single set)
        if (set.weight && set.reps) {
          const setVolume = set.weight * set.reps;
          if (setVolume > maxVolume) {
            maxVolume = setVolume;
            maxVolumeDate = session.date;
          }
          sessionTotalVolume += setVolume;
        }
      });

      // Total volume in a session
      if (sessionTotalVolume > totalVolume) {
        totalVolume = sessionTotalVolume;
        totalVolumeDate = session.date;
      }
    });

    if (maxWeight > 0 || maxReps > 0) {
      records.set(exercise.id, {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        maxWeight,
        maxWeightDate,
        maxReps,
        maxRepsDate,
        maxVolume,
        maxVolumeDate,
        totalVolume,
        totalVolumeDate
      });
    }
  });

  return records;
}

/**
 * Check if a set is a new PR or near PR
 */
export function checkPRStatus(
  exerciseId: string,
  set: WorkoutSet,
  records: Map<string, PersonalRecord>
): PRComparison[] {
  const comparisons: PRComparison[] = [];
  const record = records.get(exerciseId);

  if (!record) {
    // First time doing this exercise - everything is a PR!
    if (set.weight && set.weight > 0) {
      comparisons.push({
        type: 'weight',
        isNewPR: true,
        isNearPR: false,
        currentValue: set.weight,
        previousPR: 0,
        percentageOfPR: 100
      });
    }
    if (set.reps && set.reps > 0) {
      comparisons.push({
        type: 'reps',
        isNewPR: true,
        isNearPR: false,
        currentValue: set.reps,
        previousPR: 0,
        percentageOfPR: 100
      });
    }
    return comparisons;
  }

  // Check weight PR
  if (set.weight && record.maxWeight > 0) {
    const percentage = (set.weight / record.maxWeight) * 100;
    comparisons.push({
      type: 'weight',
      isNewPR: set.weight > record.maxWeight,
      isNearPR: percentage >= 90 && percentage < 100,
      currentValue: set.weight,
      previousPR: record.maxWeight,
      percentageOfPR: percentage
    });
  }

  // Check reps PR
  if (set.reps && record.maxReps > 0) {
    const percentage = (set.reps / record.maxReps) * 100;
    comparisons.push({
      type: 'reps',
      isNewPR: set.reps > record.maxReps,
      isNearPR: percentage >= 90 && percentage < 100,
      currentValue: set.reps,
      previousPR: record.maxReps,
      percentageOfPR: percentage
    });
  }

  // Check volume PR (single set)
  if (set.weight && set.reps && record.maxVolume > 0) {
    const volume = set.weight * set.reps;
    const percentage = (volume / record.maxVolume) * 100;
    comparisons.push({
      type: 'volume',
      isNewPR: volume > record.maxVolume,
      isNearPR: percentage >= 90 && percentage < 100,
      currentValue: volume,
      previousPR: record.maxVolume,
      percentageOfPR: percentage
    });
  }

  return comparisons;
}

/**
 * Get recent PRs (last 7 days)
 */
export function getRecentPRs(
  history: WorkoutSession[],
  exercises: ExerciseDefinition[],
  days: number = 7
): Array<{ exerciseName: string; type: string; value: number; date: string }> {
  const records = calculatePersonalRecords(history, exercises);
  const recentPRs: Array<{ exerciseName: string; type: string; value: number; date: string }> = [];
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  records.forEach((record) => {
    // Check if max weight is recent
    if (record.maxWeight > 0 && new Date(record.maxWeightDate) >= cutoffDate) {
      recentPRs.push({
        exerciseName: record.exerciseName,
        type: 'Maks vekt',
        value: record.maxWeight,
        date: record.maxWeightDate
      });
    }

    // Check if max reps is recent
    if (record.maxReps > 0 && new Date(record.maxRepsDate) >= cutoffDate) {
      recentPRs.push({
        exerciseName: record.exerciseName,
        type: 'Maks reps',
        value: record.maxReps,
        date: record.maxRepsDate
      });
    }

    // Check if max volume is recent
    if (record.maxVolume > 0 && new Date(record.maxVolumeDate) >= cutoffDate) {
      recentPRs.push({
        exerciseName: record.exerciseName,
        type: 'Maks volum',
        value: record.maxVolume,
        date: record.maxVolumeDate
      });
    }
  });

  // Sort by date (most recent first)
  return recentPRs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
