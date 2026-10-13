import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// true solo si este proyecto tiene sus propias credenciales configuradas en .env.local
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Sin credenciales, exportamos null: el resto del código revisa isSupabaseConfigured antes de
// usar este cliente, para poder seguir funcionando 100% en modo local sin romperse.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
