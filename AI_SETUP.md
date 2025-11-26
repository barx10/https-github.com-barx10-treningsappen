# 🤖 AI Agent Setup Guide

Denne guiden viser deg hvordan du setter opp AI-funksjonen i treningsappen.

## 1. Få en Gemini API-nøkkel

1. Gå til https://aistudio.google.com/apikey
2. Logg inn med Google-konto
3. Klikk "Create API Key"
4. Kopier nøkkelen (begynner med `AIza...`)

**VIKTIG:** Hold API-nøkkelen hemmelig! Den gir tilgang til din Gemini-konto.

## 2. Lokal utvikling

1. Opprett en `.env` fil i prosjektets rotmappe:
   ```bash
   cp .env.example .env
   ```

2. Åpne `.env` og erstatt `your_api_key_here` med din Gemini API-nøkkel:
   ```
   GEMINI_API_KEY=din_nøkkel_her
   ```

3. Start utviklingsserver:
   ```bash
   npm run dev
   ```

**VIKTIG:** `.env` filen er allerede i `.gitignore` og vil IKKE bli commitet til Git.

## 3. Deploy til Vercel (produksjon)

1. Push koden til GitHub (uten .env filen)

2. Gå til [Vercel Dashboard](https://vercel.com/dashboard)

3. Velg prosjektet ditt

4. Gå til **Settings** → **Environment Variables**

5. Legg til variabel:
   - Name: `GEMINI_API_KEY`
   - Value: Din Gemini API-nøkkel
   - Environments: Velg **alle** (Production, Preview, Development)

6. Klikk "Save"

7. Gå til **Deployments** og klikk "Redeploy" på siste deployment

## 4. Verifier at det fungerer

1. Åpne appen (lokalt eller på Vercel)
2. Gå til "AI Agent" fanen
3. Trykk "Generer treningsopplegg"
4. Du skal nå få et AI-generert treningsopplegg!

## 💰 Prising

Gemini 2.0 Flash er **gratis** for normal bruk:
- **Gratis tier:** 1500 requests/dag (15 requests/minutt)
- **Kostnad:** $0 (innenfor gratis tier)

For de fleste private brukere vil den gratis tieret være mer enn nok.

[Les mer om Gemini prising](https://ai.google.dev/pricing)

## ⚠️ Sikkerhet

**ALDRI:**
- ❌ Commit `.env` filen til Git
- ❌ Del API-nøkkelen offentlig
- ❌ Hardkod nøkkelen i koden

**ALLTID:**
- ✅ Bruk miljøvariabler (`.env` lokalt, Vercel Environment Variables i produksjon)
- ✅ Hold `.env` i `.gitignore`
- ✅ Slett og generer ny nøkkel hvis den lekkes

## 🔧 Feilsøking

### "API key not configured"
- Sjekk at `GEMINI_API_KEY` er satt i `.env` (lokalt) eller Vercel Environment Variables (produksjon)
- Restart utviklingsserveren etter å ha endret `.env`

### "Invalid API key"
- Sjekk at nøkkelen er kopiert riktig (ingen ekstra mellomrom)
- Verifiser at nøkkelen er aktiv i [Google AI Studio](https://aistudio.google.com/apikey)

### Deployment fungerer ikke
- Sjekk at Environment Variables er satt i Vercel
- Sjekk at du har valgt alle environments (Production, Preview, Development)
- Trigger en redeploy etter å ha lagt til variablene

## 📚 Les mer

- [Google AI Studio](https://aistudio.google.com)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
