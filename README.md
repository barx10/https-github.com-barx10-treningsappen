# 💪 Treningsappen - AI-drevet Treningsdagbok













































































































































✅ Full åpenhet - all kode er open source på GitHub  ✅ Ingen cookies, ingen tracking, ingen analytics  ✅ Vi samler ikke inn navn, e-post eller annen identifiserbar info  ✅ AI-funksjoner sender data til Google (kun når du ber om det)  ✅ Du kan når som helst slette alt ved å tømme cache  ✅ All treningsdata lagres KUN i din nettleser - ikke på noen server  **Sammendrag for ikke-jurister:**---Denne appen er designet for å være GDPR-compliant (EU General Data Protection Regulation). Dersom du bruker appen utenfor EU/EØS, gjelder ditt lokale personvernlovverk.## 14. Lovverk- **Nettside**: [https://www.laererliv.no/](https://www.laererliv.no/)- **GitHub**: [https://github.com/barx10](https://github.com/barx10)For spørsmål om personvern:## 13. Kontaktinformasjon- Disable analytics i Vercel hvis du ikke ønsker logging- Se [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)- Vercel logger requests (IP, user-agent, timestamp)### 12.3 Vercel-spesifikke hensyn- Hvis du logger trafikk på serveren, må du informere brukerne- Vurder å legge til egen personvernerklæring tilpasset din bruk- Lagre API-nøkler trygt (miljøvariabler, ALDRI commit til git)- Bruk HTTPS (krav for PWA)### 12.2 Anbefalinger- Du må informere brukerne om databehandling- Du må sikre GDPR-compliance i din deployment- **Du blir databehandler** for dine brukere### 12.1 Ditt ansvarHvis du deployer din egen versjon av appen:## 12. For utviklere som deployer appenVed vesentlige endringer vil dette dokumentet oppdateres med ny dato. Sjekk denne filen på GitHub for siste versjon.## 11. Endringer i personvernerklæringenAppen er ikke spesifikt rettet mot barn, men samler ikke inn personopplysninger som krever ekstra beskyttelse. Foreldre/foresatte bør vurdere om appen er passende.## 10. BarnAppen bruker **ingen analytics**, sporing eller tredjepartsscripts utover Google Gemini API (kun når du aktivt ber om AI-anbefalinger).## 9. Analytics og sporingAppen bruker **ingen cookies**. All data lagres i localStorage.## 8. Cookies- **API-nøkler**: Gemini API-nøkkel lagres trygt som miljøvariabel på hosting-platform (Vercel)- **Ingen servere**: Vi har ingen database å hacke- **Lokal lagring**: Data ligger kun i din nettleser- **Kryptering i transit**: HTTPS/TLS for all kommunikasjon## 7. Datasikkerhet- Du har full kontroll over hva som lagres- Alle data kan endres direkte i appen### 6.4 Rett til retting- Data eksporteres som JSON-fil som du kan laste ned- Bruk "Eksporter data"-funksjonen i appen (Profil → Backup)### 6.3 Rett til dataportabilitet- **Metode 3**: Tøm nettleserens cache for domenet- **Metode 2**: Avinstaller PWA-en- **Metode 1**: Bruk nettleserens innstillinger til å tømme localStorage### 6.2 Rett til sletting- All data er synlig i klartekst- Åpne nettleserens DevTools (F12) → Application → Local Storage### 6.1 Rett til innsyn## 6. Dine rettigheter- **Frivillighet**: Du kan når som helst slutte å bruke appen og slette alle data- **Legitim interesse**: Appen krever datalagring for å fungere- **Samtykke**: Ved å bruke appen samtykker du til lokal lagring av data## 5. Rettslig grunnlag (GDPR)- Lagre dine preferanser- Generere AI-baserte treningsanbefalinger (kun når du ber om det)- Beregne statistikk (1RM, volum, kalorier)- Vise din treningshistorikk og fremgangData brukes utelukkende til:## 4. Formål med databehandling- Google kan bruke data midlertidig for å levere tjenesten- Ifølge [Google Gemini API Terms](https://ai.google.dev/gemini-api/terms) lagres ikke input/output data permanent- Data prosesseres for å generere AI-anbefalinger**Googles behandling:**- Andre personidentifiserbare opplysninger- IP-adresse (håndteres av Vercel/din hosting)- E-postadresse- Navn**Sendes IKKE:**- Liste over tilgjengelige øvelser- Profil (alder, vekt, kjønn, treningsmål)- Treningshistorikk (øvelser, sett, reps, muskelgrupper)**Sendes:**Når du aktivt bruker AI-funksjonene ("Generer treningsopplegg" eller "Få AI-analyse"), sendes følgende data til Google Gemini API:#### Google Gemini API (AI-funksjoner)### 3.2 Data sendt til tredjeparter**Viktig**: Disse dataene lagres IKKE på noen server. De ligger kun i din nettleser og slettes hvis du tømmer cache eller avinstallerer appen.- **Preferanser**: Innstillinger og preferanser- **Egendefinerte øvelser**: Øvelser du selv har lagt til- **Treningshistorikk**: Økter med øvelser, sett, reps, vekt, dato- **Brukerprofil**: Navn, alder, vekt, kjønn, treningsmålFølgende data lagres **kun lokalt** på din enhet via nettleserens localStorage:### 3.1 Lokalt lagrede data (i din nettleser)## 3. Hvilke data samles inn?Denne appen er et open source-prosjekt uten sentral datainnsamling. Hvis du bruker en selvhostet versjon, er du selv dataansvarlig for din egen bruk.## 2. DataansvarligTreningsappen er en åpen kildekode Progressive Web App (PWA) for treningstracking. Denne personvernerklæringen forklarer hvordan appen håndterer dine data.## 1. Innledning**Sist oppdatert: 30. november 2025**En moderne Progressive Web App (PWA) for treningstracking med AI-genererte treningsopplegg.

