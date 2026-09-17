import { createClient } from '@supabase/supabase-js';

// Client admin (côté serveur uniquement — NE JAMAIS exposer au client)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: { schema: 'tbb' },
    }
  );
}