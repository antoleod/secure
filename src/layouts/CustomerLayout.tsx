import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';
import {
    LayoutDashboard,
    UserCheck,
    ShieldCheck,
    Wallet,
    CreditCard,
    ShoppingBag,
    HelpCircle,
    LogOut,
    Bell,
    Search,
    User
} from 'lucide-react';

export function CustomerLayout() {
    const { signOut, userData } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();

    async function handleLogout() {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    // Links for the BOTTOM DOCK (Main Navigation)
    const footerLinks = [
        { to: '/app', label: t('nav.dashboard'), icon: LayoutDashboard },
        { to: '/app/collateral', label: 'Prendas', icon: ShieldCheck },
        { to: '/app/loans', label: 'Préstamos', icon: Wallet },
        { to: '/app/payments', label: 'Pagos', icon: CreditCard },
    ];

    // Links for the HEADER (Utilities & Secondary)
    const headerLinks = [
        { to: '/app/verify-identity', label: 'ID', icon: UserCheck },
        { to: '/app/store', label: 'Tienda', icon: ShoppingBag, color: 'text-green-600' },
        { to: '/app/help', label: 'Ayuda', icon: HelpCircle },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#fcfcfd] flex flex-col pb-24 md:pb-28">
            {/* Header with Identity, Store, Help and Language */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/app" className="flex items-center gap-2 mr-2">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-sm italic">O</span>
                            </div>
                            <span className="font-bold text-slate-900 tracking-tighter hidden sm:inline">{t('common.shortName')}</span>
                        </Link>

                        {/* Desktop Header Links */}
                        <nav className="hidden md:flex items-center gap-1">
                            {headerLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isActive(link.to)
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Header Icons for Mobile (ID, Store, Help) */}
                        <div className="flex md:hidden items-center gap-1 mr-2 border-r pr-2 border-slate-100">
                            {headerLinks.map((link) => (
                                <Link key={link.to} to={link.to} className={`p-2 rounded-lg ${isActive(link.to) ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
                                    <link.icon className="h-4 w-4" />
                                </Link>
                            ))}
                        </div>

                        <div className="hidden sm:block">
                            <LanguageSelector />
                        </div>

                        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

                        <Link
                            to="/app/verify-identity"
                            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm overflow-hidden ring-2 ring-white shadow-sm hover:ring-blue-400 transition-all active:scale-95"
                            title="Perfil"
                        >
                            {userData?.fullName?.charAt(0)}
                        </Link>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-600 rounded-full h-9 w-9"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Outlet />
                </div>
            </main>

            {/* PROFESSIONAL BOTTOM NAVIGATION (DOCK STYLE) - MAIN ACTIONS */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pointer-events-none">
                <div className="container mx-auto max-w-lg pointer-events-auto">
                    <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-2 flex items-center justify-around">
                        {footerLinks.map((link) => {
                            const active = isActive(link.to);
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`
                                        relative group flex flex-col items-center justify-center 
                                        min-w-[4.5rem] py-3 rounded-[1.8rem] transition-all duration-300
                                        ${active ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'}
                                    `}
                                >
                                    <Icon className={`
                                        h-5 w-5 mb-1 transition-all duration-300
                                        ${active ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:text-white'}
                                    `} />
                                    <span className={`
                                        text-[10px] font-black uppercase tracking-widest transition-all
                                        ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}
                                    `}>
                                        {link.label}
                                    </span>
                                    {active && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_12px_#3b82f6]"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
}