## 📸 Screenshots

<details>
<summary>Klikk for å se skjermbilder</summary>

| Forside | Dashboard | KI-trening |
|---------|-----------|------------|
| ![Forside](screenshots/Forside.png) | ![Dashboard](screenshots/Dashboard.png) | ![KI-trening](screenshots/KI-trening.png) |

| KI-anbefaling | Profil | Ernæring |
|---------------|--------|----------|
| ![KI-anbefaling](screenshots/KI-anbefaling.13.png) | ![Profil](screenshots/Profil-treningsmål.png) | ![Ernæring](screenshots/Ernæring.png) |

| Ernæringsguide | Om appen |
|----------------|----------|
| ![Ernæringsguide](screenshots/Ernæringsguide.png) | ![Om appen](screenshots/Om%20appen.png) |

</details>

## ✨ Funksjoner

- 📊 **Treningslogging** - Logg økter med øvelser, sett, reps og vekt
- 📈 **Fremgangsvisualisering** - Se din utvikling med interaktive grafer
- 🤖 **AI Trenings-Agent** - Få personlige treningsopplegg generert av AI basert på din treningshistorikk
- 💡 **Smarte anbefalinger** - AI-drevne anbefalinger for neste økt
- ⏱️ **Innebygget timer** - Automatisk hviletid-tracking mellom sett
- 📱 **PWA** - Installer på mobil/desktop, fungerer offline
- 🎨 **Moderne UI** - Dark mode, responsive design

## 🚀 Kom i gang

### Forutsetninger

- Node.js (versjon 18 eller nyere)
- npm eller yarn
- En Gemini API-nøkkel (gratis tier tilgjengelig)

### Installasjon

1. **Klon repoet**
   ```bash
   git clone https://github.com/barx10/https-github.com-barx10-treningsappen.git
   cd https-github.com-barx10-treningsappen
   ```

2. **Installer avhengigheter**
   ```bash
   npm install
   ```

