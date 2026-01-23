import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';
import { Menu, X, LayoutDashboard, UserCheck, ShieldCheck, Wallet, CreditCard, ShoppingBag, HelpCircle, LogOut } from 'lucide-react';

export function CustomerLayout() {
    const { signOut, userData } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    async function handleLogout() {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    const navLinks = [
        { to: '/app', label: t('nav.dashboard'), icon: LayoutDashboard },
        { to: '/app/verify-identity', label: t('nav.identity'), icon: UserCheck },
        { to: '/app/collateral', label: t('nav.collateral'), icon: ShieldCheck },
        { to: '/app/loans', label: t('nav.loans'), icon: Wallet },
        { to: '/app/payments', label: t('nav.payments'), icon: CreditCard },
        { to: '/app/store', label: 'Tienda', icon: ShoppingBag, extraClass: 'text-green-600 font-semibold' },
        { to: '/app/help', label: t('nav.help'), icon: HelpCircle },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Header */}
            <header className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link to="/app" className="flex items-center gap-2 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                                    <span className="text-white font-bold text-xl uppercase italic">O</span>
                                </div>
                                <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 hidden sm:inline tracking-tighter">
                                    {t('common.shortName')}
                                </span>
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden lg:flex items-center gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-slate-100 ${isActive(link.to)
                                                ? 'text-blue-600 bg-blue-50/50'
                                                : link.extraClass || 'text-slate-600'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-sm font-bold text-slate-900">{userData?.fullName}</span>
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Cliente</span>
                            </div>

                            <div className="hidden sm:block">
                                <LanguageSelector />
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="hidden sm:flex text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={handleLogout}
                                title={t('common.logout')}
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>

                            {/* Mobile menu button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden text-slate-600"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Panel */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t bg-white animate-in slide-in-from-top duration-300">
                        <div className="container mx-auto px-4 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive(link.to)
                                            ? 'bg-blue-50 text-blue-600 font-bold'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <link.icon className={`h-5 w-5 ${isActive(link.to) ? 'text-blue-600' : 'text-slate-400'}`} />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                            <div className="pt-4 mt-4 border-t flex items-center justify-between px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                                        {userData?.fullName?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{userData?.fullName}</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 border-red-100 hover:bg-red-50">
                                    {t('common.logout')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 min-h-[calc(100vh-160px)] p-6 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
