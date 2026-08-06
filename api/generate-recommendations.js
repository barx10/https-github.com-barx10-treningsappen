import { activeModel, generateJson, getApiKey } from './_ai.js';
import { formatDate, getStartOfWeek, parseDateString } from './_dates.js';
import { handleCors, sendError } from './_http.js';

const RECOMMENDATIONS_SCHEMA = {
  type: 'object',
  properties: {
    recommendations: { type: 'array', items: { type: 'string' } },
  },
  required: ['recommendations'],
};

const VALID_MUSCLE_GROUPS = [
  'Bryst', 'Rygg', 'Bein', 'Skuldre', 'Armer', 'Kjerne', 'Kondisjon', 'Helkropp',
];

const GOAL_LABELS = {
  strength: 'Styrke',
  muscle: 'Muskelvekst',
  endurance: 'Kondisjon',
  weight_loss: 'Vektnedgang',
  general: 'Generell helse',
};

const GENDER_LABELS = { male: 'Mann', female: 'Kvinne' };

/** Completed sessions from this week (Monday onwards). */
const getWeekHistory = (history) => {
  const startOfWeek = getStartOfWeek();
  return history.filter((s) => parseDateString(s.date) >= startOfWeek && s.status === 'Fullført');
};

/** Joins each logged exercise with its definition and precomputes set stats. */
const enrichSession = (session, exercises) => ({
  ...session,
  exercises: (session.exercises || []).map((ex) => {
    const definition = exercises.find((e) => e.id === ex.exerciseDefinitionId);
    const completedSets = (ex.sets || []).filter((set) => set.completed);

    return {
      name: definition?.name || 'Ukjent øvelse',
      muscleGroup: definition?.muscleGroup || null,
      type: definition?.type || null,
      setsCompleted: completedSets.length,
      totalReps: completedSets.reduce((sum, set) => sum + (set.reps || 0), 0),
      maxWeight: Math.max(...completedSets.map((set) => set.weight || 0), 0),
      exerciseVolume: completedSets.reduce(
        (sum, set) => sum + (set.weight || 0) * (set.reps || 0),
        0
      ),
      setDetails: completedSets.map((set) => ({ weight: set.weight || 0, reps: set.reps || 0 })),
    };
  }),
});

const summarize = (enrichedHistory) => {
  const muscleGroupCounts = {};
  const muscleGroupVolume = {};
  let totalSets = 0;
  let totalVolumeKg = 0;
  let totalReps = 0;
  let cardioSessions = 0;

  for (const session of enrichedHistory) {
    for (const ex of session.exercises) {
      if (VALID_MUSCLE_GROUPS.includes(ex.muscleGroup)) {
        muscleGroupCounts[ex.muscleGroup] = (muscleGroupCounts[ex.muscleGroup] || 0) + 1;
        muscleGroupVolume[ex.muscleGroup] =
          (muscleGroupVolume[ex.muscleGroup] || 0) + ex.exerciseVolume;
      }
      totalSets += ex.setsCompleted;
      totalVolumeKg += ex.exerciseVolume;
      totalReps += ex.totalReps;
      if (ex.type === 'CARDIO' || ex.type === 'Kardio') cardioSessions++;
    }
  }

  const muscleGroups =
    Object.entries(muscleGroupCounts)
      .map(([m, c]) => `${m} (${c} øvelser, ${Math.round(muscleGroupVolume[m] || 0)}kg)`)
      .join(', ') || 'Ingen';

  return { totalSets, totalVolumeKg, totalReps, cardioSessions, muscleGroups };
};

const describeSessions = (enrichedHistory) => {
  if (enrichedHistory.length === 0) return 'Ingen økter denne uken';

  return enrichedHistory
    .map((session, i) => {
      const volume = session.exercises.reduce((sum, e) => sum + e.exerciseVolume, 0);
      const lines = session.exercises
        .map((e) => {
          const setInfo = e.setDetails.length
            ? e.setDetails.map((set) => `${set.weight}kg×${set.reps}`).join(', ')
            : 'Ingen data';
          return `  • ${e.name} (${e.muscleGroup}): ${e.setsCompleted} sett, maks ${e.maxWeight}kg, ${e.totalReps} reps, ${Math.round(e.exerciseVolume)}kg [${setInfo}]`;
        })
        .join('\n');
      return `\n📅 Økt ${i + 1} - ${formatDate(session.date)} (Totalt: ${Math.round(volume)}kg):\n${lines}\n`;
    })
    .join('\n');
};

