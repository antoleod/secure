import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import {
  AlertCircle,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const { signUpEmail, error, clearError, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const summaryError = useMemo(() => {
    const missing = Object.keys(fieldErrors).filter((k) => fieldErrors[k]);
    if (!missing.length) return null;
    return `Faltan: ${missing.map((k) => fieldErrors[k]).join(', ')}`;
  }, [fieldErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (error) clearError();
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) nextErrors.fullName = 'nombre completo';
    if (!phone.trim()) nextErrors.phone = 'telefono';
    if (!email.includes('@')) nextErrors.email = 'correo válido';
    if (password.length < 6) nextErrors.password = 'contraseña (6+)';

    setFieldErrors(nextErrors);
    setLocalError(null);

    if (Object.keys(nextErrors).length) {
      if (nextErrors.fullName) fullNameRef.current?.focus();
      else if (nextErrors.phone) phoneRef.current?.focus();
      else if (nextErrors.email) emailRef.current?.focus();
      else if (nextErrors.password) passwordRef.current?.focus();
      return;
    }
    setIsSubmitting(true);
    try {
      await signUpEmail(email, password, fullName, phone);
      navigate('/dashboard');
    } catch {
      setPassword('');
      passwordRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#fcfcfd] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-20%] w-[420px] h-[420px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[420px] h-[420px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <CardDesign>
          <div className="text-center space-y-3 mb-8 sm:mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-slate-200">
              <ShieldCheck className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{t('auth.register.title')}</h2>
              <p className="text-slate-500 font-medium text-sm sm:text-base">{t('auth.register.subtitle')}</p>
            </div>
          </div>

          <AnimatePresence>
            {(error || localError || summaryError) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-bold flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <span>{error || localError || summaryError}</span>
                  {summaryError && <p className="text-[11px] font-semibold text-rose-600">{summaryError}</p>}
                </div>
                <button onClick={() => { clearError(); setLocalError(null); }} className="font-black text-lg">&times;</button>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" onSubmit={handleSubmit}>
            <div className="space-y-2 md:col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('field.fullName')}</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="text"
                  required
                  className="h-14 sm:h-16 pl-12 sm:pl-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-blue-500 font-bold"
                  placeholder="Ej: Ana Gómez"
                  value={fullName}
                  ref={fullNameRef}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                    if (error) clearError();
                  }}
                />
              </div>
              {fieldErrors.fullName && <p className="text-rose-600 text-xs font-semibold ml-1">{fieldErrors.fullName} es requerido</p>}
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('field.phone')}</label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="tel"
                  required
                  className="h-14 sm:h-16 pl-12 sm:pl-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-blue-500 font-bold"
                  placeholder="+32 470 000 000"
                  value={phone}
                  ref={phoneRef}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, phone: '' }));
                    if (error) clearError();
                  }}
                />
              </div>
              {fieldErrors.phone && <p className="text-rose-600 text-xs font-semibold ml-1">{fieldErrors.phone} es requerido</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('field.email')}</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="email"
                  required
                  className="h-14 sm:h-16 pl-12 sm:pl-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-blue-500 font-bold"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  ref={emailRef}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: '' }));
                    if (error) clearError();
                  }}
                />
              </div>
              {fieldErrors.email && <p className="text-rose-600 text-xs font-semibold ml-1">Ingresa un {fieldErrors.email}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('field.password')}</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="password"
                  required
                  className="h-14 sm:h-16 pl-12 sm:pl-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-blue-500 font-bold"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  ref={passwordRef}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: '' }));
                    if (error) clearError();
                  }}
                />
              </div>
              {fieldErrors.password && <p className="text-rose-600 text-xs font-semibold ml-1">Ingresa una {fieldErrors.password}</p>}
            </div>

            <div className="md:col-span-2 pt-4 sm:pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full h-14 sm:h-16 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-2xl shadow-slate-200 text-sm font-black uppercase tracking-[0.15em] transition-all group active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (
                  <>
                    {t('auth.register.cta')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 sm:mt-10 text-center text-slate-500 text-sm font-medium">
            {t('auth.register.haveAccount')} <Link to="/login" className="text-blue-600 font-black hover:text-blue-700 ml-1">{t('auth.register.signin')}</Link>
          </div>
        </CardDesign>
      </motion.div>
    </div>
  );
}

function CardDesign({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/80 backdrop-blur-3xl border border-white p-6 sm:p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-slate-200/50 max-h-[calc(100dvh-4rem)] overflow-auto">
      {children}
    </div>
  );
}
