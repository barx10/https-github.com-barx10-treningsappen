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

    const prompt = `Du er en personlig treningscoach. Lag et detaljert treningsopplegg basert på følgende:

PROFIL:
- Mål: ${profile.goal}
- Alder: ${profile.age || 'Ikke oppgitt'}
- Vekt: ${profile.weight || 'Ikke oppgitt'}kg
- Kjønn: ${profile.gender || 'Ikke oppgitt'}

DENNE UKENS TRENING:
${weekHistory.length > 0 ? weekHistory.map((s) => `- ${new Date(s.date).toLocaleDateString('nb-NO')}: ${s.exercises.map((e) => `${e.name} (${e.muscleGroup}, ${e.sets} sett)`).join(', ')}`).join('\n') : '- Ingen økter denne uken'}

TILGJENGELIGE ØVELSER:
${availableExercises.map((e) => `- ${e.name} (${e.muscleGroup}, ${e.type}) [ID: ${e.id}]`).join('\n')}

INSTRUKSJONER:
1. Analyser hva brukeren har trent denne uken
2. Identifiser muskelgrupper som trenger fokus (unngå muskelgrupper trent i går)
3. Velg 5-7 øvelser fra listen over tilgjengelige øvelser (VIKTIG: Bruk BARE øvelser fra listen, og bruk korrekt ID)
4. Tilpass intensitet basert på erfaring og mål
5. Inkluder oppvarming hvis relevant
6. Gi konkrete anbefalinger for sett, reps og hviletid
7. Fokuser på baseøvelser (knebøy, markløft, benkpress, roing, etc.) men inkluder noen isolasjonsøvelser

Returner et JSON-objekt med følgende struktur (BARE JSON, ingen annen tekst):
{
  "name": "Navn på økten (f.eks. 'Rygg og Biceps - Styrke')",
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
  "focusAreas": ["Rygg", "Biceps"],
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
