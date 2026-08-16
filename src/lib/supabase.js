import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // IMPORTANTE: se il refresh fallisce, non bloccare l'app
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // Ignora
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignora
        }
      },
    },
  },
});

// ---- Aggiungi questa funzione per gestire il logout automatico ----
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token rinfrescato con successo');
  }
  
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    console.log('🚪 Utente disconnesso o eliminato, pulisco localStorage');
    localStorage.removeItem('vibe_user_id');
    localStorage.removeItem('utente_corrente');
    localStorage.removeItem('vibe_auth_valid');
    sessionStorage.removeItem('vibe_auth_session');
    // Ricarica per tornare al login
    window.location.reload();
  }
});

// ---- Funzione per verificare se il token è valido ----
export const checkSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session) {
    console.warn('⚠️ Sessione non valida o scaduta');
    return false;
  }
  return true;
};