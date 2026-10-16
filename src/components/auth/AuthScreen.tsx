import React, { useState } from 'react';
import { Target, Mail, Lock, Loader2, AlertCircle, CheckCircle2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../services/supabase';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);

    try {
      if (mode === 'login') {
        const { error: err } = await signIn(email.trim(), password);
        if (err) setError(traducirError(err));
      } else {
        const { error: err, needsConfirmation } = await signUp(email.trim(), password);
        if (err) {
          setError(traducirError(err));
        } else if (needsConfirmation) {
          setInfo('Cuenta creada. Revisá tu correo para confirmar tu email y después iniciá sesión.');
          setMode('login');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Marca */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Productiva</h1>
          <p className="text-sm text-slate-500 mt-1">Tu centro de operaciones personal</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
          {!isSupabaseConfigured ? (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="leading-relaxed">
                Falta configurar Supabase. Definí <code className="font-mono">VITE_SUPABASE_URL</code> y{' '}
                <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> en tu <code className="font-mono">.env.local</code>.
              </span>
            </div>
          ) : (
            <>
              {/* Selector de modo */}
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Ingresar
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Crear cuenta
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      autoComplete="email"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {info && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{info}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl shadow-xs transition-all"
                >
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : mode === 'login' ? (
                    <LogIn className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</span>
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          Tus datos se sincronizan de forma segura en la nube.
        </p>
      </div>
    </div>
  );
};

function traducirError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Todavía no confirmaste tu email. Revisá tu correo.';
  if (m.includes('user already registered')) return 'Ese email ya está registrado. Probá ingresar.';
  if (m.includes('password should be at least')) return 'La contraseña es demasiado corta (mínimo 6).';
  if (m.includes('unable to validate email')) return 'El email no es válido.';
  return msg;
}
