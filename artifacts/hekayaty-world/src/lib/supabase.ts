import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://naxqsbyupqrljciubvyx.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heHFzYnl1cHFybGpjaXVidnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyNDMxNzYsImV4cCI6MjExMDgxOTE3Nn0.BaRd-HZPjx0DrowZ_hBuCOyY2sJ-B9iteSGdJNFU9NM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
