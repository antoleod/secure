import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/contexts/I18nContext';
import { LanguageSelector } from '@/components/LanguageSelector';

export function LoginPage() {
    const { signIn } = useAuth();
    const { t } = useI18n();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await signIn(email, password);
        } catch (err) {
            console.error(err);
            setError(t('auth.error.credentials'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">O</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {t('common.shortName')}
                        </span>
                    </Link>
                    <LanguageSelector />
                </div>

                <Card className="animate-slide-up">
                    <CardHeader>
                        <CardTitle className="text-2xl">{t('auth.login.title')}</CardTitle>
                        <CardDescription>{t('auth.login.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">{t('field.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">{t('field.password')}</Label>
                                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                        {t('auth.login.forgot')}
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? t('common.loading') : t('auth.login.cta')}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <div className="text-sm text-muted-foreground text-center">
                            {t('auth.login.noAccount')}{' '}
                            <Link to="/register" className="text-primary hover:underline">
                                {t('auth.login.signup')}
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
