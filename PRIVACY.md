# Personvernerklæring for Treningsappen

**Sist oppdatert: 30. november 2025**

## Sammendrag

✅ All treningsdata lagres **kun lokalt** i din nettleser  
✅ Ingen brukerkontoer, ingen registrering, ingen e-post  
✅ AI-funksjoner sender data til Google Gemini (kun når du trykker)  
✅ Ingen tracking, cookies eller analytics  
✅ Du kan slette alt når som helst  

---

## 1. Datalagring

### Hva lagres lokalt?
All treningsdata lagres i nettleserens localStorage på **din enhet**:
- Brukerprofil (navn, alder, vekt, kjønn, mål)
- Treningshistorikk (økter, øvelser, sett, reps, vekt)
- Egendefinerte øvelser
- Innstillinger og preferanser

### Hvor lagres dataene?
Data ligger **kun** i din nettleser. Vi har ingen database eller server som lagrer dine data.

## 2. AI-funksjoner og Google Gemini

### Når sendes data til Google?
Kun når du aktivt trykker på:
- "Generer treningsopplegg" (AI Trenings-Agent)
- "Få dypere AI-analyse" (Anbefalinger)

### Hva sendes?
- Treningshistorikk (øvelser, sett, reps, muskelgrupper)
- Profil (alder, vekt, kjønn, treningsmål)
- Liste over tilgjengelige øvelser

### Hva sendes IKKE?
- Navn (selv om du har lagt det inn lokalt)
- E-postadresse
- IP-adresse
- Andre personidentifiserbare opplysninger

### Hvordan behandler Google dataene?
Ifølge [Google Gemini API Terms](https://ai.google.dev/gemini-api/terms):
- Data prosesseres for å generere AI-anbefalinger
- Data lagres ikke permanent
- Google kan bruke data midlertidig for å levere tjenesten

## 3. Dine rettigheter (GDPR)

### Rett til innsyn
Åpne nettleserens DevTools (F12) → Application → Local Storage  
All data er synlig i klartekst.

### Rett til sletting
**Alternativ 1:** Tøm nettleserens cache for domenet  
**Alternativ 2:** Avinstaller PWA-en  
**Alternativ 3:** Bruk nettleserens innstillinger → Slett localStorage

### Rett til dataportabilitet
Bruk "Eksporter data"-funksjonen i appen (Profil → Backup)  
Data eksporteres som JSON-fil som du kan laste ned.

### Rett til retting
Alle data kan endres direkte i appen.

## 4. Datasikkerhet

- **Kryptering i transit:** HTTPS/TLS for all kommunikasjon
- **Lokal lagring:** Data ligger kun i din nettleser
- **Ingen servere:** Vi har ingen database å hacke
- **API-nøkler:** Gemini API-nøkkel lagres trygt som miljøvariabel (ikke i koden)

## 5. Cookies og tracking

- **Cookies:** Vi bruker ingen cookies
- **Analytics:** Vi bruker ingen analytics-verktøy
- **Tracking:** Vi sporer ikke brukere på noen måte

## 6. For utviklere som deployer appen

Hvis du deployer din egen versjon av appen:

### Ditt ansvar
- Du blir **databehandler** for dine brukere
- Du må sikre GDPR-compliance i din deployment
- Du må informere brukerne om databehandling

### Anbefalinger
- Bruk HTTPS (krav for PWA)
- Lagre API-nøkler trygt (miljøvariabler, ALDRI commit til git)
- Vurder å legge til egen personvernerklæring tilpasset din bruk
- Hvis du logger trafikk på serveren, må du informere brukerne

### Vercel-spesifikke hensyn
- Vercel logger requests (IP, user-agent, timestamp)
- Se [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)
- Disable analytics i Vercel hvis du ikke ønsker logging

## 7. Kontaktinformasjon

For spørsmål om personvern:
- **GitHub:** [https://github.com/barx10](https://github.com/barx10)
- **Nettside:** [https://www.laererliv.no/](https://www.laererliv.no/)

## 8. Endringer i personvernerklæringen

Ved vesentlige endringer vil dette dokumentet oppdateres med ny dato.  
Sjekk denne filen på GitHub for siste versjon.

## 9. Lovverk

Denne appen er designet for å være GDPR-compliant (EU General Data Protection Regulation).  
Dersom du bruker appen utenfor EU/EØS, gjelder ditt lokale personvernlovverk.

---

**Kort sagt:** Vi samler ikke inn personopplysninger. All data er din, lagret lokalt, og du har full kontroll.
