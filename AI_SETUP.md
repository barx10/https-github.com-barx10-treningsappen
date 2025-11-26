# AI Agent Setup Guide

## Steg 1: Få Gemini API-nøkkel

1. Gå til https://aistudio.google.com/apikey
2. Logg inn med Google-kontoen din
3. Klikk "Create API Key"
4. Kopier nøkkelen

## Steg 2: Sett opp miljøvariabel

### Lokalt (for utvikling)
1. Opprett en `.env` fil i prosjektets root-mappe:
   ```bash
   cp .env.example .env
   ```
2. Åpne `.env` og erstatt `your_api_key_here` med din Gemini API-nøkkel:
   ```
   GEMINI_API_KEY=AIza...
   ```

### På Vercel (for produksjon)
1. Gå til Vercel dashboard for prosjektet ditt
2. Gå til Settings → Environment Variables
3. Legg til ny variabel:
   - Name: `GEMINI_API_KEY`
   - Value: Din Gemini API-nøkkel
   - Environments: Production, Preview, Development (velg alle)
4. Klikk "Save"
5. Redeploy appen (Deployments → Redeploy latest)

## Steg 3: Test funksjonaliteten

1. Kjør `npm run dev` lokalt
2. Gå til "AI Agent" fanen
3. Klikk "Generer nytt treningsopplegg"
4. Verifiser at AI genererer et personlig opplegg

## Prising (Gemini 2.0 Flash)

- **Gratis tier**: Opptil 15 forespørsler per minutt
- **Kostnad**: ~$0.002 per generering
- **Estimat for dere to**: Selv med 10 genereringer hver dag = ~$0.60/måned (praktisk talt gratis)

## Feilsøking

### "Failed to generate workout"
- Sjekk at API-nøkkelen er riktig satt
- Verifiser at du har aktivert Gemini API i Google Cloud Console
- Sjekk nettverkstilkobling

### API-feil i produksjon
- Verifiser at environment variable er satt på Vercel
- Sjekk Vercel Function logs for detaljer

## Neste steg (valgfritt)

- **Caching**: Lagre AI-genererte økter for gjenbruk
- **Fine-tuning**: Lær av hvilke forslag brukeren faktisk starter
- **Multi-language**: Støtte for både norsk og engelsk