3. **Sett opp Gemini API-nøkkel**
   
   a. Få en gratis API-nøkkel fra [Google AI Studio](https://aistudio.google.com/apikey)
   
   b. Opprett en `.env` fil i prosjektets rotmappe:
   ```bash
   cp .env.example .env
   ```
   
   c. Åpne `.env` og legg inn din API-nøkkel:
   ```
   GEMINI_API_KEY=din_api_nøkkel_her
   ```

4. **Start utviklingsserver**
   ```bash
   npm run dev
   ```

5. **Åpne appen i nettleseren**
   ```
   http://localhost:5173
   ```

## 📦 Bygg for produksjon

```bash
npm run build
```

Bygget ender opp i `dist/` mappen.

## 🌐 Deploy til Vercel

1. **Push til GitHub** (hvis ikke allerede gjort)

2. **Gå til [Vercel](https://vercel.com)**
   - Logg inn med GitHub
   - Klikk "Add New Project"
   - Import ditt repository

3. **Sett Environment Variables**
   - Gå til Project Settings → Environment Variables
   - Legg til:
     - Name: `GEMINI_API_KEY`
     - Value: Din Gemini API-nøkkel
     - Environments: Production, Preview, Development (velg alle)

4. **Deploy**
   - Vercel vil automatisk bygge og deploye
   - Fremtidige pushes til main-branch vil automatisk deployes

## 🛠️ Teknologi

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS 4
- **AI:** Google Gemini 2.0 Flash (via @google/genai)
- **Charts:** Recharts
- **Icons:** Lucide React
- **PWA:** vite-plugin-pwa
- **Deployment:** Vercel (serverless functions)

## 📱 Bruk som PWA

### På mobil (iOS/Android):
1. Åpne appen i Safari/Chrome
2. Trykk "Del" / "Meny"
3. Velg "Legg til på hjemskjerm"

### På desktop:
1. Åpne appen i Chrome/Edge
2. Klikk på install-ikonet i adressefeltet
3. Eller: Meny → "Installer [appnavn]"

## 🤖 AI-funksjoner

Appen bruker Google Gemini 2.0 Flash for:

- **Treningsopplegg**: Genererer personlige økter basert på:
  - Dine mål (styrke, muskelvekst, kondisjon)
  - Treningshistorikk (unngår overtrening)
  - Tilgjengelige øvelser i biblioteket
  
- **Smarte anbefalinger**: Foreslår neste øvelse basert på muskelgrupper du har trent

### Kostnad
Gemini 2.0 Flash er **gratis** opp til 1500 requests/dag (15 requests/minutt).  
[Les mer om prising](https://ai.google.dev/pricing)

## 📁 Prosjektstruktur

```
├── api/
│   └── generate-workout.js    # Vercel serverless function for AI
├── components/
│   ├── ActiveSessionView.tsx  # Aktiv treningsøkt
│   ├── AgentView.tsx          # AI-genererte opplegg
│   ├── ExerciseCard.tsx       # Øvelseskort
│   ├── ProfileView.tsx        # Brukerprofil og innstillinger
│   └── ...
├── utils/
│   ├── storage.ts             # LocalStorage handling
│   ├── initialData.ts         # Standardøvelser
│   └── fitnessCalculations.ts # 1RM, volum, etc.
├── App.tsx                    # Hovedapp
└── types.ts                   # TypeScript types
```

## 🔒 Personvern og GDPR

### Datalagring
- **All treningsdata lagres lokalt** i nettleserens localStorage på din enhet
- **Ingen database**: Vi samler ikke inn, lagrer eller har tilgang til dine personopplysninger
- **Ingen brukerkontoer**: Ingen registrering, ingen innlogging, ingen e-post
- **Full kontroll**: Du eier 100% av dataene dine og kan slette alt ved å tømme nettleserens cache

### AI-funksjoner og Google Gemini
- **Kun under bruk**: AI-anbefalinger sendes bare når DU aktivt trykker på "Få AI-analyse"
- **Hva sendes**: Treningshistorikk (øvelser, sett, reps), profil (alder, vekt, mål) - ingen navn eller e-post
- **Gemini API**: Data prosesseres av Google Gemini for å generere anbefalinger
- **Ikke lagret**: Google lagrer ikke dine data permanent ([les mer](https://ai.google.dev/gemini-api/terms))
- **Anonymt**: Ingen personidentifiserbar informasjon sendes til AI-tjenesten

### Dine rettigheter
- **Rett til sletting**: Slett all data ved å tømme localStorage eller avinstallere appen
- **Rett til innsyn**: All data ligger i nettleserens localStorage (F12 → Application → Local Storage)
- **Rett til dataportabilitet**: Eksporter/importer treningsdata via Backup-funksjonen i appen
- **Ingen tracking**: Vi bruker ingen cookies, analytics eller sporing

### For utviklere som deployer appen
Hvis du deployer din egen versjon av appen:
- **Du er databehandler**: Du må sørge for GDPR-compliance i din deployment
- **API-nøkkel**: Hold din Gemini API-nøkkel privat (miljøvariabel, aldri commit til git)
- **Brukere**: Informer brukerne om at data lagres lokalt og at AI-funksjoner sender data til Google Gemini

### Kontakt
For spørsmål om personvern, kontakt utvikler på GitHub eller via [Lærerliv](https://www.laererliv.no/)

📋 **[Les fullstendig personvernerklæring](PRIVACY.md)**

## 📄 Lisens

MIT License - bruk fritt, men gi gjerne credits! 😊

## 👨‍💻 Laget av

Kenneth Bareksten - [Lærerliv](https://www.laererliv.no/)

## 🙏 Credits

- Google Gemini for AI-funksjonalitet
- Vercel for hosting
- React, TypeScript, Tailwind CSS communities

---

**Liker du prosjektet?** Gi det en ⭐ på GitHub!
