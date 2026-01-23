import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    Timer,
    ArrowRight,
    Zap,
    Globe,
    Fingerprint,
    Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';
import { motion } from 'framer-motion';

export function LandingPage() {
    const { t } = useI18n();

    const stats = [
        { label: '24h', value: 'Revisión rápida' },
        { label: '0€', value: 'Comisiones ocultas' },
        { label: '100%', value: 'Seguro y Auditable' },
    ];

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0b1f2c] via-[#0f2f41] to-[#0f444f] text-white font-sans selection:bg-emerald-300 selection:text-slate-900">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-400/15 blur-[140px]" />
                <div className="absolute right-[-10%] bottom-[-10%] h-[600px] w-[600px] rounded-full bg-sky-400/15 blur-[140px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            </div>

            {/* Premium Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0f293a]/70 backdrop-blur-2xl">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ rotate: 90 }}
                            className="w-10 h-10 bg-gradient-to-tr from-emerald-400 to-sky-400 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-300/30"
                        >
                            <span className="text-slate-900 font-black text-xl italic">S</span>
                        </motion.div>
                        <span className="font-black text-white text-xl tracking-tighter hidden sm:inline-block">Secure<span className="text-emerald-300">.</span></span>
                    </div>

                    <div className="flex items-center gap-6">
                        <LanguageSelector className="text-white/60" />
                        <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
                        <Link to="/login" className="hidden sm:block">
                            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5">
                                {t('landing.cta.login')}
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button className="bg-emerald-300 text-slate-950 hover:bg-emerald-200 rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-200/40 transition-all active:scale-95">
                                {t('landing.cta.apply')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-24 lg:py-40">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-10"
                        >
                            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200 backdrop-blur">
                                <Zap className="w-4 h-4 fill-emerald-200" />
                                <span>Financiamiento Inteligente v4.0</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] text-white tracking-tighter italic">
                                {t('landing.title').split(' ').map((word, i) => (
                                    <span key={i} className={i === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-sky-300' : ''}>
                                        {word}{' '}
                                    </span>
                                ))}
                            </h1>
                            <p className="text-xl text-slate-300 max-w-xl leading-relaxed font-medium transition-all hover:text-white/90">
                                {t('landing.subtitle')}
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                {stats.map((s, i) => (
                                    <div key={i} className="px-6 py-4 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                                        <p className="text-2xl font-black text-white italic tracking-tighter leading-none">{s.label}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 pt-6">
                                <Link to="/register">
                                    <Button size="lg" className="h-16 px-10 bg-emerald-300 hover:bg-emerald-200 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-emerald-200/30 group transition-all">
                                        {t('landing.cta.apply')}
                                        <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-16 px-10 border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest"
                                    >
                                        {t('landing.cta.login')}
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-emerald-400/20 blur-[120px] rounded-full" />
                            <div className="rounded-[4rem] border border-white/10 bg-[#0d2434] p-8 lg:p-12 shadow-[0_80px_160px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-400/15 to-transparent" />
                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2 text-white/20">
                                            <div className="w-3 h-3 rounded-full bg-current" />
                                            <div className="w-3 h-3 rounded-full bg-current" />
                                            <div className="w-3 h-3 rounded-full bg-current" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Secure Dashboard Preview</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl group-hover:bg-white/10 transition-all duration-500 translate-x-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-emerald-300 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-emerald-200/30">
                                                    <Fingerprint className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Verified Identity</p>
                                                    <p className="text-xl font-black text-white tracking-tight">John Doe</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-[#0b1d2b] border border-white/5 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-1">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] font-black text-emerald-200/80 uppercase tracking-widest">Active Credit</p>
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            </div>
                                            <p className="text-4xl font-black text-white italic tracking-tighter">2.500,00€</p>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-500 -translate-x-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white">
                                                    <Smartphone className="h-5 w-5" />
                                                </div>
                                                <p className="text-sm font-bold text-white/80">iPhone 15 Pro Max · <span className="text-emerald-200 italic">Collateral Secured</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-[#f7f9fb] text-slate-950 rounded-t-[5rem] shadow-[0_-40px_120px_rgba(15,94,119,0.12)] overflow-hidden">
                    <div className="container mx-auto px-6 py-32 space-y-32">
                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                { icon: Timer, title: t('landing.feature.fast'), desc: 'Procesamos tu solicitud en tiempo récord. Sin papeleo físico, 100% digital.', color: 'text-sky-700', bg: 'bg-sky-50' },
                                { icon: ShieldCheck, title: t('landing.feature.secure'), desc: 'Custodia segura en cámaras de alta seguridad. Tus joyas o tecnología están protegidas.', color: 'text-emerald-700', bg: 'bg-emerald-50' },
                                { icon: Globe, title: t('landing.feature.rates'), desc: 'Tasas competitivas y planes de pago flexibles adaptados a tu situación.', color: 'text-cyan-700', bg: 'bg-cyan-50' }
                            ].map((f, i) => (
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    key={i}
                                    className="p-10 rounded-[3rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500"
                                >
                                    <div className={`w-16 h-16 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-8`}>
                                        <f.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight mb-4">{f.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Steps Section */}
                        <div className="space-y-16">
                            <div className="text-center max-w-2xl mx-auto space-y-4">
                                <h2 className="text-5xl font-black tracking-tighter italic uppercase text-[#0f3d5c]">Proceso en 4 Pasos</h2>
                                <p className="text-slate-500 font-medium text-lg">Del registro al desembolso en 24 horas.</p>
                            </div>
                            <div className="grid md:grid-cols-4 gap-8">
                                {[
                                    { n: 1, t: t('landing.step.register'), d: 'Crea tu perfil seguro en segundos.' },
                                    { n: 2, t: t('landing.step.kyc'), d: 'Verifica tu identidad digitalmente.' },
                                    { n: 3, t: t('landing.step.request'), d: 'Registra tu prenda y simula el crédito.' },
                                    { n: 4, t: t('landing.step.funded'), d: 'Recibe los fondos al instante.' }
                                ].map((s, i) => (
                                    <div key={i} className="relative group">
                                        <div className="w-16 h-16 rounded-full bg-[#0f3d5c] text-white flex items-center justify-center font-black text-xl mb-6 shadow-xl group-hover:scale-110 transition-transform">
                                            {s.n}
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 italic">{s.t}</h3>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.d}</p>
                                        {i < 3 && <div className="hidden lg:block absolute top-8 left-20 w-full h-[2px] bg-slate-100 -z-10" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="bg-gradient-to-br from-[#0f2434] via-[#0f3448] to-[#0f4e5c] rounded-[4rem] p-12 lg:p-24 text-center space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-300/20 to-sky-300/20 opacity-70 pointer-events-none" />
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] italic relative z-10">
                                ¿Listo para obtener liquidez hoy mismo?
                            </h2>
                            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
                                <Link to="/register">
                                    <Button size="lg" className="h-16 px-12 bg-emerald-300 text-slate-900 hover:bg-emerald-200 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-emerald-200/30 active:scale-95 transition-all">
                                        {t('landing.cta.apply')}
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button size="lg" variant="outline" className="h-16 px-12 border-white/20 text-white hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all">
                                        {t('landing.cta.login')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <footer className="bg-slate-50 border-t border-slate-100 py-20">
                        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12 text-center md:text-left">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 justify-center md:justify-start">
                                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                        <span className="text-white font-black italic">O</span>
                                    </div>
                                    <span className="font-black text-slate-900 text-xl tracking-tighter">Secure<span className="text-sky-700">.</span></span>
                                </div>
                                <p className="text-sm text-slate-400 font-medium max-w-xs">{t('landing.footer')}</p>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Legal</h4>
                                <ul className="space-y-3 text-sm font-bold text-slate-600">
                                    <li className="hover:text-sky-700 cursor-pointer">Términos y Condiciones</li>
                                    <li className="hover:text-sky-700 cursor-pointer">Política de Privacidad</li>
                                    <li className="hover:text-sky-700 cursor-pointer">Seguridad de Datos</li>
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Compañía</h4>
                                <ul className="space-y-3 text-sm font-bold text-slate-600">
                                    <li className="hover:text-sky-700 cursor-pointer">Sobre Nosotros</li>
                                    <li className="hover:text-sky-700 cursor-pointer">Contacto</li>
                                    <li className="hover:text-sky-700 cursor-pointer">Prensa</li>
                                </ul>
                            </div>
                        </div>
                    </footer>
                </section>
            </main>
        </div>
    );
}
