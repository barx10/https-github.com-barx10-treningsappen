import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

// Fall back to placeholder values so createClient doesn't throw when env vars are missing.
// Sync operations will simply fail gracefully in that case.
export const supabase = createClient(
    SUPABASE_URL ?? 'https://placeholder.supabase.co',
    SUPABASE_KEY ?? 'placeholder'
);

export const isSupabaseConfigured = !!SUPABASE_URL && !!SUPABASE_KEY;

/**
 * Supabase-klienten pakker nettverksfeil inn med nettleserens egen ordlyd:
 * «Load failed» i Safari, «Failed to fetch» i Chrome. Det sier ingenting til
 * brukeren. Den vanligste årsaken er at Supabase-prosjektet er satt på pause
 * etter inaktivitet (gratisplanen) — da fjernes DNS-navnet til prosjektet, og
 * alle kall dør før de når fram.
 */
export const isSupabaseNetworkError = (error: unknown): boolean => {
    const err = error as { name?: string; message?: string } | null;
    const message = err?.message ?? '';
    return (
        err?.name === 'AuthRetryableFetchError' ||
        /load failed|failed to fetch|networkerror|network request failed/i.test(message)
    );
};

/** Forklarende tekst for feil som skyldes at Supabase ikke svarer i det hele tatt. */
export const NETWORK_ERROR_MESSAGE =
    'Får ikke kontakt med sky-backupen. Vanligste årsak er at Supabase-prosjektet ' +
    'er satt på pause etter inaktivitet — åpne prosjektet i Supabase-dashboardet og ' +
    'velg «Restore». Treningsdataene dine ligger trygt lagret lokalt uansett.';
