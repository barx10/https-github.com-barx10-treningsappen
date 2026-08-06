import { activeModel, generateJson, getApiKey } from './_ai.js';
import { formatDate } from './_dates.js';
import { handleCors, sendError } from './_http.js';

const WORKOUT_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    exercises: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          exerciseId: { type: 'string' },
          sets: { type: 'integer' },
          reps: { type: 'string' },
          restTime: { type: 'integer' },
          notes: { type: 'string' },
        },
        required: ['exerciseId', 'sets', 'reps', 'restTime'],
      },
    },
    totalDuration: { type: 'integer' },
    focusAreas: { type: 'array', items: { type: 'string' } },
    reasoning: { type: 'string' },
  },
  required: ['name', 'exercises', 'totalDuration', 'focusAreas', 'reasoning'],
};

const GOAL_GUIDANCE = {
  strength: `MÅL: STYRKE
- Fokus på tunge baseøvelser (knebøy, markløft, benkpress, roing)
- FÆRRE reps (3-6 reps) og HØYERE vekt
- Lengre hviletid (2-3 min)
- 3-5 øvelser totalt (ikke for mange)
- Prioriter store muskelgrupper`,
  muscle: `MÅL: MUSKELVEKST
- Balanse mellom baseøvelser og isolasjon
- Moderate reps (8-12 reps)
- Moderat hviletid (60-90 sek)
- 5-7 øvelser
- Inkluder både sammensatte og isolasjonsøvelser`,
  endurance: `MÅL: KONDISJON/UTHOLDENHET
- Høyere reps (12-20 reps)
- Kortere hviletid (30-60 sek)
- Inkluder mer cardio-baserte øvelser
- Flere øvelser i circuit-stil
- Lettere vekt, høyere volum`,
  general: `MÅL: GENERELL HELSE
- Balansert mix av øvelser
- Moderate reps (8-12 reps)
- Moderat hviletid (60-90 sek)
- 5-6 øvelser
- Fokus på funksjonelle bevegelser`,
};

const summarizeWeek = (weekHistory) => {
  if (weekHistory.length === 0) return '- Ingen data';

  let totalSets = 0;
  let totalVolume = 0;
  let totalReps = 0;
  const muscleGroups = {};

  for (const session of weekHistory) {
    for (const ex of session.exercises || []) {
      totalSets += ex.setsCompleted || ex.sets || 0;
      totalVolume += ex.totalVolume || 0;
      totalReps += ex.totalReps || 0;
      muscleGroups[ex.muscleGroup] = (muscleGroups[ex.muscleGroup] || 0) + (ex.totalVolume || 0);
    }
  }

  return `- Antall økter: ${weekHistory.length}
- Totalt sett: ${totalSets}
- Totalt reps: ${totalReps}
- Totalt volum: ${Math.round(totalVolume)} kg
- Volum per muskelgruppe: ${Object.entries(muscleGroups)
    .map(([m, v]) => `${m}: ${Math.round(v)}kg`)
    .join(', ')}`;
};

const describeSessions = (weekHistory) => {
  if (weekHistory.length === 0) return '- Ingen økter denne uken';

  return weekHistory
    .map((session) => {
      const volume = (session.exercises || []).reduce((sum, e) => sum + (e.totalVolume || 0), 0);
      const lines = (session.exercises || [])
        .map((e) => {
          const setInfo = e.setDetails?.length
            ? e.setDetails.map((set) => `${set.weight}kg×${set.reps}`).join(', ')
            : 'Ingen data';
          return `  • ${e.name} (${e.muscleGroup}): ${e.setsCompleted || e.sets || 0} sett, maks ${e.maxWeight || 0}kg, ${e.totalReps || 0} reps, ${Math.round(e.totalVolume || 0)}kg volum [${setInfo}]`;
        })
        .join('\n');
      return `\n📅 ${formatDate(session.date)} (Totalt volum: ${Math.round(volume)} kg):\n${lines}`;
    })
    .join('\n');
};

/**
 * Ekstra føringer når brukeren kommer tilbake etter et opphold. Detrening gir
 * raskt tap av styrke og toleranse for volum, og den vanligste feilen er å
 * starte der man slapp.
 */
