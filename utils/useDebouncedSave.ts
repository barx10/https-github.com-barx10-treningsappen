import { useEffect, useRef } from 'react';

/** Standard ventetid før noe skrives ned. */
const DEFAULT_DELAY_MS = 400;

/**
 * Lagrer en verdi når det har vært stille en liten stund, i stedet for ved hver
 * eneste endring.
 *
 * JSON.stringify og localStorage.setItem er synkrone og går på hovedtråden. I
 * den aktive økta lå det ett slikt skriv bak hvert tastetrykk i vekt- og
 * reps-feltene, og det ble tyngre for hver øvelse i økta.
 *
 * Ingenting går tapt av å vente: det som ikke er skrevet ennå tømmes ut når
 * appen legges vekk eller lukkes, og tomme verdier skrives med én gang.
 */
export function useDebouncedSave<T>(
  value: T,
  save: (value: T) => void,
  delay = DEFAULT_DELAY_MS
) {
  const pending = useRef<{ value: T } | null>(null);
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  });

  useEffect(() => {
    // Å fjerne noe haster: en avsluttet økt som ble liggende igjen ville dukket
    // opp som aktiv igjen neste gang appen ble åpnet.
    if (value === null || value === undefined) {
      pending.current = null;
      saveRef.current(value);
      return;
    }

    pending.current = { value };
    const timer = setTimeout(() => {
      pending.current = null;
      saveRef.current(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  useEffect(() => {
    const flush = () => {
      const outstanding = pending.current;
      if (!outstanding) return;
      pending.current = null;
      saveRef.current(outstanding.value);
    };
    const flushIfHidden = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flushIfHidden);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flushIfHidden);
      flush();
    };
  }, []);
}
