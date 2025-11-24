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

    // 1. Get this week's sessions
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday (0)
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const weekSessions = history.filter((s) => new Date(s.date) >= monday);

    // 2. Analyze what has been trained
    const muscleCounts: Record<string, number> = {};
    let cardioSessions = 0;
    let strengthSessions = 0;

    weekSessions.forEach((session) => {
        let hasCardio = false;
        let hasStrength = false;

        session.exercises.forEach((ex) => {
            const def = exercises.find((e) => e.id === ex.exerciseDefinitionId);
            if (def) {
                // Count muscle groups
                muscleCounts[def.muscleGroup] = (muscleCounts[def.muscleGroup] || 0) + 1;

                if (def.type === ExerciseType.CARDIO) hasCardio = true;
                if (def.type === ExerciseType.WEIGHTED || def.type === ExerciseType.BODYWEIGHT) hasStrength = true;
            }
        });

        if (hasCardio) cardioSessions++;
        if (hasStrength) strengthSessions++;
    });

    const totalSessions = weekSessions.length;

    // 3. Goal-based dynamic recommendations
    if (profile.goal === 'strength' || profile.goal === 'muscle') {
        // Check for Leg Day
        if (!muscleCounts[MuscleGroup.LEGS] && totalSessions > 0) {
            recommendations.push('🦵 Du har ikke trent bein denne uken. På tide med en leg day?');
        }

        // Check Push/Pull balance (Simplified: Chest/Shoulders vs Back)
        const pushCount = (muscleCounts[MuscleGroup.CHEST] || 0) + (muscleCounts[MuscleGroup.SHOULDERS] || 0);
        const pullCount = muscleCounts[MuscleGroup.BACK] || 0;

        if (pushCount > pullCount + 2) {
            recommendations.push('⚖️ Du har trent mye press. Husk å trene rygg for balanse.');
        }

        if (totalSessions >= 4 && !muscleCounts[MuscleGroup.CORE]) {
            recommendations.push('🧱 Husk kjernemuskulaturen! Legg inn litt planke eller mageøvelser.');
        }

        if (totalSessions < 3) {
            recommendations.push(`💪 Du har ${totalSessions} økter denne uken. Prøv å nå minst 3 for fremgang.`);
        } else {
            recommendations.push('🔥 Godt jobbet med frekvensen denne uken!');
        }

    } else if (profile.goal === 'weight_loss') {
        if (cardioSessions === 0 && totalSessions > 0) {
            recommendations.push('🏃 Få opp pulsen! En kondisjonsøkt vil hjelpe på forbrenningen.');
        }

        if (strengthSessions === 0 && totalSessions > 0) {
            recommendations.push('💪 Styrketrening øker hvileforbrenningen. Ikke glem vektene!');
        }

        if (totalSessions < 4) {
            recommendations.push('📅 Kontinuitet er nøkkelen. Prøv å være aktiv litt hver dag.');
        }

    } else if (profile.goal === 'endurance') {
        if (cardioSessions < 2) {
            recommendations.push('❤️ For kondisjon bør du ha minst 2-3 pulssøkter i uken.');
        }
        if (strengthSessions === 0) {
            recommendations.push('🦵 Sterke bein gir bedre løpsøkonomi. Legg inn litt styrke.');
        }
    }

    // General fallback if few specific recommendations
    if (recommendations.length === 0) {
        if (totalSessions === 0) {
            recommendations.push('🚀 Ny uke, nye muligheter! Hva skal du trene i dag?');
            if (profile.goal === 'strength') recommendations.push('Tips: Start uken med de tyngste løftene.');
            if (profile.goal === 'weight_loss') recommendations.push('Tips: En gåtur er bedre enn ingenting.');
        } else {
            recommendations.push('🌟 Du er godt i gang denne uken. Fortsett sånn!');
            recommendations.push('💧 Husk å drikke nok vann i løpet av dagen.');
        }
    }

    // Always add recovery advice if training hard
    if (totalSessions >= 5) {
        recommendations.push('💤 Du har trent mye denne uken. Husk at hvile er viktig for fremgang.');
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
