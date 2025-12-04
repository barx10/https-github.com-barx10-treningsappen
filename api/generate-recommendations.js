import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { profile, history, exercises } = req.body;

        // Lag en oversikt over tilgjengelige øvelser
        const exerciseList = exercises?.map(e => `- ${e.name} (${e.muscleGroup}, ${e.type})`).join('\n') || 'Ingen øvelser registrert';

        if (!profile) {
            return res.status(400).json({ error: 'Profile is required' });
        }

        // Validate API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY not found in environment variables');
            return res.status(500).json({ error: 'API key not configured' });
        }

        console.log('Initializing Gemini AI...');
        const ai = new GoogleGenAI({ apiKey });

        // Helper to parse dates consistently
        const parseDateString = (dateStr) => {
            if (dateStr.length === 10 && dateStr.includes('-')) {
                const [year, month, day] = dateStr.split('-').map(Number);
                return new Date(year, month - 1, day);
            }
            const date = new Date(dateStr);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        };

        // Get start of week (Monday)
        const getStartOfWeek = () => {
            const d = new Date();
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            d.setDate(diff);
            d.setHours(0, 0, 0, 0);
            return d;
        };

        // Get this week's completed training (from Monday)
        const startOfWeek = getStartOfWeek();
        const weekHistory = (history || []).filter(s => {
            const sessionDate = parseDateString(s.date);
            return sessionDate >= startOfWeek && s.status === 'Fullført';
        });

        // Map exercise definitions to history for detailed analysis
        const enrichedHistory = weekHistory.map(session => ({
            ...session,
            exercises: session.exercises.map(ex => {
                const definition = exercises?.find(e => e.id === ex.exerciseDefinitionId);
                return {
                    ...ex,
                    name: definition?.name || 'Ukjent øvelse',
                    muscleGroup: definition?.muscleGroup || null,
                    type: definition?.type || null
                };
            })
        }));

        // Analyser treningshistorikk
        const muscleGroupCounts = {};
        let totalVolume = 0;
        let cardioSessions = 0;

        enrichedHistory.forEach(session => {
            session.exercises.forEach(ex => {
                // Bruk kun gyldige muskelgrupper
                const validGroups = [
                  'Bryst', 'Rygg', 'Bein', 'Skuldre', 'Armer', 'Kjerne', 'Kondisjon'
                ];
                const muscle = validGroups.includes(ex.muscleGroup) ? ex.muscleGroup : null;
                if (muscle) {
                  muscleGroupCounts[muscle] = (muscleGroupCounts[muscle] || 0) + 1;
                }
                totalVolume += ex.sets?.length || 0;
                if (ex.type === 'CARDIO' || ex.type === 'Kardio') cardioSessions++;
            });
        });        const prompt = `Du er en erfaren personlig trener med fokus på langsiktig, bærekraftig progresjon.

BRUKERENS PROFIL:
- Mål: ${profile.goal === 'strength' ? 'Styrke' : profile.goal === 'muscle' ? 'Muskelvekst' : profile.goal === 'endurance' ? 'Kondisjon' : 'Generell helse'}
- Alder: ${profile.age || 'Ikke oppgitt'} år
- Vekt: ${profile.weight || 'Ikke oppgitt'} kg
- Kjønn: ${profile.gender === 'male' ? 'Mann' : profile.gender === 'female' ? 'Kvinne' : 'Ikke oppgitt'}

TILGJENGELIGE ØVELSER (bruk KUN disse i anbefalingene):
${exerciseList}

TRENINGSAKTIVITET SISTE 7 DAGER:
- Antall økter: ${weekHistory.length}
- Totalt antall sett: ${totalVolume}
- Cardio-økter: ${cardioSessions}
- Muskelgrupper trent: ${Object.entries(muscleGroupCounts).map(([m, c]) => `${m} (${c}x)`).join(', ') || 'Ingen'}

DETALJERT HISTORIKK:
${enrichedHistory.length > 0 ? enrichedHistory.map((s, i) => {
    const sessionDate = parseDateString(s.date);
    return `
Økt ${i + 1} - ${sessionDate.toLocaleDateString('nb-NO')}:
${s.exercises.map(e => `  • ${e.name} (${e.muscleGroup}): ${e.sets?.length || 0} sett`).join('\n')}
`;
}).join('\n') : 'Ingen økter denne uken'}

TOTAL TRENINGSHISTORIKK:
- Totalt ${history?.length || 0} økter registrert

OPPGAVE:
Analyser brukerens treningsuke grundig og gi 4-6 konkrete, handlingsrettede anbefalinger. Hver anbefaling skal være:

1. **Spesifikk og detaljert** - ikke generiske tips
2. **Tilpasset brukerens mål og erfaring**
3. **Basert på faktisk data** fra treningshistorikken
4. **Handlingsrettet** - si eksakt hva brukeren skal gjøre
5. **Variert** - dekk ulike aspekter (teknikk, volum, restitusjon, ernæring, periodisering)

VIKTIG: Når du foreslår øvelser, bruk KUN navn og ID fra listen over tilgjengelige øvelser. Hvis brukeren har lagt inn nye øvelser, skal disse også kunne foreslås.

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

RETURNER JSON:
{
  "recommendations": [
    "📊 Volum & Intensitet: Du har trent [antall] økter med [X] sett denne uken. For ditt mål om [mål] anbefaler jeg å...",
    "💪 Muskelbalanse: Jeg ser at du har trent [muskel X] [antall] ganger, men [muskel Y] bare [antall]. Neste uke bør du...",
    "🍽️ Ernæring: Med [mål] som mål og [vekt] kg kroppsvekt, bør du...",
    "⚡ Progresjon: For å fortsette å utvikle deg, prøv å...",
    "🧘 Restitusjon: Basert på [frekvens] økter denne uken..."
  ]
}Vær kreativ, personlig og gi tips som virkelig hjelper brukeren å nå målet sitt!`;

        console.log('Calling Gemini API for recommendations...');
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json'
            }
        });

        console.log('Gemini API response received');
        const text = result.text;
        console.log('Raw response:', text);

        let parsed = JSON.parse(text);
        console.log('Parsed response:', parsed);

        // Handle array response (sometimes Gemini returns an array)
        if (Array.isArray(parsed)) {
            console.log('Response is array, taking first element');
            parsed = parsed[0];
        }

        if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
            throw new Error('Invalid response format from AI');
        }

        console.log('Returning recommendations:', parsed.recommendations);
        return res.status(200).json(parsed);

    } catch (error) {
        console.error('Error generating recommendations:', error);
        return res.status(500).json({ 
            error: 'Failed to generate recommendations',
            details: error.message 
        });
    }
}
