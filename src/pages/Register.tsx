import React, { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (error) clearError();
    setIsSubmitting(true);
    try {
      await signUpEmail(email, password, fullName, phone);
      navigate('/dashboard');
    } catch {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <CardDesign>
          <div className="text-center space-y-4 mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-slate-200">
              <ShieldCheck className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t('auth.register.title')}</h2>
              <p className="text-slate-500 font-medium">{t('auth.register.subtitle')}</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-bold flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={clearError} className="font-black text-lg">&times;</button>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div className="space-y-2 md:col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('field.fullName')}</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="text"
                  required
                  className="h-16 pl-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-blue-500 font-bold"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) clearError();
                  }}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('field.phone')}</label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="tel"
                  required
                  className="h-16 pl-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-blue-500 font-bold"
                  placeholder="+32 ..."
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) clearError();
                  }}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('field.email')}</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="email"
                  required
                  className="h-16 pl-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-blue-500 font-bold"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('field.password')}</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="password"
                  required
                  className="h-16 pl-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-blue-500 font-bold"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-2xl shadow-slate-200 text-sm font-black uppercase tracking-[0.2em] transition-all group active:scale-[0.98]"
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

          <div className="mt-10 text-center text-slate-500 text-sm font-medium">
            {t('auth.register.haveAccount')} <Link to="/login" className="text-blue-600 font-black hover:text-blue-700 ml-1">{t('auth.register.signin')}</Link>
          </div>
        </CardDesign>
      </motion.div>
    </div>
  );
}

function CardDesign({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/80 backdrop-blur-3xl border border-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50">
      {children}
    </div>
  );
}
