import {
  ExerciseDefinition,
  ExerciseType,
  GeneratedWorkout,
  WorkoutExercise,
  WorkoutSession,
  WorkoutStatus,
} from '../types';
import { getTodayDateString } from './dateUtils';

const newId = () => crypto.randomUUID();

/** First number in "8-12" / "10" — falls back to 10. */
const parseFirstRep = (reps?: string): number => {
  const parsed = parseInt(reps?.split('-')[0] ?? '', 10);
  return Number.isFinite(parsed) ? parsed : 10;
};

const isTimeBased = (exercise: ExerciseDefinition) =>
  exercise.type === ExerciseType.CARDIO || exercise.type === ExerciseType.DURATION;

/**
 * Turns an AI-generated workout into loggable exercises, dropping anything
 * that doesn't match a known exercise definition.
 */
export const buildExercisesFromGenerated = (
  workout: GeneratedWorkout,
  exercises: ExerciseDefinition[],
  noteFormat: (reps: string, restTime: number) => string = (reps, rest) =>
    `${reps} reps, ${rest}s hvile`
): WorkoutExercise[] =>
  (workout.exercises ?? [])
    .map((planned): WorkoutExercise | null => {
      const definition = exercises.find(e => e.id === planned.exerciseId);
      if (!definition) return null;

      const reps = parseFirstRep(planned.reps);
      const timeBased = isTimeBased(definition);

      return {
        id: newId(),
        exerciseDefinitionId: definition.id,
        sets: Array.from({ length: planned.sets || 3 }, () => ({
          id: newId(),
          weight: 0,
          reps: timeBased ? 0 : reps,
          durationMinutes: timeBased ? 10 : 0,
          completed: false,
        })),
        notes: planned.notes || noteFormat(planned.reps, planned.restTime),
      };
    })
    .filter((ex): ex is WorkoutExercise => ex !== null);

/** Copies exercises with fresh ids and uncompleted sets, ready for a new session. */
export const cloneExercisesForNewSession = (exercises: WorkoutExercise[]): WorkoutExercise[] =>
  exercises.map(ex => ({
    ...ex,
    id: newId(),
    sets: ex.sets.map(set => ({ ...set, id: newId(), completed: false })),
  }));

/** Wraps exercises in a fresh, active workout session. */
export const createSession = (name: string, exercises: WorkoutExercise[]): WorkoutSession => ({
  id: newId(),
  name,
  date: getTodayDateString(),
  startTime: new Date().toISOString(),
  status: WorkoutStatus.ACTIVE,
  exercises,
});
