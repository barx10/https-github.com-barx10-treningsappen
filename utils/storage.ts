import { ExerciseDefinition, WorkoutSession } from '../types';
import { createInitialExercises, createInitialHistory } from './initialData';
import { STORAGE_KEYS } from './storageKeys';

const hasStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

/**
 * Migrate stored exercises to include secondary muscle groups and updated imageUrls from initial data
 */
const migrateExercises = (storedExercises: ExerciseDefinition[]): ExerciseDefinition[] => {
    const initialExercises = createInitialExercises();
    
    return storedExercises.map(stored => {
        // Find matching exercise in initial data (for built-in exercises)
        const initial = initialExercises.find(ex => ex.id === stored.id);
        
        // If it's a built-in exercise, update from initial data
        if (initial && !stored.isCustom) {
            const updates: Partial<ExerciseDefinition> = {};
            
            // Migrate secondaryMuscleGroups if missing
            if (!stored.secondaryMuscleGroups && initial.secondaryMuscleGroups) {
                updates.secondaryMuscleGroups = initial.secondaryMuscleGroups;
            }
            
            // Always use the latest imageUrl from initial data for built-in exercises
            if (initial.imageUrl && stored.imageUrl !== initial.imageUrl) {
                updates.imageUrl = initial.imageUrl;
            }
            
            if (Object.keys(updates).length > 0) {
                return { ...stored, ...updates };
            }
        }
        
        return stored;
    });
};

export const loadExercises = (): ExerciseDefinition[] => {
    if (!hasStorage()) return createInitialExercises();
    try {
        const stored = window.localStorage.getItem(STORAGE_KEYS.EXERCISES);
        if (!stored) return createInitialExercises();
        
        const parsed = JSON.parse(stored);
        const migrated = migrateExercises(parsed);
        
        // Save migrated data back to localStorage
        if (JSON.stringify(migrated) !== stored) {
            window.localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(migrated));
        }
        
        return migrated;
    } catch (error) {
        console.error('Failed to load exercises', error);
        return createInitialExercises();
    }
};

export const saveExercises = (exercises: ExerciseDefinition[]) => {
    if (!hasStorage()) return;
    try {
        window.localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    } catch (error) {
        console.error('Failed to save exercises', error);
    }
};

export const loadHistory = (): WorkoutSession[] => {
    if (!hasStorage()) return createInitialHistory();
    try {
        const stored = window.localStorage.getItem(STORAGE_KEYS.HISTORY);
        return stored ? JSON.parse(stored) : createInitialHistory();
    } catch (error) {
        console.error('Failed to load history', error);
        return createInitialHistory();
    }
};

export const saveHistory = (history: WorkoutSession[]) => {
    if (!hasStorage()) return;
    try {
        window.localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (error) {
        console.error('Failed to save history', error);
    }
};

export const loadActiveSession = (): WorkoutSession | null => {
    if (!hasStorage()) return null;
    try {
        const stored = window.localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Failed to load active session', error);
        return null;
    }
};

export const saveActiveSession = (session: WorkoutSession | null) => {
    if (!hasStorage()) return;
    try {
        if (session) {
            window.localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
        } else {
            window.localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
        }
    } catch (error) {
        console.error('Failed to save active session', error);
    }
};
