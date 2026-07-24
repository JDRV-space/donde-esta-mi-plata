import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();

const hasValidSupabaseConfiguration = (): boolean => {
  if (!supabaseUrl || !supabasePublishableKey) {
    return false;
  }

  try {
    const url = new URL(supabaseUrl);
    return (
      (url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1')
      && !supabasePublishableKey.includes('your_key_here')
    );
  } catch {
    return false;
  }
};

const supabase = hasValidSupabaseConfiguration()
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const getSupabaseClient = (): SupabaseClient | null => supabase;
