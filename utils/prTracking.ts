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
 * Folder de avhukede settene fra den pågående økta inn i rekordene fra
 * historikken.
 *
 * Alternativet – å regne ut alt på nytt med økta lagt til historikken – kostet
 * 89 øvelser ganget med hele historikken, og det for hvert eneste tastetrykk i
 * vekt- og reps-feltene. Her rører vi bare de settene som faktisk er hukket av.
 * Resultatet er det samme: historikken ligger i bunn, og økta får bare flytte
 * en rekord hvis den er strengt bedre.
 */
export function withSessionRecords(
  base: Map<string, PersonalRecord>,
  session: WorkoutSession | null,
  exercises: ExerciseDefinition[]
): Map<string, PersonalRecord> {
  if (!session) return base;

  // Er samme øvelse lagt inn to ganger i økta, teller bare den første. Det er
  // slik calculatePersonalRecords leser historikken, og uten den samme regelen
  // ville en rekord vist seg under økta og forsvunnet igjen når den ble lagret.
  const firstPerExercise = session.exercises.filter(
    (exercise, index) =>
      session.exercises.findIndex(
        e => e.exerciseDefinitionId === exercise.exerciseDefinitionId
      ) === index
  );

  const completed = firstPerExercise
    .map(exercise => ({ exercise, sets: exercise.sets.filter(set => set.completed) }))
    .filter(entry => entry.sets.length > 0);

  if (completed.length === 0) return base;

  const merged = new Map(base);

  completed.forEach(({ exercise, sets }) => {
    const definition = exercises.find(e => e.id === exercise.exerciseDefinitionId);
    if (!definition) return;

    const existing = merged.get(definition.id);
    const record: PersonalRecord = existing ? { ...existing } : {
      exerciseId: definition.id,
      exerciseName: definition.name,
      maxWeight: 0,
      maxWeightDate: '',
      maxReps: 0,
      maxRepsDate: '',
      maxVolume: 0,
      maxVolumeDate: '',
      totalVolume: 0,
      totalVolumeDate: '',
    };

    let sessionTotalVolume = 0;

    sets.forEach(set => {
      if (set.weight && set.weight > record.maxWeight) {
        record.maxWeight = set.weight;
        record.maxWeightDate = session.date;
      }

      if (set.reps && set.reps > record.maxReps) {
        record.maxReps = set.reps;
        record.maxRepsDate = session.date;
      }

      if (set.weight && set.reps) {
        const setVolume = set.weight * set.reps;
        if (setVolume > record.maxVolume) {
          record.maxVolume = setVolume;
          record.maxVolumeDate = session.date;
        }
        sessionTotalVolume += setVolume;
      }
    });

    if (sessionTotalVolume > record.totalVolume) {
      record.totalVolume = sessionTotalVolume;
      record.totalVolumeDate = session.date;
    }

    // Samme regel som over: uten vekt eller reps er det ingen rekord å ta vare på.
    if (record.maxWeight > 0 || record.maxReps > 0) {
      merged.set(definition.id, record);
    }
  });

  return merged;
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
