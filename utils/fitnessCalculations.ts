import { UserProfile, WorkoutSession, ExerciseDefinition, ExerciseType, MuscleGroup } from '../types';

/**
 * Calculate estimated calories burned during a workout session
 * Based on MET (Metabolic Equivalent of Task) values
 */
export const calculateCaloriesBurned = (
    session: WorkoutSession,
    exercises: ExerciseDefinition[],
    userWeight?: number
): number => {
    if (!userWeight) return 0;

    const durationMinutes = session.endTime
        ? (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000
        : 0;

    // Average MET values for different exercise types
    const MET_VALUES = {
        [ExerciseType.WEIGHTED]: 6.0, // Weight training, vigorous
        [ExerciseType.BODYWEIGHT]: 5.0, // Calisthenics, vigorous
        [ExerciseType.CARDIO]: 7.0, // Cardio, moderate-vigorous
        [ExerciseType.DURATION]: 4.0, // Static exercises like planks
    };

    // Calculate average MET based on exercises in session
    let totalMET = 0;
    let exerciseCount = 0;

    session.exercises.forEach((workoutEx) => {
        const def = exercises.find((e) => e.id === workoutEx.exerciseDefinitionId);
        if (def) {
            totalMET += MET_VALUES[def.type] || 5.0;
            exerciseCount++;
        }
    });

    const avgMET = exerciseCount > 0 ? totalMET / exerciseCount : 5.0;

    // Calories = MET × weight(kg) × duration(hours)
    const calories = avgMET * userWeight * (durationMinutes / 60);

    return Math.round(calories);
};

/**
 * Get personalized recommendations based on user profile and history
 */
export const getRecommendations = (
    profile: UserProfile,
    history: WorkoutSession[],
    exercises: ExerciseDefinition[]
): string[] => {
    const recommendations: string[] = [];

    if (history.length === 0) {
        return ['🚀 Start uka med en enkel fullkroppsøkt – alt teller!'];
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const sessionsThisWeek = history.filter((session) => new Date(session.date) >= startOfWeek);
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastSession = sortedHistory[0];
    const yesterdaySession = sortedHistory.find((session) => {
        const sessionDate = new Date(session.date);
        const diffMs = now.getTime() - sessionDate.getTime();
        return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
    });

    const muscleCounts: Record<string, number> = {};
    let cardioSessions = 0;
    let strengthSessions = 0;

    const getSessionMuscles = (session?: WorkoutSession | null) => {
        if (!session) return [] as MuscleGroup[];
        const unique = new Set<MuscleGroup>();
        session.exercises.forEach((ex) => {
            const def = exercises.find((d) => d.id === ex.exerciseDefinitionId);
            if (def?.muscleGroup) {
                unique.add(def.muscleGroup);
            }
        });
        return Array.from(unique);
    };

    sessionsThisWeek.forEach((session) => {
        let hasCardio = false;
        let hasStrength = false;
        session.exercises.forEach((ex) => {
            const def = exercises.find((d) => d.id === ex.exerciseDefinitionId);
            if (!def) return;
            muscleCounts[def.muscleGroup] = (muscleCounts[def.muscleGroup] || 0) + 1;
            if (def.type === ExerciseType.CARDIO || def.type === ExerciseType.DURATION) hasCardio = true;
            if (def.type === ExerciseType.WEIGHTED || def.type === ExerciseType.BODYWEIGHT) hasStrength = true;
        });
        if (hasCardio) cardioSessions++;
        if (hasStrength) strengthSessions++;
    });

    const formatMuscles = (groups: MuscleGroup[]) => {
        if (!groups.length) return '';
        const lower = groups.map((m) => m.toLowerCase());
        if (lower.length === 1) return lower[0];
        return `${lower.slice(0, -1).join(', ')} og ${lower[lower.length - 1]}`;
    };

    const sampleExerciseNames = (groups: MuscleGroup[]) => {
        const names = groups
            .map((group) => exercises.find((ex) => ex.muscleGroup === group)?.name)
            .filter(Boolean) as string[];
        if (!names.length) return '';
        if (names.length === 1) return names[0];
        return `${names[0]} eller ${names[1]}`;
    };

    const priorityGroups: MuscleGroup[] = [
        MuscleGroup.LEGS,
        MuscleGroup.BACK,
        MuscleGroup.CHEST,
        MuscleGroup.SHOULDERS,
        MuscleGroup.CORE,
        MuscleGroup.ARMS
    ];

    const pickFocusGroups = (trainedYesterday: MuscleGroup[]) => {
        const result: MuscleGroup[] = [];
        const trainedSet = new Set(trainedYesterday);

        const addIfValid = (group: MuscleGroup) => {
            if (!result.includes(group)) {
                result.push(group);
            }
        };

        // 1. Prioriter muskelgrupper som ikke er trent denne uken
        priorityGroups.forEach((group) => {
            if (!muscleCounts[group] && !trainedSet.has(group)) {
                addIfValid(group);
            }
        });

        // 2. Deretter grupper som ikke ble trent i går
        if (result.length < 2) {
            priorityGroups.forEach((group) => {
                if (!trainedSet.has(group)) {
                    addIfValid(group);
                }
            });
        }

        // 3. Til slutt de gruppene med lavest volum denne uken
        if (result.length < 2) {
            const sortedByVolume = [...priorityGroups].sort((a, b) => (muscleCounts[a] || 0) - (muscleCounts[b] || 0));
            sortedByVolume.forEach((group) => addIfValid(group));
        }

        return result.slice(0, 2);
    };

    if (yesterdaySession) {
        const muscles = getSessionMuscles(yesterdaySession);
        if (muscles.length) {
            const focus = pickFocusGroups(muscles);
            const exerciseExamples = sampleExerciseNames(focus);
            const focusText = formatMuscles(focus);
            const exampleText = exerciseExamples ? ` – prøv ${exerciseExamples}` : '';
            recommendations.push(`🔄 I går trente du ${formatMuscles(muscles)}. I dag passer ${focusText}${exampleText}.`);
        }
    } else if (lastSession) {
        const muscles = getSessionMuscles(lastSession);
        const focus = pickFocusGroups(muscles);
        if (focus.length > 0) {
            const exerciseExamples = sampleExerciseNames(focus);
            const focusText = formatMuscles(focus);
            const exampleText = exerciseExamples ? ` som ${exerciseExamples}` : '';
            recommendations.push(`💡 Du trente ${formatMuscles(muscles)} forrige gang. Hva med ${focusText}${exampleText} neste gang?`);
        }
    }

    const goal = profile.goal || 'general';

    if ((goal === 'weight_loss' || goal === 'endurance') && cardioSessions < 2) {
        const example = sampleExerciseNames([MuscleGroup.CARDIO]) || 'en rask gåtur';
        recommendations.push(`🏃 Få opp pulsen denne uken – legg inn en kondisjonsøkt som ${example}.`);
    }

    if ((goal === 'strength' || goal === 'muscle') && !muscleCounts[MuscleGroup.LEGS]) {
        const legExample = sampleExerciseNames([MuscleGroup.LEGS]) || 'knebøy';
        recommendations.push(`🦵 Ingen beintrening så langt – legg inn ${legExample} for å holde balansen.`);
    }

    const pushVolume = (muscleCounts[MuscleGroup.CHEST] || 0) + (muscleCounts[MuscleGroup.SHOULDERS] || 0);
    const pullVolume = muscleCounts[MuscleGroup.BACK] || 0;
    if (pushVolume >= pullVolume + 2) {
        const backExample = sampleExerciseNames([MuscleGroup.BACK]) || 'roing';
        recommendations.push(`⚖️ Mye press denne uken – gi ryggen kjærlighet med ${backExample}.`);
    }

    const consecutive = sortedHistory.slice(0, 2);
    if (
        consecutive.length === 2 &&
        Math.abs(new Date(consecutive[0].date).getTime() - new Date(consecutive[1].date).getTime()) < 36 * 60 * 60 * 1000 &&
        sessionsThisWeek.length >= 3
    ) {
        recommendations.push('💤 To økter på rad! Vurder en rolig mobilitetsøkt eller hviledag før du kjører på igjen.');
    }

    if (!recommendations.length) {
        recommendations.push('✨ Fortsett den gode trenden – planlegg neste økt basert på målet ditt.');
    }

    return recommendations.slice(0, 3);
};

/**
 * Calculate strength standards based on bodyweight
 * Returns percentile (0-100) for common lifts
 */
export const getStrengthStandard = (
    exerciseName: string,
    weight: number,
    userWeight?: number,
    age?: number,
    gender: 'male' | 'female' = 'male'
): { level: string; percentile: number } | null => {
    if (!userWeight || !weight) return null;

    const ratio = weight / userWeight;

    // Simplified strength standards (male, approximate)
    // Based on ExRx.net standards
    const standards: Record<string, { beginner: number; intermediate: number; advanced: number }> = {
        'Knebøy / Goblet Squat': { beginner: 0.75, intermediate: 1.25, advanced: 1.75 },
        'Markløft (KB/Stang)': { beginner: 1.0, intermediate: 1.5, advanced: 2.0 },
        Benkpress: { beginner: 0.5, intermediate: 1.0, advanced: 1.5 },
        Skulderpress: { beginner: 0.35, intermediate: 0.6, advanced: 0.9 },
    };

    const standard = standards[exerciseName];
    if (!standard) return null;

    let level = 'Nybegynner';
    let percentile = 20;

    if (ratio >= standard.advanced) {
        level = 'Avansert';
        percentile = 85;
    } else if (ratio >= standard.intermediate) {
        level = 'Middels';
        percentile = 60;
    } else if (ratio >= standard.beginner) {
        level = 'Nybegynner+';
        percentile = 40;
    }

    return { level, percentile };
};

/**
 * Calculate weekly statistics
 */
export const getWeeklyStats = (
    history: WorkoutSession[],
    exercises: ExerciseDefinition[],
    userWeight?: number
) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const weekSessions = history.filter((s) => new Date(s.date) >= monday);

    let totalMinutes = 0;
    let totalCalories = 0;

    weekSessions.forEach((session) => {
        if (session.endTime) {
            const duration =
                (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000;
            totalMinutes += duration;

            if (userWeight) {
                totalCalories += calculateCaloriesBurned(session, exercises, userWeight);
            }
        }
    });

    return {
        workouts: weekSessions.length,
        totalMinutes: Math.round(totalMinutes),
        totalCalories: Math.round(totalCalories),
    };
};
