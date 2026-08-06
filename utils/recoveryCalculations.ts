import { WorkoutSession, MuscleGroup, ExerciseDefinition } from '../types';
import { parseDateString, getDaysDifference, isYesterday } from './dateUtils';

export interface MuscleGroupRecovery {
  muscleGroup: MuscleGroup;
  daysSinceLastTrained: number;
  lastTrainedDate: string | null;
  status: 'fresh' | 'ready' | 'warning' | 'overdue';
  message: string;
}

export interface RecoveryWarning {
  type: 'overtraining' | 'neglected';
  muscleGroup: MuscleGroup;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

/**
 * Helkropp er en øvelseskategori, ikke en muskel man restituerer. Den ble
 * tidligere listet som en egen gruppe og sto for alltid som «Aldri trent»,
 * siden ingen økt trener «helkropp» isolert.
 */
const RECOVERY_MUSCLE_GROUPS = Object.values(MuscleGroup).filter(
  g => g !== MuscleGroup.FULL_BODY
);

/** Fallback for helkroppsøvelser som ikke oppgir hvilke muskler de treffer. */
const FULL_BODY_COVERS: MuscleGroup[] = [
  MuscleGroup.CHEST,
  MuscleGroup.BACK,
  MuscleGroup.LEGS,
  MuscleGroup.SHOULDERS,
  MuscleGroup.ARMS,
  MuscleGroup.CORE,
];

/**
 * Hvilke muskelgrupper en øvelse faktisk belaster. En helkroppsøvelse teller
 * mot musklene den treffer, ikke mot «Helkropp».
 */
const musclesWorkedBy = (definition: ExerciseDefinition): MuscleGroup[] => {
  const secondary = definition.secondaryMuscleGroups ?? [];

  const groups =
    definition.muscleGroup === MuscleGroup.FULL_BODY
      ? (secondary.length > 0 ? secondary : FULL_BODY_COVERS)
      : [definition.muscleGroup, ...secondary];

  return groups.filter(g => g !== MuscleGroup.FULL_BODY);
};

/**
 * Calculate days since each muscle group was last trained
 */
export function calculateMuscleGroupRecovery(
  history: WorkoutSession[],
  exercises: ExerciseDefinition[]
): MuscleGroupRecovery[] {
  const now = new Date();
  const muscleGroupLastTrained = new Map<MuscleGroup, Date>();

  // Find last training date for each muscle group
  const completedSessions = history
    .filter(s => s.status === 'Fullført')
    .sort((a, b) => {
      const dateA = parseDateString(a.date);
      const dateB = parseDateString(b.date);
      return dateB.getTime() - dateA.getTime();
    });

  completedSessions.forEach(session => {
    session.exercises.forEach(exercise => {
      const def = exercises.find(e => e.id === exercise.exerciseDefinitionId);
      if (!def) return;

      const sessionDate = parseDateString(session.date);
      // Øktene er sortert nyeste først, så første treff er siste gang trent.
      musclesWorkedBy(def).forEach(muscle => {
        if (!muscleGroupLastTrained.has(muscle)) {
          muscleGroupLastTrained.set(muscle, sessionDate);
        }
      });
    });
  });

  // Calculate recovery status for each muscle group
  return RECOVERY_MUSCLE_GROUPS.map(muscleGroup => {
    const lastDate = muscleGroupLastTrained.get(muscleGroup);
    const daysSince = lastDate
      ? Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let status: MuscleGroupRecovery['status'];
    let message: string;

    if (daysSince === 0) {
      status = 'fresh';
      message = 'Trent i dag! 💪';
    } else if (daysSince === 1) {
      status = 'fresh';
      message = 'Trent i går - fortsatt fersk';
    } else if (daysSince >= 2 && daysSince <= 4) {
      status = 'ready';
      message = `${daysSince} dager siden - godt restituert, klar for trening!`;
    } else if (daysSince >= 5 && daysSince <= 7) {
      status = 'ready';
      message = `${daysSince} dager siden - klar for trening`;
    } else if (daysSince >= 8 && daysSince <= 10) {
      status = 'warning';
      message = `${daysSince} dager siden - bør snart trenes`;
    } else if (daysSince >= 11 && daysSince <= 14) {
      status = 'overdue';
      message = `${daysSince} dager siden - på tide å trene!`;
    } else if (daysSince === 999) {
      status = 'overdue';
      message = 'Aldri trent';
    } else {
      status = 'overdue';
      message = `${daysSince} dager siden - lenge siden!`;
    }

    return {
      muscleGroup,
      daysSinceLastTrained: daysSince,
      lastTrainedDate: lastDate ? lastDate.toISOString() : null,
      status,
      message
    };
  });
}

/**
 * Check for overtraining (same muscle group trained 2 days in a row)
 */
export function checkOvertrainingRisk(
  history: WorkoutSession[],
  exercises: ExerciseDefinition[],
  todaysMuscleGroups: MuscleGroup[]
): RecoveryWarning[] {
  const warnings: RecoveryWarning[] = [];

  // Find yesterday's muscle groups
  const yesterdaysMuscleGroups = new Set<MuscleGroup>();
  history
    .filter(s => s.status === 'Fullført' && isYesterday(s.date))
    .forEach(session => {
      session.exercises.forEach(exercise => {
        const def = exercises.find(e => e.id === exercise.exerciseDefinitionId);
        if (def) yesterdaysMuscleGroups.add(def.muscleGroup);
      });
    });

  // Check for overlap
  todaysMuscleGroups.forEach(muscleGroup => {
    if (yesterdaysMuscleGroups.has(muscleGroup)) {
      warnings.push({
        type: 'overtraining',
        muscleGroup,
        message: `Du trente ${muscleGroup.toLowerCase()} i går. Vurder hviledag eller annen muskelgruppe.`,
        severity: 'high'
      });
    }
  });

  return warnings;
}

/**
 * Find neglected muscle groups (not trained in 10+ days)
 */
export function findNeglectedMuscleGroups(
  recovery: MuscleGroupRecovery[]
): RecoveryWarning[] {
  return recovery
    .filter(r => r.daysSinceLastTrained >= 10 && r.daysSinceLastTrained < 999)
    .map(r => ({
      type: 'neglected' as const,
      muscleGroup: r.muscleGroup,
      message: `${r.muscleGroup} ikke trent på ${r.daysSinceLastTrained} dager. Legg inn en økt snart!`,
      severity: r.daysSinceLastTrained >= 14 ? 'high' as const : 'medium' as const
    }));
}

/**
 * Get emoji for muscle group
 */
export function getMuscleGroupEmoji(muscleGroup: MuscleGroup): string {
  const emojiMap: Record<MuscleGroup, string> = {
    [MuscleGroup.CHEST]: '💪',
    [MuscleGroup.BACK]: '🏋️',
    [MuscleGroup.LEGS]: '🦵',
    [MuscleGroup.SHOULDERS]: '🤷',
    [MuscleGroup.ARMS]: '💪',
    [MuscleGroup.CORE]: '🧘',
    [MuscleGroup.CARDIO]: '🏃',
    [MuscleGroup.FULL_BODY]: '🏆'
  };
  return emojiMap[muscleGroup] || '💪';
}
