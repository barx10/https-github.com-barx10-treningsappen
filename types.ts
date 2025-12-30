export enum MuscleGroup {
  CHEST = 'Bryst',
  BACK = 'Rygg',
  LEGS = 'Bein',
  SHOULDERS = 'Skuldre',
  ARMS = 'Armer',
  CORE = 'Kjerne',
  CARDIO = 'Kondisjon',
  FULL_BODY = 'Helkropp'
}

export enum ExerciseType {
  WEIGHTED = 'Styrke (Vekt)', // Reps x Weight
  BODYWEIGHT = 'Kroppsvekt', // Reps only
  DURATION = 'Tid', // Time based (e.g. Plank, Static hold)
  CARDIO = 'Kardio' // Duration x Intensity/Distance
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscleGroups?: MuscleGroup[]; // Muscles also worked during this exercise
  type: ExerciseType;
  description?: string; // Instructions
  imageUrl?: string; // URL to image/gif
  isCustom?: boolean;
}

export interface WorkoutSet {
  id: string;
  weight?: number; // Used for Kg or Distance/Level depending on context
  reps?: number; // Used for Reps
  durationMinutes?: number; // Specific for cardio/timed exercises
  rpe?: number; // Rate of Perceived Exertion (1-10)
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseDefinitionId: string;
  sets: WorkoutSet[];
  notes?: string;
}

export enum WorkoutStatus {
  ACTIVE = 'Aktiv',
  COMPLETED = 'Fullført',
  CANCELLED = 'Avbrutt'
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string; // ISO Date String
  startTime: string; // ISO Date String
  endTime?: string; // ISO Date String
  exercises: WorkoutExercise[];
  status: WorkoutStatus;
}

// Navigation Types
export enum Screen {
  HOME = 'Hjem',
  HISTORY = 'Historikk',
  ACTIVE_WORKOUT = 'Aktiv Økt',
  EXERCISES = 'Øvelser',
  PROFILE = 'Profil',
  INFO = 'Info',
  AGENT = 'AI Agent'
}

// User Profile
export interface UserProfile {
  name: string;
  age?: number;
  weight?: number; // kg
  height?: number; // cm
  gender?: 'male' | 'female';
  goal?: 'strength' | 'muscle' | 'weight_loss' | 'endurance' | 'general';
}

export interface BackupData {
  profile: UserProfile;
  exercises: ExerciseDefinition[];
  history: WorkoutSession[];
  activeSession: WorkoutSession | null;
}