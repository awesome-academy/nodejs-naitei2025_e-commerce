import { createClient } from '@supabase/supabase-js';

function getEnv() {
  if (typeof import.meta !== 'undefined') {
    return import.meta.env ?? {};
  }

  return process?.env ?? {};
}

const env = getEnv();
const DEFAULT_SUPABASE_URL = 'https://wzjjqllpgqpvqxbjbndk.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ampxbGxwZ3FwdnF4YmpibmRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTU1MTEsImV4cCI6MjA3ODE3MTUxMX0.6nFQq1vPd6UK9_eak_RIf7m3pipPB_oGtfrPu1RTtq8';
const SUPABASE_URL = env.VITE_SUPABASE_URL ?? DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY ?? DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
