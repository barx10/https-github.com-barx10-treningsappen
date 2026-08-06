import {
  ExerciseDefinition,
  GeneratedWorkout,
  UserProfile,
  WorkoutSession,
  WorkoutStatus,
} from '../types';
import { getStartOfWeek, parseDateString } from './dateUtils';

const TIMEOUT_MS = 60_000;

/**
 * Shown in the UI before the first API response. The server decides the real
 * model (see api/_ai.js) and returns it as `model` on the response.
 */
export const DEFAULT_AI_MODEL = 'gemini-3.6-flash';

/** Completed sessions from Monday and onwards. */
export const getCompletedSessionsThisWeek = (history: WorkoutSession[]): WorkoutSession[] => {
  const startOfWeek = getStartOfWeek();
  return history.filter(
    s => parseDateString(s.date) >= startOfWeek && s.status === WorkoutStatus.COMPLETED
  );
};

const readError = async (response: Response): Promise<string> => {
  try {
    const body = await response.json();
    return body.details || body.error || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

/** POST JSON with a timeout, and turn failures into Norwegian error messages. */
const postJson = async <T>(url: string, body: unknown): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    if (name === 'TimeoutError' || name === 'AbortError') {
      throw new Error('Forespørselen tok for lang tid. Prøv igjen.');
    }
    throw new Error('Fikk ikke kontakt med serveren. Sjekk nettforbindelsen.');
  }

  if (!response.ok) {
    throw new Error(`API-feil (${response.status}): ${await readError(response)}`);
  }

  return response.json() as Promise<T>;
};

/** Condenses a session's logged sets into the summary the AI prompt needs. */
const summarizeSession = (session: WorkoutSession, exercises: ExerciseDefinition[]) => ({
  date: session.date,
  exercises: session.exercises.map(e => {
    const def = exercises.find(ex => ex.id === e.exerciseDefinitionId);
    const completedSets = e.sets.filter(set => set.completed);

    return {
      name: def?.name || 'Unknown',
      muscleGroup: def?.muscleGroup || 'Unknown',
      type: def?.type || 'Unknown',
      setsCompleted: completedSets.length,
      setsPlanned: e.sets.length,
      totalReps: completedSets.reduce((sum, set) => sum + (set.reps || 0), 0),
      maxWeight: Math.max(...completedSets.map(set => set.weight || 0), 0),
      totalVolume: completedSets.reduce(
        (sum, set) => sum + (set.weight || 0) * (set.reps || 0),
        0
      ),
      setDetails: completedSets.map(set => ({ weight: set.weight || 0, reps: set.reps || 0 })),
    };
  }),
});

export const generateWorkout = (
  profile: UserProfile,
  weekHistory: WorkoutSession[],
  exercises: ExerciseDefinition[]
): Promise<GeneratedWorkout> =>
  postJson<GeneratedWorkout>('/api/generate-workout', {
    profile: {
      goal: profile.goal || 'general',
      age: profile.age,
      weight: profile.weight,
      gender: profile.gender,
    },
    weekHistory: weekHistory.map(s => summarizeSession(s, exercises)),
    availableExercises: exercises.map(e => ({
      id: e.id,
      name: e.name,
      type: e.type,
      muscleGroup: e.muscleGroup,
    })),
  });

export const generateRecommendations = async (
  profile: UserProfile,
  history: WorkoutSession[],
  exercises: ExerciseDefinition[]
): Promise<string[]> => {
  const data = await postJson<{ recommendations?: string[] }>('/api/generate-recommendations', {
    profile,
    history,
    exercises,
  });

  if (!data.recommendations?.length) {
    throw new Error('AI-analysen kom tom tilbake. Prøv igjen.');
  }
  return data.recommendations;
};
