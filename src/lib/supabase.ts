import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hhhhsascjplhgktfvqmh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaGhzYXNjanBsaGdrdGZ2cW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MjA2MjUsImV4cCI6MjA4ODI5NjYyNX0.cxVzoJnIgR_5gHUnTxdRe5kDoArUHi-M4kMeJU-S-5U';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Using provided fallbacks.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
