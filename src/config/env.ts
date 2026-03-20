const env = import.meta.env;

export const projectId = env.VITE_SUPABASE_PROJECT_ID ?? '';
export const publicAnonKey = env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  projectId.length > 0 && publicAnonKey.length > 0;
