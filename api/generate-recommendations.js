import { GoogleGenerativeAI } from '@google/genai';

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
        const ai = new GoogleGenerativeAI(apiKey);

        // Get last 7 days of training
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekHistory = (history || []).filter(s => new Date(s.date) >= weekAgo);

        const prompt = `Du er en erfaren treningscoach. Analyser brukerens treningsprofil og gi 3-4 konkrete, personlige anbefalinger.

PROFIL:
- Mål: ${profile.goal}
- Alder: ${profile.age || 'Ikke oppgitt'}
- Vekt: ${profile.weight || 'Ikke oppgitt'}kg
- Kjønn: ${profile.gender || 'Ikke oppgitt'}

DENNE UKENS TRENING:
${weekHistory.length > 0 ? weekHistory.map((s) => `- ${new Date(s.date).toLocaleDateString('nb-NO')}: ${s.exercises.map((e) => `${e.name} (${e.muscleGroup}, ${e.sets} sett x ${e.reps} reps)`).join(', ')}`).join('\n') : '- Ingen økter denne uken'}

TOTAL TRENINGSHISTORIKK:
- Totalt ${history?.length || 0} økter registrert

INSTRUKSJONER:
1. Analyser treningsmønsteret (frekvens, intensitet, muskelfordeling)
2. Gi konkrete, handlingsrettede råd basert på målet
3. Identifiser potensielle ubalanser eller forbedringspunkter
4. Inkluder ernærings- eller restitusjonstips hvis relevant
5. Vær motiverende men realistisk
6. Bruk emojis for å gjøre det visuelt appetitvekkkende

Returner et JSON-array med 3-4 anbefalinger (BARE JSON, ingen annen tekst):
{
  "recommendations": [
    "💪 Din første anbefaling her...",
    "🎯 Din andre anbefaling her...",
    "🍗 Din tredje anbefaling her..."
  ]
}`;

        console.log('Calling Gemini API for recommendations...');
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json'
            }
        });

        console.log('Gemini API response received');
        const text = result.response.text();
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
