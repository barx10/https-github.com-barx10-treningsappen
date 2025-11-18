import { 
  ExerciseDefinition, 
  WorkoutSession, 
  MuscleGroup, 
  ExerciseType, 
  WorkoutStatus,
  WorkoutExercise
} from '../types';

// Definerer øvelsene fra programmet ditt + gode alternativer
export const createInitialExercises = (): ExerciseDefinition[] => [
  // --- Oppvarming & Mobilitet ---
  { 
    id: 'ex_warmup', 
    name: 'Oppvarming (Gå + Dynamisk)', 
    muscleGroup: MuscleGroup.FULL_BODY, 
    type: ExerciseType.DURATION,
    description: 'Start med 5 min rolig gange. Siste 2 minutter øker du tempoet. Avslutt med armsirkler, hofterotasjoner og lette knebøy.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Oppvarming'
  },
  { 
    id: 'ex_mobility', 
    name: 'Mobilitetsøvelser (Tøying)', 
    muscleGroup: MuscleGroup.FULL_BODY, 
    type: ExerciseType.DURATION,
    description: 'Fokuser på dynamisk tøying av hofteleddsbøyer, bryst og bakside lår.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Mobilitet'
  },

  // --- Bein (Baseøvelser) ---
  { 
    id: 'ex_squat', 
    name: 'Knebøy / Goblet Squat', 
    muscleGroup: MuscleGroup.LEGS, 
    type: ExerciseType.WEIGHTED,
    description: 'Hold vekten foran brystet. Stå med skulderbreddes avstand. Sett deg ned som om du skal på en stol, hold ryggen rett. Press opp gjennom hælene.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Kneb%C3%B8y'
  },
  { 
    id: 'ex_lunges', 
    name: 'Utfall (Gående/Stående)', 
    muscleGroup: MuscleGroup.LEGS, 
    type: ExerciseType.WEIGHTED,
    description: 'Ta et stort steg frem. Senk bakre kne nesten ned i gulvet. Hold overkroppen oppreist. Skyv tilbake til start.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Utfall'
  },
  { id: 'ex_legpress', name: 'Beinpress', muscleGroup: MuscleGroup.LEGS, type: ExerciseType.WEIGHTED, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Beinpress' },
  { id: 'ex_stepup', name: 'Step-ups på kasse', muscleGroup: MuscleGroup.LEGS, type: ExerciseType.WEIGHTED, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Step-ups' },
  { 
    id: 'ex_bridge', 
    name: 'Hoftehev / Glute Bridge', 
    muscleGroup: MuscleGroup.LEGS, 
    type: ExerciseType.BODYWEIGHT,
    description: 'Ligg på ryggen med føttene i gulvet. Løft hoften opp mot taket ved å stramme setemusklene. Hold i 1-2 sekunder på toppen.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Hoftehev'
  },
  { 
    id: 'ex_deadlift', 
    name: 'Markløft (KB/Stang)', 
    muscleGroup: MuscleGroup.BACK, 
    type: ExerciseType.WEIGHTED,
    description: 'Stå med vekten mellom føttene. Bøy i hofta (ikke ryggen) for å gripe vekten. Stram magen, og reis deg opp ved å skyve hofta frem.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Markl%C3%B8ft'
  },
  { id: 'ex_rdl', name: 'Strake Markløft (Rumensk)', muscleGroup: MuscleGroup.LEGS, type: ExerciseType.WEIGHTED, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Strake+Markl%C3%B8ft' },

  // --- Press (Bryst/Skuldre) ---
  { 
    id: 'ex_pushup', 
    name: 'Armhevinger', 
    muscleGroup: MuscleGroup.CHEST, 
    type: ExerciseType.BODYWEIGHT,
    description: 'Plasser hendene litt bredere enn skuldrene. Hold kroppen strak som en planke. Senk brystet mot gulvet og skyv opp.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Armhevinger'
  },
  { 
    id: 'ex_bench', 
    name: 'Benkpress', 
    muscleGroup: MuscleGroup.CHEST, 
    type: ExerciseType.WEIGHTED,
    description: 'Ligg på benken. Senk stangen kontrollert ned til brystet. Press stangen opp til armene er strake.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Benkpress'
  },
  { 
    id: 'ex_press', 
    name: 'Skulderpress', 
    muscleGroup: MuscleGroup.SHOULDERS, 
    type: ExerciseType.WEIGHTED,
    description: 'Press manualene eller stangen fra skuldrene og rett opp over hodet. Senk kontrollert ned igjen.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Skulderpress'
  },
  { id: 'ex_dips', name: 'Dips', muscleGroup: MuscleGroup.ARMS, type: ExerciseType.BODYWEIGHT, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Dips' },
  { id: 'ex_lateral', name: 'Sidehev', muscleGroup: MuscleGroup.SHOULDERS, type: ExerciseType.WEIGHTED, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Sidehev' },

  // --- Trekk (Rygg) ---
  { 
    id: 'ex_row', 
    name: 'Roing', 
    muscleGroup: MuscleGroup.BACK, 
    type: ExerciseType.WEIGHTED,
    description: 'Len deg fremover med rett rygg. Trekk vekten opp mot nedre del av magen. Klem skulderbladene sammen.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Roing'
  },
  { 
    id: 'ex_lat_row', 
    name: 'Nedtrekk / Sittende Roing', 
    muscleGroup: MuscleGroup.BACK, 
    type: ExerciseType.WEIGHTED,
    description: 'Trekk stangen ned til øvre del av brystet. Hold albuene litt ut til siden. Slipp rolig opp igjen.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Nedtrekk'
  },
  { id: 'ex_facepull', name: 'Face Pulls', muscleGroup: MuscleGroup.SHOULDERS, type: ExerciseType.WEIGHTED, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Face+Pulls' },
  { id: 'ex_back_ext', name: 'Rygghev', muscleGroup: MuscleGroup.BACK, type: ExerciseType.BODYWEIGHT, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Rygghev' },
  { id: 'ex_pullup', name: 'Pull-ups', muscleGroup: MuscleGroup.BACK, type: ExerciseType.BODYWEIGHT, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Pull-ups' },

  // --- Kjerne ---
  { 
    id: 'ex_plank', 
    name: 'Planke', 
    muscleGroup: MuscleGroup.CORE, 
    type: ExerciseType.DURATION,
    description: 'Støtt deg på albuene og tærne. Hold kroppen helt rett. Stram magen og setet. Ikke la korsryggen svaie.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Planke'
  },
  { id: 'ex_sideplank', name: 'Sideplanke', muscleGroup: MuscleGroup.CORE, type: ExerciseType.DURATION, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Sideplanke' },
  { id: 'ex_deadbug', name: 'Deadbug', muscleGroup: MuscleGroup.CORE, type: ExerciseType.BODYWEIGHT, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Deadbug' },
  { id: 'ex_russiantwist', name: 'Russian Twist', muscleGroup: MuscleGroup.CORE, type: ExerciseType.BODYWEIGHT, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Russian+Twist' },

  // --- Kondisjon (Lavterskel & Helse) ---
  { 
    id: 'ex_walk_int', 
    name: 'Gange m/ Intervaller', 
    muscleGroup: MuscleGroup.CARDIO, 
    type: ExerciseType.CARDIO,
    description: 'Veksle mellom rask gange (andpusten) og rolig gange. F.eks. 1 min raskt, 1 min rolig.',
    imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Gange'
  },
  { id: 'ex_walk_fast', name: 'Rask Gange', muscleGroup: MuscleGroup.CARDIO, type: ExerciseType.CARDIO, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Rask+Gange' },
  { id: 'ex_stairs', name: 'Trappeintervaller', muscleGroup: MuscleGroup.CARDIO, type: ExerciseType.CARDIO, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Trapper' },
  { id: 'ex_bike', name: 'Sykling', muscleGroup: MuscleGroup.CARDIO, type: ExerciseType.CARDIO, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Sykling' },
  { id: 'ex_elliptical', name: 'Ellippsemmaskin', muscleGroup: MuscleGroup.CARDIO, type: ExerciseType.CARDIO, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Ellipse' },
  { id: 'ex_row_machine', name: 'Romaskin', muscleGroup: MuscleGroup.CARDIO, type: ExerciseType.CARDIO, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Romaskin' },
  { id: 'ex_swim', name: 'Svømming', muscleGroup: MuscleGroup.CARDIO, type: ExerciseType.CARDIO, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Sv%C3%B8mming' },
  { id: 'ex_hike', name: 'Fjelltur / Skogstur', muscleGroup: MuscleGroup.CARDIO, type: ExerciseType.CARDIO, imageUrl: 'https://placehold.co/600x400/1e293b/f1f5f9?text=Tur' },

].sort((a, b) => a.name.localeCompare(b.name)); // Sorterer alfabetisk for bedre oversikt

// Hjelpefunksjon for å lage sett
const createSets = (count: number, reps: number = 10) => {
  return Array(count).fill(null).map(() => ({
    id: crypto.randomUUID(),
    weight: 0,
    reps: reps,
    completed: false
  }));
};

// Maler for øktene dine
export const createSessionA = (): WorkoutSession => ({
  id: crypto.randomUUID(),
  name: 'Økt A: Styrke & Intervall',
  date: new Date().toISOString(),
  startTime: new Date().toISOString(),
  status: WorkoutStatus.ACTIVE,
  exercises: [
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_warmup', notes: '5 min rolig + 2 min raskere. Dynamisk tøyning.', sets: [{ id: crypto.randomUUID(), durationMinutes: 10, completed: false }] },
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_squat', notes: '3 sett x 8-10 reps', sets: createSets(3, 10) },
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_pushup', notes: 'Eller benkpress. 3 sett x 8-10 reps', sets: createSets(3, 10) },
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_row', notes: '3 sett x 8-10 reps', sets: createSets(3, 10) },
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_bridge', notes: '3 sett x 10-12 reps', sets: createSets(3, 12) },
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_walk_int', notes: '1 min rask / 1 min rolig x 6-8 ganger', sets: [{ id: crypto.randomUUID(), durationMinutes: 15, completed: false }] },
  ]
});

export const createSessionB = (): WorkoutSession => ({
  id: crypto.randomUUID(),
  name: 'Økt B: Base & Trapper',
  date: new Date().toISOString(),
  startTime: new Date().toISOString(),
  status: WorkoutStatus.ACTIVE,
  exercises: [
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_warmup', notes: '5 min rolig + 2 min raskere. Dynamisk tøyning.', sets: [{ id: crypto.randomUUID(), durationMinutes: 10, completed: false }] },
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_deadlift', notes: 'Kettlebell eller stang. 3 sett x 6-8 reps', sets: createSets(3, 8) },
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_press', notes: 'Sittende eller stående. 3 sett x 8-10 reps', sets: createSets(3, 10) },
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_lat_row', notes: '3 sett x 8-10 reps', sets: createSets(3, 10) },
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_plank', notes: '3 runder x 15-30 sek', sets: [{ id: crypto.randomUUID(), durationMinutes: 0.5, completed: false }, { id: crypto.randomUUID(), durationMinutes: 0.5, completed: false }, { id: crypto.randomUUID(), durationMinutes: 0.5, completed: false }] },
    { id: crypto.randomUUID(), exerciseDefinitionId: 'ex_stairs', notes: 'Gå opp/ned 1 etg. Pause 1 min. 5-8 ganger.', sets: [{ id: crypto.randomUUID(), durationMinutes: 10, completed: false }] },
  ]
});

export const createInitialHistory = (): WorkoutSession[] => {
  // Lager en "fullført" Økt A for et par dager siden for å vise historikk
  const date = new Date();
  date.setDate(date.getDate() - 2);

  const session = createSessionA();
  session.id = 'past_session_1';
  session.status = WorkoutStatus.COMPLETED; // Corrected syntax from previous version
  session.date = date.toISOString();
  session.startTime = date.toISOString();
  session.endTime = new Date(date.getTime() + 45 * 60000).toISOString(); // 45 min later
  session.exercises.forEach(ex => ex.sets.forEach(s => {
    s.completed = true;
    s.weight = 10; // Mock data
  }));

  return [session];
};

export const createEmptySession = (): WorkoutSession => ({
  id: crypto.randomUUID(),
  name: 'Egentrening',
  date: new Date().toISOString(),
  startTime: new Date().toISOString(),
  exercises: [],
  status: WorkoutStatus.ACTIVE
});