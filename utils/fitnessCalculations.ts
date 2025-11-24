import { UserProfile, WorkoutSession, ExerciseDefinition, ExerciseType } from '../types';

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
    history: WorkoutSession[]
): string[] => {
    const recommendations: string[] = [];

    // Calculate weekly workout frequency
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyWorkouts = history.filter((s) => new Date(s.date) >= weekAgo).length;

    // Goal-based recommendations
    if (profile.goal === 'strength') {
        if (weeklyWorkouts < 3) {
            recommendations.push('💪 For optimal styrkeøkning, tren 3-4 ganger i uken');
        }
        recommendations.push('🎯 Fokuser på progressive overload - øk vekt gradvis');
        recommendations.push('⏱️ Ta 2-3 minutters pause mellom tunge sett');
    } else if (profile.goal === 'muscle') {
        if (weeklyWorkouts < 4) {
            recommendations.push('🏋️ For muskelbygging, tren 4-5 ganger i uken');
        }
        recommendations.push('🍗 Sørg for å få nok protein (1.6-2.2g per kg kroppsvekt)');
        recommendations.push('💤 Hvil er viktig - muskler vokser under restitusjon');
    } else if (profile.goal === 'weight_loss') {
        recommendations.push('🔥 Kombiner styrke og kondisjon for best fettforbrenning');
        recommendations.push('🥗 Kaloriunderskudd er nøkkelen til vektnedgang');
        if (weeklyWorkouts < 4) {
            recommendations.push('📈 Øk til 4-5 økter i uken for raskere resultater');
        }
    } else if (profile.goal === 'endurance') {
        recommendations.push('🏃 Bygg opp distanse og varighet gradvis');
        recommendations.push('❤️ Tren i ulike intensitetssoner for best effekt');
        if (weeklyWorkouts < 3) {
            recommendations.push('📊 Tren minst 3 ganger i uken for å bygge kondisjon');
        }
    }

    // General recommendations
    if (weeklyWorkouts === 0) {
        recommendations.push('🚀 Kom i gang! Start med 2-3 økter denne uken');
    } else if (weeklyWorkouts >= 6) {
        recommendations.push('⚠️ Husk å ta hvile - kroppen trenger restitusjon');
    }

    // Age-based recommendations
    if (profile.age && profile.age > 40) {
        recommendations.push('🧘 Inkluder mobilitet og tøying i programmet ditt');
    }

    return recommendations.slice(0, 3); // Return top 3
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
