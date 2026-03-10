import { supabase } from './supabaseClient';
import { UserProfile, ExerciseDefinition, WorkoutSession, FavoriteWorkout } from '../types';
import { saveLastSyncAt, saveSyncPending } from './storage';

// ── Profiles ──────────────────────────────────────────────────────────────────

export const pushProfile = async (profile: UserProfile, userId: string): Promise<void> => {
    const { error } = await supabase.from('profiles').upsert({
        user_id: userId,
        name: profile.name,
        age: profile.age ?? null,
        weight: profile.weight ?? null,
        height: profile.height ?? null,
        gender: profile.gender ?? null,
        goal: profile.goal ?? null,
        updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) throw error;
};

export const pullProfile = async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error || !data) return null;
    return {
        name: data.name,
        age: data.age ?? undefined,
        weight: data.weight ?? undefined,
        height: data.height ?? undefined,
        gender: data.gender ?? undefined,
        goal: data.goal ?? undefined,
    };
};

// ── Exercises (custom only) ────────────────────────────────────────────────────

export const pushExercises = async (exercises: ExerciseDefinition[], userId: string): Promise<void> => {
    const custom = exercises.filter(e => e.isCustom);
    if (custom.length === 0) return;
    const { error } = await supabase.from('exercises').upsert(
        custom.map(e => ({
            id: e.id,
            user_id: userId,
            name: e.name,
            muscle_group: e.muscleGroup,
            secondary_muscle_groups: e.secondaryMuscleGroups ?? [],
            type: e.type,
            description: e.description ?? null,
            is_custom: true,
            personal_best: e.personalBest ?? null,
            last_performed: e.lastPerformed ?? null,
            total_sessions: e.totalSessions ?? 0,
            updated_at: new Date().toISOString(),
        })),
        { onConflict: 'id,user_id' }
    );
    if (error) throw error;
};

export const pullExercises = async (userId: string): Promise<ExerciseDefinition[]> => {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', userId)
        .eq('is_custom', true);
    if (error || !data) return [];
    return data.map(row => ({
        id: row.id,
        name: row.name,
        muscleGroup: row.muscle_group,
        secondaryMuscleGroups: row.secondary_muscle_groups ?? undefined,
        type: row.type,
        description: row.description ?? undefined,
        isCustom: true,
        personalBest: row.personal_best ?? undefined,
        lastPerformed: row.last_performed ?? undefined,
        totalSessions: row.total_sessions ?? 0,
    }));
};

// ── Workout Sessions ───────────────────────────────────────────────────────────

export const pushHistory = async (sessions: WorkoutSession[], userId: string): Promise<void> => {
    if (sessions.length === 0) return;
    const { error } = await supabase.from('workout_sessions').upsert(
        sessions.map(s => ({
            id: s.id,
            user_id: userId,
            name: s.name,
            date: s.date,
            start_time: s.startTime,
            end_time: s.endTime ?? null,
            status: s.status,
            exercises_json: s.exercises,
            updated_at: new Date().toISOString(),
        })),
        { onConflict: 'id' }
    );
    if (error) throw error;
};

export const pullHistory = async (userId: string): Promise<WorkoutSession[]> => {
    const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });
    if (error || !data) return [];
    return data.map(row => ({
        id: row.id,
        name: row.name,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time ?? undefined,
        status: row.status,
        exercises: row.exercises_json ?? [],
    }));
};

// ── Favorite Workouts ──────────────────────────────────────────────────────────

export const pushFavorites = async (favorites: FavoriteWorkout[], userId: string): Promise<void> => {
    if (favorites.length === 0) return;
    const { error } = await supabase.from('favorite_workouts').upsert(
        favorites.map(f => ({
            id: f.id,
            user_id: userId,
            name: f.name,
            description: f.description ?? null,
            focus_areas: f.focusAreas ?? [],
            estimated_duration: f.estimatedDuration ?? null,
            times_used: f.timesUsed ?? 0,
            created_date: f.createdDate,
            exercises_json: f.exercises,
            updated_at: new Date().toISOString(),
        })),
        { onConflict: 'id' }
    );
    if (error) throw error;
};

export const pullFavorites = async (userId: string): Promise<FavoriteWorkout[]> => {
    const { data, error } = await supabase
        .from('favorite_workouts')
        .select('*')
        .eq('user_id', userId);
    if (error || !data) return [];
    return data.map(row => ({
        id: row.id,
        name: row.name,
        exercises: row.exercises_json ?? [],
        createdDate: row.created_date,
        description: row.description ?? undefined,
        focusAreas: row.focus_areas ?? undefined,
        estimatedDuration: row.estimated_duration ?? undefined,
        timesUsed: row.times_used ?? 0,
    }));
};

// ── Orchestration ──────────────────────────────────────────────────────────────

interface AppState {
    profile: UserProfile;
    exercises: ExerciseDefinition[];
    history: WorkoutSession[];
    favorites: FavoriteWorkout[];
}

export const syncAll = async (state: AppState, userId: string): Promise<void> => {
    await Promise.all([
        pushProfile(state.profile, userId),
        pushExercises(state.exercises, userId),
        pushHistory(state.history, userId),
        pushFavorites(state.favorites, userId),
    ]);
    saveLastSyncAt(new Date().toISOString());
    saveSyncPending(false);
};

/**
 * On first sign-in: pull cloud data and merge with local data.
 * Merge strategy: append-only on history (union by id), cloud wins for profile if local is default.
 */
export const mergeCloudIntoLocal = async (
    state: AppState,
    userId: string
): Promise<Partial<AppState>> => {
    const [cloudProfile, cloudSessions, cloudCustomExercises, cloudFavorites] = await Promise.all([
        pullProfile(userId),
        pullHistory(userId),
        pullExercises(userId),
        pullFavorites(userId),
    ]);

    const merged: Partial<AppState> = {};

    if (cloudProfile) {
        merged.profile = cloudProfile;
    }

    if (cloudSessions.length > 0) {
        const localIds = new Set(state.history.map(s => s.id));
        const newFromCloud = cloudSessions.filter(s => !localIds.has(s.id));
        if (newFromCloud.length > 0) {
            merged.history = [...state.history, ...newFromCloud].sort(
                (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );
        }
    }

    if (cloudCustomExercises.length > 0) {
        const localIds = new Set(state.exercises.map(e => e.id));
        const newFromCloud = cloudCustomExercises.filter(e => !localIds.has(e.id));
        if (newFromCloud.length > 0) {
            merged.exercises = [...state.exercises, ...newFromCloud];
        }
    }

    if (cloudFavorites.length > 0) {
        const localIds = new Set(state.favorites.map(f => f.id));
        const newFromCloud = cloudFavorites.filter(f => !localIds.has(f.id));
        if (newFromCloud.length > 0) {
            merged.favorites = [...state.favorites, ...newFromCloud];
        }
    }

    return merged;
};