const buildPrompt = ({ profile, history, exercises, enrichedHistory, stats }) => {
  const { totalSets, totalVolumeKg, totalReps, cardioSessions, muscleGroups } = stats;
  const roundedVolume = Math.round(totalVolumeKg);

  return `Du er en erfaren personlig trener med fokus på langsiktig, bærekraftig progresjon.

BRUKERENS PROFIL:
- Mål: ${GOAL_LABELS[profile.goal] || GOAL_LABELS.general}
- Alder: ${profile.age || 'Ikke oppgitt'} år
- Vekt: ${profile.weight || 'Ikke oppgitt'} kg
- Kjønn: ${GENDER_LABELS[profile.gender] || 'Ikke oppgitt'}

TILGJENGELIGE ØVELSER (bruk KUN disse i anbefalingene):
${exercises.map((e) => `- ${e.name} (${e.muscleGroup}, ${e.type})`).join('\n') || 'Ingen øvelser registrert'}

TRENINGSAKTIVITET SISTE 7 DAGER:
- Antall økter: ${enrichedHistory.length}
- Totalt antall sett: ${totalSets}
- Totalt antall reps: ${totalReps}
- Totalt volum: ${roundedVolume} kg
- Cardio-økter: ${cardioSessions}
- Muskelgrupper trent: ${muscleGroups}

DETALJERT HISTORIKK:
${describeSessions(enrichedHistory)}

TOTAL TRENINGSHISTORIKK:
- Totalt ${history.length} økter registrert

OPPGAVE:
Analyser brukerens treningsuke grundig og gi 4-6 konkrete, handlingsrettede anbefalinger. Hver anbefaling skal være:

1. **Spesifikk og detaljert** - ikke generiske tips
2. **Tilpasset brukerens mål og erfaring**
3. **Basert på faktisk data** fra treningshistorikken
4. **Handlingsrettet** - si eksakt hva brukeren skal gjøre
5. **Variert** - dekk ulike aspekter (teknikk, volum, restitusjon, ernæring, periodisering)

VIKTIG: Når du foreslår øvelser, bruk KUN navn fra listen over tilgjengelige øvelser. Hvis brukeren har lagt inn nye øvelser, skal disse også kunne foreslås.

FOKUSOMRÅDER Å VURDERE:
- Muskelgruppebalanse (er noe neglektert?)
- Treningsfrekvens vs. mål (for mye/lite?)
- Volum og intensitet (optimalt for målet?)
- Restitusjon (nok hvile mellom økter?)
- Progresjon (hvordan øke over tid?)
- Ernæring tilpasset målet
- Cardio vs. styrke-balanse
- Periodisering (variasjon i treningen)
- Teknikk og form
- Mobilitet og skadeforebygging

RETURNER JSON med feltet "recommendations": en liste med 4-6 strenger. Start hver anbefaling med en emoji og en kort overskrift, f.eks.:
"📊 Volum & Intensitet: Du har trent ${enrichedHistory.length} økter med ${totalSets} sett og løftet ${roundedVolume}kg denne uken. For ditt mål anbefaler jeg å ..."
"💪 Muskelbalanse: ..." / "🍽️ Ernæring: ..." / "⚡ Progresjon: ..." / "🧘 Restitusjon: ..."

VIKTIG: Bruk de FAKTISKE tallene fra treningshistorikken i anbefalingene. Vær spesifikk med kg, reps, og sett.
Vær kreativ, personlig og gi tips som virkelig hjelper brukeren å nå målet sitt!`;
};

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { profile, history = [], exercises = [] } = req.body || {};

  if (!profile) {
    return res.status(400).json({ error: 'Profile is required' });
  }
  if (!getApiKey()) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const enrichedHistory = getWeekHistory(history).map((s) => enrichSession(s, exercises));
    const stats = summarize(enrichedHistory);

    const parsed = await generateJson(
      buildPrompt({ profile, history, exercises, enrichedHistory, stats }),
      RECOMMENDATIONS_SCHEMA
    );

    if (!Array.isArray(parsed?.recommendations)) {
      throw new Error('Invalid response format from AI');
    }

    return res.status(200).json({ recommendations: parsed.recommendations, model: activeModel() });
  } catch (error) {
    return sendError(res, 502, 'Failed to generate recommendations', error);
  }
}
