import { Link } from 'react-router-dom';
import { ShieldCheck, Timer, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';

export function LandingPage() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">O</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {t('common.appName')}
                        </span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <LanguageSelector />
                        <Link to="/login">
                            <Button variant="ghost">{t('landing.cta.login')}</Button>
                        </Link>
                        <Link to="/register">
                            <Button>{t('landing.cta.apply')}</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <section className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-slide-down">
                        {t('landing.title')}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up">
                        {t('landing.subtitle')}
                    </p>
                    <div className="flex gap-4 justify-center pt-4 animate-slide-up">
                        <Link to="/register">
                            <Button size="lg">{t('landing.cta.apply')}</Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline">
                                {t('landing.cta.login')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-20">
                <div className="grid md:grid-cols-3 gap-6">
                    <FeatureCard icon={<Timer className="w-5 h-5 text-blue-600" />} title={t('landing.feature.fast')} />
                    <FeatureCard
                        icon={<ShieldCheck className="w-5 h-5 text-purple-600" />}
                        title={t('landing.feature.secure')}
                    />
                    <FeatureCard
                        icon={<Percent className="w-5 h-5 text-blue-600" />}
                        title={t('landing.feature.rates')}
                    />
                </div>
            </section>

            <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl my-10">
                <h2 className="text-3xl font-bold text-center mb-12">{t('nav.dashboard')}</h2>
                <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                    <StepCard number={1} title={t('landing.step.register')} description={t('auth.register.subtitle')} />
                    <StepCard number={2} title={t('landing.step.kyc')} description={t('kyc.subtitle')} />
                    <StepCard number={3} title={t('landing.step.request')} description={t('loan.new.subtitle')} />
                    <StepCard number={4} title={t('landing.step.funded')} description={t('landing.feature.fast')} />
                </div>
            </section>

            <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
                <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>{t('landing.footer')}</p>
                    <p className="mt-2">Firebase • React • Tailwind • GitHub Pages</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <Card className="animate-slide-up hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    <span>{title}</span>
                </CardTitle>
                <CardDescription>{title}</CardDescription>
            </CardHeader>
        </Card>
    );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
    return (
        <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                {number}
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
