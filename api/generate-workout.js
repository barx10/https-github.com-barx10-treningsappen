import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('API handler started');

  try {
    const { profile, weekHistory, availableExercises } = req.body;
    
    console.log('Request data:', { 
      profileGoal: profile?.goal,
      historyCount: weekHistory?.length,
      exercisesCount: availableExercises?.length 
    });
    
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('Initializing GoogleGenAI...');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Helper to parse dates consistently
    const parseDateString = (dateStr) => {
      if (dateStr.length === 10 && dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      const date = new Date(dateStr);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const prompt = `Du er en personlig treningscoach. Lag et detaljert treningsopplegg basert på følgende:

PROFIL:
- Mål: ${profile.goal}
- Alder: ${profile.age || 'Ikke oppgitt'}
- Vekt: ${profile.weight || 'Ikke oppgitt'}kg
- Kjønn: ${profile.gender || 'Ikke oppgitt'}

DENNE UKENS TRENING:
${weekHistory.length > 0 ? weekHistory.map((s) => {
  const sessionDate = parseDateString(s.date);
  return `- ${sessionDate.toLocaleDateString('nb-NO')}: ${s.exercises.map((e) => `${e.name} (${e.muscleGroup}, ${e.sets} sett)`).join(', ')}`;
}).join('\n') : '- Ingen økter denne uken'}

TILGJENGELIGE ØVELSER:
${availableExercises.map((e) => `- ${e.name} (${e.muscleGroup}, ${e.type}) [ID: ${e.id}]`).join('\n')}

VIKTIGE REGLER FOR TILPASNING TIL MÅL:

${profile.goal === 'strength' ? `
MÅL: STYRKE
- Fokus på tunge baseøvelser (knebøy, markløft, benkpress, roing)
- FÆRRE reps (3-6 reps) og HØYERE vekt
- Lengre hviletid (2-3 min)
- 3-5 øvelser totalt (ikke for mange)
- Prioriter store muskelgrupper
` : ''}

${profile.goal === 'muscle' ? `
MÅL: MUSKELVEKST
- Balanse mellom baseøvelser og isolasjon
- Moderate reps (8-12 reps)
- Moderat hviletid (60-90 sek)
- 5-7 øvelser
- Inkluder både sammensatte og isolasjonsøvelser
` : ''}

${profile.goal === 'endurance' ? `
MÅL: KONDISJON/UTHOLDENHET
- Høyere reps (12-20 reps)
- Kortere hviletid (30-60 sek)
- Inkluder mer cardio-baserte øvelser
- Flere øvelser i circuit-stil
- Lettere vekt, høyere volum
` : ''}

${profile.goal === 'general' ? `
MÅL: GENERELL HELSE
- Balansert mix av øvelser
- Moderate reps (8-12 reps)
- Moderat hviletid (60-90 sek)
- 5-6 øvelser
- Fokus på funksjonelle bevegelser
` : ''}

GENERELLE INSTRUKSJONER:
1. Analyser hva brukeren har trent denne uken
2. Identifiser muskelgrupper som trenger fokus (UNNGÅ muskelgrupper trent i går eller i går)
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

    console.log('Calling Gemini API...');
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json'
      }
    });

    console.log('Gemini API response received');
    console.log('Raw result.text:', result.text);
    
    let workout = JSON.parse(result.text);
    console.log('Parsed workout type:', Array.isArray(workout) ? 'array' : 'object');
    console.log('Parsed workout:', workout);
    
    // If Gemini returns an array, take the first item
    if (Array.isArray(workout)) {
      console.log('Converting array to object');
      workout = workout[0];
    }
    
    console.log('Final workout:', workout);
    
    res.status(200).json(workout);
  } catch (error) {
    console.error('Generate workout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to generate workout',
      details: errorMessage 
    });
  }
}
