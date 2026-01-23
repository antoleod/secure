import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/contexts/I18nContext';
import { LanguageSelector } from '@/components/LanguageSelector';

const registrationSchema = z.object({
    fullName: z.string().min(3),
    email: z.string().email(),
    phone: z.string().min(6),
    dob: z.string().min(4),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
});

export function RegisterPage() {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const { t } = useI18n();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const validation = registrationSchema.safeParse(formData);
        if (!validation.success) {
            setError(t('common.error.generic'));
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            return setError(t('auth.error.passwordMismatch'));
        }

        try {
            setError('');
            setLoading(true);
            await signUp(formData.email, formData.password, formData.fullName, formData.phone, formData.dob);
            navigate('/app');
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : t('common.error.generic');
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <Link to="/" className="inline-flex items-center gap-2 mb-2">
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
                        <CardTitle className="text-2xl">{t('auth.register.title')}</CardTitle>
                        <CardDescription>{t('auth.register.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="fullName">{t('field.fullName')}</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Jane Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    autoComplete="name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">{t('field.email')}</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('field.phone')}</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+1234567890"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    autoComplete="tel"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dob">{t('field.dob')}</Label>
                                <Input
                                    id="dob"
                                    name="dob"
                                    type="date"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t('field.password')}</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    minLength={8}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">{t('field.confirmPassword')}</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    minLength={8}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? t('common.loading') : t('auth.register.cta')}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <div className="text-sm text-muted-foreground text-center">
                            {t('auth.register.haveAccount')}{' '}
                            <Link to="/login" className="text-primary hover:underline">
                                {t('auth.register.signin')}
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
