import { Link } from 'react-router-dom';
import { ShieldCheck, Timer, Percent, CheckCircle2, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';

const assurancePoints = [
    'Storage disabled by default; evidence requested as text.',
    'Auth + protected routes with customer/admin roles.',
    'Firestore/Storage rules and audit mindset for public repos.',
];

export function LandingPage() {
    const { t } = useI18n();

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-purple-600/30 blur-3xl" />
                <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl" />
                <div className="absolute inset-0 pattern-grid opacity-30" />
            </div>

            <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <span className="text-white font-bold text-2xl">O</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm uppercase tracking-[0.2em] text-white/70">Collateral loans</span>
                            <span className="text-xl font-semibold text-white">{t('common.appName')}</span>
                        </div>
                    </div>
                    <nav className="flex items-center gap-3">
                        <LanguageSelector />
                        <Link to="/login">
                            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                                {t('landing.cta.login')}
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 border border-white/10">
                                {t('landing.cta.apply')}
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="relative z-10">
                <section className="container mx-auto px-4 py-16 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>Auditable, secure and GitHub Pages-ready</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-white">
                                {t('landing.title')}
                            </h1>
                            <p className="text-lg text-white/80 max-w-2xl">{t('landing.subtitle')}</p>
                            <div className="flex flex-wrap gap-3">
                                <StatPill label="24h" value="Average review" />
                                <StatPill label="0" value="Uploads enabled by default" />
                                <StatPill label="100%" value="Routes with role control" />
                            </div>
                            <div className="flex gap-4">
                                <Link to="/register">
                                    <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                                        {t('landing.cta.apply')}
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                                    >
                                        {t('landing.cta.login')}
                                    </Button>
                                </Link>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                                <span>Firestore and Storage rules ready for audits.</span>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 lg:p-8 shadow-2xl soft-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-white/60">Preview</span>
                                <span className="text-xs uppercase tracking-[0.15em] text-white/50">Customer & admin</span>
                            </div>
                            <div className="space-y-4">
                                <PreviewCard
                                    title="KYC + Requests"
                                    description="Guided KYC, loan requests and evidence without file uploads."
                                    icon={<Timer className="w-5 h-5 text-blue-200" />}
                                />
                                <PreviewCard
                                    title="Admin control"
                                    description="Approvals, audit log, and Storage locked until safe rules are deployed."
                                    icon={<ShieldCheck className="w-5 h-5 text-emerald-200" />}
                                />
                                <PreviewCard
                                    title="Payments & loyalty"
                                    description="Payment references, role-based states, and customer-facing rewards."
                                    icon={<Percent className="w-5 h-5 text-purple-200" />}
                                />
                            </div>
                            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-amber-200" />
                                <span>GitHub Pages + HashRouter, safe on refresh.</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white text-slate-900 rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-40px_120px_rgba(15,23,42,0.35)]">
                    <div className="container mx-auto px-4 py-16 space-y-16">
                        <div className="grid md:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={<Timer className="w-5 h-5 text-blue-600" />}
                                title={t('landing.feature.fast')}
                                description="Guided onboarding, ready dashboards, and clear steps for customers/admins."
                            />
                            <FeatureCard
                                icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
                                title={t('landing.feature.secure')}
                                description="Storage blocked by default, Firestore rules ready, auditable flows."
                            />
                            <FeatureCard
                                icon={<Percent className="w-5 h-5 text-purple-600" />}
                                title={t('landing.feature.rates')}
                                description="Integer cents, feature flags for uploads, and protected routes."
                            />
                        </div>

                        <div>
                            <h2 className="text-3xl font-semibold mb-6 text-slate-900">Flujo en 4 pasos</h2>
                            <div className="grid md:grid-cols-4 gap-6">
                                <StepCard
                                    number={1}
                                    title={t('landing.step.register')}
                                    description="Crea tu perfil y selecciona idioma."
                                />
                                <StepCard
                                    number={2}
                                    title={t('landing.step.kyc')}
                                    description={t('kyc.subtitle')}
                                />
                                <StepCard
                                    number={3}
                                    title={t('landing.step.request')}
                                    description="Simula montos en centavos y envía tu solicitud."
                                />
                                <StepCard
                                    number={4}
                                    title={t('landing.step.funded')}
                                    description="Admin revisa y confirma; cliente ve el estado."
                                />
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Seguridad primero
                                </div>
                                <h3 className="text-2xl font-semibold text-slate-900">Prácticas listas para prod</h3>
                                <p className="text-slate-600">
                                    Incluye pruebas de reglas, rutas con roles, CI/CD para Pages y plantillas de secretos.
                                    Activa App Check y reglas de Storage antes de permitir cargas.
                                </p>
                                <ul className="space-y-2">
                                    {assurancePoints.map((item) => (
                                        <li key={item} className="flex items-start gap-2 text-slate-700">
                                            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-1" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-lg">
                                <h4 className="text-lg font-semibold text-slate-900 mb-2">Listo para GitHub Pages</h4>
                                <p className="text-sm text-slate-600 mb-4">
                                    Base path configurado, HashRouter para refrescos, workflows de CI y deploy con `.env`
                                    generado desde secretos/variables.
                                </p>
                                <div className="space-y-3 text-sm text-slate-700">
                                    <ChecklistItem label="HashRouter + rutas protegidas" />
                                    <ChecklistItem label="Workflows con inyección de `.env`" />
                                    <ChecklistItem label="Pruebas de reglas y linters listos" />
                                </div>
                                <div className="mt-5 flex gap-3">
                                    <Link to="/register" className="w-full">
                                        <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
                                            Crear cuenta segura
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button variant="outline" className="border-slate-300 text-slate-900">
                                            Ingresar
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="bg-white border-t border-slate-200">
                    <div className="container mx-auto px-4 py-8 text-center text-sm text-slate-500">
                        <p>(c) 2026 OryxenTech. Loans listos para auditoría.</p>
                        <p className="mt-2">React · Firebase · Tailwind · GitHub Pages</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}

function StatPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
            <span className="font-semibold text-white">{label}</span> · {value}
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <Card className="h-full border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                    {icon}
                    <span>{title}</span>
                </CardTitle>
                <CardDescription className="text-slate-600">{description}</CardDescription>
            </CardHeader>
        </Card>
    );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold mb-3">
                {number}
            </div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
        </div>
    );
}

function PreviewCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex gap-3 items-start">
            <div className="rounded-full bg-white/10 p-2">{icon}</div>
            <div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-sm text-white/70">{description}</p>
            </div>
        </div>
    );
}

function ChecklistItem({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{label}</span>
        </div>
    );
}