const easeInGuidance = (daysSinceLastWorkout) => `
VIKTIGST AV ALT – BRUKEREN KOMMER TILBAKE ETTER EN PAUSE${
  daysSinceLastWorkout ? ` PÅ ${daysSinceLastWorkout} DAGER` : ''
}:
Dette er en oppstartsøkt. Disse reglene går FORAN reglene for målet over:
- Maks 4-5 øvelser totalt, og hold økta under 45 minutter
- 2-3 sett per øvelse, aldri flere
- Legg deg i øvre del av rep-området med lette vekter: rundt 50-60 % av det
  brukeren løftet før pausen. Skriv gjerne konkret vektforslag i "notes"
- Lengre hvile enn normalt (90-120 sekunder)
- Start med grundig oppvarming og mobilitet
- Prioriter enkle, stabile øvelser. Unngå tunge markløft, eksplosive løft og
  øvelser med høy skaderisiko når kroppen er utrent
- Brukeren skal gå fra økta med krefter igjen, ikke være støl i tre dager
- I "reasoning": si tydelig at dette er en rolig oppstart, og at volum og vekt
  økes gradvis over de neste 2-3 ukene
`;

const buildPrompt = ({ profile, weekHistory, availableExercises, easeIn, daysSinceLastWorkout }) =>
  `Du er en personlig treningscoach. Lag et detaljert treningsopplegg basert på følgende:

PROFIL:
- Mål: ${profile.goal}
- Alder: ${profile.age || 'Ikke oppgitt'}
- Vekt: ${profile.weight || 'Ikke oppgitt'}kg
- Kjønn: ${profile.gender || 'Ikke oppgitt'}

DENNE UKENS TRENING:
${describeSessions(weekHistory)}

UKENS STATISTIKK:
${summarizeWeek(weekHistory)}

TILGJENGELIGE ØVELSER:
${availableExercises.map((e) => `- ${e.name} (${e.muscleGroup}, ${e.type}) [ID: ${e.id}]`).join('\n')}

VIKTIGE REGLER FOR TILPASNING TIL MÅL:

${GOAL_GUIDANCE[profile.goal] || GOAL_GUIDANCE.general}
${easeIn ? easeInGuidance(daysSinceLastWorkout) : ''}

GENERELLE INSTRUKSJONER:
1. Analyser hva brukeren har trent denne uken
2. Identifiser muskelgrupper som trenger fokus (UNNGÅ muskelgrupper trent i går eller i dag)
3. Velg øvelser fra listen over tilgjengelige øvelser (VIKTIG: Bruk BARE øvelser fra listen, og bruk korrekt ID)
4. Tilpass ALLE parametre (sett, reps, hviletid) til brukerens mål
5. VIKTIG: Ikke lag for hardcore opplegg - tilpass til brukerens nivå
6. Inkluder alltid oppvarming som første øvelse
7. Vær konservativ med antall sett - bedre å starte lavt enn for høyt

Returner et JSON-objekt med følgende struktur (BARE JSON, ingen annen tekst):
{
  "name": "Navn på økten (f.eks. 'Bryst og Triceps - Muskelvekst')",
  "exercises": [
    {
      "exerciseId": "id fra tilgjengelige øvelser",
      "sets": 3,
      "reps": "8-12",
      "restTime": 90,
      "notes": "Kort tips (optional)"
    }
  ],
  "totalDuration": 60,
  "focusAreas": ["Bryst", "Triceps"],
  "reasoning": "Kort forklaring på hvorfor dette opplegget passer nå (2-3 setninger)"
}`;

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const {
    profile,
    weekHistory = [],
    availableExercises = [],
    easeIn = false,
    daysSinceLastWorkout = null,
  } = req.body || {};

  if (!profile) {
    return res.status(400).json({ error: 'Profile is required' });
  }
  if (availableExercises.length === 0) {
    return res.status(400).json({ error: 'No exercises available to build a workout from' });
  }
  if (!getApiKey()) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const workout = await generateJson(
      buildPrompt({ profile, weekHistory, availableExercises, easeIn, daysSinceLastWorkout }),
      WORKOUT_SCHEMA
    );

    if (!Array.isArray(workout?.exercises) || workout.exercises.length === 0) {
      throw new Error('AI-modellen returnerte ingen øvelser');
    }

    return res.status(200).json({ ...workout, model: activeModel() });
  } catch (error) {
    return sendError(res, 502, 'Failed to generate workout', error);
  }
}
