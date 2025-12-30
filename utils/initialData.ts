import {
  ExerciseDefinition,
  WorkoutSession,
  MuscleGroup,
  ExerciseType,
  WorkoutStatus,
  WorkoutExercise
} from '../types';
import { getTodayDateString, getDateString } from './dateUtils';

// Definerer øvelsene fra programmet ditt + gode alternativer
export const createInitialExercises = (): ExerciseDefinition[] => [
  // --- Oppvarming & Mobilitet ---
  {
    id: 'ex_warmup',
    name: 'Oppvarming (Gå + Dynamisk)',
    muscleGroup: MuscleGroup.CARDIO,
    type: ExerciseType.DURATION,
    description: 'Start med 5 min rolig gange. Siste 2 minutter øker du tempoet. Avslutt med armsirkler, hofterotasjoner og lette knebøy.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/07/Arm-Circles_Shoulders.gif'
  },
  {
    id: 'ex_mobility',
    name: 'Mobilitetsøvelser (Tøying)',
    muscleGroup: MuscleGroup.CORE,
    type: ExerciseType.DURATION,
    description: 'Fokuser på dynamisk tøying av hofteleddsbøyer, bryst og bakside lår.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/08/Kneeling-Hip-Flexor-Stretch.gif'
  },

  // --- Bein (Baseøvelser) ---
  {
    id: 'ex_squat',
    name: 'Knebøy / Goblet Squat',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Hold vekten foran brystet. Stå med skulderbreddes avstand. Sett deg ned som om du skal på en stol, hold ryggen rett. Press opp gjennom hælene.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2023/01/Dumbbell-Goblet-Squat.gif'
  },
  {
    id: 'ex_lunges',
    name: 'Utfall (Gående/Stående)',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Ta et stort steg frem. Senk bakre kne nesten ned i gulvet. Hold overkroppen oppreist. Skyv tilbake til start.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2023/09/dumbbell-lunges.gif'
  },
  {
    id: 'ex_legpress',
    name: 'Beinpress',
    muscleGroup: MuscleGroup.LEGS,
    type: ExerciseType.WEIGHTED,
    description: 'Sitt i maskinen med ryggen godt inntil setet. Plasser føttene i skulderbredde på platen. Press platen bort til beina er nesten strake, og senk rolig tilbake.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2015/11/Leg-Press.gif'
  },
  {
    id: 'ex_stepup',
    name: 'Step-ups på kasse',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Stå foran en kasse eller benk. Sett den ene foten opp på kassen. Press deg opp ved å bruke beinet på kassen, til du står med begge føttene oppe. Senk deg kontrollert ned igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Step-up.gif'
  },
  {
    id: 'ex_bridge',
    name: 'Hoftehev / Glute Bridge',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CORE],
    type: ExerciseType.BODYWEIGHT,
    description: 'Ligg på ryggen med føttene i gulvet. Løft hoften opp mot taket ved å stramme setemusklene. Hold i 1-2 sekunder på toppen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Glute-Bridge-.gif'
  },
  {
    id: 'ex_bulgarian_split',
    name: 'Bulgarian Split Squat',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Stå foran en benk. Plasser den ene foten bakover på benken. Senk kroppen ved å bøye det fremre beinet til kneet nesten berører gulvet. Press opp igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/05/Dumbbell-Bulgarian-Split-Squat.gif'
  },
  {
    id: 'ex_leg_curl',
    name: 'Leg Curl',
    muscleGroup: MuscleGroup.LEGS,
    type: ExerciseType.WEIGHTED,
    description: 'Ligg på magen i leg curl-maskinen. Bøy knærne for å trekke vekten opp mot setet. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif'
  },
  {
    id: 'ex_calf_raise',
    name: 'Calf Raises',
    muscleGroup: MuscleGroup.LEGS,
    type: ExerciseType.WEIGHTED,
    description: 'Stå med tærne på en forhøyning. Løft hælene opp så høyt du kan. Senk kontrollert ned igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Calf-Raise.gif'
  },
  {
    id: 'ex_deadlift',
    name: 'Markløft',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.LEGS, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Stå med vekten mellom føttene. Bøy i hofta (ikke ryggen) for å gripe vekten. Stram magen, og reis deg opp ved å skyve hofta frem.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif'
  },
  {
    id: 'ex_rdl',
    name: 'Strake Markløft (Rumensk)',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.BACK, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Stå med føttene i hoftebredde. Hold stangen/vektene foran lårene. Bøy i hoften og senk vektene ned langs beina mens du holder ryggen rett og beina nesten strake. Kjenn strekken i bakside lår.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif'
  },

  // --- Press (Bryst/Skuldre) ---
  {
    id: 'ex_pushup',
    name: 'Armhevinger',
    muscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.SHOULDERS, MuscleGroup.CORE],
    type: ExerciseType.BODYWEIGHT,
    description: 'Plasser hendene litt bredere enn skuldrene. Hold kroppen strak som en planke. Senk brystet mot gulvet og skyv opp.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif'
  },
  {
    id: 'ex_bench',
    name: 'Benkpress',
    muscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Ligg på benken. Senk stangen kontrollert ned til brystet. Press stangen opp til armene er strake.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif'
  },
  {
    id: 'ex_incline_press',
    name: 'Incline Press',
    muscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Ligg på en skråbenk (30-45 grader). Press manualene eller stangen opp fra brystet til armene er strake.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif'
  },
  {
    id: 'ex_cable_fly',
    name: 'Cable Flies',
    muscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Stå mellom to kabelstasjoner med armene ut til siden. Trekk hendene sammen foran brystet i en bueformet bevegelse.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif'
  },
  {
    id: 'ex_press',
    name: 'Skulderpress',
    muscleGroup: MuscleGroup.SHOULDERS,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Press manualene eller stangen fra skuldrene og rett opp over hodet. Senk kontrollert ned igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif'
  },
  {
    id: 'ex_arnold_press',
    name: 'Arnold Press',
    muscleGroup: MuscleGroup.SHOULDERS,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Sitt med manualene foran skuldrene, håndflater mot deg. Roter håndleddene mens du presser vektene opp over hodet.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Arnold-Press.gif'
  },
  {
    id: 'ex_lateral',
    name: 'Sidehev',
    muscleGroup: MuscleGroup.SHOULDERS,
    type: ExerciseType.WEIGHTED,
    description: 'Stå med en manual i hver hånd. Løft armene rett ut til siden til de er på høyde med skuldrene. Senk rolig ned igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif'
  },
  {
    id: 'ex_dips',
    name: 'Dips',
    muscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.SHOULDERS],
    type: ExerciseType.BODYWEIGHT,
    description: 'Hold i stengene med strake armer. Senk kroppen ned ved å bøye i albuene til overarmene er parallelle med gulvet. Press opp igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Chest-Dips.gif'
  },

  // --- Trekk (Rygg) ---
  {
    id: 'ex_row',
    name: 'Sittende Roing',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Sitt i maskinen med brystet mot puten. Trekk håndtaket mot magen med rett rygg. Klem skulderbladene sammen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif'
  },
  {
    id: 'ex_lat_row',
    name: 'Nedtrekk',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.ARMS],
    type: ExerciseType.WEIGHTED,
    description: 'Trekk stangen ned til øvre del av brystet. Hold albuene litt ut til siden. Slipp rolig opp igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif'
  },
  {
    id: 'ex_pullup',
    name: 'Pull-ups',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.CORE],
    type: ExerciseType.BODYWEIGHT,
    description: 'Heng i stangen med hendene litt bredere enn skulderbredde. Trekk deg opp til haken er over stangen. Senk deg kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif'
  },
  {
    id: 'ex_tbar_row',
    name: 'T-bar Row',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Len deg fremover over T-bar stangen. Trekk vekten opp mot brystet med rett rygg. Klem skulderbladene sammen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/t-bar-rows.gif'
  },
  {
    id: 'ex_facepull',
    name: 'Face Pulls',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Fest et tau i kabelmaskinen i hodehøyde. Trekk tauet mot ansiktet mens du trekker albuene ut og bakover. Klem skulderbladene sammen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif'
  },
  {
    id: 'ex_back_ext',
    name: 'Rygghev',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.LEGS],
    type: ExerciseType.BODYWEIGHT,
    description: 'Ligg på magen eller i et rygghev-apparat. Løft overkroppen opp ved å bruke korsryggen. Senk rolig ned igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/hyperextension.gif'
  },

  // --- Kjerne ---
  {
    id: 'ex_plank',
    name: 'Planke',
    muscleGroup: MuscleGroup.CORE,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    type: ExerciseType.DURATION,
    description: 'Støtt deg på albuene og tærne. Hold kroppen helt rett. Stram magen og setet. Ikke la korsryggen svaie.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/plank.gif'
  },
  {
    id: 'ex_sideplank',
    name: 'Sideplanke',
    muscleGroup: MuscleGroup.CORE,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    type: ExerciseType.DURATION,
    description: 'Ligg på siden og støtt deg på albuen. Løft hoften opp fra gulvet slik at kroppen danner en rett linje. Hold posisjonen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/05/Side-Bridge.gif'
  },
  {
    id: 'ex_deadbug',
    name: 'Deadbug',
    muscleGroup: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    description: 'Ligg på ryggen med armer og bein opp mot taket. Senk motsatt arm og bein rolig ned mot gulvet mens du holder korsryggen presset ned i underlaget. Bytt side.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/05/Dead-Bug.gif'
  },
  {
    id: 'ex_russiantwist',
    name: 'Russian Twist',
    muscleGroup: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    description: 'Sitt på rumpa med bøyde knær og føttene litt over gulvet. Len overkroppen litt bakover. Roter overkroppen fra side til side, gjerne med en vekt i hendene.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Russian-Twist.gif'
  },
  {
    id: 'ex_hanging_knee',
    name: 'Hanging Knee Raises',
    muscleGroup: MuscleGroup.CORE,
    secondaryMuscleGroups: [MuscleGroup.ARMS],
    type: ExerciseType.BODYWEIGHT,
    description: 'Heng i en stang med strake armer. Løft knærne opp mot brystet ved å bruke magemusklene. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hanging-Knee-Raises.gif'
  },

  // --- Armer ---
  {
    id: 'ex_bicep_curl',
    name: 'Bicep Curl',
    muscleGroup: MuscleGroup.ARMS,
    type: ExerciseType.WEIGHTED,
    description: 'Stå med manualene hengende langs siden. Bøy albuene for å løfte vektene opp mot skuldrene. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif'
  },
  {
    id: 'ex_tricep_ext',
    name: 'Tricep Extensions',
    muscleGroup: MuscleGroup.ARMS,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Hold en manual over hodet med begge hender. Senk vekten bak hodet ved å bøye i albuene. Strekk armene tilbake opp.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Triceps-Extension.gif'
  },

  // --- Kondisjon (Lavterskel & Helse) ---
  {
    id: 'ex_walk_int',
    name: 'Gange m/ Intervaller',
    muscleGroup: MuscleGroup.CARDIO,
    secondaryMuscleGroups: [MuscleGroup.LEGS],
    type: ExerciseType.CARDIO,
    description: 'Veksle mellom rask gange (andpusten) og rolig gange. F.eks. 1 min raskt, 1 min rolig.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Walking.gif'
  },
  {
    id: 'ex_walk_fast',
    name: 'Rask Gange',
    muscleGroup: MuscleGroup.CARDIO,
    secondaryMuscleGroups: [MuscleGroup.LEGS],
    type: ExerciseType.CARDIO,
    description: 'Gå i et tempo som gjør at du blir varm og litt andpusten, men fortsatt kan føre en samtale.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Briskly-Walking.gif'
  },
  {
    id: 'ex_stairs',
    name: 'Trappeintervaller',
    muscleGroup: MuscleGroup.CARDIO,
    secondaryMuscleGroups: [MuscleGroup.LEGS],
    type: ExerciseType.CARDIO,
    description: 'Løp eller gå raskt opp en trapp. Gå rolig ned igjen. Gjenta.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/10/Walking-on-Stepmill.gif'
  },
  {
    id: 'ex_bike',
    name: 'Sykling',
    muscleGroup: MuscleGroup.CARDIO,
    secondaryMuscleGroups: [MuscleGroup.LEGS],
    type: ExerciseType.CARDIO,
    description: 'Sykling utendørs eller på ergometersykkel. Hold et jevnt tempo eller kjør intervaller.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Bike.gif'
  },
  {
    id: 'ex_elliptical',
    name: 'Ellippsemmaskin',
    muscleGroup: MuscleGroup.CARDIO,
    type: ExerciseType.CARDIO,
    description: 'Bruk armer og bein til å skape en jevn bevegelse. Hold ryggen rett.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/10/Elliptical-Machine.gif'
  },
  {
    id: 'ex_row_machine',
    name: 'Romaskin',
    muscleGroup: MuscleGroup.CARDIO,
    type: ExerciseType.CARDIO,
    description: 'Sitt på setet med føttene festet. Skyv fra med beina, len deg litt bakover og trekk håndtaket mot nedre del av brystet. Returner i motsatt rekkefølge.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Rowing-Machine.gif'
  },
  {
    id: 'ex_hike',
    name: 'Fjelltur / Skogstur',
    muscleGroup: MuscleGroup.CARDIO,
    type: ExerciseType.CARDIO,
    description: 'Gå tur i ulendt terreng. God trening for både kondisjon og balanse.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Walking.gif'
  },

  // --- Flere Brystøvelser ---
  {
    id: 'ex_decline_press',
    name: 'Decline Benkpress',
    muscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Ligg på en skråbenk med hodet lavere enn føttene. Senk stangen kontrollert ned til nedre del av brystet. Press stangen opp til armene er strake.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Decline-Barbell-Bench-Press.gif'
  },
  {
    id: 'ex_pec_deck',
    name: 'Pec Deck / Butterfly',
    muscleGroup: MuscleGroup.CHEST,
    type: ExerciseType.WEIGHTED,
    description: 'Sitt i maskinen med ryggen mot puten. Plasser underarmene mot putene. Press armene sammen foran brystet. Returner kontrollert.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pec-Deck-Fly.gif'
  },
  {
    id: 'ex_chest_press_machine',
    name: 'Brystpress (Maskin)',
    muscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Sitt i maskinen med ryggen mot setet. Grip håndtakene og press fremover til armene er nesten strake. Returner kontrollert.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Chest-Press-Machine.gif'
  },
  {
    id: 'ex_dumbbell_fly',
    name: 'Dumbbell Fly',
    muscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Ligg på benken med manualene over brystet. Senk armene ut til siden i en bue med lett bøy i albuene. Før armene tilbake opp i en klem-bevegelse.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif'
  },
  {
    id: 'ex_svend_press',
    name: 'Svend Press',
    muscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Hold en vektskive mellom håndflatene foran brystet. Press hendene sammen og skyv skiven rett frem. Trekk tilbake til brystet.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Svend-Press.gif'
  },

  // --- Flere Ryggøvelser ---
  {
    id: 'ex_single_arm_row',
    name: 'Enarms Roing',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Støtt en hånd og kne på en benk. Hold en manual i den andre hånden. Trekk vekten opp mot hoften med albuen tett inntil kroppen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif'
  },
  {
    id: 'ex_bent_over_row',
    name: 'Bøyd Roing',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Stå med lett bøyde knær og len overkroppen fremover. Hold stangen med strake armer. Trekk stangen opp mot magen mens du klemmer skulderbladene sammen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif'
  },
  {
    id: 'ex_reverse_fly',
    name: 'Reverse Fly',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Len deg fremover med en manual i hver hånd. Løft armene ut til siden med lett bøy i albuene. Fokuser på å klemme skulderbladene sammen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Reverse-Fly.gif'
  },
  {
    id: 'ex_close_grip_pulldown',
    name: 'Nedtrekk (Tett grep)',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.ARMS],
    type: ExerciseType.WEIGHTED,
    description: 'Grip V-håndtaket med begge hender. Trekk håndtaket ned til øvre del av brystet med albuene tett inntil kroppen. Slipp kontrollert opp.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/V-bar-Lat-Pulldown.gif'
  },
  {
    id: 'ex_straight_arm_pulldown',
    name: 'Strak Arm Nedtrekk',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Stå foran en kabelstasjon. Med strake armer, trekk stangen ned mot lårene. Hold magen stram og fokuser på å bruke latissimus.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Rope-Straight-Arm-Pulldown.gif'
  },
  {
    id: 'ex_chinup',
    name: 'Chin-ups',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.ARMS],
    type: ExerciseType.BODYWEIGHT,
    description: 'Heng i stangen med underhåndsgrep (håndflater mot deg). Trekk deg opp til haken er over stangen. Senk deg kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Chin-up.gif'
  },
  {
    id: 'ex_shrug',
    name: 'Skuldertrekk (Shrugs)',
    muscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Stå med vekter i hendene langs siden. Løft skuldrene rett opp mot ørene. Hold i ett sekund og senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Dumbbell-Shrug.gif'
  },

  // --- Flere Skulderøvelser ---
  {
    id: 'ex_front_raise',
    name: 'Fronthev',
    muscleGroup: MuscleGroup.SHOULDERS,
    type: ExerciseType.WEIGHTED,
    description: 'Stå med manualene foran lårene. Løft en arm rett frem til skulderhøyde. Senk kontrollert ned og gjenta med andre arm.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Front-Raise.gif'
  },
  {
    id: 'ex_rear_delt_fly',
    name: 'Bakre Skulderhev',
    muscleGroup: MuscleGroup.SHOULDERS,
    secondaryMuscleGroups: [MuscleGroup.BACK],
    type: ExerciseType.WEIGHTED,
    description: 'Len deg fremover i hoften. Med lett bøy i albuene, løft armene ut til siden. Fokuser på bakre del av skulderen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bent-Over-Lateral-Raise.gif'
  },
  {
    id: 'ex_upright_row',
    name: 'Opptrekk',
    muscleGroup: MuscleGroup.SHOULDERS,
    secondaryMuscleGroups: [MuscleGroup.BACK, MuscleGroup.ARMS],
    type: ExerciseType.WEIGHTED,
    description: 'Hold stangen eller manualene foran lårene. Trekk vekten opp langs kroppen til brysthøyde med albuene høyt. Senk kontrollert.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Upright-Row.gif'
  },
  {
    id: 'ex_cable_lateral',
    name: 'Kabel Sidehev',
    muscleGroup: MuscleGroup.SHOULDERS,
    type: ExerciseType.WEIGHTED,
    description: 'Stå ved siden av en lav kabel. Trekk kabelen ut til siden til armen er på skulderhøyde. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Lateral-Raise.gif'
  },
  {
    id: 'ex_landmine_press',
    name: 'Landmine Press',
    muscleGroup: MuscleGroup.SHOULDERS,
    secondaryMuscleGroups: [MuscleGroup.CHEST, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Hold enden av en stang festet i gulvet. Press stangen opp og fremover i en bue. Kontroller bevegelsen ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Landmine-Press.gif'
  },

  // --- Flere Beinøvelser ---
  {
    id: 'ex_leg_extension',
    name: 'Leg Extension',
    muscleGroup: MuscleGroup.LEGS,
    type: ExerciseType.WEIGHTED,
    description: 'Sitt i maskinen med knærne i 90 grader. Strekk beina ut til de er nesten strake. Senk kontrollert ned igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif'
  },
  {
    id: 'ex_hip_thrust',
    name: 'Hip Thrust',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Len øvre rygg mot en benk. Plasser en vektstang over hoften. Driv hoften opp mot taket ved å stramme setet. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif'
  },
  {
    id: 'ex_sumo_squat',
    name: 'Sumo Knebøy',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Stå med bred benstilling og tærne pekende utover. Hold en vekt foran kroppen. Senk deg ned til lårene er parallelle med gulvet.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/dumbbell-sumo-squat.gif'
  },
  {
    id: 'ex_hack_squat',
    name: 'Hack Squat',
    muscleGroup: MuscleGroup.LEGS,
    type: ExerciseType.WEIGHTED,
    description: 'Plasser deg i hack squat-maskinen med skuldrene under putene. Senk deg ned til knærne er i 90 grader. Press opp igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Sled-Hack-Squat.gif'
  },
  {
    id: 'ex_good_morning',
    name: 'Good Mornings',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.BACK, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Plasser en stang på øvre rygg. Med lett bøy i knærne, bøy fremover i hoften til overkroppen er nesten parallell med gulvet. Reis deg opp igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Good-Morning.gif'
  },
  {
    id: 'ex_adductor',
    name: 'Adduktor Maskin',
    muscleGroup: MuscleGroup.LEGS,
    type: ExerciseType.WEIGHTED,
    description: 'Sitt i maskinen med beina spredt. Press beina sammen mot hverandre. Returner kontrollert til start.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hip-Adduction-Machine.gif'
  },
  {
    id: 'ex_abductor',
    name: 'Abduktor Maskin',
    muscleGroup: MuscleGroup.LEGS,
    type: ExerciseType.WEIGHTED,
    description: 'Sitt i maskinen med beina sammen. Press beina ut til siden mot motstanden. Returner kontrollert til start.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/HiP-ABDUCTION-MACHINE.gif'
  },
  {
    id: 'ex_front_squat',
    name: 'Front Squat',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Hold stangen foran skuldrene med albuene høyt. Senk deg ned i en knebøy med oppreist overkropp. Press opp igjen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/front-squat.gif'
  },
  {
    id: 'ex_sissy_squat',
    name: 'Sissy Squat',
    muscleGroup: MuscleGroup.LEGS,
    type: ExerciseType.BODYWEIGHT,
    description: 'Hold i noe for balanse. Len deg bakover mens du bøyer knærne og går opp på tærne. Knærne beveger seg fremover. Kjenn strekk i lårene.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2022/10/sissy-squat.gif'
  },
  {
    id: 'ex_nordic_curl',
    name: 'Nordic Hamstring Curl',
    muscleGroup: MuscleGroup.LEGS,
    type: ExerciseType.BODYWEIGHT,
    description: 'Knel med anklene festet. Senk kroppen fremover kontrollert ved å bruke hamstrings som brems. Bruk hendene til å dytte deg tilbake opp.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Nordic-Hamstring-Curl.gif'
  },
  {
    id: 'ex_donkey_kick',
    name: 'Donkey Kicks',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CORE],
    type: ExerciseType.BODYWEIGHT,
    description: 'Start på alle fire. Spark ett bein opp og bakover med bøyd kne. Klem setemusklene på toppen. Senk ned og gjenta.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Donkey-Kicks.gif'
  },

  // --- Flere Armøvelser ---
  {
    id: 'ex_hammer_curl',
    name: 'Hammer Curl',
    muscleGroup: MuscleGroup.ARMS,
    type: ExerciseType.WEIGHTED,
    description: 'Hold manualene med nøytralt grep (tommelen opp). Bøy albuene for å løfte vektene. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif'
  },
  {
    id: 'ex_preacher_curl',
    name: 'Preacher Curl',
    muscleGroup: MuscleGroup.ARMS,
    type: ExerciseType.WEIGHTED,
    description: 'Hvil overarmene på preacher-benken. Bøy albuene for å løfte stangen opp mot skuldrene. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Preacher-Curl.gif'
  },
  {
    id: 'ex_cable_curl',
    name: 'Kabel Bicep Curl',
    muscleGroup: MuscleGroup.ARMS,
    type: ExerciseType.WEIGHTED,
    description: 'Stå foran en lav kabel. Grip håndtaket og curl opp mot skuldrene. Hold albuene stille. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/cable-curl.gif'
  },
  {
    id: 'ex_concentration_curl',
    name: 'Concentration Curl',
    muscleGroup: MuscleGroup.ARMS,
    type: ExerciseType.WEIGHTED,
    description: 'Sitt med albuen hvilende mot innsiden av låret. Curl manualen opp mot skulderen. Fokuser på full sammentrekning.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Concentration-Curl.gif'
  },
  {
    id: 'ex_tricep_pushdown',
    name: 'Tricep Pushdown',
    muscleGroup: MuscleGroup.ARMS,
    type: ExerciseType.WEIGHTED,
    description: 'Stå foran kabelmaskin med tau eller stang. Press vekten ned ved å strekke albuene. Hold overarmene stille.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif'
  },
  {
    id: 'ex_skull_crusher',
    name: 'Skull Crushers',
    muscleGroup: MuscleGroup.ARMS,
    type: ExerciseType.WEIGHTED,
    description: 'Ligg på en benk med stangen over brystet. Senk stangen mot pannen ved å bøye albuene. Strekk armene tilbake opp.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Triceps-Extension.gif'
  },
  {
    id: 'ex_close_grip_bench',
    name: 'Tett Grep Benkpress',
    muscleGroup: MuscleGroup.ARMS,
    secondaryMuscleGroups: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Ligg på benken med hendene skulderbredde fra hverandre. Senk stangen til brystet og press opp. Fokuser på triceps.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Close-Grip-Bench-Press.gif'
  },
  {
    id: 'ex_tricep_kickback',
    name: 'Tricep Kickback',
    muscleGroup: MuscleGroup.ARMS,
    type: ExerciseType.WEIGHTED,
    description: 'Len deg fremover med en manual i hånden. Hold overarmen parallell med gulvet. Strekk underarmen bakover. Senk kontrollert.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Kickback.gif'
  },
  {
    id: 'ex_wrist_curl',
    name: 'Håndleddscurl',
    muscleGroup: MuscleGroup.ARMS,
    type: ExerciseType.WEIGHTED,
    description: 'Sitt med underarmene på lårene og håndleddene over kanten. Curl vekten opp ved å bøye håndleddene. Senk kontrollert.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Wrist-Curl.gif'
  },
  {
    id: 'ex_reverse_curl',
    name: 'Reverse Curl',
    muscleGroup: MuscleGroup.ARMS,
    type: ExerciseType.WEIGHTED,
    description: 'Hold stangen med overhåndsgrep (håndflater ned). Curl stangen opp mot skuldrene. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Reverse-Curl.gif'
  },

  // --- Flere Kjerneøvelser ---
  {
    id: 'ex_crunch',
    name: 'Crunches',
    muscleGroup: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    description: 'Ligg på ryggen med bøyde knær. Løft skuldrene opp fra gulvet ved å stramme magen. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif'
  },
  {
    id: 'ex_leg_raise',
    name: 'Liggende Benhev',
    muscleGroup: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    description: 'Ligg på ryggen med strake bein. Løft beina opp mot taket ved å bruke magemusklene. Senk kontrollert ned uten å berøre gulvet.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Raise.gif'
  },
  {
    id: 'ex_ab_rollout',
    name: 'Ab Rollout',
    muscleGroup: MuscleGroup.CORE,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    type: ExerciseType.BODYWEIGHT,
    description: 'Knel med ab-wheel foran deg. Rull hjulet fremover mens du strekker kroppen. Hold magen stram. Rull tilbake til start.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Ab-Wheel-Rollout.gif'
  },
  {
    id: 'ex_bicycle_crunch',
    name: 'Bicycle Crunches',
    muscleGroup: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    description: 'Ligg på ryggen med hendene bak hodet. Roter overkroppen og før albuen mot motsatt kne mens du strekker det andre beinet. Bytt side.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bicycle-Crunch.gif'
  },
  {
    id: 'ex_mountain_climber',
    name: 'Mountain Climbers',
    muscleGroup: MuscleGroup.CORE,
    secondaryMuscleGroups: [MuscleGroup.CARDIO, MuscleGroup.SHOULDERS],
    type: ExerciseType.BODYWEIGHT,
    description: 'Start i push-up posisjon. Trekk knærne vekselvis inn mot brystet i et raskt tempo. Hold kroppen stabil.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Mountain-Climber.gif'
  },
  {
    id: 'ex_cable_crunch',
    name: 'Kabel Crunch',
    muscleGroup: MuscleGroup.CORE,
    type: ExerciseType.WEIGHTED,
    description: 'Knel foran en høy kabel. Hold tauet bak hodet. Bøy overkroppen ned mot gulvet ved å bruke magemusklene.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Kneeling-Cable-Crunch.gif'
  },
  {
    id: 'ex_reverse_crunch',
    name: 'Reverse Crunch',
    muscleGroup: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    description: 'Ligg på ryggen med bøyde knær. Løft hoften opp fra gulvet ved å trekke knærne mot brystet. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Reverse-Crunch-1.gif'
  },
  {
    id: 'ex_v_up',
    name: 'V-ups',
    muscleGroup: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    description: 'Ligg på ryggen med strake armer og bein. Løft overkropp og bein samtidig for å møtes i midten. Senk kontrollert ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/10/Dumbbell-V-up.gif'
  },
  {
    id: 'ex_bird_dog',
    name: 'Bird Dog',
    muscleGroup: MuscleGroup.CORE,
    secondaryMuscleGroups: [MuscleGroup.BACK],
    type: ExerciseType.BODYWEIGHT,
    description: 'Start på alle fire. Strekk motsatt arm og bein ut i en linje. Hold i 2-3 sekunder. Bytt side.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2022/07/Bird-Dog.gif'
  },
  {
    id: 'ex_pallof_press',
    name: 'Pallof Press',
    muscleGroup: MuscleGroup.CORE,
    type: ExerciseType.WEIGHTED,
    description: 'Stå sidelengs mot en kabel i brysthøyde. Hold håndtaket mot brystet. Press armene rett frem og hold. Motstå rotasjonen.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/pallof-press.gif'
  },

  // --- Flere Kondisjons- og Plyometriske Øvelser ---
  {
    id: 'ex_jumping_jack',
    name: 'Jumping Jacks',
    muscleGroup: MuscleGroup.CARDIO,
    type: ExerciseType.BODYWEIGHT,
    description: 'Start med føttene sammen og armene langs siden. Hopp ut til bena er bredt og armene over hodet. Hopp tilbake til start.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Jumping-Jack.gif'
  },
  {
    id: 'ex_burpee',
    name: 'Burpees',
    muscleGroup: MuscleGroup.CARDIO,
    secondaryMuscleGroups: [MuscleGroup.CHEST, MuscleGroup.LEGS, MuscleGroup.CORE],
    type: ExerciseType.BODYWEIGHT,
    description: 'Gå ned i push-up posisjon. Utfør en push-up. Hopp føttene frem mot hendene. Hopp opp med armene over hodet.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif'
  },
  {
    id: 'ex_box_jump',
    name: 'Box Jumps',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CARDIO],
    type: ExerciseType.BODYWEIGHT,
    description: 'Stå foran en kasse. Svinge armene og hopp opp på kassen. Land mykt med bøyde knær. Steg ned og gjenta.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Box-Jump.gif'
  },
  {
    id: 'ex_jump_rope',
    name: 'Hopptau',
    muscleGroup: MuscleGroup.CARDIO,
    secondaryMuscleGroups: [MuscleGroup.LEGS],
    type: ExerciseType.DURATION,
    description: 'Hopp over tauet med lette hopp på tærne. Hold albuene nær kroppen og roter tauet med håndleddene.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Jump-Rope.gif'
  },
  {
    id: 'ex_high_knees',
    name: 'Høye Kneløft',
    muscleGroup: MuscleGroup.CARDIO,
    secondaryMuscleGroups: [MuscleGroup.LEGS, MuscleGroup.CORE],
    type: ExerciseType.BODYWEIGHT,
    description: 'Løft knærne høyt vekselvis i et raskt tempo. Pump armene som ved løping. Hold overkroppen oppreist.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/High-Knee-Run.gif'
  },
  {
    id: 'ex_battle_ropes',
    name: 'Battle Ropes',
    muscleGroup: MuscleGroup.CARDIO,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.SHOULDERS, MuscleGroup.CORE],
    type: ExerciseType.DURATION,
    description: 'Hold ett tau i hver hånd. Lag bølger ved å bevege armene opp og ned vekselvis. Kan også gjøres samtidig eller sidelengs.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/08/Battle-Rope.gif'
  },
  {
    id: 'ex_kettlebell_swing',
    name: 'Kettlebell Swing',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.BACK, MuscleGroup.CORE, MuscleGroup.SHOULDERS],
    type: ExerciseType.WEIGHTED,
    description: 'Stå med bena i hoftebredde. Svinge kettlebellen mellom beina og opp til brysthøyde ved å drive hoften fremover. Kontroller ned.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Kettlebell-Swing.gif'
  },
  {
    id: 'ex_squat_jump',
    name: 'Squat Jumps',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CARDIO],
    type: ExerciseType.BODYWEIGHT,
    description: 'Utfør en vanlig knebøy. Fra bunnen, eksploder opp i et hopp. Land mykt og gå rett ned i neste rep.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Squat-Jump.gif'
  },
  {
    id: 'ex_lunge_jump',
    name: 'Jumping Lunges',
    muscleGroup: MuscleGroup.LEGS,
    secondaryMuscleGroups: [MuscleGroup.CARDIO, MuscleGroup.CORE],
    type: ExerciseType.BODYWEIGHT,
    description: 'Start i utfallsposisjon. Hopp opp og bytt bein i luften. Land i utfall med motsatt bein foran.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/05/Split-Squat.gif'
  },
  {
    id: 'ex_sprint',
    name: 'Sprint',
    muscleGroup: MuscleGroup.CARDIO,
    secondaryMuscleGroups: [MuscleGroup.LEGS],
    type: ExerciseType.CARDIO,
    description: 'Løp så fort du kan over en kort distanse (20-100m). Fullt fokus på maksimal hastighet.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/10/Sprinting.gif'
  },
  {
    id: 'ex_farmer_walk',
    name: 'Farmer\'s Walk',
    muscleGroup: MuscleGroup.CORE,
    secondaryMuscleGroups: [MuscleGroup.ARMS, MuscleGroup.LEGS, MuscleGroup.BACK],
    type: ExerciseType.WEIGHTED,
    description: 'Hold tunge vekter i hver hånd. Gå med korte, kontrollerte skritt. Hold ryggen rett og skuldrene tilbake.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Farmers-Walk.gif'
  },

  // === HELKROPP ===
  {
    id: 'ex_burpee',
    name: 'Burpees',
    muscleGroup: MuscleGroup.FULL_BODY,
    secondaryMuscleGroups: [MuscleGroup.CHEST, MuscleGroup.LEGS, MuscleGroup.CORE],
    type: ExerciseType.BODYWEIGHT,
    description: 'Start stående. Gå ned i push-up posisjon, gjør en push-up. Hopp føttene frem og eksploder opp i et hopp med armene over hodet.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif'
  },
  {
    id: 'ex_thruster',
    name: 'Thrusters',
    muscleGroup: MuscleGroup.FULL_BODY,
    secondaryMuscleGroups: [MuscleGroup.LEGS, MuscleGroup.SHOULDERS, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Hold vekter ved skuldrene. Gjør en dyp knebøy, og i oppreisningen presser du vektene rett opp over hodet i én flytende bevegelse.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2022/10/thruster.gif'
  },
  {
    id: 'ex_clean_press',
    name: 'Clean and Press',
    muscleGroup: MuscleGroup.FULL_BODY,
    secondaryMuscleGroups: [MuscleGroup.BACK, MuscleGroup.SHOULDERS, MuscleGroup.LEGS],
    type: ExerciseType.WEIGHTED,
    description: 'Løft vekten fra gulvet til skuldrene (clean), deretter press den over hodet. Senk kontrollert tilbake.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Barbell-Clean-and-Press-.gif'
  },
  {
    id: 'ex_kettlebell_swing',
    name: 'Kettlebell Swing',
    muscleGroup: MuscleGroup.FULL_BODY,
    secondaryMuscleGroups: [MuscleGroup.BACK, MuscleGroup.LEGS, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Hold kettlebellen med begge hender. Sving den mellom beina og bruk hofteekstensjon til å drive den opp til brysthøyde. Hold armene strake.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Kettlebell-Swing.gif'
  },
  {
    id: 'ex_man_maker',
    name: 'Man Makers',
    muscleGroup: MuscleGroup.FULL_BODY,
    secondaryMuscleGroups: [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS, MuscleGroup.LEGS],
    type: ExerciseType.WEIGHTED,
    description: 'Start i push-up posisjon med manualer. Gjør push-up, ro med hver arm, hopp føttene frem, reis deg opp med clean og press over hodet.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Burpees.gif'
  },
  {
    id: 'ex_devil_press',
    name: 'Devil Press',
    muscleGroup: MuscleGroup.FULL_BODY,
    secondaryMuscleGroups: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.LEGS],
    type: ExerciseType.WEIGHTED,
    description: 'Gjør en burpee med manualer i hendene. I oppreisningen svinger du manualene mellom beina og presser dem over hodet.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2022/07/Dumbbell-Devil-Press.gif'
  },
  {
    id: 'ex_turkish_getup',
    name: 'Turkish Get-Up',
    muscleGroup: MuscleGroup.FULL_BODY,
    secondaryMuscleGroups: [MuscleGroup.CORE, MuscleGroup.SHOULDERS, MuscleGroup.LEGS],
    type: ExerciseType.WEIGHTED,
    description: 'Ligg på ryggen med en vekt i én hånd strukket opp. Reis deg opp til stående stilling mens du holder vekten over hodet hele veien.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Turkish-Get-Up-Squat-style.gif'
  },
  {
    id: 'ex_wall_ball',
    name: 'Wall Balls',
    muscleGroup: MuscleGroup.FULL_BODY,
    secondaryMuscleGroups: [MuscleGroup.LEGS, MuscleGroup.SHOULDERS, MuscleGroup.CORE],
    type: ExerciseType.WEIGHTED,
    description: 'Hold en medisinball ved brystet. Gjør en dyp knebøy, og i oppreisningen kaster du ballen opp mot et mål på veggen. Fang og gjenta.',
    imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2023/01/wall-ball.gif'
  },

].sort((a, b) => {
  // Sorteringsrekkefølge for muskelgrupper
  const muscleGroupOrder: Record<MuscleGroup, number> = {
    [MuscleGroup.CHEST]: 1,
    [MuscleGroup.BACK]: 2,
    [MuscleGroup.SHOULDERS]: 3,
    [MuscleGroup.ARMS]: 4,
    [MuscleGroup.LEGS]: 5,
    [MuscleGroup.CORE]: 6,
    [MuscleGroup.CARDIO]: 7,
    [MuscleGroup.FULL_BODY]: 8,
  };

  // Først sorter etter muskelgruppe
  const groupDiff = muscleGroupOrder[a.muscleGroup] - muscleGroupOrder[b.muscleGroup];
  if (groupDiff !== 0) return groupDiff;

  // Deretter alfabetisk innenfor hver gruppe
  return a.name.localeCompare(b.name);
})

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
  date: getTodayDateString(),
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
  date: getTodayDateString(),
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
  session.date = getDateString(date);
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
  date: getTodayDateString(),
  startTime: new Date().toISOString(),
  exercises: [],
  status: WorkoutStatus.ACTIVE
});