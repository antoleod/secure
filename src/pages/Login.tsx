import React, { useState } from 'react';
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
  const { signInEmail, signInGoogle, error, clearError } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signInEmail(email, password);
      navigate('/dashboard');
    } catch {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInGoogle();
      navigate('/dashboard');
    } catch {
      // Error handled in context
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* Visual Side (Hidden on Mobile) */}
      <div className="hidden lg:flex relative bg-slate-900 overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 z-10" />

        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ repeat: Infinity, duration: 20 }}
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90]
          }}
          transition={{ repeat: Infinity, duration: 25 }}
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]"
        />

        <div className="relative z-20 max-w-md w-full text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-24 h-24 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl"
          >
            <ShieldCheck className="w-12 h-12 text-blue-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-5xl font-black text-white tracking-tighter italic">Oryxen<span className="text-blue-500">.</span></h1>
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
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-black italic">O</span>
              </div>
              <span className="font-black text-slate-900 text-xl tracking-tighter">Oryxen<span className="text-blue-600">.</span></span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t('auth.login.title')}</h2>
            <p className="text-slate-500 font-medium text-lg">{t('auth.login.subtitle')}</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-[1.5rem] flex items-center gap-3 text-sm font-bold relative group"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={clearError} className="opacity-40 hover:opacity-100 transition-opacity">
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
                  <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type="email"
                    required
                    className="h-16 pl-14 bg-white border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-blue-500 font-bold text-slate-900 transition-all"
                    placeholder="email@oryxen.tech"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('field.password')}</label>
                  <Link to="/reset" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">{t('auth.login.forgot')}</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type="password"
                    required
                    className="h-16 pl-14 bg-white border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-blue-500 font-bold text-slate-900 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] shadow-2xl shadow-slate-200 text-sm font-black uppercase tracking-[0.2em] transition-all group active:scale-[0.98]"
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
            className="w-full h-16 border-slate-200 hover:bg-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest gap-3 transition-all hover:border-slate-300"
          >
            <Chrome className="h-5 w-5 text-blue-600" />
            Google Connect
          </Button>

          <p className="text-center text-slate-500 text-sm font-medium">
            {t('auth.login.noAccount')} <Link to="/register" className="text-blue-600 font-black hover:text-blue-700 ml-1">{t('auth.login.signup')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}