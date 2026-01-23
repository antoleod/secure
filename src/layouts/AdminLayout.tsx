import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';
import { Menu, X, LayoutDashboard, Users, FileText, Wallet, CreditCard, Settings, History, LogOut, Shield } from 'lucide-react';

export function AdminLayout() {
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
        { to: '/admin', label: t('nav.dashboard'), icon: LayoutDashboard },
        { to: '/admin/clients', label: 'Clientes', icon: Users },
        { to: '/admin/requests', label: t('nav.requests'), icon: FileText },
        { to: '/admin/loans', label: t('nav.loans'), icon: Wallet },
        { to: '/admin/payments', label: 'Pagos', icon: CreditCard },
        { to: '/admin/settings', label: t('nav.settings'), icon: Settings },
        { to: '/admin/audit', label: t('nav.audit'), icon: History },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#fcfaff]">
            {/* Header */}
            <header className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link to="/admin" className="flex items-center gap-2 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-105 transition-transform">
                                    <Shield className="text-white h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-700 hidden sm:inline tracking-tighter leading-none">
                                        ADMIN
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 hidden sm:inline tracking-[0.2em]">CONTROL PANEL</span>
                                </div>
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden lg:flex items-center gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-purple-50 ${isActive(link.to)
                                                ? 'text-purple-600 bg-purple-50/80 font-bold'
                                                : 'text-slate-600'
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
                                <span className="text-[10px] uppercase tracking-widest text-purple-600 font-black">Super Administrador</span>
                            </div>

                            <div className="hidden sm:block">
                                <LanguageSelector />
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="hidden sm:flex text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={handleLogout}
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
                                            ? 'bg-purple-50 text-purple-700 font-bold'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <link.icon className={`h-5 w-5 ${isActive(link.to) ? 'text-purple-600' : 'text-slate-400'}`} />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                            <div className="pt-4 mt-4 border-t flex items-center justify-between px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-xs">
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
