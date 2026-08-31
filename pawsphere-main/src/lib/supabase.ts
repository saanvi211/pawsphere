import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const rawSupabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const normalizedSupabaseUrl = rawSupabaseUrl
  ? rawSupabaseUrl
      .replace(/\/+$/, '')
      .replace(/\/rest\/v1\/?>?$/i, '')
      .replace(/\/auth\/v1\/?>?$/i, '')
  : '';

const missingConfigMessage =
  '[PawSphere] Missing real Supabase auth configuration. Create a .env file in the project root with your real project credentials: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';

if (!normalizedSupabaseUrl || !rawSupabaseAnonKey) {
  console.error(missingConfigMessage);
}

const hasValidUrlShape = !!normalizedSupabaseUrl && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(normalizedSupabaseUrl);

export const isSupabaseConfigured =
  hasValidUrlShape &&
  !!rawSupabaseAnonKey &&
  !normalizedSupabaseUrl.includes('placeholder') &&
  !rawSupabaseAnonKey.includes('placeholder') &&
  !normalizedSupabaseUrl.includes('your-project-ref') &&
  !rawSupabaseAnonKey.includes('your-anon-key');

export const supabase = isSupabaseConfigured && normalizedSupabaseUrl && rawSupabaseAnonKey
  ? createClient(normalizedSupabaseUrl, rawSupabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null as any;

export const getSupabaseConfigError = () =>
  'PawSphere authentication is not configured. Add your real Supabase project URL and anon key to the project .env file before signing in.';
