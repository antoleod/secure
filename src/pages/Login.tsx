import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import {
  AlertCircle,
  ArrowRight,
  AtSign,
  Lock,
  ShieldCheck,
  Fingerprint,
  Loader2,
  Chrome
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInEmail, signInGoogle, error, clearError, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const summaryError = useMemo(() => {
    const missing = Object.keys(fieldErrors).filter((key) => fieldErrors[key]);
    if (missing.length === 0) return null;
    return `Faltan: ${missing.map((k) => fieldErrors[k]).join(', ')}`;
  }, [fieldErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (error) clearError();
    const nextErrors: Record<string, string> = {};
    if (!email.includes('@')) {
      nextErrors.email = 'correo válido';
    }
    if (password.length < 6) {
      nextErrors.password = 'contraseña válida';
    }
    setFieldErrors(nextErrors);
    setLocalError(null);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.email) emailRef.current?.focus();
      else if (nextErrors.password) passwordRef.current?.focus();
      return;
    }
    setIsSubmitting(true);
    try {
      await signInEmail(email, password);
      navigate('/dashboard');
    } catch {
      setPassword('');
      passwordRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (error) clearError();
    setIsGoogleSubmitting(true);
    try {
      await signInGoogle();
      navigate('/dashboard');
    } catch {
      // Error handled in context
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white font-sans selection:bg-emerald-100 selection:text-slate-900">

      {/* Visual Side (Hidden on Mobile) */}
      <div className="hidden lg:flex relative bg-[#0d2434] overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/15 to-sky-400/15 z-10" />

        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ repeat: Infinity, duration: 20 }}
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-emerald-300/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90]
          }}
          transition={{ repeat: Infinity, duration: 25 }}
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-sky-400/15 rounded-full blur-[100px]"
        />

        <div className="relative z-20 max-w-md w-full text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-24 h-24 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl"
          >
            <ShieldCheck className="w-12 h-12 text-emerald-300" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-5xl font-black text-white tracking-tighter italic">Secure<span className="text-emerald-300">.</span></h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Accede a liquidez inmediata respaldada por tus activos de alta gama. Seguridad, transparencia y rapidez.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-6 pt-10"
          >
            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
              Bank Grade Security
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
              Real-time Audit
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 md:p-16 lg:p-24 bg-[#fcfcfd]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full space-y-10"
        >
          <div className="text-center lg:text-left space-y-3">
            <div className="inline-flex lg:hidden items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#0f3d5c] rounded-xl flex items-center justify-center">
                <span className="text-white font-black italic">S</span>
              </div>
              <span className="font-black text-slate-900 text-xl tracking-tighter">Secure<span className="text-emerald-500">.</span></span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t('auth.login.title')}</h2>
            <p className="text-slate-500 font-medium text-lg">{t('auth.login.subtitle')}</p>
          </div>

          <AnimatePresence>
            {(error || localError || summaryError) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                role="alert"
                aria-live="assertive"
                className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-[1.5rem] flex items-center gap-3 text-sm font-bold relative group"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <span>{error || localError || summaryError}</span>
                  {summaryError && <p className="text-[11px] font-semibold text-rose-600">{summaryError}</p>}
                </div>
                <button onClick={() => { clearError(); setLocalError(null); }} className="opacity-40 hover:opacity-100 transition-opacity">
                  <Fingerprint className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('field.email')}</label>
                <div className="relative group">
                  <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    type="email"
                    required
                    className="h-16 pl-14 bg-white border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-emerald-400 font-bold text-slate-900 transition-all"
                    placeholder="email@secure.tech"
                    value={email}
                    ref={emailRef}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: '' }));
                      if (error) clearError();
                    }}
                  />
                  {fieldErrors.email && <p className="text-rose-600 text-xs font-semibold mt-1 ml-1">Ingresa un {fieldErrors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('field.password')}</label>
                  <Link to="/reset" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">{t('auth.login.forgot')}</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    type="password"
                    required
                    className="h-16 pl-14 bg-white border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-emerald-400 font-bold text-slate-900 transition-all"
                    placeholder="••••••••"
                    value={password}
                    ref={passwordRef}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, password: '' }));
                      if (error) clearError();
                    }}
                  />
                  {fieldErrors.password && <p className="text-rose-600 text-xs font-semibold mt-1 ml-1">Ingresa una {fieldErrors.password}</p>}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || loading || isGoogleSubmitting}
              className="w-full h-16 bg-[#0f3d5c] hover:bg-[#0d3049] text-white rounded-[1.5rem] shadow-2xl shadow-emerald-200/30 text-sm font-black uppercase tracking-[0.2em] transition-all group active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  {t('auth.login.cta')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="px-4 bg-[#fcfcfd] text-slate-400">O continúa con</span></div>
          </div>

          <Button
            onClick={handleGoogle}
            type="button"
            variant="outline"
            disabled={isSubmitting || loading || isGoogleSubmitting}
            aria-busy={isGoogleSubmitting}
            className="w-full h-16 border-emerald-100 hover:bg-emerald-50 rounded-[1.5rem] text-sm font-black uppercase tracking-widest gap-3 transition-all hover:border-emerald-200 text-emerald-700"
          >
            {isGoogleSubmitting ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : <Chrome className="h-5 w-5 text-emerald-600" />}
            {isGoogleSubmitting ? 'Redirigiendo con Google…' : 'Continuar con Google'}
          </Button>

          <p className="text-center text-slate-500 text-sm font-medium">
            {t('auth.login.noAccount')} <Link to="/register" className="text-emerald-600 font-black hover:text-emerald-700 ml-1">{t('auth.login.signup')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
