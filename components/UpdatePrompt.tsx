import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, X } from 'lucide-react';

/** Hvor ofte en åpen app spør om det finnes en ny versjon. */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Registrerer service workeren og spør før den nye versjonen tas i bruk.
 *
 * Tidligere oppdaterte den seg selv i bakgrunnen (`registerType: 'autoUpdate'`).
 * Da ble de gamle appfilene kastet mens siden fortsatt var åpen, og neste skjerm
 * du trykket på forsvant i løse luften. Nå blir den gamle versjonen stående til
 * du trykker «Oppdater», og bytte og omlasting skjer i samme håndbevegelse.
 */
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // En app som ligger åpen i dagevis oppdager ellers aldri nye versjoner.
      setInterval(() => {
        registration.update().catch(() => {
          // Uten nett er det ikke noe å oppdatere. Vi prøver igjen neste time.
        });
      }, UPDATE_CHECK_INTERVAL_MS);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-surface border border-primary/40 rounded-xl shadow-2xl p-4 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">Ny versjon er klar</div>
          <div className="text-xs text-muted mt-0.5">Oppdater for å ta den i bruk.</div>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-primary hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Download size={14} />
          Oppdater
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Lukk"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
