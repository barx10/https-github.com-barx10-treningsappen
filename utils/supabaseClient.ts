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
