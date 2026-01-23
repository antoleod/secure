import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';

export function CustomerLayout() {
    const { logout, userData } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link to="/app" className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">O</span>
                                </div>
                                <span className="text-xl font-bold hidden sm:inline">{t('common.shortName')}</span>
                            </Link>

                            <nav className="hidden md:flex items-center gap-4">
                                <Link to="/app" className="text-sm hover:text-primary transition-colors">
                                    {t('nav.dashboard')}
                                </Link>
                                <Link to="/app/verify-identity" className="text-sm hover:text-primary transition-colors">
                                    {t('nav.identity')}
                                </Link>
                                <Link to="/app/collateral" className="text-sm hover:text-primary transition-colors">
                                    {t('nav.collateral')}
                                </Link>
                                <Link to="/app/loans" className="text-sm hover:text-primary transition-colors">
                                    {t('nav.loans')}
                                </Link>
                                <Link to="/app/payments" className="text-sm hover:text-primary transition-colors">
                                    {t('nav.payments')}
                                </Link>
                                <Link to="/app/help" className="text-sm hover:text-primary transition-colors">
                                    {t('nav.help')}
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                                {userData?.fullName}
                            </span>
                            <LanguageSelector />
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                {t('common.logout')}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}
