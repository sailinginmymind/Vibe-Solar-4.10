// ============================================================
//  components/Auth/RegisterScreen.jsx — Van Life Style
//  Registrazione con gestione errori migliorata
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername || trimmedUsername.length < 3) {
      setError('Username deve avere almeno 3 caratteri');
      return;
    }
    if (password.length < 6) {
      setError('Password deve avere almeno 6 caratteri');
      return;
    }
    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const email = `${trimmedUsername}@vibesolar.local`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: trimmedUsername },
          // Se la conferma email è disattivata, questo non serve
        },
      });

      if (signUpError) {
        console.error('SignUp error details:', signUpError);
        
        // Messaggi di errore più chiari
        if (signUpError.message.includes('User already registered')) {
          setError('Questo username è già registrato');
        } else if (signUpError.message.includes('signups not allowed')) {
          setError('Le registrazioni sono disabilitate. Contatta l\'amministratore.');
        } else if (signUpError.message.includes('email')) {
          setError('Errore con l\'email. Riprova.');
        } else {
          setError(signUpError.message || 'Errore durante la registrazione');
        }
        setIsLoading(false);
        return;
      }

      if (!data?.user) {
        setError('Errore sconosciuto durante la registrazione');
        setIsLoading(false);
        return;
      }

      // Inserimento manuale del profilo (se il trigger non funziona)
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert(
          { id: data.user.id, username: trimmedUsername },
          { onConflict: 'id' }
        );

      if (insertError && insertError.code !== '23505') {
        console.warn('Insert profile warning:', insertError);
        // Non blocchiamo la registrazione se il profilo non viene creato,
        // perché potrebbe essere già stato creato dal trigger.
      }

      // Registrazione riuscita
      onRegister();
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Errore di rete. Riprova.');
    } finally {
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
          <div className="text-4xl mb-2 opacity-80">🌱</div>
          <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight">
            Nuovo account
          </h1>
          <p className="text-sm text-white/40 font-light mt-1">
            Inizia il tuo viaggio solare
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="reg-username" className="block text-sm font-normal text-white/50 mb-1.5">
              Username
            </label>
            <input
              ref={inputRef}
              id="reg-username"
              type="text"
              placeholder="es. alex"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/\s/g, ''));
                if (error) setError('');
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/15 focus:outline-none focus:border-white/30 transition-colors"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-normal text-white/50 mb-1.5">
              Password (min 6 caratteri)
            </label>
            <input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/15 focus:outline-none focus:border-white/30 transition-colors"
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-normal text-white/50 mb-1.5">
              Conferma password
            </label>
            <input
              id="reg-confirm"
              type="password"
              placeholder="ripeti la password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/15 focus:outline-none focus:border-white/30 transition-colors"
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-medium text-sm tracking-wide bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-loader" />
                Registrazione in corso
              </span>
            ) : (
              'Registrati'
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
            Hai già un account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-white/60 hover:text-white transition-colors font-medium"
            >
              Accedi
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