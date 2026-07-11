// ============================================================
//  components/Auth/LoginScreen.jsx — Con gestione errori avanzata
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { setAuthLocal, setAuthSession } from '../../utils/storage';

export default function LoginScreen({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password.trim()) {
      setError('Inserisci username e password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Cerca l'utente nella tabella profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', trimmedUsername)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        setError('Errore nella verifica dell\'utente');
        setIsLoading(false);
        return;
      }

      if (!profiles) {
        setError('Utente non trovato. Registrati prima.');
        setIsLoading(false);
        return;
      }

      // 2. Login con Supabase Auth
      const email = `${trimmedUsername}@vibesolar.local`;
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        if (authError.message.includes('Invalid login credentials')) {
          setError('Password errata');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Email non confermata. Controlla la tua casella.');
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      // 3. Login riuscito
      if (authData?.user) {
        const userId = authData.user.id;

        if (rememberMe) {
          setAuthLocal(trimmedUsername);
        } else {
          setAuthSession(trimmedUsername);
        }
        
        localStorage.setItem('vibe_user_id', userId);
        
        // Sincronizza i dati dal cloud
        console.log('✅ Login riuscito per:', trimmedUsername);
        onLogin();
      } else {
        setError('Errore sconosciuto durante il login');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Problema di connessione al database');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg">
        <div className="bg-glow" />
        <div className="stars" />
      </div>

      <div className="login-card rounded-3xl p-8 md:p-10 max-w-sm w-full mx-4 relative z-10 animate-fade-slide-up">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2 opacity-80">🌄</div>
          <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight">
            Vibe Solar
          </h1>
          <p className="text-sm text-white/40 font-light mt-1">
            Energia solare per il tuo viaggio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-normal text-white/50 mb-1.5">
              Username
            </label>
            <input
              ref={inputRef}
              id="username"
              type="text"
              placeholder="il tuo username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/15 focus:outline-none focus:border-white/30 transition-colors"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-normal text-white/50 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="la tua password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/15 focus:outline-none focus:border-white/30 transition-colors"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div className="relative w-5 h-5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border border-white/20 bg-white/5 transition-colors peer-checked:border-[#38bdf8] peer-checked:bg-[#38bdf8] peer-hover:border-white/40" />
                <svg
                  className="absolute top-0.5 left-0.5 w-4 h-4 text-[#0b1121] opacity-0 transition-opacity peer-checked:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                Resta collegato
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-medium text-sm tracking-wide bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-loader" />
                Accesso in corso
              </span>
            ) : (
              'Accedi'
            )}
          </button>

          {error && (
            <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/20 rounded-xl px-4 py-2.5 text-[#f43f5e] text-sm text-center">
              {error}
            </div>
          )}
        </form>

        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-sm text-white/30">
            Non hai un account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-white/60 hover:text-white transition-colors font-medium"
            >
              Registrati
            </button>
          </p>
        </div>

        <div className="mt-4 text-center text-xs text-white/20 font-light">
          Vibe Solar · v3.3
        </div>
      </div>
    </div>
  );
}