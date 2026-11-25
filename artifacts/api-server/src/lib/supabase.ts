import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://naxqsbyupqrljciubvyx.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heHFzYnl1cHFybGpjaXVidnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyNDMxNzYsImV4cCI6MjExMDgxOTE3Nn0.BaRd-HZPjx0DrowZ_hBuCOyY2sJ-B9iteSGdJNFU9NM';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heHFzYnl1cHFybGpjaXVidnl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTI0MzE3NiwiZXhwIjoyMTEwODE5MTc2fQ.1CcbMsJGoU48F2w4v1TU7Kle3jq_Jyx-LU3HCTGPL0Y';

// Privileged Service-Role client for backend administration & entitlements
export const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// User-scoped client factory (RLS enforced based on user token)
export function createUserScopedClient(jwtToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
  });
}
