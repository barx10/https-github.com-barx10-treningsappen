import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  try {
    const { profile, weekHistory, availableExercises } = req.body;
    
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Du er en personlig treningscoach. Lag et detaljert treningsopplegg basert på følgende:

PROFIL:
- Mål: ${profile.goal}
- Alder: ${profile.age || 'Ikke oppgitt'}
- Vekt: ${profile.weight || 'Ikke oppgitt'}kg
- Kjønn: ${profile.gender || 'Ikke oppgitt'}

DENNE UKENS TRENING:
${weekHistory.length > 0 ? weekHistory.map((s: any) => `- ${new Date(s.date).toLocaleDateString('nb-NO')}: ${s.exercises.map((e: any) => `${e.name} (${e.muscleGroup}, ${e.sets} sett)`).join(', ')}`).join('\n') : '- Ingen økter denne uken'}

TILGJENGELIGE ØVELSER:
${availableExercises.map((e: any) => `- ${e.name} (${e.muscleGroup}, ${e.type}) [ID: ${e.id}]`).join('\n')}

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

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response from AI');
    }

    const workout = JSON.parse(jsonMatch[0]);
    
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
